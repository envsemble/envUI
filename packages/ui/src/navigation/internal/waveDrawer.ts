import {
  easingFunction,
  motionDuration,
  motionEasing,
} from '../../internal/motion/motionTokens.js';
import {
  glideAt,
  glideStep,
  glideTo,
  wavePath,
  wavePlace,
  type Glide,
  type WaveLayout,
} from './contentsWave.js';
import '../../styles/Base.css';
import '../../styles/TableOfContents.css';

/**
 * How far the reader's place may move between two frames, in entries, and still be followed as it
 * is, as the scroll moves it; a larger step, such as a jump to a chosen section, glides there.
 */
const followStep = 0.2;

/**
 * Where the entries sit beside the shape, in layout pixels from the top of the list's box, which
 * holds the shape and is the links' offset parent, so a transform or zoom around it changes nothing.
 */
function measureWave(body: HTMLElement, shape: SVGSVGElement): WaveLayout | null {
  const links = body.querySelectorAll<HTMLElement>('.env-table-of-contents-link');
  if (links.length === 0) return null;
  const anchors = Array.from(links, (link) => link.offsetTop + link.offsetHeight / 2);
  const first = links[0]!;
  const last = links[links.length - 1]!;
  // The shape runs past the first and last entries into the room the box leaves around them, where
  // the bulge tapers whole when the reader is at either end.
  const room = getComputedStyle(body);
  return {
    anchors,
    top: first.offsetTop - (parseFloat(room.paddingTop) || 0),
    bottom: last.offsetTop + last.offsetHeight + (parseFloat(room.paddingBottom) || 0),
    full: parseFloat(getComputedStyle(shape).width) || 0,
  };
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
  /** The list's box, which holds the shape and the links. */
  body: () => HTMLElement | null,
  shape: () => SVGSVGElement | null,
  reducedMotion: MediaQueryList | null,
) {
  let layout: WaveLayout | null = null;
  let target: number | null = null;
  const place: Glide = glideAt(0);
  let placed = false;
  // How far each entry's swell under the pointer has grown, and the entry under it.
  let hovers: Glide[] = [];
  let hovered = -1;
  let drawFrame = 0;

  const draw = (now: number) => {
    drawFrame = 0;
    const box = body();
    const svg = shape();
    const path = svg?.querySelector('path');
    if (!box || !svg || !path) return;
    if (!layout) {
      layout = measureWave(box, svg);
      if (!layout) return;
      hovers = layout.anchors.map((_, index) => glideAt(index === hovered ? 1 : 0));
    }
    const instant = reducedMotion?.matches ?? false;
    const travel = instant ? 0 : motionDuration(box, 'medium');
    const swell = instant ? 0 : motionDuration(box, 'fast');
    const arrive = easingFunction(motionEasing(box, 'ease-enter'));
    const ease = easingFunction(motionEasing(box, 'ease'));
    let moving = false;
    if (target === null || !placed) {
      // The first place, or none: drawn where it is, at rest.
      placed = target !== null;
      Object.assign(place, glideAt(target ?? 0));
    } else {
      glideTo(place, target, now, followStep);
      moving = glideStep(place, now, travel, arrive);
    }
    hovers.forEach((glide, index) => {
      glideTo(glide, index === hovered ? 1 : 0, now);
      if (glideStep(glide, now, swell, ease)) moving = true;
    });
    path.setAttribute(
      'd',
      wavePath(
        layout,
        placed ? place.value : null,
        hovers.map((glide) => glide.value),
      ),
    );
    if (moving) drawFrame = requestAnimationFrame(draw);
  };
  const redraw = () => {
    if (drawFrame === 0) drawFrame = requestAnimationFrame(draw);
  };
  // The entry under a mouse swells the shape a little, as a brush pressed there.
  const hover = (index: number) => {
    if (hovered === index) return;
    hovered = index;
    redraw();
  };

  return {
    /** Moves the reader's place to a position among the entries, or takes it away with null. */
    wave(position: number | null) {
      target = position === null ? null : wavePlace(position);
      cancelAnimationFrame(drawFrame);
      draw(performance.now());
    },
    /** Measures the entries again, as their sizes changed. */
    remeasure() {
      layout = null;
      redraw();
    },
    onPointerOver(event: PointerEvent) {
      if (event.pointerType !== 'mouse') return;
      const link = event.target instanceof Element ? event.target.closest('a') : null;
      const links = body()?.querySelectorAll('.env-table-of-contents-link');
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
