import type { ComponentPropsWithRef, ReactNode } from 'react';

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
  const previous = direction === 'previous';
  const symbol =
    icon != null ? (
      <span className="env-symbol" aria-hidden="true">
        {icon}
      </span>
    ) : null;

  return (
    <a
      {...props}
      rel={rel ?? (previous ? 'prev' : 'next')}
      className={['env-direction-link', `env-direction-link-${direction}`, className]
        .filter(Boolean)
        .join(' ')}
    >
      {previous && symbol}
      <span className="env-direction-link-copy">
        <span className="env-direction-link-label">{previous ? 'Previous' : 'Up next'}</span>
        <span className="env-direction-link-title">{children}</span>
      </span>
      {!previous && symbol}
    </a>
  );
}
