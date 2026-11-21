import type { ComponentPropsWithRef, ReactElement } from 'react';
import { classNames } from '../internal/classNames.js';
import { renderElement } from '../internal/react/renderElement.js';
import '../styles/Base.css';
import '../styles/Beacon.css';

/** A beacon's color: accent, the purple that stands out, or primary, the blue of what is current. */
export type BeaconTone = 'accent' | 'primary';

export interface BeaconProps extends ComponentPropsWithRef<'span'> {
  /**
   * The halo's color: accent, the purple that stands out, or primary, the blue of what is current.
   * --env-beacon-indicator gives it any other color, such as a brand's.
   * @default 'accent'
   */
  tone?: BeaconTone;
  /**
   * The element to render, a span that keeps an inline child, such as a Button, in its line; or
   * render={<div />} around a block, such as a Card, so it keeps its width. Without children it is
   * the box the halo surrounds, which the application places itself, such as with position
   * absolute over a region it measured.
   */
  render?: ReactElement;
}

/**
 * A soft halo that breathes around what it holds, to point at the one control or region to look at
 * next, such as the first step of a tour. The halo stays outside the content and takes no room, and
 * is hidden from assistive technology; it holds still with a reduced-motion preference.
 */
export function Beacon({ tone = 'accent', render, className, children, ...props }: BeaconProps) {
  return renderElement('span', render, {
    ...props,
    className: classNames('env-beacon', className),
    'data-tone': tone,
    children: (
      <>
        {children}
        <span className="env-beacon-halo" aria-hidden="true" />
      </>
    ),
  });
}
