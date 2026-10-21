'use client';

import {
  useContext,
  useLayoutEffect,
  useRef,
  type ComponentPropsWithRef,
  type ReactNode,
  type RefObject,
} from 'react';
import { Text } from '../foundations/Text.js';
import { useContainerSize } from '../foundations/useContainerSize.js';
import { classNames } from '../internal/classNames.js';
import { ControlDefaults } from '../internal/ControlDefaults.js';
import { setRef } from '../internal/setRef.js';
import { PageContext } from './Page.js';

export interface PageHeaderProps extends Omit<ComponentPropsWithRef<'div'>, 'title'> {
  /** The page's title. It wraps, balanced across its lines, and is never cut short. */
  title: ReactNode;
  /**
   * The title's heading level: 1 for the page's own heading, a lower level for a header inside a
   * pane or a section that sits under another heading. It looks the same at every level.
   * @default 1
   */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  /** A sentence under the title, in the smaller muted text, such as what the page is for. */
  description?: ReactNode;
  /** The trail to the page, usually Breadcrumbs with wrap={false}, above the title. */
  breadcrumbs?: ReactNode;
  /** Before the title: an Avatar, an icon or a back IconButton. */
  start?: ReactNode;
  /** Beside the title, wrapping with it: Badges, such as a status, or a count. */
  meta?: ReactNode;
  /**
   * The page's actions, at the end of the title row: its primary action last. Below 32 rem of the
   * header's own width they move under the title and wrap.
   */
  actions?: ReactNode;
  /**
   * A second row under the title: search, filters and view switches, laid out with
   * `<Row wrap justify="between">`; see Toolbar's layouts.
   */
  toolbar?: ReactNode;
  /**
   * Keeps the header in view at the top of the page as it scrolls, at `--env-frame-sticky-top`,
   * under the app frame's header. Its height is published on its Page as
   * `--env-page-header-block-size`, so content can stick below both.
   */
  sticky?: boolean;
  /**
   * The size of the buttons and icon buttons in `actions` and `toolbar` that set none: sm for a
   * dense page, such as one in a small window, or md. Give fields in the toolbar the same `size`.
   * @default 'md'
   */
  controlSize?: 'sm' | 'md';
}

/** Publishes a sticky header's height on its Page, for content that sticks below it. */
function usePublishedHeight(header: RefObject<HTMLElement | null>, sticky: boolean) {
  const page = useContext(PageContext);
  const size = useContainerSize(sticky ? header : null, { box: 'border-box' });
  useLayoutEffect(() => {
    const element = page?.current;
    if (!element || !sticky || !size) return;
    element.style.setProperty('--env-page-header-block-size', `${size.blockSize}px`);
    return () => {
      element.style.removeProperty('--env-page-header-block-size');
    };
  }, [page, sticky, size]);
}

/**
 * The heading of a page: its title with an optional trail above it, a description, leading content,
 * meta beside the title, actions at the end and a toolbar row under it. It responds to its own
 * width, and can stick to the top of the page as it scrolls.
 */
export function PageHeader({
  title,
  headingLevel = 1,
  description,
  breadcrumbs,
  start,
  meta,
  actions,
  toolbar,
  sticky = false,
  controlSize = 'md',
  className,
  ref,
  ...props
}: PageHeaderProps) {
  const header = useRef<HTMLDivElement | null>(null);
  usePublishedHeight(header, sticky);
  const Heading = `h${headingLevel}` as const;
  return (
    // A div, not a header: outside main, article or section a header would be a second banner.
    <div
      {...props}
      ref={(node) => {
        header.current = node;
        setRef(ref, node);
      }}
      className={classNames('env-page-header', className)}
      data-sticky={sticky ? '' : undefined}
    >
      {breadcrumbs != null && <div className="env-page-header-breadcrumbs">{breadcrumbs}</div>}
      <div className="env-page-header-row">
        {start != null && <div className="env-page-header-start">{start}</div>}
        <div className="env-page-header-heading">
          <div className="env-page-header-title-line">
            <Text variant="headline" render={<Heading className="env-page-header-title" />}>
              {title}
            </Text>
            {meta != null && <div className="env-page-header-meta">{meta}</div>}
          </div>
          {description != null && (
            <Text variant="body-sm" className="env-page-header-description">
              {description}
            </Text>
          )}
        </div>
        {actions != null && (
          <div className="env-page-header-actions">
            <ControlDefaults size={controlSize}>{actions}</ControlDefaults>
          </div>
        )}
      </div>
      {toolbar != null && (
        <div className="env-page-header-toolbar">
          <ControlDefaults size={controlSize}>{toolbar}</ControlDefaults>
        </div>
      )}
    </div>
  );
}
