'use client';

import {
  Children,
  useLayoutEffect,
  useRef,
  type ComponentPropsWithRef,
  type ReactNode,
  type RefObject,
} from 'react';
import { Slot } from '../internal/layout/Slot.js';
import { classNames } from '../internal/classNames.js';
import { landmarkLabel } from './internal/landmarkLabel.js';
import { Row } from '../layout/Layout.js';
import { mergeRefs } from '../internal/react/setRef.js';
import { withDisplayName } from '../internal/react/withDisplayName.js';
import { useLinkComponent } from '../internal/provider/LinkComponentContext.js';
import { useMessages } from '../internal/provider/EnvUIContext.js';
import { pager } from '../foundations/messages/pager.js';
import { observeResize } from '../internal/dom/observeResize.js';
import '../styles/Base.css';
import '../styles/Pager.css';

export interface LinkProps extends Omit<ComponentPropsWithRef<'a'>, 'children'> {
  /** The destination; the link renders through the LinkProvider's link component. */
  href: string;
  /**
   * The destination's title, such as the name of the next page. It shows below the direction
   * label, wraps between words, and names the link after the label.
   */
  children: ReactNode;
  /**
   * The link's relation to this page.
   * @default 'prev' on Pager.Previous, 'next' on Pager.Next
   */
  rel?: string;
  /**
   * The direction label above the title, such as Previous chapter or Back to setup, for this link
   * alone; null leaves it out.
   * @default 'Previous' or 'Up next', or EnvUIProvider's messages.pager.previous or next
   */
  label?: ReactNode;
}

/** The link to the previous page. */
export type PreviousProps = LinkProps & {
  /**
   * Content before the text, such as IconArrowBack: an envUI icon takes the pager's icon size and
   * other content keeps its own. It is hidden from assistive technology; none by default.
   */
  start?: ReactNode;
};
/** The link to the next page. */
export type NextProps = LinkProps & {
  /**
   * Content after the text, such as IconArrowForward: an envUI icon takes the pager's icon size and
   * other content keeps its own. It is hidden from assistive technology; none by default.
   */
  end?: ReactNode;
};

function PagerLink({
  direction,
  start,
  end,
  children,
  className,
  rel,
  label,
  ...props
}: LinkProps & { direction: 'previous' | 'next'; start?: ReactNode; end?: ReactNode }) {
  const LinkComponent = useLinkComponent();
  const caption = useMessages('pager', pager)[direction];
  const isPrevious = direction === 'previous';

  return (
    // eslint-disable-next-line react-hooks/static-components
    <LinkComponent
      {...props}
      rel={rel ?? (isPrevious ? 'prev' : 'next')}
      className={classNames('env-pager-link', `env-pager-link-${direction}`, className)}
    >
      {start != null && (
        <Slot
          className="env-pager-link-start"
          element="span"
          layout="row"
          shrink="never"
          aria-hidden
        >
          {start}
        </Slot>
      )}
      <span className="env-pager-link-copy">
        {label !== null && <span className="env-pager-link-label">{label ?? caption}</span>}
        <span className="env-pager-link-title">{children}</span>
      </span>
      {end != null && (
        <Slot className="env-pager-link-end" element="span" layout="row" shrink="never" aria-hidden>
          {end}
        </Slot>
      )}
    </LinkComponent>
  );
}

function Previous(props: PreviousProps) {
  return <PagerLink {...props} direction="previous" />;
}

function Next(props: NextProps) {
  return <PagerLink {...props} direction="next" />;
}

export interface RootProps extends ComponentPropsWithRef<'nav'> {
  /**
   * Pager.Previous and Pager.Next, in that order; leave one out on the first or the last page of a
   * sequence.
   */
  children?: ReactNode;
  /**
   * The navigation landmark's name; give each pager its own where a page has several.
   * @default 'Previous and next content', or EnvUIProvider's messages.pager.label
   */
  'aria-label'?: string;
}

function useStackedOnceWrapped(pager: RefObject<HTMLElement | null>, linkCount: number) {
  useLayoutEffect(() => {
    const element = pager.current;
    if (!element) return;
    let measuredWidth = -1;
    return observeResize(element, function stackWhereLinksWrap() {
      if (element.clientWidth === measuredWidth) return;
      measuredWidth = element.clientWidth;
      delete element.dataset.stacked;
      const links = [...element.children] as HTMLElement[];
      const wrapped = links.some((link) => link.offsetTop !== links[0].offsetTop);
      if (wrapped) element.dataset.stacked = '';
    });
  }, [pager, linkCount]);
}

function Root({ children, className, 'aria-label': ariaLabel, ref, ...props }: RootProps) {
  const messages = useMessages('pager', pager);
  const element = useRef<HTMLElement>(null);
  const linkCount = Children.toArray(children).length;
  useStackedOnceWrapped(element, linkCount);
  if (linkCount === 0) return null;

  return (
    <Row
      wrap
      justify="center"
      align="stretch"
      gap={4}
      render={
        <nav
          {...props}
          ref={mergeRefs(element, ref)}
          aria-label={landmarkLabel(ariaLabel, props['aria-labelledby'], messages.label)}
          className={classNames('env-pager', className)}
        />
      }
    >
      {children}
    </Row>
  );
}

/**
 * A centered pair of previous and next destinations in a navigation landmark, its Pager.Previous
 * and Pager.Next children; either one can be left out, and without any it renders nothing. Where
 * the two don't fit side by side, they stack as rows of the pager's width, the previous first.
 */
const RootPart = /* @__PURE__ */ withDisplayName(Root, 'Pager.Root');
/**
 * The destination before this one: a native link with rel="prev", its title under the label
 * Previous (EnvUIProvider's messages.pager.previous), and optional content before them, its start. It also
 * stands alone, outside Pager.Root.
 */
const PreviousPart = /* @__PURE__ */ withDisplayName(Previous, 'Pager.Previous');
/**
 * The destination after this one: a native link with rel="next", its title under the label Up
 * next (EnvUIProvider's messages.pager.next), and optional content after them, its end. It also stands
 * alone, outside Pager.Root.
 */
const NextPart = /* @__PURE__ */ withDisplayName(Next, 'Pager.Next');
export { RootPart as Root, PreviousPart as Previous, NextPart as Next };
