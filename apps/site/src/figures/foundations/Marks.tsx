import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { remeasure } from '../../fit/Remeasure';

/**
 * A real envUI example with numbered marks measured from its live layout, as an anatomy figure's
 * callouts are: the space between the children of an element marked `data-catalogue-space="n"` is
 * filled and numbered n, an element marked `data-catalogue-mark="n"` is outlined and numbered n, and an
 * element marked `data-catalogue-guides` gets a guide along its children's top and bottom edges. The marks follow
 * the example as it resizes and as the theme changes. The example is a picture: it neither takes
 * focus nor changes under the pointer.
 *
 * With `named`, the marked elements are named instead, in one tidy column at the subject's end
 * (`measureColumn`): no outlines and no numbers, a dot on each part and a leader to its name.
 */

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Mark {
  number: number;
  /** The space or the element marked. */
  rect: Rect;
  kind: 'space' | 'part';
  /** The side of the subject its badge sits on. */
  side: 'start' | 'end';
  badge: { x: number; y: number };
  anchor: { x: number; y: number };
}

/** How far outside the subject a badge sits, and the least distance between two badges. */
const reach = 28;
const spacing = 28;

/** Spreads positions so badges never overlap, keeping their order. */
function spread(positions: number[]) {
  const result = [...positions];
  for (let index = 1; index < result.length; index++)
    result[index] = Math.max(result[index]!, result[index - 1]! + spacing);
  return result;
}

/** An element's or a range's box, from the stage's corner. */
const boxIn =
  (origin: DOMRect) =>
  (element: Element | DOMRect): Rect => {
    const rect = element instanceof Element ? element.getBoundingClientRect() : element;
    return {
      x: rect.left - origin.left,
      y: rect.top - origin.top,
      width: rect.width,
      height: rect.height,
    };
  };

function measure(stage: HTMLElement, subject: HTMLElement) {
  const origin = stage.getBoundingClientRect();
  const box = boxIn(origin);
  const bounds = box(subject);
  const found: Omit<Mark, 'badge'>[] = [];
  const guides: number[] = [];
  for (const element of subject.querySelectorAll<HTMLElement>('[data-catalogue-space]')) {
    const number = Number(element.dataset.catalogueSpace);
    const children = [...element.children].filter((child) => child.getClientRects().length);
    // The space runs across the element's content, inside its padding.
    const style = getComputedStyle(element);
    const padded = box(element);
    const outer = {
      x: padded.x + parseFloat(style.paddingLeft),
      y: padded.y + parseFloat(style.paddingTop),
      width: padded.width - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight),
      height: padded.height - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom),
    };
    const row = style.flexDirection.startsWith('row');
    children.slice(1).forEach((child, index) => {
      const before = box(children[index]!);
      const after = box(child);
      const rect = row
        ? {
            x: before.x + before.width,
            y: outer.y,
            width: after.x - before.x - before.width,
            height: outer.height,
          }
        : {
            x: outer.x,
            y: before.y + before.height,
            width: outer.width,
            height: after.y - before.y - before.height,
          };
      if (rect.width > 0 && rect.height > 0)
        found.push({
          number,
          rect,
          kind: 'space',
          side: 'end',
          anchor: { x: rect.x + rect.width, y: rect.y + rect.height / 2 },
        });
    });
  }
  // A part's badge sits on the side of the subject nearer the part, so no line crosses it.
  const centre = bounds.x + bounds.width / 2;
  for (const element of subject.querySelectorAll<HTMLElement>('[data-catalogue-mark]')) {
    const rect = box(element);
    const side = rect.x + rect.width / 2 < centre - 8 ? 'start' : 'end';
    found.push({
      number: Number(element.dataset.catalogueMark),
      rect,
      kind: 'part',
      side,
      anchor: {
        x: side === 'start' ? rect.x : rect.x + rect.width,
        y: rect.y + Math.min(rect.height / 2, 14),
      },
    });
  }
  for (const element of subject.querySelectorAll<HTMLElement>('[data-catalogue-guides]')) {
    // The first line of the row: a row that wraps is guided along its first line.
    const all = [...element.children].map(box);
    if (!all.length) continue;
    const middle = all[0]!.y + all[0]!.height / 2;
    const children = all.filter((child) => Math.abs(child.y + child.height / 2 - middle) < 4);
    guides.push(
      Math.min(...children.map((child) => child.y)),
      Math.max(...children.map((child) => child.y + child.height)),
    );
  }
  const marks: Mark[] = [];
  for (const side of ['start', 'end'] as const) {
    const onSide = found
      .filter((mark) => mark.side === side)
      .sort((a, b) => a.anchor.y - b.anchor.y);
    const placed = spread(onSide.map((mark) => mark.anchor.y));
    const x = side === 'start' ? bounds.x - reach : bounds.x + bounds.width + reach;
    onSide.forEach((mark, index) => marks.push({ ...mark, badge: { x, y: placed[index]! } }));
  }
  return { marks, guides };
}

/** A named part's callout: the dot on the part, its leader's points and its name's place. */
interface Callout {
  number: number;
  points: readonly { x: number; y: number }[];
  name: { x: number; y: number };
}

/**
 * Where a part's dot may sit: on a part that holds others, such as a surface, anywhere down the
 * band between its end edge and its content, clear of its corners, so the dot sits on its own
 * color; on text, just after the end of its last line, give or take a hair.
 */
interface Anchor {
  number: number;
  x: number;
  top: number;
  bottom: number;
}

/** The gap between two names in the column, the least and the most, and between two dots. */
const nameSpacing = { least: 34, most: 50, dots: 12 };

/** The orders of a list, every one. */
function orders<T>(items: readonly T[]): T[][] {
  if (items.length <= 1) return [[...items]];
  return items.flatMap((item, index) =>
    orders([...items.slice(0, index), ...items.slice(index + 1)]).map((rest) => [item, ...rest]),
  );
}

/**
 * The column of names: evenly spaced, in the order of their parts from the top, so no two leaders
 * cross. Each leader runs level from its dot past the subject's end, then straight to its name;
 * a dot free to move takes its name's height, so most leaders are one level line. Of the orders
 * and spacings that keep the dots in order and the names beside the subject, the one with the
 * least bending wins, the parts' own order breaking a tie.
 */
function measureColumn(stage: HTMLElement, subject: HTMLElement, column: HTMLElement | null) {
  const origin = stage.getBoundingClientRect();
  const box = boxIn(origin);
  const bounds = box(subject);
  const anchors: Anchor[] = [];
  for (const element of subject.querySelectorAll<HTMLElement>('[data-catalogue-mark]')) {
    const number = Number(element.dataset.catalogueMark);
    const rect = box(element);
    if (element.children.length) {
      const content = Math.max(
        ...[...element.children].map((child) => {
          const inner = box(child);
          return inner.x + inner.width;
        }),
      );
      const radius = Math.min(
        parseFloat(getComputedStyle(element).borderStartEndRadius) || 0,
        rect.height / 2,
      );
      const inset = Math.max(radius, 6);
      anchors.push({
        number,
        x: (content + rect.x + rect.width) / 2,
        top: rect.y + inset,
        bottom: rect.y + rect.height - inset,
      });
    } else {
      const range = document.createRange();
      range.selectNodeContents(element);
      const lines = [...range.getClientRects()];
      const last = lines.length ? box(lines[lines.length - 1]!) : rect;
      const y = last.y + last.height / 2;
      anchors.push({ number, x: last.x + last.width + 6, top: y - 2, bottom: y + 2 });
    }
  }
  const end = bounds.x + bounds.width;
  const nameX = column ? box(column).x : end + 32;
  const bend = end + 10;
  const first = bounds.y + 10;
  const last = bounds.y + bounds.height - 10;
  const count = anchors.length;
  // Names that wrap, as on a phone, are spaced by the tallest, so none touches the next.
  const tallest = Math.max(
    0,
    ...[...(column?.children ?? [])].map((name) => name.getBoundingClientRect().height),
  );
  const least = Math.max(nameSpacing.least, Math.ceil(tallest) + 8);
  let best: { score: number; callouts: Callout[] } | undefined;
  for (const order of orders(anchors)) {
    const inversions = order.reduce(
      (sum, anchor, index) =>
        sum + order.slice(index + 1).filter((later) => later.number < anchor.number).length,
      0,
    );
    for (let spacing = least; spacing <= Math.max(least, nameSpacing.most); spacing++) {
      const starts = order.flatMap((anchor, index) => [
        anchor.top - spacing * index,
        anchor.bottom - spacing * index,
      ]);
      for (const start of starts) {
        if (start < first || start + spacing * (count - 1) > last) continue;
        let score = inversions * 3 + Math.abs(spacing - 40) / 2;
        let previous = -Infinity;
        const callouts: Callout[] = [];
        for (const [index, anchor] of order.entries()) {
          const y = start + spacing * index;
          const at = Math.min(Math.max(y, anchor.top), anchor.bottom);
          if (at < previous + nameSpacing.dots) {
            score = Infinity;
            break;
          }
          previous = at;
          const bent = Math.abs(at - y);
          score += bent + (bent > 0.5 ? 6 : 0);
          callouts.push({
            number: anchor.number,
            points: [
              { x: anchor.x, y: at },
              { x: bend, y: at },
              { x: nameX - 6, y },
            ],
            name: { x: nameX, y },
          });
        }
        if (score < (best?.score ?? Infinity)) best = { score, callouts };
      }
    }
  }
  return best?.callouts ?? [];
}

/**
 * `named` names the marked parts instead of numbering them, the name of the part marked n at n - 1,
 * such as a swatch of its color and its name: they stand in one column at the subject's end, in
 * the stage's flow so it is as wide as they need.
 */
export function MarkedSubject({
  children,
  named,
}: {
  children: ReactNode;
  named?: readonly ReactNode[];
}) {
  const stage = useRef<HTMLDivElement>(null);
  const subject = useRef<HTMLDivElement>(null);
  const column = useRef<HTMLUListElement>(null);
  const [state, setState] = useState<{ marks: Mark[]; guides: number[]; callouts: Callout[] }>({
    marks: [],
    guides: [],
    callouts: [],
  });
  const isNamed = Boolean(named);
  useLayoutEffect(() => {
    const stageElement = stage.current;
    const subjectElement = subject.current;
    if (!stageElement || !subjectElement) return;
    const marks = remeasure(
      () => {
        const next = isNamed
          ? {
              marks: [],
              guides: [],
              callouts: measureColumn(stageElement, subjectElement, column.current),
            }
          : { ...measure(stageElement, subjectElement), callouts: [] };
        setState((current) => (JSON.stringify(current) === JSON.stringify(next) ? current : next));
      },
      { first: 'frame', resize: [stageElement, subjectElement], fonts: true },
    );
    return marks.stop;
  }, [isNamed]);
  const placed = new Map(state.callouts.map((callout) => [callout.number, callout.name.y]));
  return (
    <div ref={stage} className="catalogue-marked" data-named={isNamed || undefined}>
      <div ref={subject} className="catalogue-marked-subject" inert>
        {children}
      </div>
      <svg className="site-anatomy-lines" aria-hidden="true">
        {state.guides.map((y, index) => (
          <line
            key={`guide-${index}`}
            className="catalogue-marked-guide"
            x1="0"
            x2="100%"
            y1={y}
            y2={y}
          />
        ))}
        {state.marks.map(({ rect, kind, badge, anchor }, index) => (
          <g key={index}>
            {kind === 'space' ? (
              <rect
                className="catalogue-marked-space"
                x={rect.x}
                y={rect.y}
                width={rect.width}
                height={rect.height}
              />
            ) : (
              <rect
                className="site-anatomy-box"
                x={rect.x}
                y={rect.y}
                width={rect.width}
                height={rect.height}
              />
            )}
            <line x1={badge.x} y1={badge.y} x2={anchor.x} y2={anchor.y} />
            <circle cx={anchor.x} cy={anchor.y} r={3} />
          </g>
        ))}
        {state.callouts.map(({ number, points }) => (
          <g key={number}>
            <polyline points={points.map(({ x, y }) => `${x},${y}`).join(' ')} />
            <circle cx={points[0]!.x} cy={points[0]!.y} r={3} />
          </g>
        ))}
      </svg>
      {state.marks.map(({ number, badge }, index) => (
        <span
          key={index}
          className="site-anatomy-badge"
          aria-hidden="true"
          style={{ left: badge.x, top: badge.y }}
        >
          {number}
        </span>
      ))}
      {named && (
        <ul ref={column} className="catalogue-marked-names">
          {named.map((name, index) => {
            const y = placed.get(index + 1);
            return (
              <li key={index} style={y === undefined ? { visibility: 'hidden' } : { top: y }}>
                {name}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
