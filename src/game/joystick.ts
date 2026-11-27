export interface Vec { x: number; y: number }

export const JOYSTICK_DEADZONE = 0.1;

export function joystickVector(origin: Vec, pointer: Vec, radius: number): Vec {
  const dx = pointer.x - origin.x, dy = pointer.y - origin.y;
  const len = Math.hypot(dx, dy);
  const mag = Math.min(len / radius, 1);
  if (mag < JOYSTICK_DEADZONE || len === 0) return { x: 0, y: 0 };
  return { x: (dx / len) * mag, y: (dy / len) * mag };
}

export const isInJoystickZone = (y: number, screenHeight: number): boolean => y >= screenHeight / 3;
