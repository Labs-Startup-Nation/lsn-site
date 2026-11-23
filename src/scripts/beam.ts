import { BEAM, ease, glideTarget, renderBeam, type Glide } from './beam-core';

interface Item {
  el: HTMLElement;
  canvas: HTMLCanvasElement;
  shift: number;
  offset: number;
  seen: boolean;
  interactive: boolean;
  glide: Glide;
  target: Glide;
}

/** Draws every `.beam` under `root`, animates the visible ones, and lets `[data-interactive]` beams follow the pointer. */
export function initBeams(root: ParentNode = document): () => void {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const items: Item[] = [...root.querySelectorAll<HTMLElement>('.beam')].flatMap((el, i) => {
    const canvas = el.querySelector('canvas');
    if (!canvas) return [];
    return [{
      el, canvas, shift: parseFloat(el.dataset.shift ?? '0') || 0, offset: i * 1.7, seen: true,
      interactive: el.hasAttribute('data-interactive'), glide: { dx: 0, dy: 0 }, target: { dx: 0, dy: 0 },
    }];
  });
  let phase = 0;
  const cleanups: (() => void)[] = [];

  const paint = (it: Item) => {
    renderBeam(it.canvas, it.shift, reduce ? 0 : phase + it.offset, it.glide);
    it.el.dataset.drawn = '';
  };
  const drawAll = () => items.forEach((it) => it.el.offsetParent !== null && paint(it));

  for (const it of items) {
    if (!it.interactive) continue;
    it.el.dataset.glideDx = '0';
    if (reduce || !finePointer) continue;
    const move = (e: PointerEvent) => {
      const r = it.el.getBoundingClientRect();
      it.target = glideTarget((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
    };
    const leave = () => { it.target = { dx: 0, dy: 0 }; };
    it.el.addEventListener('pointermove', move);
    it.el.addEventListener('pointerleave', leave);
    cleanups.push(() => { it.el.removeEventListener('pointermove', move); it.el.removeEventListener('pointerleave', leave); });
  }

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      const it = items.find((x) => x.el === e.target);
      if (it) it.seen = e.isIntersecting;
    }));
    items.forEach((it) => io.observe(it.el));
    cleanups.push(() => io.disconnect());
  }

  let resizeTimer: number | undefined;
  const onResize = () => { clearTimeout(resizeTimer); resizeTimer = window.setTimeout(drawAll, 120); };
  addEventListener('resize', onResize);
  cleanups.push(() => removeEventListener('resize', onResize));
  document.fonts?.ready.then(drawAll);
  drawAll();

  if (!reduce) {
    let raf = 0;
    let last = 0;
    const tick = (now: number) => {
      // The glide eases every frame so it feels smooth; the costly repaint stays throttled.
      for (const it of items) {
        if (!it.interactive) continue;
        it.glide = { dx: ease(it.glide.dx, it.target.dx), dy: ease(it.glide.dy, it.target.dy) };
        it.el.dataset.glideDx = it.glide.dx.toFixed(4);
      }
      if (now - last > BEAM.frameMs) {
        phase += BEAM.phaseStep;
        last = now;
        items.forEach((it) => it.seen && it.el.offsetParent !== null && paint(it));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    cleanups.push(() => cancelAnimationFrame(raf));
  }

  return () => cleanups.forEach((fn) => fn());
}
