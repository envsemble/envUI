import type { ReactNode } from 'react';
import { flag } from '../flag.js';
import '../../styles/Base.css';

export interface SlotProps {
  className: string;
  children: ReactNode;
  id?: string;
  element?: 'div' | 'span';
  layout?: 'flow' | 'row';
  grow?: boolean;
  shrink?: 'first' | 'never';
  'aria-hidden'?: boolean;
}

export function Slot({
  className,
  children,
  id,
  element: Element = 'div',
  layout = 'flow',
  grow,
  shrink,
  'aria-hidden': hidden,
}: SlotProps) {
  return (
    <Element
      id={id}
      className={className}
      data-env-slot={layout}
      data-env-slot-grow={flag(grow)}
      data-env-slot-shrink={shrink}
      aria-hidden={hidden || undefined}
    >
      {children}
    </Element>
  );
}
