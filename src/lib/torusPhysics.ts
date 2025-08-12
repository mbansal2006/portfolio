// Pure physics functions for torus-based pong game
// All functions are pure and testable

export interface Vector2D {
  x: number;
  y: number;
}

export interface Ball {
  pos: Vector2D;
  vel: Vector2D;
  radius: number;
  id: number;
}

export interface Cursor {
  pos: Vector2D;
  radius: number;
}

export interface PhysicsConfig {
  damping: number;
  impulseCoefficient: number;
  tangentialDamping: number;
  attractorMode: boolean;
}

// Wrap a single coordinate value
export function wrapCoord(x: number, max: number): number {
  if (x < 0) return x + max;
  if (x >= max) return x - max;
  return x;
}

// Wrap a 2D vector to torus coordinates
export function wrapVec(pos: Vector2D, width: number, height: number): Vector2D {
  return {
    x: wrapCoord(pos.x, width),
    y: wrapCoord(pos.y, height)
  };
}

// Calculate shortest distance between two points on a torus
export function distanceWrapped(a: Vector2D, b: Vector2D, width: number, height: number): number {
  const dx = Math.min(
    Math.abs(a.x - b.x),
    Math.abs(a.x - b.x + width),
    Math.abs(a.x - b.x - width)
  );
  const dy = Math.min(
    Math.abs(a.y - b.y),
    Math.abs(a.y - b.y + height),
    Math.abs(a.y - b.y - height)
  );
  return Math.sqrt(dx * dx + dy * dy);
}

// Get unit vector from a to b on torus shortest path
export function directionWrapped(a: Vector2D, b: Vector2D, width: number, height: number): Vector2D {
  let dx = b.x - a.x;
  let dy = b.y - a.y;
  
  // Find shortest path on torus
  if (dx > width / 2) dx -= width;
  if (dx < -width / 2) dx += width;
  if (dy > height / 2) dy -= height;
  if (dy < -height / 2) dy += height;
  
  const length = Math.sqrt(dx * dx + dy * dy);
  if (length === 0) return { x: 0, y: 0 };
  
  return {
    x: dx / length,
    y: dy / length
  };
}

// Apply cursor impulse to ball
export function applyCursorImpulse(
  ball: Ball, 
  cursor: Cursor, 
  width: number, 
  height: number, 
  config: PhysicsConfig
): void {
  const distance = distanceWrapped(ball.pos, cursor.pos, width, height);
  const combinedRadius = ball.radius + cursor.radius;
  
  if (distance <= combinedRadius) {
    const penetrationDepth = combinedRadius - distance;
    const normal = directionWrapped(cursor.pos, ball.pos, width, height);
    
    // Reverse normal if in attractor mode
    const impulseDirection = config.attractorMode 
      ? { x: -normal.x, y: -normal.y }
      : normal;
    
    // Apply impulse
    const impulseMagnitude = config.impulseCoefficient * penetrationDepth;
    ball.vel.x += impulseDirection.x * impulseMagnitude;
    ball.vel.y += impulseDirection.y * impulseMagnitude;
    
    // Apply tangential damping for stability
    const tangentialVel = ball.vel.x * normal.y - ball.vel.y * normal.x;
    ball.vel.x -= tangentialVel * normal.y * config.tangentialDamping;
    ball.vel.y += tangentialVel * normal.x * config.tangentialDamping;
  }
}

// Update ball physics for one frame
export function updateBall(
  ball: Ball, 
  cursor: Cursor, 
  width: number, 
  height: number, 
  config: PhysicsConfig,
  deltaTime: number
): void {
  // Integrate velocity
  ball.pos.x += ball.vel.x * deltaTime;
  ball.pos.y += ball.vel.y * deltaTime;
  
  // Wrap coordinates
  ball.pos = wrapVec(ball.pos, width, height);
  
  // Apply cursor impulse
  applyCursorImpulse(ball, cursor, width, height, config);
  
  // Apply global damping
  ball.vel.x *= config.damping;
  ball.vel.y *= config.damping;
}

// Calculate ball speed in pixels per second
export function getBallSpeed(ball: Ball): number {
  return Math.sqrt(ball.vel.x * ball.vel.x + ball.vel.y * ball.vel.y);
}

// Calculate total distance traveled by ball
export function calculateDistanceTraveled(ball: Ball, deltaTime: number): number {
  return getBallSpeed(ball) * deltaTime;
}

// Detect if ball crossed an edge (for loop detection)
export function detectEdgeCross(
  oldPos: Vector2D, 
  newPos: Vector2D, 
  width: number, 
  height: number
): 'none' | 'left' | 'right' | 'top' | 'bottom' {
  // Check horizontal wrapping
  if (oldPos.x >= width - 1 && newPos.x < 1) return 'right';
  if (oldPos.x < 1 && newPos.x >= width - 1) return 'left';
  
  // Check vertical wrapping
  if (oldPos.y >= height - 1 && newPos.y < 1) return 'bottom';
  if (oldPos.y < 1 && newPos.y >= height - 1) return 'top';
  
  return 'none';
}
