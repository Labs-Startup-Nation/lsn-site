// Dithered "beam": a diagonal colour ramp drawn in coarse cells with 4×4 ordered (Bayer) dithering
// and a cream grid, ported from the validated mockup ("solar" palette, "diag" layout).

export type RGB = [number, number, number];
export type Stop = [number, RGB];

export const BEAM = {
  cell: 5,
  angle: 24,
  wave: 0.06,
  freq: 1.2,
  grid: 'rgba(255,251,240,.45)',
  /** 80 ms (mockup: 50 ms) to keep the main thread free on phones; phaseStep scaled so the speed is unchanged. */
  frameMs: 80,
  phaseStep: 0.056,
  /** Under this width only interactive (hero) beams animate; the others are drawn once. */
  animateAllFrom: 600,
  glideMax: 0.04,
  /** dy (in [-glideMax, glideMax]) is multiplied by this before being added to the wave phase, in radians. */
  glidePhase: 25,
} as const;

const hex = (h: string): RGB => {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

export const SOLAR: Stop[] = (
  [
    [0, '#14CBFD'], [0.22, '#14CBFD'], [0.27, '#DDF2F8'], [0.34, '#FB8E56'], [0.48, '#FD3F07'],
    [0.6, '#FB6A3A'], [0.67, '#FEFC76'], [0.84, '#FFF6C8'], [1, '#FFFBF0'],
  ] as const
).map(([at, color]) => [at, hex(color)] as Stop);

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);

/** Colour of the cell at grid position (x, y) for ramp position u (clamped to [0, 1]). */
export function pickColor(u: number, x: number, y: number, stops: Stop[]): RGB {
  const v = u < 0 ? 0 : u > 1 ? 1 : u;
  let i = 0;
  while (i < stops.length - 2 && v > stops[i + 1][0]) i++;
  const [a0, c0] = stops[i];
  const [a1, c1] = stops[i + 1];
  const fr = (v - a0) / Math.max(1e-6, a1 - a0);
  return fr > BAYER[(y & 3) * 4 + (x & 3)] ? c1 : c0;
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Pointer position normalised to the beam (0–1 on each axis) → target glide offset. */
export function glideTarget(px: number, py: number): { dx: number; dy: number } {
  const m = BEAM.glideMax;
  const round = (v: number) => Math.round(v * 1e6) / 1e6 + 0; // +0 turns -0 into 0
  return { dx: round((clamp01(px) - 0.5) * 2 * m), dy: round((clamp01(py) - 0.5) * 2 * m) };
}

export function ease(current: number, target: number, k = 0.08): number {
  return current + (target - current) * k;
}

export interface Glide { dx: number; dy: number }

/** Paints the beam into `canvas` at its CSS size. `shift` moves the ramp; `phase` animates the wave. */
export function renderBeam(canvas: HTMLCanvasElement, shift: number, phase: number, glide: Glide = { dx: 0, dy: 0 }): void {
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const W = Math.round(rect.width * dpr);
  const H = Math.round(rect.height * dpr);
  if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }

  const cell = Math.max(2, Math.round(BEAM.cell * dpr));
  const cols = Math.ceil(W / cell);
  const rows = Math.ceil(H / cell);
  const store = canvas as HTMLCanvasElement & { _off?: HTMLCanvasElement };
  const off = store._off ?? (store._off = document.createElement('canvas'));
  off.width = cols; off.height = rows;
  const octx = off.getContext('2d');
  const ctx = canvas.getContext('2d');
  if (!octx || !ctx) return;
  const img = octx.createImageData(cols, rows);
  const d = img.data;

  const a = (BEAM.angle * Math.PI) / 180;
  const ca = Math.cos(a), sa = Math.sin(a);
  const corners = [0, cols * ca, rows * sa, cols * ca + rows * sa];
  const mn = Math.min(...corners), mx = Math.max(...corners);
  const span = Math.max(cols, rows);
  const drift = 0.025 * Math.sin(phase * 0.35);
  const wavePhase = phase + glide.dy * BEAM.glidePhase;
  const offset = shift + drift + glide.dx;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let u = (x * ca + y * sa - mn) / (mx - mn);
      u += BEAM.wave * Math.sin(((-x * sa + y * ca) / span) * BEAM.freq * 6.283 + wavePhase);
      const c = pickColor(u + offset, x, y, SOLAR);
      const q = (y * cols + x) * 4;
      d[q] = c[0]; d[q + 1] = c[1]; d[q + 2] = c[2]; d[q + 3] = 255;
    }
  }
  octx.putImageData(img, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(off, 0, 0, cols * cell, rows * cell);
  ctx.fillStyle = BEAM.grid;
  const g = Math.max(1, Math.round(dpr * 0.8));
  for (let gx = 0; gx < cols; gx++) ctx.fillRect(gx * cell, 0, g, H);
  for (let gy = 0; gy < rows; gy++) ctx.fillRect(0, gy * cell, W, g);
}
