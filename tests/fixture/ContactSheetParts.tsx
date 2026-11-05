import { useState, type CSSProperties, type ReactNode } from 'react';
import { PortalContainer } from '@envsemble/envui';

/**
 * The library's contact sheets: every component of one family of the catalogue, in its variants,
 * tones and sizes, and each in its states side by side, so a reviewer judges the components
 * themselves. `?fixture=contact-sheet&family=<family>&theme=light|dark&scale=system|comfortable`.
 *
 * A cell that shows an interaction state names it in `data-cs-force` (hover, focus or pressed): the
 * capture script forces that pseudo-class on the cell's control through the browser's DevTools
 * protocol, so the component's own style sheet draws it. `data-cs-target` picks the control where
 * the first focusable element isn't it, `data-cs-highlight` gives the element it selects the
 * attributes a component sets itself under the pointer (`data-cs-mark-as`, by default the
 * `data-highlighted` of a list's cursor), and `data-cs-click` asks for a real click, such as to arm
 * a ConfirmButton.
 */
export type Force = 'hover' | 'focus' | 'pressed';

interface CellProps {
  caption: string;
  force?: Force;
  target?: string;
  highlight?: string;
  markAs?: string;
  click?: string;
  width?: CSSProperties['inlineSize'];
  children: ReactNode;
}

/** One specimen with its caption under it. */
export function Cell({
  caption,
  force,
  target,
  highlight,
  markAs,
  click,
  width,
  children,
}: CellProps) {
  return (
    <figure
      className="cs-cell"
      data-cs-force={force}
      data-cs-target={target}
      data-cs-highlight={highlight}
      data-cs-mark-as={markAs}
      data-cs-click={click}
      style={width === undefined ? undefined : { inlineSize: width }}
    >
      <div className="cs-cell-body">{children}</div>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

/**
 * A row of cells, with a label at its start. `middle` centres the cells' specimens on one line and
 * their captions on another, for specimens of different heights that sit side by side in use, such
 * as a badge and a count.
 */
export function Strip({
  label,
  middle = false,
  children,
}: {
  label?: string;
  middle?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="cs-strip">
      <div className="cs-strip-label">{label}</div>
      <div className="cs-strip-cells" data-cs-middle={middle ? '' : undefined}>
        {children}
      </div>
    </div>
  );
}

/** One component and its strips; the capture script splits sheets between sections. */
export function Section({ name, children }: { name: string; children: ReactNode }) {
  return (
    <section className="cs-section" data-cs-component={name}>
      <h2 className="cs-heading">{name}</h2>
      {children}
    </section>
  );
}

/**
 * A region whose popups, dialogs, sheets and toasts render inside it, open in place, through a
 * contained PortalContainer.
 */
export function Stage({
  height,
  width = '22rem',
  children,
}: {
  height: CSSProperties['blockSize'];
  width?: CSSProperties['inlineSize'];
  children: ReactNode;
}) {
  const [layer, setLayer] = useState<HTMLDivElement | null>(null);
  return (
    <div className="cs-stage" style={{ blockSize: height, inlineSize: width }}>
      <PortalContainer container={layer} contained>
        {children}
      </PortalContainer>
      <div ref={setLayer} className="cs-stage-layer" />
    </div>
  );
}

/** A plain box that shows where a layout component places its children. */
export function Block({ children, style }: { children?: ReactNode; style?: CSSProperties }) {
  return (
    <div className="cs-block" style={style}>
      {children}
    </div>
  );
}

/** The usual interaction states of a control, with the props of the disabled one. */
export const interactionStates = [
  { caption: 'Rest', force: undefined },
  { caption: 'Hover', force: 'hover' },
  { caption: 'Focus-visible', force: 'focus' },
  { caption: 'Pressed', force: 'pressed' },
] as const;
