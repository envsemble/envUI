import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react';
import { classNames } from '../internal/classNames.js';
import { renderElement } from '../internal/renderElement.js';

/** A page column's width: sm 40 rem, md 60 rem, lg 76 rem, or full, the whole width. */
export type PageWidth = 'sm' | 'md' | 'lg' | 'full';

export interface PageProps extends ComponentPropsWithRef<'div'> {
  /**
   * How wide the content may grow, a readable width: sm (40 rem) for a form or a settings page, md
   * (60 rem) for a document or a detail page, lg (76 rem) for a dashboard or a list, full for
   * content that uses the whole width, such as a board. The column is centered in the space it has.
   * @default 'lg'
   */
  width?: PageWidth;
  /** The page's heading, usually a PageHeader, at the top of the same column. */
  header?: ReactNode;
  /**
   * Pads the column at its inline edges with the page gutter, which follows the window class of
   * the region the page sits in: 1 rem in a compact one, 1.5 rem from medium. False leaves the
   * edges to the content, such as a page that is one full-bleed table.
   * @default true
   */
  gutter?: boolean;
  /**
   * A name for this node, such as "settings", which dev mode and the docs show; it renders as
   * `data-env-name`.
   */
  name?: string;
  /**
   * The element to render, for its meaning, such as render={<article />}; a div by default. The
   * page's class and attributes merge into its props.
   */
  render?: ReactElement;
  /** The page's content, under its header. */
  children?: ReactNode;
}

/**
 * The column a page's content sits in: invisible structure that never paints, centered, as wide
 * as `width` at most, with the page gutter at its edges and the page's header at its top. Its
 * gutters follow the window class of the region it sits in, such as a Scaffold's body or a pane,
 * and it is the env-page container for the content inside. It adds no landmark; put it in a
 * Scaffold's body, or the application's own main.
 */
export function Page({
  width = 'lg',
  header,
  gutter = true,
  name,
  render,
  className,
  children,
  ...props
}: PageProps) {
  return renderElement('div', render, {
    ...props,
    className: classNames('env-page', className),
    'data-env-layout': 'page',
    'data-env-name': name,
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
  });
}
