import type { ComponentPropsWithRef } from 'react';
import { classNames } from '../internal/classNames.js';
import { DirectionLink, type DirectionLinkProps } from './DirectionLink.js';

export type DirectionLinksDestination = Omit<DirectionLinkProps, 'direction'>;

export interface DirectionLinksProps extends Omit<ComponentPropsWithRef<'nav'>, 'children'> {
  previous?: DirectionLinksDestination | null;
  next?: DirectionLinksDestination | null;
}

/** A centered pair of destinations; either destination can be omitted. */
export function DirectionLinks({
  previous,
  next,
  className,
  'aria-label': ariaLabel = 'Previous and next content',
  ...props
}: DirectionLinksProps) {
  if (!previous && !next) return null;

  return (
    <nav {...props} aria-label={ariaLabel} className={classNames('env-direction-links', className)}>
      {previous && <DirectionLink {...previous} direction="previous" />}
      {next && <DirectionLink {...next} direction="next" />}
    </nav>
  );
}
