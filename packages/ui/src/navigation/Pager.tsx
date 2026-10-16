'use client';

import type { ComponentPropsWithRef, ReactNode } from 'react';
import { DecorativeIcon } from '../internal/DecorativeIcon.js';
import { classNames } from '../internal/classNames.js';
import { withDisplayName } from '../internal/withDisplayName.js';
import { useLinkComponent } from './LinkProvider.js';

export interface LinkProps extends Omit<ComponentPropsWithRef<'a'>, 'children'> {
  href: string;
  children: ReactNode;
  /** Optional decorative icon, placed before the previous link and after the next link. */
  icon?: ReactNode;
}

/** The link to the previous page. */
export type PreviousProps = LinkProps;
/** The link to the next page. */
export type NextProps = LinkProps;

function PagerLink({
  direction,
  icon,
  children,
  className,
  rel,
  ...props
}: LinkProps & { direction: 'previous' | 'next' }) {
  const LinkComponent = useLinkComponent();
  const isPrevious = direction === 'previous';
  const symbol = icon != null ? <DecorativeIcon>{icon}</DecorativeIcon> : null;

  return (
    // The link component comes from LinkProvider and keeps its identity between renders.
    // eslint-disable-next-line react-hooks/static-components
    <LinkComponent
      {...props}
      rel={rel ?? (isPrevious ? 'prev' : 'next')}
      className={classNames('env-pager-link', `env-pager-link-${direction}`, className)}
    >
      {isPrevious && symbol}
      <span className="env-pager-link-copy">
        <span className="env-pager-link-label">{isPrevious ? 'Previous' : 'Up next'}</span>
        <span className="env-pager-link-title">{children}</span>
      </span>
      {!isPrevious && symbol}
    </LinkComponent>
  );
}

/** The destination before this one, with rel="prev". */
function Previous(props: PreviousProps) {
  return <PagerLink {...props} direction="previous" />;
}

/** The destination after this one, with rel="next". */
function Next(props: NextProps) {
  return <PagerLink {...props} direction="next" />;
}

export interface RootProps extends ComponentPropsWithRef<'nav'> {
  /** The previous destination, as the props of Pager.Previous. */
  previous?: PreviousProps | null;
  /** The next destination, as the props of Pager.Next. */
  next?: NextProps | null;
}

/**
 * A centered pair of previous and next destinations, from the previous and next props or from
 * Pager.Previous and Pager.Next children; either one can be omitted.
 */
function Root({
  previous,
  next,
  children,
  className,
  'aria-label': ariaLabel = 'Previous and next content',
  ...props
}: RootProps) {
  if (!previous && !next && children == null) return null;

  return (
    <nav {...props} aria-label={ariaLabel} className={classNames('env-pager', className)}>
      {previous && <Previous {...previous} />}
      {next && <Next {...next} />}
      {children}
    </nav>
  );
}

// Each part is named for React DevTools by a pure call, so a bundler drops the parts an
// application leaves unused.
const RootPart = /* @__PURE__ */ withDisplayName(Root, 'Pager.Root');
const PreviousPart = /* @__PURE__ */ withDisplayName(Previous, 'Pager.Previous');
const NextPart = /* @__PURE__ */ withDisplayName(Next, 'Pager.Next');
export { RootPart as Root, PreviousPart as Previous, NextPart as Next };
