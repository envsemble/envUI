import {
  easingFunction,
  motionDuration,
  motionEasing,
} from '../../../internal/motion/motionTokens.js';
import {
  glideAt,
  glideStep,
  glideTo,
  wavePath,
  wavePlace,
  type Glide,
  type WaveLayout,
} from './contentsWave.js';
import { pixelsOf } from '../../../internal/dom/lengths.js';
import '../../../styles/Base.css';
import '../../../styles/TableOfContents.css';

const largestStepFollowedWithoutGlideInEntries = 0.2;

function measureWave(body: HTMLElement, shape: SVGSVGElement): WaveLayout | null {
  const links = body.querySelectorAll<HTMLElement>('.env-table-of-contents-link');
  if (links.length === 0) return null;
  const anchors = Array.from(links, (link) => link.offsetTop + link.offsetHeight / 2);
  const first = links[0];
  const last = links[links.length - 1];
  const roomAroundEntries = getComputedStyle(body);
  return {
    anchors,
    top: first.offsetTop - pixelsOf(roomAroundEntries.paddingTop),
    bottom: last.offsetTop + last.offsetHeight + pixelsOf(roomAroundEntries.paddingBottom),
    full: pixelsOf(getComputedStyle(shape).width),
  };
}

export interface WaveDrawer {
  /** Moves the reader's place to a position among the entries, or takes it away with null. */
  wave(position: number | null): void;
  /** Measures the entries again, as their sizes changed. */
  remeasure(): void;
  onPointerOver(event: PointerEvent): void;
  onPointerLeave(): void;
  stop(): void;
}

/**
 * Draws the shape beside a table of contents' list that marks the reader's place: every frame the
 * place moves, by writing its outline directly, without rendering the list again. It keeps its
 * shape and follows the scroll as it is; a larger step, such as a chosen section's jump or a mouse
 * wheel's without smooth scrolling, glides there in the medium duration with the entering easing,
 * never past it, while the label there takes the text color. The swell under the pointer grows and
 * fades in the fast one. No frame is drawn once they rest. At once where reduced motion is
 * preferred or the motion tokens are 0s.
 */
export function createWaveDrawer(
  listBox: () => HTMLElement | null,
  shape: () => SVGSVGElement | null,
  reducedMotion: MediaQueryList | null,
): WaveDrawer {
  let layout: WaveLayout | null = null;
  let target: number | null = null;
  const place: Glide = glideAt(0);
  let placed = false;
  let swellsUnderPointer: Glide[] = [];
  let entryUnderPointer = -1;
  let drawFrame = 0;

  const draw = (now: number) => {
    drawFrame = 0;
    const box = listBox();
    const svg = shape();
    const path = svg?.querySelector('path');
    if (!box || !svg || !path) return;
    if (!layout) {
      layout = measureWave(box, svg);
      if (!layout) return;
      swellsUnderPointer = layout.anchors.map((_, index) =>
        glideAt(index === entryUnderPointer ? 1 : 0),
      );
    }
    const instant = reducedMotion?.matches ?? false;
    const travel = instant ? 0 : motionDuration(box, 'medium');
    const swell = instant ? 0 : motionDuration(box, 'fast');
    const arrive = easingFunction(motionEasing(box, 'ease-enter'));
    const ease = easingFunction(motionEasing(box, 'ease'));
    let moving = false;
    if (target === null || !placed) {
      placed = target !== null;
      Object.assign(place, glideAt(target ?? 0));
    } else {
      glideTo(place, target, now, largestStepFollowedWithoutGlideInEntries);
      moving = glideStep(place, now, travel, arrive);
    }
    swellsUnderPointer.forEach((glide, index) => {
      glideTo(glide, index === entryUnderPointer ? 1 : 0, now);
      if (glideStep(glide, now, swell, ease)) moving = true;
    });
    path.setAttribute(
      'd',
      wavePath(
        layout,
        placed ? place.value : null,
        swellsUnderPointer.map((glide) => glide.value),
      ),
    );
    if (moving) drawFrame = requestAnimationFrame(draw);
  };
  const redraw = () => {
    if (drawFrame === 0) drawFrame = requestAnimationFrame(draw);
  };
  const hover = (index: number) => {
    if (entryUnderPointer === index) return;
    entryUnderPointer = index;
    redraw();
  };

  return {
    wave(position: number | null) {
      target = position === null ? null : wavePlace(position);
      cancelAnimationFrame(drawFrame);
      draw(performance.now());
    },
    remeasure() {
      layout = null;
      redraw();
    },
    onPointerOver(event: PointerEvent) {
      if (event.pointerType !== 'mouse') return;
      const link = event.target instanceof Element ? event.target.closest('a') : null;
      const links = listBox()?.querySelectorAll('.env-table-of-contents-link');
      hover(link && links ? Array.prototype.indexOf.call(links, link) : -1);
    },
    onPointerLeave() {
      hover(-1);
    },
    stop() {
      cancelAnimationFrame(drawFrame);
    },
  };
}
