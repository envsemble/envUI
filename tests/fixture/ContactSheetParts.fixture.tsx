import { useState, type CSSProperties, type ReactNode } from 'react';
import { PortalContainer } from '@envsemble/envui';
import { flag } from '../../packages/ui/src/internal/flag.js';

type Force = 'hover' | 'focus' | 'pressed';

interface CellProps {
  caption: string;
  force?: Force;
  target?: string;
  highlight?: string;
  markAs?: string;
  click?: string;
  tooltipRoom?: boolean;
  width?: CSSProperties['inlineSize'];
  children: ReactNode;
}

export function Cell({
  caption,
  force,
  target,
  highlight,
  markAs,
  click,
  tooltipRoom,
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
      data-cs-tooltip-room={flag(tooltipRoom)}
      style={width === undefined ? undefined : { inlineSize: width }}
    >
      <div className="cs-cell-body">{children}</div>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

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
      <div className="cs-strip-cells" data-cs-middle={flag(middle)}>
        {children}
      </div>
    </div>
  );
}

export function Section({ name, children }: { name: string; children: ReactNode }) {
  return (
    <section className="cs-section" data-cs-component={name}>
      <h2 className="cs-heading">{name}</h2>
      {children}
    </section>
  );
}

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

export function Block({ children, style }: { children?: ReactNode; style?: CSSProperties }) {
  return (
    <div className="cs-block" style={style}>
      {children}
    </div>
  );
}

export const interactionStates = [
  { caption: 'Rest', force: undefined },
  { caption: 'Hover', force: 'hover' },
  { caption: 'Focus-visible', force: 'focus' },
  { caption: 'Pressed', force: 'pressed' },
] as const;
