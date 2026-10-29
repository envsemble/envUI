import type { ComponentPropsWithRef, ReactNode } from 'react';
import { Column, Row } from '../foundations/Layout.js';
import { Text } from '../foundations/Text.js';
import { classNames } from '../internal/classNames.js';
import { ControlDefaults } from '../internal/ControlDefaults.js';
import { StickyHeaderSize } from './internal/StickyHeaderSize.js';
import '../styles/Base.css';
import '../styles/PageHeader.css';

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
   * The page's actions, at the end of the title row: its primary action last. Below 37.5 rem of
   * the header's own width, a compact one, they move under the title and wrap.
   */
  actions?: ReactNode;
  /**
   * A second row under the title: search, filters and view switches, laid out with
   * `<Row wrap justify="between">`; see Toolbar's layouts.
   */
  toolbar?: ReactNode;
  /**
   * Keeps the header in view at the top of the area that scrolls, over the content that scrolls
   * under it: under a Scaffold's top bar where the document scrolls, or at the top of a Scaffold's
   * body that scrolls. As a Page's header, what scrolls into view below it, such as a field taking
   * focus, keeps clear of it: the header measures its height, which CSS reckons from its rows until
   * script runs.
   */
  sticky?: boolean;
  /**
   * The size of the buttons and icon buttons in `actions` and `toolbar` that set none: sm for a
   * dense page, such as one in a small window, or md. Give fields in the toolbar the same `size`.
   * @default 'md'
   */
  controlSize?: 'sm' | 'md';
}

/**
 * The heading of a page: its title with an optional trail above it, a description, leading content,
 * meta beside the title, actions at the end and a toolbar row under it, built from Row and
 * Column. It responds to its own width, and can stick to the top of the area that scrolls.
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
  ...props
}: PageHeaderProps) {
  const Heading = `h${headingLevel}` as const;
  return (
    // A div, not a header: outside main, article or section a header would be a second banner.
    <Column
      gap={3}
      {...props}
      className={classNames('env-page-header', className)}
      data-sticky={sticky ? '' : undefined}
    >
      {sticky && <StickyHeaderSize />}
      {breadcrumbs != null && <div className="env-page-header-breadcrumbs">{breadcrumbs}</div>}
      <Row wrap gap={4} align="start" className="env-page-header-row">
        {start != null && (
          <Row align="center" className="env-page-header-start">
            {start}
          </Row>
        )}
        <Column gap={1} className="env-page-header-heading">
          <Row wrap align="center" className="env-page-header-title-line">
            <Text variant="headline" render={<Heading className="env-page-header-title" />}>
              {title}
            </Text>
            {meta != null && (
              <Row wrap align="center" gap={2} className="env-page-header-meta">
                {meta}
              </Row>
            )}
          </Row>
          {description != null && (
            <Text variant="body-sm" className="env-page-header-description">
              {description}
            </Text>
          )}
        </Column>
        {actions != null && (
          <Row wrap align="center" gap={2} className="env-page-header-actions">
            <ControlDefaults size={controlSize}>{actions}</ControlDefaults>
          </Row>
        )}
      </Row>
      {toolbar != null && (
        <div className="env-page-header-toolbar">
          <ControlDefaults size={controlSize}>{toolbar}</ControlDefaults>
        </div>
      )}
    </Column>
  );
}
