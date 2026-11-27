import { isInJoystickZone, joystickVector } from '../../src/game/joystick';

test('joystick vektörü 1 ile sınırlı', () => {
  const v = joystickVector({ x: 0, y: 0 }, { x: 300, y: 0 }, 60);
  expect(v.x).toBeCloseTo(1); expect(v.y).toBeCloseTo(0);
});
test('yarıçap içinde orantılı', () => {
  const v = joystickVector({ x: 10, y: 10 }, { x: 10, y: 40 }, 60);
  expect(v.x).toBeCloseTo(0); expect(v.y).toBeCloseTo(0.5);
});
test('ölü bölge', () => expect(joystickVector({ x: 0, y: 0 }, { x: 3, y: 0 }, 60)).toEqual({ x: 0, y: 0 }));
test('joystick bölgesi alt ⅔', () => { expect(isInJoystickZone(100, 960)).toBe(false); expect(isInJoystickZone(400, 960)).toBe(true); });
