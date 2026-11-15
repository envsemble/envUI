import type { ReactNode } from 'react';
import { flag } from '../flag.js';
import '../../styles/Base.css';

export interface SlotProps {
  className: string;
  children: ReactNode;
  element?: 'div' | 'span';
  layout?: 'flow' | 'row';
  grow?: boolean;
  shrink?: 'first' | 'never';
}

export function Slot({
  className,
  children,
  element: Element = 'div',
  layout = 'flow',
  grow,
  shrink,
}: SlotProps) {
  return (
    <Element
      className={className}
      data-env-slot={layout}
      data-env-slot-grow={flag(grow)}
      data-env-slot-shrink={shrink}
    >
      {children}
    </Element>
  );
}
