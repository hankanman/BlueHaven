// src/components/FloorPlan/FloorPlan.tsx
import React, { useRef, useState, useEffect } from "react";
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

  const [currentRoom, setCurrentRoom] = useState<{ x: number; y: number }[]>(
    []
  );
  const [selectedRoomIndex, setSelectedRoomIndex] = useState<number | null>(
    null
  );
  const [towers, setTowers] = useState<Tower[]>([]);

  const renderModeIndicator = () => {
    let modeText = "Normal Mode";
    if (placingTower) {
      modeText = "Tower Placement Mode";
    } else if (drawingRoom) {
      modeText = "Room Drawing Mode";
    }
    return <div className="mode-indicator">{modeText}</div>;
  };

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
    return { x: 0, y: 0 };
  };

  const calculateLength = (vertices: { x: number; y: number }[]) => {
    const lengths: number[] = [];
    for (let i = 0; i < vertices.length; i++) {
      const vertex = vertices[i];
      const nextVertex = vertices[(i + 1) % vertices.length];
      const length = Math.sqrt(
        (nextVertex.x - vertex.x) ** 2 + (nextVertex.y - vertex.y) ** 2
      );
      lengths.push(length);
    }
    return lengths;
  };

  // Function to handle changes to length inputs
  const handleLengthChange = (sideIndex: number, newLength: number) => {
    if (selectedRoomIndex !== null) {
      const updatedRoom = { ...rooms[selectedRoomIndex] };
      updatedRoom.lengths[sideIndex] = newLength;
      const updatedRooms = [...rooms];
      updatedRooms[selectedRoomIndex] = updatedRoom;
      setRooms(updatedRooms);
    }
  };
  // Function to select a room
  const handleRoomClick = (roomIndex: number) => {
    setSelectedRoomIndex(roomIndex);
  };
  // Function to handle mouse move event (draw the current edge)
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentRoom.length === 0) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous drawings
        renderRooms(); // Render existing rooms

        // Get canvas coordinates
        const { x, y } = getCanvasCoordinates(e);

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

  // Function to check if a point is inside a room (can use a library or custom logic)
  const isPointInsideRoom = (x: number, y: number, room: Room) => {
    let inside = false;
    for (
      let i = 0, j = room.vertices.length - 1;
      i < room.vertices.length;
      j = i++
    ) {
      const xi = room.vertices[i].x,
        yi = room.vertices[i].y;
      const xj = room.vertices[j].x,
        yj = room.vertices[j].y;

      const intersect = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi); // prettier-ignore

      if (intersect) inside = !inside;
    }

    return inside;
  };

  const renderRooms = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
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
            const length = room.lengths[index].toFixed(2);
            ctx.fillStyle = "black";
            ctx.font = "12px Arial";
            ctx.fillText(length, midX, midY);
          });
        });
      }
    }
  };
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
      {renderModeIndicator()}
      <button
        onClick={() => setPlacingTower(true)}
        className={placingTower ? "active-button" : ""}
      >
        Place Tower
      </button>
      <button
        onClick={() => setDrawingRoom(!drawingRoom)}
        className={drawingRoom ? "active-button" : ""}
      >
        {drawingRoom ? "Stop Drawing Room" : "Draw Room"}
      </button>
      <button onClick={clearCanvas}>Clear Canvas</button>
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
          {selectedRoomIndex !== null && (
            <div>
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
        </div>
      )}
      {/* Other components and elements can be added here */}
    </div>
  );
};

export default FloorPlan;
