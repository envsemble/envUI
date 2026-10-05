import type { ComponentPropsWithRef, ReactNode } from 'react';
import { DecorativeIcon } from '../internal/DecorativeIcon.js';
import { classNames } from '../internal/classNames.js';

export interface DirectionLinkProps extends Omit<ComponentPropsWithRef<'a'>, 'children'> {
  direction: 'previous' | 'next';
  href: string;
  children: ReactNode;
  /** Optional decorative icon, placed before previous links and after next links. */
  icon?: ReactNode;
}

export function DirectionLink({
  direction,
  icon,
  children,
  className,
  rel,
  ...props
}: DirectionLinkProps) {
  const isPrevious = direction === 'previous';
  const symbol = icon != null ? <DecorativeIcon>{icon}</DecorativeIcon> : null;

  return (
    <a
      {...props}
      rel={rel ?? (isPrevious ? 'prev' : 'next')}
      className={classNames('env-direction-link', `env-direction-link-${direction}`, className)}
    >
      {isPrevious && symbol}
      <span className="env-direction-link-copy">
        <span className="env-direction-link-label">{isPrevious ? 'Previous' : 'Up next'}</span>
        <span className="env-direction-link-title">{children}</span>
      </span>
      {!isPrevious && symbol}
    </a>
  );
}
