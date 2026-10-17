'use client';

import {
  createContext,
  useRef,
  type ComponentPropsWithRef,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from 'react';
import { classNames } from '../internal/classNames.js';
import { renderElement } from '../internal/renderElement.js';
import { setRef } from '../internal/setRef.js';

/** A page column's width: sm 40 rem, md 60 rem, lg 76 rem, or full, the whole width. */
export type PageWidth = 'sm' | 'md' | 'lg' | 'full';

export interface PageProps extends ComponentPropsWithRef<'div'> {
  /**
   * How wide the content may grow: sm (40 rem) for a form or a settings page, md (60 rem) for a
   * document or a detail page, lg (76 rem) for a dashboard or a list, full for content that uses
   * the whole width, such as a board. The column is centered in the space it has.
   * @default 'lg'
   */
  width?: PageWidth;
  /** The page's heading, usually a PageHeader, at the top of the same column. */
  header?: ReactNode;
  /**
   * Pads the column at its inline edges with the page gutter, which grows from 1 to 2 rem with the
   * viewport. False leaves the edges to the content, such as a page that is one full-bleed table.
   * @default true
   */
  gutter?: boolean;
  /**
   * The element to render, for its meaning, such as render={<article />}; a div by default. The
   * page's class and attributes merge into its props.
   */
  render?: ReactElement;
  /** The page's content, under its header. */
  children?: ReactNode;
}

/** The page element, where a sticky PageHeader publishes its height. */
export const PageContext = createContext<RefObject<HTMLElement | null> | null>(null);

/**
 * The column a page's content sits in: centered, as wide as `width` at most, with the page gutter
 * at its edges and the page's header at its top. It adds no landmark; put it in AppShell.Main, or
 * the application's own main.
 */
export function Page({
  width = 'lg',
  header,
  gutter = true,
  render,
  className,
  ref,
  children,
  ...props
}: PageProps) {
  const page = useRef<HTMLElement>(null);
  return (
    <PageContext value={page}>
      {renderElement('div', render, {
        ...props,
        ref: (node: HTMLElement | null) => {
          page.current = node;
          setRef(ref as RefObject<HTMLElement | null> | undefined, node);
        },
        className: classNames('env-page', className),
        'data-width': width,
        'data-gutter': gutter ? undefined : 'none',
        // Under a header, the content sits in a block of its own, the page's space below the header.
        children:
          header == null ? (
            children
          ) : (
            <>
              {header}
              <div className="env-page-content">{children}</div>
            </>
          ),
      })}
    </PageContext>
  );
}
