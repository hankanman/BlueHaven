// src/components/FloorPlan/utilities.ts

type Vertex = { x: number; y: number };
type Room = {
  vertices: Vertex[];
  lengths: number[];
  label: string;
};

export const calculateLength = (vertices: Vertex[]): number[] => {
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

export const isPointInsideRoom = (
  x: number,
  y: number,
  room: Room
): boolean => {
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

    const intersect = (yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi; // prettier-ignore
    if (intersect) inside = !inside;
  }
  return inside;
};

export const isPointNearEdge = (
  px: number,
  py: number,
  start: { x: number; y: number },
  end: { x: number; y: number }
) => {
  // Define the line segment's direction vector
  const dx = end.x - start.x;
  const dy = end.y - start.y;

  // If the line segment is a point
  if (dx === 0 && dy === 0) {
    const dist = Math.sqrt((px - start.x) ** 2 + (py - start.y) ** 2);
    return dist < 20;
  }

  // Calculate the t parameter for projection
  const t =
    dotProduct(px - start.x, py - start.y, dx, dy) / (dx * dx + dy * dy);

  // If t is outside the [0,1] range, it's outside the segment, so just compute distance to start or end
  if (t < 0) {
    const dist = Math.sqrt((px - start.x) ** 2 + (py - start.y) ** 2);
    return dist < 20;
  } else if (t > 1) {
    const dist = Math.sqrt((px - end.x) ** 2 + (py - end.y) ** 2);
    return dist < 20;
  }

  // Project onto the line to get closest point on the line
  const projectionX = start.x + t * dx;
  const projectionY = start.y + t * dy;

  // Compute distance from the point to this projection
  const dist = Math.sqrt((px - projectionX) ** 2 + (py - projectionY) ** 2);
  return dist < 20;
};

const dotProduct = (ax: number, ay: number, bx: number, by: number) => {
  return ax * bx + ay * by;
};

export const adjustRoomVertices = (room: Room, sideIndex: number) => {
  const vertexA = room.vertices[sideIndex];
  const vertexB = room.vertices[(sideIndex + 1) % room.vertices.length];
  const newLength = room.lengths[sideIndex];

  // Calculate the angle of the side
  const angle = Math.atan2(vertexB.y - vertexA.y, vertexB.x - vertexA.x);

  // Adjust the position of vertexB based on the new length and angle
  vertexB.x = vertexA.x + newLength * Math.cos(angle);
  vertexB.y = vertexA.y + newLength * Math.sin(angle);

  // TODO: Adjust subsequent vertices to maintain the shape

  // For now, we'll adjust only the immediate next vertex
  const vertexC = room.vertices[(sideIndex + 2) % room.vertices.length];
  if (vertexC) {
    const sideBCPrevLength = Math.sqrt(
      (vertexC.x - vertexB.x) ** 2 + (vertexC.y - vertexB.y) ** 2
    );
    const angleBC = Math.atan2(vertexC.y - vertexB.y, vertexC.x - vertexB.x);
    vertexC.x = vertexB.x + sideBCPrevLength * Math.cos(angleBC);
    vertexC.y = vertexB.y + sideBCPrevLength * Math.sin(angleBC);
  }
};
