import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Theme, useTheme } from '@envsemble/envui';
import type { AnatomyLegendItem, StageFill } from '../DocumentationTypes';
import { Documentation } from '../pages/Documentation';
import { ExampleCode, ExampleRender, leastFitScale } from './LiveExample';
import { OpenExample, openerBox } from './OpenExample';
import { legendOf, partDescription, partSelector } from './Parts';
import { legendName } from '../shared/CatalogueContent';
import { OptionLegend } from './OptionLegend';
import type { OptionTable } from '../shared/CatalogueContent';

/** A callout's number, where it sits and the part it points at, in the stage's coordinates. */
interface Callout {
  number: number;
  /** A variants figure's callout: the variant's name, and the side of its item it sits on. */
  label?: string;
  side?: Side;
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
/** How far below its top the root's callout points, at most: past a large corner's curve. */
const rootInset = 32;

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
 * part is nearest to, the root at the start, with a line to the part and its box outlined. In a
 * figure of an open popup, the callouts keep clear of what opens it, such as a select's field: no
 * callout sits over it, or reaches a part across it.
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
  const opener = openerBox(subject);
  const avoid: Box | undefined = opener && {
    left: opener.left - origin.left,
    top: opener.top - origin.top,
    right: opener.right - origin.left,
    bottom: opener.bottom - origin.top,
  };
  // The callouts sit outside the parts and what opens them.
  const reachOuter: Box = avoid
    ? {
        left: Math.min(outer.left, avoid.left),
        top: Math.min(outer.top, avoid.top),
        right: Math.max(outer.right, avoid.right),
        bottom: Math.max(outer.bottom, avoid.bottom),
      }
    : outer;
  /** Whether what opens the popup lies between a part and a side. */
  const blocked = (side: Side, box: Box) => {
    if (!avoid) return false;
    const across = avoid.left < box.right && avoid.right > box.left;
    const along = avoid.top < box.bottom && avoid.bottom > box.top;
    if (side === 'top') return across && avoid.bottom <= box.top + 1;
    if (side === 'bottom') return across && avoid.top >= box.bottom - 1;
    if (side === 'left') return along && avoid.right <= box.left + 1;
    return along && avoid.left >= box.right - 1;
  };
  const isRoot = (box: Box) =>
    box.left - outer.left < 1 &&
    box.top - outer.top < 1 &&
    outer.right - box.right < 1 &&
    outer.bottom - box.bottom < 1;
  // Parts that all fill the component, such as a number and its value, would crowd its start:
  // their callouts sit above and below it instead, in turn.
  const roots = found.filter(({ box }) => isRoot(box)).length;
  let stacked = 0;
  const placed = found.map(({ number, box }) => {
    const root = isRoot(box);
    if (root && roots > 1) {
      const side: Side = stacked++ % 2 ? 'bottom' : 'top';
      return { number, box, root, side };
    }
    // The nearest side, with the sides above and below preferred by a few pixels.
    const distances = (
      [
        ['top', box.top - reachOuter.top],
        ['bottom', reachOuter.bottom - box.bottom],
        ['left', box.left - reachOuter.left + 6],
        ['right', reachOuter.right - box.right + 6],
      ] as [Side, number][]
    ).filter(
      ([side], _, all) => !blocked(side, box) || all.every(([other]) => blocked(other, box)),
    );
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
    // The root's callout sits by its top corner, above its parts' on its side, rather than
    // halfway down, where a tall component's own parts, such as a card's content, take theirs.
    const parts = items.filter(({ root }) => !root).map(({ box }) => centre(box));
    const along = spread(
      items.map(({ box, root }) =>
        root && !vertical
          ? Math.min(centre(box), box.top + rootInset, Math.min(...parts) - spacing)
          : centre(box),
      ),
      badgeSize / 2 + 2,
      extent - badgeSize / 2 - 2,
    );
    items.forEach(({ number, box, root }, index) => {
      const at = along[index];
      const clamp = (value: number, low: number, high: number) =>
        Math.min(Math.max(value, low + 2), Math.max(high - 2, low + 2));
      const badge =
        side === 'top'
          ? { x: at, y: reachOuter.top - reach }
          : side === 'bottom'
            ? { x: at, y: reachOuter.bottom + reach }
            : side === 'left'
              ? { x: reachOuter.left - reach, y: at }
              : { x: reachOuter.right + reach, y: at };
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

/** The room, in px, a variants figure's names take beside its items: on the start side or above. */
interface Room {
  start: number;
  top: number;
}

/** A name's width in px, as its callout draws it, measured off-screen in the stage. */
function labelWidth(stage: HTMLElement, text: string) {
  const probe = document.createElement('span');
  probe.className = 'site-anatomy-badge catalogue-variant-label';
  probe.style.visibility = 'hidden';
  probe.textContent = text;
  stage.append(probe);
  const width = probe.getBoundingClientRect().width;
  probe.remove();
  return width;
}

/**
 * Places a callout with each variant's name on the item it labels: the item a legend item's part
 * names, or else the example's items in the legend's order. Items one under another take their
 * names on the start side, items side by side above them, each with a line to its item and its box
 * outlined. Returns the room the names need, which the subject keeps free.
 */
function measureVariants(
  stage: HTMLElement,
  subject: HTMLElement,
  legend: AnatomyLegendItem[],
): { callouts: Callout[]; room: Room } {
  const origin = stage.getBoundingClientRect();
  const rtl = getComputedStyle(stage).direction === 'rtl';
  // The example's items: the children of its root, or of the wrapper the root holds alone, that
  // show, leaving out such as a select's hidden input.
  const shown = (element: Element) => {
    const box = element.getBoundingClientRect();
    return box.width > 1 && box.height > 1;
  };
  let root = subject.firstElementChild;
  while (root && [...root.children].filter(shown).length === 1 && legend.length > 1)
    root = [...root.children].find(shown) ?? null;
  const items = root ? [...root.children].filter(shown) : [];
  const found = legend.flatMap((item, index) => {
    let element: Element | null | undefined = items[index];
    if (item.part) {
      try {
        element = subject.querySelector(partSelector(item.part).selector);
      } catch {
        element = undefined;
      }
    }
    const box = element && boxOf(element, false, origin);
    return box ? [{ number: index + 1, box, label: item.label ?? '' }] : [];
  });
  if (!found.length) return { callouts: [], room: { start: 0, top: 0 } };
  const widths = found.map(({ label }) => labelWidth(stage, label));
  const outer: Box = {
    left: Math.min(...found.map(({ box }) => box.left)),
    top: Math.min(...found.map(({ box }) => box.top)),
    right: Math.max(...found.map(({ box }) => box.right)),
    bottom: Math.max(...found.map(({ box }) => box.bottom)),
  };
  const outline = (box: Box) => ({
    x: box.left,
    y: box.top,
    width: box.right - box.left,
    height: box.bottom - box.top,
  });
  // One under another where no two items share a line.
  const sorted = [...found].sort((a, b) => a.box.top - b.box.top);
  const stacked = sorted.every(
    (item, index) => index === 0 || item.box.top >= sorted[index - 1].box.bottom - 1,
  );
  if (stacked) {
    const side: Side = rtl ? 'right' : 'left';
    const callouts = found.map(({ number, box, label }) => {
      const y = (box.top + box.bottom) / 2;
      return {
        number,
        label,
        side,
        badge: { x: side === 'left' ? outer.left - reach : outer.right + reach, y },
        anchor: { x: side === 'left' ? box.left : box.right, y },
        box: outline(box),
      };
    });
    return { callouts, room: { start: Math.ceil(Math.max(...widths) + reach + 8), top: 0 } };
  }
  // Side by side: the names above, spread so that none overlaps the next.
  const order = found
    .map((_, index) => index)
    .sort((a, b) => found[a].box.left - found[b].box.left);
  const centres = order.map((index) => (found[index].box.left + found[index].box.right) / 2);
  for (let rank = 1; rank < order.length; rank++)
    centres[rank] = Math.max(
      centres[rank],
      centres[rank - 1] + (widths[order[rank - 1]] + widths[order[rank]]) / 2 + 6,
    );
  const callouts = order.map((index, rank) => {
    const { number, box, label } = found[index];
    const x = centres[rank];
    return {
      number,
      label,
      side: 'top' as const,
      badge: { x, y: outer.top - reach },
      anchor: { x: Math.min(Math.max(x, box.left + 2), box.right - 2), y: box.top },
      box: outline(box),
    };
  });
  return {
    callouts: callouts.sort((a, b) => a.number - b.number),
    room: { start: 0, top: Math.ceil(badgeSize + reach) },
  };
}

/** A subject at most this wide and tall, in CSS pixels, is small enough to show larger. */
const smallSubject = { width: 240, height: 48 };

/**
 * Shows a small subject, such as a badge or a checkbox, half as large again, as far as its stage
 * has room, so the callouts on its parts don't crowd; so too any subject its fence marks `enlarge`,
 * whose parts sit close together, such as a bar's item. The callouts measure the enlarged parts.
 */
function enlarge(subject: HTMLElement, always: boolean) {
  // The example's root, which sizes to its content when it is small.
  const scaled = subject.firstElementChild;
  if (!(scaled instanceof HTMLElement)) return;
  const current = Number(scaled.style.getPropertyValue('zoom') || 1);
  const box = scaled.getBoundingClientRect();
  const width = box.width / current;
  const height = box.height / current;
  const small =
    width > 0 && (always || (width <= smallSubject.width && height <= smallSubject.height));
  const zoom = small ? Math.max(1, Math.min(1.5, subject.clientWidth / width)) : 1;
  if (Math.abs(zoom - current) < 0.01) return;
  if (zoom === 1) scaled.style.removeProperty('zoom');
  else scaled.style.setProperty('zoom', zoom.toFixed(2));
}

/**
 * A subject that shows all its parts only from a width, such as panes side by side, laid out at
 * that width, in rem, and drawn smaller where the stage is narrower, down to `leastFitScale`, as a
 * width frame is; the callouts measure the parts as drawn. On a stage narrower still, it lays out
 * at the stage's width, and shows the parts that width has.
 */
function FitFrame({ width, children }: { width: number; children: ReactNode }) {
  const fit = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [scaled, setScaled] = useState<{ scale: number; width: number; height: number }>();
  useLayoutEffect(() => {
    const frame = box.current;
    const subject = fit.current?.parentElement;
    if (!frame || !subject) return;
    const measure = () => {
      const needed = width * parseFloat(getComputedStyle(document.documentElement).fontSize);
      const scale = subject.clientWidth / needed;
      const next =
        scale < 1 && scale >= leastFitScale
          ? { scale, width: needed * scale, height: frame.offsetHeight * scale }
          : undefined;
      // Unchanged sizes keep the state, so the stage, which grows with the frame, settles.
      setScaled((current) =>
        current &&
        next &&
        Math.abs(current.width - next.width) < 0.5 &&
        Math.abs(current.height - next.height) < 0.5
          ? current
          : next,
      );
    };
    let request = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(request);
      request = requestAnimationFrame(measure);
    });
    observer.observe(subject);
    observer.observe(frame);
    return () => {
      cancelAnimationFrame(request);
      observer.disconnect();
    };
  }, [width]);
  return (
    <div
      ref={fit}
      className="catalogue-anatomy-fit"
      data-scaled={scaled ? '' : undefined}
      style={scaled && { inlineSize: scaled.width, blockSize: scaled.height }}
    >
      <div
        ref={box}
        className="catalogue-anatomy-fit-box"
        style={scaled && { inlineSize: `${width}rem`, transform: `scale(${scaled.scale})` }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * The component in the theme the reader has chosen, on the recessed canvas, following it as it
 * changes, with its callouts measured from its live parts.
 */
function AnatomyStage({
  page,
  name,
  legend,
  open,
  enlarged,
  stage: fill,
  variants,
  width,
}: {
  page: string;
  name: string;
  legend: AnatomyLegendItem[];
  open: boolean;
  /** Whether the subject shows half as large again, though it isn't small. */
  enlarged: boolean;
  stage?: StageFill;
  /** Whether the callouts name the variants rather than number the parts. */
  variants: boolean;
  /** The width, in rem, the subject needs to show its parts. */
  width?: number;
}) {
  const theme = useTheme();
  const stage = useRef<HTMLDivElement>(null);
  const subject = useRef<HTMLDivElement>(null);
  const [callouts, setCallouts] = useState<Callout[]>([]);
  const [room, setRoom] = useState<Room>({ start: 0, top: 0 });
  useLayoutEffect(() => {
    const stageElement = stage.current;
    const subjectElement = subject.current;
    if (!stageElement || !subjectElement) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      // Only a change of place re-renders the callouts.
      frame = requestAnimationFrame(() => {
        // Open overlays take the room they need; they are never small.
        if (!open && !variants) enlarge(subjectElement, enlarged);
        const measured = variants
          ? measureVariants(stageElement, subjectElement, legend)
          : { callouts: measure(stageElement, subjectElement, legend), room: undefined };
        const next = measured.callouts;
        setCallouts((current) =>
          JSON.stringify(current) === JSON.stringify(next) ? current : next,
        );
        const needed = measured.room;
        if (needed)
          setRoom((current) =>
            current.start === needed.start && current.top === needed.top ? current : needed,
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
  }, [legend, open, enlarged, variants]);
  const render = open ? (
    <OpenExample name={name}>
      <ExampleRender page={page} name={name} />
    </OpenExample>
  ) : (
    <ExampleRender page={page} name={name} />
  );
  return (
    <Theme
      {...theme}
      ref={stage}
      className="site-anatomy-stage"
      data-example={name}
      data-stage={fill}
    >
      {/* A picture of the parts: the live component neither takes focus nor changes under it. A
          variants figure keeps room beside its items for their names. */}
      <div
        ref={subject}
        className="site-anatomy-subject"
        inert
        style={
          variants
            ? {
                paddingInlineStart: room.start || undefined,
                paddingBlockStart: room.top || undefined,
              }
            : undefined
        }
      >
        {width ? <FitFrame width={width}>{render}</FitFrame> : render}
      </div>
      <svg className="site-anatomy-lines" aria-hidden="true">
        {callouts.map(({ number, badge, anchor, box }) => (
          <g key={number}>
            {box && (
              <rect
                className="site-anatomy-box"
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
      {callouts.map(({ number, badge, label, side }) => (
        <span
          key={number}
          className={
            label === undefined
              ? 'site-anatomy-badge'
              : 'site-anatomy-badge catalogue-variant-label'
          }
          data-side={side}
          aria-hidden="true"
          // Measured in physical coordinates, in either direction.
          style={{ left: badge.x, top: badge.y }}
        >
          {label ?? number}
        </span>
      ))}
    </Theme>
  );
}

/**
 * A legend item as the figure shows it: the part's name alone, such as Label, in plain words; its
 * class names and props are on the page's guide in the Docs. An item without a name shows the
 * description parts.json gives its part, or else what it is written as.
 */
function legendText(item: AnatomyLegendItem) {
  const name = legendName(item);
  if (name) return name;
  return partDescription(item.part.replace(/::text$/, '')) ?? item.text;
}

/**
 * An anatomy figure: the live component in the reader's theme, a numbered callout on each part its
 * legend names, by class name, and the legend of part names, with the example's code below. A
 * variants figure names each variant on its callout instead, as anatomy figures number parts, and
 * shows the option table after it as its legend, each name in its callout's tag followed by what it
 * is for; without one, its names are for assistive technology alone.
 */
export function AnatomyFigure({
  page,
  name,
  title,
  caption,
  legend,
  of,
  open = false,
  enlarge: enlarged = false,
  stage,
  variants = false,
  options,
  width,
}: {
  page: string;
  name: string;
  title: string;
  caption?: string;
  legend?: AnatomyLegendItem[];
  of?: string;
  /** Whether the example's overlays are shown open, their parts numbered too. */
  open?: boolean;
  /** Whether the subject shows half as large again where its stage has room, as a small one does. */
  enlarge?: boolean;
  /** The stage's fill, where the page's would hide the subject. */
  stage?: StageFill;
  /** A variants figure: a callout with each variant's name on the example's items. */
  variants?: boolean;
  /** A variants figure's option table, shown as its legend. */
  options?: OptionTable;
  /** The width, in rem, the subject needs to show its parts: a narrower stage draws it smaller. */
  width?: number;
}) {
  const [items] = useState(() => (legend?.length ? legend : legendOf(of ?? '')));
  return (
    <figure className={variants ? 'catalogue-variants' : 'site-anatomy'} aria-label={title}>
      <AnatomyStage
        page={page}
        name={name}
        legend={items}
        open={open}
        enlarged={enlarged}
        stage={stage}
        variants={variants}
        width={width}
      />
      <figcaption className="site-anatomy-caption">
        {caption && <p className="site-figure-caption">{caption}</p>}
        {variants && options && <OptionLegend table={options} path={`components/${page}.md`} />}
        {variants && !options && (
          <ul className="site-visually-hidden">
            {items.map((item, index) => (
              <li key={`${index}-${item.label}`}>{item.label}</li>
            ))}
          </ul>
        )}
        {!variants && items.length > 0 && (
          <ol className="site-anatomy-legend">
            {items.map((item, index) => (
              <li key={`${index}-${item.part}`}>
                <span className="site-anatomy-number" aria-hidden="true">
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
