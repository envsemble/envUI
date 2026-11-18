import type { ComponentPropsWithRef, ReactElement } from 'react';
import { classNames } from '../internal/classNames.js';
import { renderElement } from '../internal/react/renderElement.js';
import '../styles/Base.css';
import '../styles/VisuallyHidden.css';

export interface VisuallyHiddenProps extends ComponentPropsWithRef<'span'> {
  /**
   * The element to render, for its meaning, such as render={<h2 />} for a heading only assistive
   * technology reads; a span by default.
   */
  render?: ReactElement;
}

/**
 * Content that assistive technology reads and the screen doesn't show, such as words that complete
 * a short label, or a heading over a region whose purpose shows without one.
 */
export function VisuallyHidden({ render, className, ...props }: VisuallyHiddenProps) {
  return renderElement('span', render, {
    ...props,
    className: classNames('env-visually-hidden', className),
  });
}
