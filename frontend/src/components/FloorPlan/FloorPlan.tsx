// src/components/FloorPlan/FloorPlan.tsx
import React, { useRef, useState, useEffect } from "react";
import ModeIndicator from "./ModeIndicator";
import Toolbar from "./Toolbar";
import {
  calculateLength,
  isPointInsideRoom,
  isPointNearEdge,
  adjustRoomVertices,
} from "./utilities";
import "./FloorPlan.css";

type Tower = { x: number; y: number };
type Room = {
  vertices: { x: number; y: number }[];
  lengths: number[];
  label: string;
};

const FloorPlan: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [placingTower, setPlacingTower] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [drawingRoom, setDrawingRoom] = useState(false);
  const [potentialVertex, setPotentialVertex] = useState<{roomIndex: number, edgeIndex: number, position: {x: number, y: number}} | null>(null); // prettier-ignore
  const [hoveredVertex, setHoveredVertex] = useState<{roomIndex: number; vertexIndex: number;} | null>(null); // prettier-ignore
  const [draggingVertex, setDraggingVertex] = useState<{roomIndex: number; vertexIndex: number;} | null>(null); // prettier-ignore
  const [currentRoom, setCurrentRoom] = useState<{ x: number; y: number }[]>([]); // prettier-ignore
  const [selectedRoomIndex, setSelectedRoomIndex] = useState<number | null>(null); // prettier-ignore
  const [towers, setTowers] = useState<Tower[]>([]);

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
    return { x: 0, y: 0 };
  };

  // Function to select a room
  const handleRoomClick = (roomIndex: number) => {
    setSelectedRoomIndex(roomIndex);
  };
  // Function to handle changes to length inputs
  const handleLengthChange = (sideIndex: number, newLength: number) => {
    if (selectedRoomIndex !== null) {
      const updatedRoom = { ...rooms[selectedRoomIndex] };
      updatedRoom.lengths[sideIndex] = newLength;
      const updatedRooms = [...rooms];
      updatedRooms[selectedRoomIndex] = updatedRoom;
      setRooms(updatedRooms);

      adjustRoomVertices(updatedRoom, sideIndex);
    }
  };
  // Function to handle mouse move event (draw the current edge)
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoordinates(e);

    // If a vertex is being dragged, update its position
    if (draggingVertex) {
      const updatedRooms = [...rooms];
      const room = updatedRooms[draggingVertex.roomIndex];
      room.vertices[draggingVertex.vertexIndex] = { x, y };

      // Recalculate lengths
      room.lengths = calculateLength(room.vertices);

      setRooms(updatedRooms);
      return; // Exit the function if a vertex is being dragged
    } else {
      let nearVertex = null;
      for (let roomIndex = 0; roomIndex < rooms.length; roomIndex++) {
        const room = rooms[roomIndex];
        for (
          let vertexIndex = 0;
          vertexIndex < room.vertices.length;
          vertexIndex++
        ) {
          const vertex = room.vertices[vertexIndex];
          const distance = Math.sqrt((vertex.x - x) ** 2 + (vertex.y - y) ** 2);
          if (distance < 20) {
            nearVertex = { roomIndex, vertexIndex };
            break;
          }
        }
        if (nearVertex) break;
      }
      setHoveredVertex(nearVertex);
    }

    let potentialSpot = null;
    for (let roomIndex = 0; roomIndex < rooms.length; roomIndex++) {
      const room = rooms[roomIndex];
      for (let edgeIndex = 0; edgeIndex < room.vertices.length; edgeIndex++) {
        const startVertex = room.vertices[edgeIndex];
        const endVertex = room.vertices[(edgeIndex + 1) % room.vertices.length];

        if (isPointNearEdge(x, y, startVertex, endVertex)) {
          potentialSpot = { roomIndex, edgeIndex, position: { x, y } };
          break;
        }
      }
      if (potentialSpot) break;
    }
    setPotentialVertex(potentialSpot);

    if (currentRoom.length === 0) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous drawings
        renderRooms(); // Render existing rooms and towers
        // Draw the current room
        ctx.beginPath();
        ctx.moveTo(currentRoom[0].x, currentRoom[0].y);
        currentRoom.slice(1).forEach((vertex) => {
          ctx.lineTo(vertex.x, vertex.y);
        });
        ctx.lineTo(x, y); // Draw line to the current mouse position
        ctx.stroke();
      }
    }
  };

  // Function to handle mouse up event (finalize the current room, optional)
  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggingVertex) {
      const { x, y } = getCanvasCoordinates(e);
      const updatedRooms = [...rooms];
      const room = updatedRooms[draggingVertex.roomIndex];

      // Check for nearby vertices (other than the one being dragged)
      for (const otherRoom of rooms) {
        for (const vertex of otherRoom.vertices) {
          const distance = Math.sqrt((vertex.x - x) ** 2 + (vertex.y - y) ** 2);
          if (distance < 20) {
            room.vertices[draggingVertex.vertexIndex] = vertex; // Snap the vertex
            // Recalculate lengths
            room.lengths = calculateLength(room.vertices);
            break;
          }
        }
      }

      setRooms(updatedRooms);
      setDraggingVertex(null); // Reset the dragging state
      return; // Exit the function if a vertex was dragged
    }
    if (drawingRoom) {
      if (currentRoom.length < 3) return;

      const { x, y } = getCanvasCoordinates(e);
      const distanceToStart = Math.sqrt(
        (currentRoom[0].x - x) ** 2 + (currentRoom[0].y - y) ** 2
      );
      const snapDistance = 20; // Threshold distance for snapping (in pixels)
      if (distanceToStart < snapDistance) {
        // Remove the last vertex if it is a duplicate
        const vertices = currentRoom;

        const newRoom: Room = {
          vertices: vertices,
          lengths: calculateLength(vertices),
          label: `Room ${rooms.length + 1}`,
        };

        setRooms([...rooms, newRoom]);
        setCurrentRoom([]);
        setDrawingRoom(false); // Reset drawing state
      }
    }
  };

  // Function to handle mouse down event (start drawing a new vertex)
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawingRoom) return; // Skip if not in drawing room mode
    let { x, y } = getCanvasCoordinates(e);

    // If currentRoom has more than 2 vertices, check for snapping to the first vertex
    if (currentRoom.length > 2) {
      const distanceToStart = Math.sqrt(
        (currentRoom[0].x - x) ** 2 + (currentRoom[0].y - y) ** 2
      );
      const snapDistance = 20; // Threshold distance for snapping (in pixels)
      if (distanceToStart < snapDistance) {
        handleMouseUp(e); // Finalize the room if clicked near the starting vertex
        return;
      }
    }
    // Check if any vertex is clicked
    for (let roomIndex = 0; roomIndex < rooms.length; roomIndex++) {
      const room = rooms[roomIndex];
      for (
        let vertexIndex = 0;
        vertexIndex < room.vertices.length;
        vertexIndex++
      ) {
        const vertex = room.vertices[vertexIndex];
        const distance = Math.sqrt((vertex.x - x) ** 2 + (vertex.y - y) ** 2);
        if (distance < 10) {
          // Assuming 10 pixels as the click radius for a vertex
          setDraggingVertex({ roomIndex, vertexIndex });
          return; // Exit the function if a vertex is clicked
        }
      }
    }
    if (potentialVertex) {
      const updatedRooms = [...rooms];
      const room = updatedRooms[potentialVertex.roomIndex];
      room.vertices.splice(
        potentialVertex.edgeIndex + 1,
        0,
        potentialVertex.position
      );
      setRooms(updatedRooms);
      setPotentialVertex(null);
    }

    setCurrentRoom([...currentRoom, { x, y }]);
  };

  // Function to handle mouse click on the canvas
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoordinates(e);

    if (placingTower) {
      setTowers([...towers, { x, y }]);
      setPlacingTower(false); // Exit tower placement mode
    } else if (drawingRoom) {
      // Handle room drawing logic here if needed
    } else {
      rooms.forEach((room, index) => {
        if (isPointInsideRoom(x, y, room)) {
          handleRoomClick(index);
          setSelectedRoomIndex(index);
        }
      });
    }
  };
  function renderRooms() {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        if (potentialVertex) {
          ctx.beginPath();
          ctx.arc(potentialVertex.position.x, potentialVertex.position.y, 8, 0, 2 * Math.PI); // prettier-ignore
          ctx.fillStyle = "rgba(0, 255, 0, 0.5)";
          ctx.fill();
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas first

        towers.forEach((tower) => {
          ctx.beginPath();
          ctx.arc(tower.x, tower.y, 10, 0, 2 * Math.PI); // Draw a circle for the tower
          ctx.fillStyle = "blue";
          ctx.fill();
        });

        // Iterate through the rooms and draw each one
        rooms.forEach((room, roomIndex) => {
          // Draw the room
          ctx.strokeStyle = roomIndex === selectedRoomIndex ? "red" : "black";
          ctx.beginPath();
          room.vertices.forEach((vertex, index) => {
            if (index === 0) {
              ctx.moveTo(vertex.x, vertex.y);
            } else {
              ctx.lineTo(vertex.x, vertex.y);
            }
          });
          ctx.closePath();
          ctx.stroke();

          // Draw the lengths of the sides
          room.vertices.forEach((vertex, index) => {
            const nextVertex =
              room.vertices[(index + 1) % room.vertices.length];
            const midX = (vertex.x + nextVertex.x) / 2;
            const midY = (vertex.y + nextVertex.y) / 2;
            const length = room.lengths[index]
              ? room.lengths[index].toFixed(2)
              : "N/A";
            ctx.fillStyle = "black";
            ctx.font = "12px Arial";
            ctx.fillText(index + 1 + ": " + length, midX, midY);
          });
          room.vertices.forEach((vertex, vertexIndex) => {
            ctx.beginPath();
            ctx.arc(vertex.x, vertex.y, hoveredVertex && hoveredVertex.roomIndex === roomIndex && hoveredVertex.vertexIndex === vertexIndex ? 8 : 5, 0, 2 * Math.PI); // prettier-ignore
            ctx.fillStyle =
              hoveredVertex &&
              hoveredVertex.roomIndex === roomIndex &&
              hoveredVertex.vertexIndex === vertexIndex
                ? "red"
                : "blue";
            ctx.fill();
          });
        });
      }
    }
  }
  const handleLabelChange = (newLabel: string) => {
    if (selectedRoomIndex !== null) {
      const updatedRooms = [...rooms];
      updatedRooms[selectedRoomIndex].label = newLabel;
      setRooms(updatedRooms);
    }
  };
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    // Reset the state
    setRooms([]);
    setTowers([]);
    setCurrentRoom([]);
    setSelectedRoomIndex(null);
  };
  // Call renderRooms inside a useEffect to ensure it runs when rooms change
  useEffect(() => {
    console.log(rooms, towers);
    renderRooms();
  }, [rooms, towers]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <ModeIndicator placingTower={placingTower} drawingRoom={drawingRoom} />
      <Toolbar
        placingTower={placingTower}
        drawingRoom={drawingRoom}
        onToggleTowerMode={() => setPlacingTower(true)}
        onToggleRoomDrawing={() => setDrawingRoom(!drawingRoom)}
        onClearCanvas={clearCanvas}
      />
      <br></br>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onClick={handleCanvasClick}
        width={800}
        height={600}
      />
      {selectedRoomIndex !== null && (
        <div>
          <label>Room Label:</label>
          <input
            placeholder="label"
            type="text"
            value={rooms[selectedRoomIndex].label}
            onChange={(e) => handleLabelChange(e.target.value)}
          />
          {rooms[selectedRoomIndex].lengths.map((length, index) => (
            <div key={index}>
              <label>Side {index + 1} Length:</label>
              <input
                placeholder="length"
                type="number"
                value={length}
                onChange={(e) =>
                  handleLengthChange(index, parseFloat(e.target.value))
                }
              />
            </div>
          ))}
        </div>
      )}
      {/* Other components and elements can be added here */}
    </div>
  );
};

export default FloorPlan;
