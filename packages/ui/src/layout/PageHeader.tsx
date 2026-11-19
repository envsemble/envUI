import type { ComponentPropsWithRef, ReactNode } from 'react';
import { Column, Row } from './Layout.js';
import { Text } from '../foundations/Text.js';
import { classNames } from '../internal/classNames.js';
import { ControlDefaults } from '../internal/control/ControlDefaults.js';
import { StickyHeaderSize } from './internal/StickyHeaderSize.js';
import { PageTitleFocus } from './internal/PageTitleFocus.js';
import { Slot } from '../internal/layout/Slot.js';
import type { HeadingLevel } from '../foundations/headingLevel.js';
import { flag } from '../internal/flag.js';
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
  headingLevel?: HeadingLevel;
  /**
   * Under the title, such as a sentence on what the page is for, or a status line. Text takes the
   * smaller muted text; any content, block content too, keeps its own look.
   */
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
  /**
   * In a Scaffold, moves focus to the title of a level 1 header when the page changes: as a new
   * page's header mounts after the Scaffold first showed, not as a title changes. People using a screen
   * reader then hear the new page, and the next Tab starts from it. Focus moved there shows no
   * ring, and focus in a field or an open overlay stays where it is. False leaves focus to the
   * application.
   * @default true
   */
  focusOnNavigation?: boolean;
  /**
   * More rows under the toolbar, placed as given, such as a progress strip or an inline Alert. They
   * stay in the header, so they stick with it.
   */
  children?: ReactNode;
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
  focusOnNavigation = true,
  className,
  children,
  ...props
}: PageHeaderProps) {
  const Heading = `h${headingLevel}` as const;
  const isPagesOwnHeading = headingLevel === 1;
  const titleTakesFocus = isPagesOwnHeading && focusOnNavigation;
  return (
    <Column
      gap={3}
      {...props}
      className={classNames('env-page-header', className)}
      data-sticky={flag(sticky)}
    >
      {sticky && <StickyHeaderSize />}
      {breadcrumbs != null && <Slot className="env-page-header-breadcrumbs">{breadcrumbs}</Slot>}
      <Row wrap gap={4} align="start" className="env-page-header-row">
        {start != null && (
          <Slot className="env-page-header-start" layout="row" shrink="never">
            {start}
          </Slot>
        )}
        <Column gap={1} className="env-page-header-heading">
          <Row wrap align="center" className="env-page-header-title-line">
            <Text
              variant="headline"
              render={
                <Heading
                  className="env-page-header-title"
                  tabIndex={titleTakesFocus ? -1 : undefined}
                />
              }
            >
              {title}
            </Text>
            {isPagesOwnHeading && <PageTitleFocus enabled={focusOnNavigation} />}
            {meta != null && (
              <Slot className="env-page-header-meta" layout="row">
                {meta}
              </Slot>
            )}
          </Row>
          {description != null && (
            <Slot className="env-page-header-description">{description}</Slot>
          )}
        </Column>
        {actions != null && (
          <Slot className="env-page-header-actions" layout="row">
            <ControlDefaults size={controlSize}>{actions}</ControlDefaults>
          </Slot>
        )}
      </Row>
      {toolbar != null && (
        <Slot className="env-page-header-toolbar">
          <ControlDefaults size={controlSize}>{toolbar}</ControlDefaults>
        </Slot>
      )}
      {children}
    </Column>
  );
}
