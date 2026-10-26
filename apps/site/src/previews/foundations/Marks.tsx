import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';

/**
 * A real envUI example with numbered marks measured from its live layout, as an anatomy figure's
 * callouts are: the space between the children of an element marked `data-catalogue-space="n"` is
 * filled and numbered n, an element marked `data-catalogue-mark="n"` is outlined and numbered n, and an
 * element marked `data-catalogue-guides` gets a guide along its children's top and bottom edges. The marks follow
 * the example as it resizes and as the theme changes. The example is a picture: it neither takes
 * focus nor changes under the pointer.
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

function measure(stage: HTMLElement, subject: HTMLElement) {
  const origin = stage.getBoundingClientRect();
  const box = (element: Element): Rect => {
    const rect = element.getBoundingClientRect();
    return {
      x: rect.left - origin.left,
      y: rect.top - origin.top,
      width: rect.width,
      height: rect.height,
    };
  };
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

export function MarkedSubject({ children }: { children: ReactNode }) {
  const stage = useRef<HTMLDivElement>(null);
  const subject = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<{ marks: Mark[]; guides: number[] }>({
    marks: [],
    guides: [],
  });
  useLayoutEffect(() => {
    const stageElement = stage.current;
    const subjectElement = subject.current;
    if (!stageElement || !subjectElement) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const next = measure(stageElement, subjectElement);
        setState((current) => (JSON.stringify(current) === JSON.stringify(next) ? current : next));
      });
    };
    update();
    const resize = new ResizeObserver(update);
    resize.observe(stageElement);
    resize.observe(subjectElement);
    void document.fonts?.ready.then(update);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
    };
  }, []);
  return (
    <div ref={stage} className="catalogue-marked">
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
    </div>
  );
}
