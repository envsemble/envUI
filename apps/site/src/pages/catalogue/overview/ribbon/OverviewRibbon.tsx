import { useEffect, useRef } from 'react';
import { useDisplaySettings } from '../../../../display/useDisplaySettings';
import { reducedMotionQuery } from '../../../../shared/ReducedMotion';
import { remeasure } from '../../../../shared/Remeasure';
import { useHydrated } from '../../../../shared/useHydrated';
import { arcFrame } from './RibbonArc';
import type { RibbonFrame, RibbonView } from './RibbonScene';
import './OverviewRibbon.css';

const loadAheadMargin = '200px';
const frameIntervalMs = 1000 / 30;
const longestStepS = 0.1;
const pixelRatioCap = 2;
const themeAttribute = 'data-env-theme';
const framingSelector = '.catalogue-overview-widget';
const clearedSelector = '.catalogue-overview-facts';
const arcProperty = '--catalogue-overview-ribbon-arc';
const narrowestFramePx = 300;

function frameOf(box: HTMLElement, arc: boolean): RibbonFrame | null {
  const outer = box.getBoundingClientRect();
  const inner = (box.parentElement?.querySelector(framingSelector) ?? box).getBoundingClientRect();
  if (outer.width < 1 || outer.height < 1) return null;
  if (arc)
    return arcFrame(
      outer,
      inner,
      box.parentElement?.querySelector(clearedSelector)?.getBoundingClientRect(),
    );
  if (inner.width < narrowestFramePx) return null;
  return {
    width: outer.width,
    height: outer.height,
    cornerX: inner.right - outer.left,
    cornerY: inner.top - outer.top,
    unit: inner.width / 2,
  };
}

function startRibbon(box: HTMLElement, paused: () => boolean) {
  const canvas = document.createElement('canvas');
  canvas.className = 'catalogue-ribbon-canvas';
  box.append(canvas);
  let view: RibbonView | null = null;
  let stopped = false;
  let shown = false;
  let clock = 0;
  let last = 0;
  let frame = 0;
  let arc = false;
  const reduced = reducedMotionQuery();
  const moving = () =>
    view !== null && shown && !canvas.hidden && !document.hidden && !reduced?.matches && !paused();

  const draw = () => {
    const placed = frameOf(box, arc);
    canvas.hidden = !placed;
    if (!view || !placed) return;
    const dark = box.closest(`[${themeAttribute}]`)?.getAttribute(themeAttribute) === 'dark';
    view.draw(placed, Math.min(pixelRatioCap, devicePixelRatio || 1), dark, clock);
  };
  const tick = (now: number) => {
    frame = 0;
    if (!moving()) return;
    frame = requestAnimationFrame(tick);
    if (last && now - last < frameIntervalMs) return;
    if (last) clock += Math.min(longestStepS, (now - last) / 1000);
    last = now;
    draw();
  };
  let loading = false;
  let unavailable = false;
  let lost = false;
  const create = () => {
    if (loading || unavailable || lost) return;
    loading = true;
    import('./RibbonScene')
      .then(({ createRibbonView }) => {
        loading = false;
        if (stopped || view || lost) return;
        view = createRibbonView(canvas);
        unavailable = !view;
        update();
      })
      .catch(() => {
        loading = false;
        unavailable = true;
      });
  };

  const update = () => {
    if (stopped) return;
    arc = getComputedStyle(box).getPropertyValue(arcProperty).trim() !== '';
    canvas.hidden = !frameOf(box, arc);
    if (shown && !canvas.hidden && !view) create();
    if (moving()) {
      if (!frame) {
        last = 0;
        frame = requestAnimationFrame(tick);
      }
    } else {
      cancelAnimationFrame(frame);
      frame = 0;
      draw();
    }
  };
  const measuring = remeasure(update, {
    resize: [box],
    mutation: {
      target: document.documentElement,
      options: { attributes: true, subtree: true, attributeFilter: [themeAttribute] },
    },
  });
  const seen = new IntersectionObserver(
    ([entry]) => {
      shown = entry?.isIntersecting ?? false;
      update();
    },
    { rootMargin: loadAheadMargin },
  );
  seen.observe(box);
  const framing = box.parentElement?.querySelector(framingSelector);
  if (framing) measuring.observe(framing);
  const cleared = box.parentElement?.querySelector(clearedSelector);
  if (cleared) measuring.observe(cleared);
  const onLost = (event: Event) => {
    event.preventDefault();
    lost = true;
    view = null;
    cancelAnimationFrame(frame);
    frame = 0;
  };
  const onRestored = () => {
    lost = false;
    update();
  };
  canvas.addEventListener('webglcontextlost', onLost);
  canvas.addEventListener('webglcontextrestored', onRestored);
  document.addEventListener('visibilitychange', update);
  reduced?.addEventListener('change', update);

  return {
    update,
    stop() {
      stopped = true;
      cancelAnimationFrame(frame);
      measuring.stop();
      seen.disconnect();
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', onRestored);
      document.removeEventListener('visibilitychange', update);
      reduced?.removeEventListener('change', update);
      view?.dispose();
      canvas.remove();
    },
  };
}

export function OverviewRibbon({ className }: { className?: string }) {
  const hydrated = useHydrated();
  const { motionPaused } = useDisplaySettings();
  const boxRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(motionPaused);
  const ribbonRef = useRef<ReturnType<typeof startRibbon> | null>(null);

  useEffect(() => {
    const box = boxRef.current;
    if (!hydrated || !box) return;
    const ribbon = startRibbon(box, () => pausedRef.current);
    ribbonRef.current = ribbon;
    return () => {
      ribbon.stop();
      ribbonRef.current = null;
    };
  }, [hydrated]);

  useEffect(() => {
    pausedRef.current = motionPaused;
    ribbonRef.current?.update();
  }, [motionPaused]);

  if (!hydrated) return null;
  return <div ref={boxRef} className={`catalogue-ribbon ${className ?? ''}`} aria-hidden="true" />;
}
