// src/components/FloorPlan/FloorPlan.tsx
import React, { useRef, useState, useEffect } from "react";
import "./FloorPlan.css"; // Import the CSS file

type Tower = {
  x: number;
  y: number;
  // Additional properties for the tower (e.g., ID, configuration)
};

// Define the Room type outside the component
type Room = {
  vertices: { x: number; y: number }[];
  lengths: number[];
  label: string; // Label for the room
};

const FloorPlan: React.FC = () => {
  const [placingTower, setPlacingTower] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<{ x: number; y: number }[]>(
    []
  );
  const [selectedRoomIndex, setSelectedRoomIndex] = useState<number | null>(
    null
  );

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
  // Function to handle tower placement (e.g., on mouse click)
  const handleTowerPlacement = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const x = e.clientX;
    const y = e.clientY;
    setTowers([...towers, { x, y }]);
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

        // Draw the current edge
        const lastVertex = currentRoom[currentRoom.length - 1];
        ctx.beginPath();
        ctx.moveTo(lastVertex.x, lastVertex.y);
        ctx.lineTo(e.clientX, e.clientY);
        ctx.stroke();
      }
    }
  };

  // Function to handle mouse up event (finalize the current room, optional)
  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentRoom.length < 3) return; // Need at least 3 vertices to form a polygon

    // Finalize the current room
    const newRoom: Room = {
      vertices: currentRoom,
      lengths: [], // Lengths can be defined later or calculated based on vertices
      label: "", // Initialize label as an empty string or provide a default label
    };
    setRooms([...rooms, newRoom]);
    setCurrentRoom([]); // Reset the current room
  };

  // Function to handle mouse down event (start drawing a new vertex)
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    let x = e.clientX;
    let y = e.clientY;

    // Check for snapping with existing vertices
    const snapDistance = 10; // Threshold distance for snapping (in pixels)
    rooms.forEach((room) => {
      const snapThreshold = 10; // Threshold distance for snapping (in pixels)
      rooms.forEach((room) => {
        room.vertices.forEach((vertex) => {
          const distance = Math.sqrt((vertex.x - x) ** 2 + (vertex.y - y) ** 2);
          if (distance < snapThreshold) {
            x = vertex.x; // Snap to the existing vertex
            y = vertex.y;
          }
        });
      });
      room.vertices.forEach((vertex) => {
        const distance = Math.sqrt((vertex.x - x) ** 2 + (vertex.y - y) ** 2);
        if (distance < snapDistance) {
          x = vertex.x; // Snap to the existing vertex
          y = vertex.y;
        }
      });
    });

    setCurrentRoom([...currentRoom, { x, y }]);
  };

  // Function to handle mouse click on the canvas
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const x = e.clientX;
    const y = e.clientY;
    if (placingTower) {
      setTowers([...towers, { x, y }]);
      setPlacingTower(false); // Exit tower placement mode
    }

    rooms.forEach((room, index) => {
      if (isPointInsideRoom(x, y, room)) {
        // Use x and y here
        setSelectedRoomIndex(index);
      }
    });
  };

  // Function to check if a point is inside a room (can use a library or custom logic)
  const isPointInsideRoom = (x: number, y: number, room: Room) => {
    // Implement logic to check if the point (x, y) is inside the room
    // This can be done using a point-in-polygon algorithm
    return true;
  };

  const [towers, setTowers] = useState<Tower[]>([]);
  const renderRooms = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        towers.forEach((tower) => {
          ctx.beginPath();
          ctx.arc(tower.x, tower.y, 10, 0, 2 * Math.PI); // Draw a circle for the tower
          ctx.fillStyle = "blue";
          ctx.fill();
        });
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

        // Iterate through the rooms and draw each one
        rooms.forEach((room, roomIndex) => {
          // Include roomIndex as the second parameter
          ctx.strokeStyle = roomIndex === selectedRoomIndex ? "red" : "black"; // Highlight the selected room
          ctx.beginPath();
          room.vertices.forEach((vertex, index) => {
            if (index === 0) {
              ctx.moveTo(vertex.x, vertex.y); // Move to the first vertex
            } else {
              ctx.lineTo(vertex.x, vertex.y); // Draw lines to subsequent vertices
            }
          });
          ctx.closePath(); // Close the path to create a polygon
          ctx.stroke(); // Stroke the path to draw the lines
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

  // Call renderRooms inside a useEffect to ensure it runs when rooms change
  useEffect(() => {
    renderRooms();
  }, [rooms]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <button onClick={() => setPlacingTower(true)}>Place Tower</button>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
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
