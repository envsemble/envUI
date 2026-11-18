import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { remeasure } from '../../shared/Remeasure';

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Mark {
  number: number;
  rect: Rect;
  kind: 'space' | 'part';
  side: 'start' | 'end';
  badge: { x: number; y: number };
  anchor: { x: number; y: number };
}

const badgeReachPx = 28;
const badgeSpacingPx = 28;

function spread(positions: number[]) {
  const result = [...positions];
  for (let index = 1; index < result.length; index++)
    result[index] = Math.max(result[index]!, result[index - 1]! + badgeSpacingPx);
  return result;
}

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
    const style = getComputedStyle(element);
    const padded = box(element);
    const contentBox = {
      x: padded.x + parseFloat(style.paddingLeft),
      y: padded.y + parseFloat(style.paddingTop),
      width: padded.width - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight),
      height: padded.height - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom),
    };
    const isRow = style.flexDirection.startsWith('row');
    children.slice(1).forEach((child, index) => {
      const before = box(children[index]!);
      const after = box(child);
      const rect = isRow
        ? {
            x: before.x + before.width,
            y: contentBox.y,
            width: after.x - before.x - before.width,
            height: contentBox.height,
          }
        : {
            x: contentBox.x,
            y: before.y + before.height,
            width: contentBox.width,
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
    const all = [...element.children].map(box);
    if (!all.length) continue;
    const firstLineMiddle = all[0]!.y + all[0]!.height / 2;
    const firstLine = all.filter(
      (child) => Math.abs(child.y + child.height / 2 - firstLineMiddle) < 4,
    );
    guides.push(
      Math.min(...firstLine.map((child) => child.y)),
      Math.max(...firstLine.map((child) => child.y + child.height)),
    );
  }
  const marks: Mark[] = [];
  for (const side of ['start', 'end'] as const) {
    const onSide = found
      .filter((mark) => mark.side === side)
      .sort((a, b) => a.anchor.y - b.anchor.y);
    const placed = spread(onSide.map((mark) => mark.anchor.y));
    const x = side === 'start' ? bounds.x - badgeReachPx : bounds.x + bounds.width + badgeReachPx;
    onSide.forEach((mark, index) => marks.push({ ...mark, badge: { x, y: placed[index]! } }));
  }
  return { marks, guides };
}

interface Callout {
  number: number;
  points: readonly { x: number; y: number }[];
  name: { x: number; y: number };
}

interface Anchor {
  number: number;
  x: number;
  top: number;
  bottom: number;
}

const nameSpacingPx = { least: 34, most: 50, dots: 12 };

function orders<T>(items: readonly T[]): T[][] {
  if (items.length <= 1) return [[...items]];
  return items.flatMap((item, index) =>
    orders([...items.slice(0, index), ...items.slice(index + 1)]).map((rest) => [item, ...rest]),
  );
}

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
  const tallestName = Math.max(
    0,
    ...[...(column?.children ?? [])].map((name) => name.getBoundingClientRect().height),
  );
  const least = Math.max(nameSpacingPx.least, Math.ceil(tallestName) + 8);
  let best: { score: number; callouts: Callout[] } | undefined;
  for (const order of orders(anchors)) {
    const inversions = order.reduce(
      (sum, anchor, index) =>
        sum + order.slice(index + 1).filter((later) => later.number < anchor.number).length,
      0,
    );
    for (let spacing = least; spacing <= Math.max(least, nameSpacingPx.most); spacing++) {
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
          if (at < previous + nameSpacingPx.dots) {
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
