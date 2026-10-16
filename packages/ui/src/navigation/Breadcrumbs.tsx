'use client';

import type { MouseEvent, ReactNode } from 'react';
import { classNames } from '../internal/classNames.js';
import { ChevronRight } from '../icons/ChevronRight.js';
import { useLinkComponent } from '../internal/LinkContext.js';

export interface BreadcrumbItem {
  /** The level's name, such as a folder's title; it ends with an ellipsis beyond 20 rem. */
  label: ReactNode;
  /** A destination, rendered through the LinkProvider link. */
  href?: string;
  /** An action for applications that navigate without URLs; rendered as a button styled as a link. */
  onClick?: (event: MouseEvent<HTMLElement>) => void;
}

export interface BreadcrumbsProps {
  /** From the top level to the current page, which is last. */
  items: readonly BreadcrumbItem[];
  /**
   * The trail wraps onto more lines when it runs out of room; true by default. False keeps it on
   * one line, for a bar or header: the current page is cut short first, and earlier levels keep
   * their width.
   */
  wrap?: boolean;
  /** Accessible name of the navigation landmark; name each trail where a page has several. */
  'aria-label'?: string;
  /** Classes for the `nav` element. */
  className?: string;
}

/** The path from the top level to the current page; earlier levels are links. */
export function Breadcrumbs({
  items,
  wrap = true,
  'aria-label': label = 'Breadcrumb',
  className,
}: BreadcrumbsProps) {
  const LinkComponent = useLinkComponent();
  return (
    <nav
      aria-label={label}
      className={classNames('env-breadcrumbs', className)}
      data-nowrap={wrap ? undefined : ''}
    >
      <ol className="env-breadcrumbs-list">
        {items.map((item, index) => {
          const current = index === items.length - 1;
          const content = <span className="env-breadcrumb-label">{item.label}</span>;
          let crumb: ReactNode;
          if (current) {
            crumb = (
              <span className="env-breadcrumb-current" aria-current="page">
                {content}
              </span>
            );
          } else if (item.href !== undefined) {
            crumb = (
              <LinkComponent
                href={item.href}
                className="env-breadcrumb-link"
                onClick={item.onClick}
              >
                {content}
              </LinkComponent>
            );
          } else if (item.onClick) {
            crumb = (
              <button type="button" className="env-breadcrumb-link" onClick={item.onClick}>
                {content}
              </button>
            );
          } else {
            crumb = <span className="env-breadcrumb-text">{content}</span>;
          }
          return (
            <li key={index} className="env-breadcrumb">
              {crumb}
              {!current && (
                <span className="env-icon env-breadcrumb-separator" aria-hidden="true">
                  <ChevronRight />
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
