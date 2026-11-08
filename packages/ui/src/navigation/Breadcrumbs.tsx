'use client';

import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import {
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from 'react';
import { classNames } from '../internal/classNames.js';
import { Row } from '../layout/Layout.js';
import { IconChevronRight } from '../icons/ChevronRight.js';
import { ActionElement } from '../internal/ActionElement.js';
import { useMessages } from '../internal/EnvUIContext.js';
import { breadcrumbs } from '../foundations/messages/breadcrumbs.js';
import { TooltipPopup, tooltipDelay } from '../internal/TooltipPopup.js';
import { flag } from '../internal/flag.js';
import '../styles/Base.css';
import '../styles/Breadcrumbs.css';

export interface BreadcrumbsItem {
  /**
   * The level's name, such as a folder's title. Beyond 20 rem it ends with an ellipsis, and a
   * tooltip shows it in full on hover and keyboard focus.
   */
  label: ReactNode;
  /** A destination, rendered through the LinkProvider link. */
  href?: string;
  /** An action for applications that navigate without URLs; rendered as a button styled as a link. */
  onClick?: (event: MouseEvent<HTMLElement>) => void;
}

export interface BreadcrumbsProps extends Omit<ComponentPropsWithRef<'nav'>, 'children'> {
  /** From the top level to the current page, which is last. */
  items: readonly BreadcrumbsItem[];
  /**
   * The trail wraps onto more lines when it runs out of room; true by default. False keeps it on
   * one line, for a bar or header: the current page is cut short first, and earlier levels keep
   * their width.
   */
  wrap?: boolean;
  /**
   * Accessible name of the navigation landmark; name each trail where a page has several.
   * @default 'Breadcrumb', or EnvUIProvider's messages.breadcrumbs.label
   */
  'aria-label'?: string;
  /** Classes for the `nav` element. */
  className?: string;
}

/** Whether the text in an element is cut short with an ellipsis, followed as its size changes. */
function useTruncated(element: RefObject<HTMLElement | null>) {
  const [truncated, setTruncated] = useState(false);
  useLayoutEffect(() => {
    const node = element.current;
    if (!node) return;
    const measure = () => setTruncated(node.scrollWidth > node.clientWidth);
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [element]);
  return truncated;
}

/** One level: a link, a button, plain text or the current page, with its full label on hover. */
function Crumb({ item, current }: { item: BreadcrumbsItem; current: boolean }) {
  const label = useRef<HTMLSpanElement>(null);
  const truncated = useTruncated(label);
  const [focused, setFocused] = useState(false);
  const content = (
    <span className="env-breadcrumbs-label" ref={label}>
      {item.label}
    </span>
  );
  // A label cut short that is no link takes keyboard focus, so the keyboard can show it in full. It
  // leaves the tab order only once it has lost focus: a label that comes to fit while focused, as
  // the window widens, keeps focus instead of dropping it to the page.
  const focusable = {
    tabIndex: truncated || focused ? 0 : undefined,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
  };
  let crumb: ReactElement;
  if (current) {
    crumb = (
      <span className="env-breadcrumbs-current" aria-current="page" {...focusable}>
        {content}
      </span>
    );
  } else if (item.href !== undefined || item.onClick) {
    crumb = (
      <ActionElement
        {...(item.href !== undefined ? { href: item.href } : {})}
        className="env-breadcrumbs-link"
        onClick={item.onClick}
      >
        {content}
      </ActionElement>
    );
  } else {
    crumb = (
      <span className="env-breadcrumbs-text" {...focusable}>
        {content}
      </span>
    );
  }
  // A label cut short shows in full in a tooltip, on hover and on keyboard focus.
  // The tooltip stays in place while the label fits, so the element and its focus are kept.
  return (
    <BaseTooltip.Root disabled={!truncated}>
      <BaseTooltip.Trigger delay={tooltipDelay} render={crumb} />
      {truncated && <TooltipPopup content={item.label} side="bottom" />}
    </BaseTooltip.Root>
  );
}

/** The path from the top level to the current page; earlier levels are links. */
export function Breadcrumbs({
  items,
  wrap = true,
  'aria-label': label,
  className,
  ...props
}: BreadcrumbsProps) {
  const messages = useMessages('breadcrumbs', breadcrumbs);
  return (
    <nav
      {...props}
      aria-label={label ?? messages.label}
      className={classNames('env-breadcrumbs', className)}
      data-nowrap={flag(!wrap)}
    >
      <Row render={<ol />} wrap={wrap} align="center" gap={1} className="env-breadcrumbs-list">
        {items.map((item, index) => {
          const current = index === items.length - 1;
          return (
            <Row
              key={index}
              render={<li />}
              align="center"
              gap={1}
              className="env-breadcrumbs-item"
            >
              <Crumb item={item} current={current} />
              {!current && (
                <span className="env-icon env-breadcrumbs-separator" aria-hidden="true">
                  <IconChevronRight />
                </span>
              )}
            </Row>
          );
        })}
      </Row>
    </nav>
  );
}
