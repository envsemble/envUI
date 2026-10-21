'use client';

import type { ComponentPropsWithRef, ReactNode } from 'react';
import { DecorativeIcon } from '../internal/DecorativeIcon.js';
import { classNames } from '../internal/classNames.js';
import { Row } from '../foundations/Layout.js';
import { withDisplayName } from '../internal/withDisplayName.js';
import { useLinkComponent } from '../internal/LinkContext.js';
import { useEnvUI, useMessages } from '../internal/EnvUIContext.js';
import { pager } from '../foundations/messages/pager.js';

export interface LinkProps extends Omit<ComponentPropsWithRef<'a'>, 'children'> {
  /** The destination; the link renders through the LinkProvider's link component. */
  href: string;
  /**
   * The destination's title, such as the name of the next page. It shows below the direction
   * label, wraps between words, and names the link after the label.
   */
  children: ReactNode;
  /**
   * A decorative icon, such as ArrowBack, before the previous destination's text, or such as
   * ArrowForward, after the next one's; none by default.
   */
  icon?: ReactNode;
  /**
   * The link's relation to this page.
   * @default 'prev' on Pager.Previous, 'next' on Pager.Next
   */
  rel?: string;
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
  // The one caption a link shows, read without merging the namespace, so a part alone stays small.
  const caption =
    (useEnvUI().messages.pager?.[direction] as string | undefined) ?? pager[direction];
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
        <span className="env-pager-link-label">{caption}</span>
        <span className="env-pager-link-title">{children}</span>
      </span>
      {!isPrevious && symbol}
    </LinkComponent>
  );
}

/**
 * The destination before this one: a native link with rel="prev", its title under the label
 * Previous (EnvUIProvider's messages.pager.previous), and an optional icon before them. It also
 * stands alone, outside Pager.Root.
 */
function Previous(props: PreviousProps) {
  return <PagerLink {...props} direction="previous" />;
}

/**
 * The destination after this one: a native link with rel="next", its title under the label Up
 * next (EnvUIProvider's messages.pager.next), and an optional icon after them. It also stands
 * alone, outside Pager.Root.
 */
function Next(props: NextProps) {
  return <PagerLink {...props} direction="next" />;
}

export interface RootProps extends ComponentPropsWithRef<'nav'> {
  /**
   * The destination before this page, as the props of Pager.Previous; leave it out, or pass null,
   * on the first page of a sequence.
   */
  previous?: PreviousProps | null;
  /**
   * The destination after this page, as the props of Pager.Next; leave it out, or pass null, on
   * the last page of a sequence.
   */
  next?: NextProps | null;
  /**
   * Pager.Previous and Pager.Next, instead of the previous and next props or beside one of them:
   * they render between the previous prop's link and the next prop's, so the links keep their
   * order.
   */
  children?: ReactNode;
  /**
   * The navigation landmark's name; give each pager its own where a page has several.
   * @default 'Previous and next content', or EnvUIProvider's messages.pager.label
   */
  'aria-label'?: string;
}

/**
 * A centered pair of previous and next destinations in a navigation landmark, from the previous
 * and next props or from Pager.Previous and Pager.Next children; either one can be left out, and
 * without any it renders nothing.
 */
function Root({
  previous,
  next,
  children,
  className,
  'aria-label': ariaLabel,
  ...props
}: RootProps) {
  const messages = useMessages('pager', pager);
  if (!previous && !next && children == null) return null;

  return (
    <Row
      wrap
      justify="center"
      align="stretch"
      gap={4}
      render={
        <nav
          {...props}
          aria-label={ariaLabel ?? messages.label}
          className={classNames('env-pager', className)}
        />
      }
    >
      {previous && <Previous {...previous} />}
      {children}
      {next && <Next {...next} />}
    </Row>
  );
}

// Each part is named for React DevTools by a pure call, so a bundler drops the parts an
// application leaves unused.
const RootPart = /* @__PURE__ */ withDisplayName(Root, 'Pager.Root');
const PreviousPart = /* @__PURE__ */ withDisplayName(Previous, 'Pager.Previous');
const NextPart = /* @__PURE__ */ withDisplayName(Next, 'Pager.Next');
export { RootPart as Root, PreviousPart as Previous, NextPart as Next };
