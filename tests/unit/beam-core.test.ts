import { describe, expect, test } from 'vitest';
import { pickColor, SOLAR, glideTarget, ease, BEAM } from '../../src/scripts/beam-core';

describe('pickColor', () => {
  test('ends of the ramp', () => {
    expect(pickColor(0, 0, 0, SOLAR)).toEqual([20, 203, 253]);
    expect(pickColor(1, 3, 3, SOLAR)).toEqual([255, 251, 240]);
  });
  test('clamps out-of-range positions', () => {
    for (const [x, y] of [[0, 0], [1, 2], [3, 1]]) {
      expect(pickColor(-0.5, x, y, SOLAR)).toEqual(pickColor(0, x, y, SOLAR));
      expect(pickColor(1.7, x, y, SOLAR)).toEqual(pickColor(1, x, y, SOLAR));
    }
  });
  test('ordered dithering mixes the two neighbouring stops in proportion', () => {
    const high = [0xfb, 0x8e, 0x56]; // stop .34
    let count = 0;
    for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) if (pickColor(0.3, x, y, SOLAR).join() === high.join()) count++;
    expect(Math.abs(count - Math.round(((0.3 - 0.27) / 0.07) * 16))).toBeLessThanOrEqual(1);
  });
});

describe('mouse glide', () => {
  test('centre is neutral, corners reach the limit', () => {
    expect(glideTarget(0.5, 0.5)).toEqual({ dx: 0, dy: 0 });
    expect(glideTarget(1, 1)).toEqual({ dx: 0.04, dy: 0.04 });
    expect(glideTarget(0, 0)).toEqual({ dx: -0.04, dy: -0.04 });
  });
  test('out-of-range pointer positions are clamped', () => {
    expect(glideTarget(3, -2)).toEqual({ dx: 0.04, dy: -0.04 });
  });
  test('ease moves 8% of the way', () => {
    expect(ease(0, 1)).toBeCloseTo(0.08);
    expect(ease(1, 1)).toBe(1);
  });
});

test('beam parameters match the mockup', () => {
  expect(BEAM).toMatchObject({ cell: 5, angle: 24, wave: 0.06, freq: 1.2, frameMs: 50, phaseStep: 0.035 });
});
