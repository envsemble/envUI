'use client';

import { mergeProps } from '@base-ui/react/merge-props';
import {
  useRef,
  useState,
  type ComponentPropsWithRef,
  type ComponentPropsWithoutRef,
  type HTMLAttributes,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { classNames } from '../internal/classNames.js';
import { Row } from '../layout/Layout.js';
import { IconChevronRight } from '../icons/ChevronRight.js';
import { ActionElement } from '../internal/control/ActionElement.js';
import { useMessages } from '../internal/provider/EnvUIContext.js';
import { breadcrumbs } from '../foundations/messages/breadcrumbs.js';
import { CutLabelTooltip } from '../internal/popup/TooltipPopup.js';
import { flag } from '../internal/flag.js';
import { useCutShort } from '../internal/popup/useCutShort.js';
import '../styles/Base.css';
import '../styles/Breadcrumbs.css';

export interface BreadcrumbsItem {
  /**
   * The level's name, such as a folder's title: text, or any content, such as an Avatar before a
   * project's name. It names the crumb's link or button; beyond 20 rem the trail cuts it short
   * with an ellipsis, and a tooltip shows the same content in full on hover and keyboard focus.
   */
  label: ReactNode;
  /** A destination, rendered through the LinkProvider link. */
  href?: string;
  /** An action for applications that navigate without URLs; rendered as a button styled as a link. */
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  /**
   * More props for the crumb's link, button or text, such as target and rel to open it in a new
   * tab, or data attributes for tests. Its class joins the crumb's; the crumb's aria-current and
   * name stay its own.
   */
  itemProps?: BreadcrumbsItemElementProps;
}

/** What a crumb's itemProps can set on its link, button or text. */
export type BreadcrumbsItemElementProps = Omit<
  ComponentPropsWithoutRef<'a'>,
  'children' | 'href' | 'onClick' | 'id' | 'role' | 'dangerouslySetInnerHTML' | `aria-${string}`
> & { [attribute: `data-${string}`]: string | number | boolean | undefined };

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

function Crumb({ item, current }: { item: BreadcrumbsItem; current: boolean }) {
  const label = useRef<HTMLSpanElement>(null);
  const cut = useCutShort(label);
  const [focused, setFocused] = useState(false);
  const content = (
    <span className="env-breadcrumbs-label" ref={label}>
      {item.label}
    </span>
  );
  const keepsFocusUntilBlurEvenOnceItFits = focused;
  const { className: ownClassName, ...ownProps } = item.itemProps ?? {};
  const focusableToShowInFull = mergeProps(ownProps as HTMLAttributes<HTMLSpanElement>, {
    tabIndex: cut || keepsFocusUntilBlurEvenOnceItFits ? 0 : ownProps.tabIndex,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
  });
  let crumb: ReactElement;
  if (current) {
    crumb = (
      <span
        {...focusableToShowInFull}
        className={classNames('env-breadcrumbs-current', ownClassName)}
        aria-current="page"
      >
        {content}
      </span>
    );
  } else if (item.href !== undefined) {
    crumb = (
      <ActionElement
        {...ownProps}
        href={item.href}
        className={classNames('env-breadcrumbs-link', ownClassName)}
        onClick={item.onClick}
      >
        {content}
      </ActionElement>
    );
  } else if (item.onClick) {
    crumb = (
      <ActionElement
        {...(ownProps as HTMLAttributes<HTMLButtonElement>)}
        className={classNames('env-breadcrumbs-link', ownClassName)}
        onClick={item.onClick}
      >
        {content}
      </ActionElement>
    );
  } else {
    crumb = (
      <span {...focusableToShowInFull} className={classNames('env-breadcrumbs-text', ownClassName)}>
        {content}
      </span>
    );
  }
  return (
    <CutLabelTooltip cut={cut} label={item.label} side="bottom">
      {crumb}
    </CutLabelTooltip>
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
