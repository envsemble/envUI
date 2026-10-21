import { useLayoutEffect, useRef, useState } from 'react';
import { Theme, useTheme, type ThemeValue } from '@envsemble/envui';
import type { AnatomyLegendItem } from '../DocumentationTypes';
import { Documentation } from '../pages/Documentation';
import { ExampleCode, ExampleRender } from './LiveExample';
import { legendOf, partDescription, partSelector } from './Parts';

/** A callout's number, where it sits and the part it points at, in the stage's coordinates. */
interface Callout {
  number: number;
  badge: { x: number; y: number };
  anchor: { x: number; y: number };
  /** The part's box, outlined; the root's is not. */
  box?: { x: number; y: number; width: number; height: number };
}

type Side = 'top' | 'bottom' | 'left' | 'right';
interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** How far outside the component a callout's badge sits, and the badges' diameter, in px. */
const reach = 28;
const badgeSize = 24;
/** The least distance between two badges' centres on one side. */
const spacing = badgeSize + 4;

/** The box of a part, or of its own text, relative to the stage. */
function boxOf(element: Element, text: boolean, origin: DOMRect): Box | undefined {
  let rects: DOMRect[] = [element.getBoundingClientRect()];
  if (text) {
    rects = [];
    for (const node of element.childNodes)
      if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
        const range = document.createRange();
        range.selectNodeContents(node);
        rects.push(range.getBoundingClientRect());
      }
  }
  rects = rects.filter((rect) => rect.width || rect.height);
  if (!rects.length) return undefined;
  return {
    left: Math.min(...rects.map((rect) => rect.left)) - origin.left,
    top: Math.min(...rects.map((rect) => rect.top)) - origin.top,
    right: Math.max(...rects.map((rect) => rect.right)) - origin.left,
    bottom: Math.max(...rects.map((rect) => rect.bottom)) - origin.top,
  };
}

/** Spreads positions along one side so badges never overlap, within `min` and `max`. */
function spread(positions: number[], min: number, max: number) {
  const order = positions.map((_, index) => index).sort((a, b) => positions[a] - positions[b]);
  const placed = order.map((index) => positions[index]);
  for (let index = 1; index < placed.length; index++)
    placed[index] = Math.max(placed[index], placed[index - 1] + spacing);
  if (placed.length) placed[placed.length - 1] = Math.min(placed.at(-1)!, max);
  for (let index = placed.length - 2; index >= 0; index--)
    placed[index] = Math.min(placed[index], placed[index + 1] - spacing);
  if (placed.length) placed[0] = Math.max(placed[0], min);
  const result = [...positions];
  order.forEach((index, rank) => (result[index] = placed[rank]));
  return result;
}

/**
 * Places a numbered callout on each part found in the subject: on the side of the component the
 * part is nearest to, the root at the start, with a line to the part and its box outlined.
 */
function measure(stage: HTMLElement, subject: HTMLElement, legend: AnatomyLegendItem[]) {
  const origin = stage.getBoundingClientRect();
  const rtl = getComputedStyle(stage).direction === 'rtl';
  const found = legend.flatMap((item, index) => {
    const { selector, text } = partSelector(item.part);
    let element: Element | null;
    try {
      element = subject.querySelector(selector);
    } catch {
      // A reference that is no selector numbers nothing; the legend still lists it.
      return [];
    }
    const box = element && boxOf(element, text, origin);
    return box ? [{ number: index + 1, box }] : [];
  });
  if (!found.length) return [];
  const outer: Box = {
    left: Math.min(...found.map(({ box }) => box.left)),
    top: Math.min(...found.map(({ box }) => box.top)),
    right: Math.max(...found.map(({ box }) => box.right)),
    bottom: Math.max(...found.map(({ box }) => box.bottom)),
  };
  const placed = found.map(({ number, box }) => {
    const root =
      box.left - outer.left < 1 &&
      box.top - outer.top < 1 &&
      outer.right - box.right < 1 &&
      outer.bottom - box.bottom < 1;
    // The nearest side, with the sides above and below preferred by a few pixels.
    const distances: [Side, number][] = [
      ['top', box.top - outer.top],
      ['bottom', outer.bottom - box.bottom],
      ['left', box.left - outer.left + 6],
      ['right', outer.right - box.right + 6],
    ];
    const side: Side = root
      ? rtl
        ? 'right'
        : 'left'
      : distances.reduce((best, entry) => (entry[1] < best[1] ? entry : best))[0];
    return { number, box, root, side };
  });
  const callouts: Callout[] = [];
  for (const side of ['top', 'bottom', 'left', 'right'] as const) {
    const items = placed.filter((item) => item.side === side);
    const vertical = side === 'top' || side === 'bottom';
    const centre = (box: Box) =>
      vertical ? (box.left + box.right) / 2 : (box.top + box.bottom) / 2;
    const extent = vertical ? origin.width : origin.height;
    const along = spread(
      items.map(({ box }) => centre(box)),
      badgeSize / 2 + 2,
      extent - badgeSize / 2 - 2,
    );
    items.forEach(({ number, box, root }, index) => {
      const at = along[index];
      const clamp = (value: number, low: number, high: number) =>
        Math.min(Math.max(value, low + 2), Math.max(high - 2, low + 2));
      const badge =
        side === 'top'
          ? { x: at, y: outer.top - reach }
          : side === 'bottom'
            ? { x: at, y: outer.bottom + reach }
            : side === 'left'
              ? { x: outer.left - reach, y: at }
              : { x: outer.right + reach, y: at };
      const anchor =
        side === 'top'
          ? { x: clamp(at, box.left, box.right), y: box.top }
          : side === 'bottom'
            ? { x: clamp(at, box.left, box.right), y: box.bottom }
            : side === 'left'
              ? { x: box.left, y: clamp(at, box.top, box.bottom) }
              : { x: box.right, y: clamp(at, box.top, box.bottom) };
      callouts.push({
        number,
        badge,
        anchor,
        box: root
          ? undefined
          : { x: box.left, y: box.top, width: box.right - box.left, height: box.bottom - box.top },
      });
    });
  }
  return callouts.sort((a, b) => a.number - b.number);
}

/** The component in one theme, with its callouts measured from its live parts. */
function AnatomyStage({
  page,
  name,
  theme,
  legend,
}: {
  page: string;
  name: string;
  theme: ThemeValue;
  legend: AnatomyLegendItem[];
}) {
  const { contrast, scale } = useTheme();
  const stage = useRef<HTMLDivElement>(null);
  const subject = useRef<HTMLDivElement>(null);
  const [callouts, setCallouts] = useState<Callout[]>([]);
  useLayoutEffect(() => {
    const stageElement = stage.current;
    const subjectElement = subject.current;
    if (!stageElement || !subjectElement) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      // Only a change of place re-renders the callouts.
      frame = requestAnimationFrame(() => {
        const next = measure(stageElement, subjectElement, legend);
        setCallouts((current) =>
          JSON.stringify(current) === JSON.stringify(next) ? current : next,
        );
      });
    };
    update();
    // The callouts follow the figure as it resizes, its example loads and its fonts arrive.
    const resize = new ResizeObserver(update);
    resize.observe(stageElement);
    resize.observe(subjectElement);
    const mutation = new MutationObserver(update);
    mutation.observe(subjectElement, {
      childList: true,
      subtree: true,
      attributeFilter: ['class', 'style'],
    });
    void document.fonts?.ready.then(update);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      mutation.disconnect();
    };
  }, [legend]);
  return (
    <Theme
      theme={theme}
      contrast={contrast}
      scale={scale}
      ref={stage}
      className="docs-anatomy-stage"
      data-theme={theme}
    >
      {/* A picture of the parts: the live component neither takes focus nor changes under it. */}
      <div ref={subject} className="docs-anatomy-subject" inert>
        <ExampleRender page={page} name={name} />
      </div>
      <svg className="docs-anatomy-lines" aria-hidden="true">
        {callouts.map(({ number, badge, anchor, box }) => (
          <g key={number}>
            {box && (
              <rect
                className="docs-anatomy-box"
                x={box.x}
                y={box.y}
                width={box.width}
                height={box.height}
              />
            )}
            <line x1={badge.x} y1={badge.y} x2={anchor.x} y2={anchor.y} />
            <circle cx={anchor.x} cy={anchor.y} r={3} />
          </g>
        ))}
      </svg>
      {callouts.map(({ number, badge }) => (
        <span
          key={number}
          className="docs-anatomy-badge"
          aria-hidden="true"
          // Measured in physical coordinates, in either direction.
          style={{ left: badge.x, top: badge.y }}
        >
          {number}
        </span>
      ))}
    </Theme>
  );
}

/** A legend item's Markdown, with the description parts.json gives a part it only names. */
function legendText({ part, text }: AnatomyLegendItem) {
  if (text.replace(/`[^`]*`/g, '').trim()) return text;
  const description = partDescription(part.replace(/::text$/, ''));
  return description ? `${text}: ${description}` : text;
}

/**
 * An anatomy figure: the live component in the light and the dark theme, a numbered callout on
 * each part its legend names, by class name, and the legend, with the example's code below.
 */
export function AnatomyFigure({
  page,
  name,
  title,
  caption,
  legend,
  of,
}: {
  page: string;
  name: string;
  title: string;
  caption?: string;
  legend?: AnatomyLegendItem[];
  of?: string;
}) {
  const [items] = useState(() => (legend?.length ? legend : legendOf(of ?? '')));
  return (
    <figure className="docs-anatomy" aria-label={title}>
      <div className="docs-anatomy-stages" data-example={name}>
        <AnatomyStage page={page} name={name} theme="light" legend={items} />
        <AnatomyStage page={page} name={name} theme="dark" legend={items} />
      </div>
      <figcaption className="docs-anatomy-caption">
        {caption && <p className="docs-figure-caption">{caption}</p>}
        {items.length > 0 && (
          <ol className="docs-anatomy-legend">
            {items.map((item, index) => (
              <li key={`${index}-${item.part}`}>
                <span className="docs-anatomy-number" aria-hidden="true">
                  {index + 1}
                </span>
                <Documentation markdown={legendText(item)} path={`components/${page}.md`} />
              </li>
            ))}
          </ol>
        )}
      </figcaption>
      <ExampleCode page={page} name={name} />
    </figure>
  );
}
