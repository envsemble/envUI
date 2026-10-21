'use client';

import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react';
import { LoadingBar } from '../feedback/internal/LoadingBar.js';
import { Row } from '../foundations/Layout.js';
import { topBar } from '../foundations/messages/topBar.js';
import { classNames } from '../internal/classNames.js';
import { ControlDefaults } from '../internal/ControlDefaults.js';
import { useMessages } from '../internal/EnvUIContext.js';
import { SkeletonScope } from '../foundations/SkeletonScope.js';
import { skeletonAttributes, type SkeletonProps } from '../internal/skeleton.js';

export interface TopBarProps
  extends Omit<ComponentPropsWithRef<'div'>, 'title' | 'children'>,
    SkeletonProps {
  /**
   * Content before the title, at the inline start: a navigation IconButton, such as one that opens
   * a navigation drawer, a back IconButton, or the application's mark.
   */
  start?: ReactNode;
  /**
   * The title, such as the application's or the section's name. It truncates before the start
   * content and the actions shrink. It is no heading: the page's own heading is its PageHeader's.
   */
  title?: ReactNode;
  /**
   * The actions at the inline end, such as a search trigger, a theme toggle and an account menu,
   * in the order people read them.
   */
  actions?: ReactNode;
  /**
   * Keeps the bar at the top of the scrolling area as it scrolls, for a bar in a page whose
   * document scrolls. In a Scaffold's top bar region it is unneeded: the body scrolls under it.
   * @default false
   */
  sticky?: boolean;
  /**
   * The bar is the window's title bar, in an installed web app or a desktop shell that draws its
   * own (the Window Controls Overlay): empty space drags the window, it leaves room for the window
   * controls the system draws, the title is centered, and its controls are small, with buttons
   * that set no variant ghost. Put it in a Scaffold with topBarSpan="full".
   * @default false
   */
  titleBar?: boolean;
  /** Shows page progress along the bar's bottom edge, such as while the next page loads. */
  loading?: boolean;
  /**
   * The progress bar's name.
   * @default 'Loading page', or EnvUIProvider's messages.topBar.loadingPage
   */
  loadingLabel?: string;
  /**
   * The element to render, such as render={<header />} for a bar outside a Scaffold, which then
   * is the page's banner; a div by default, as Scaffold's top bar region is the banner.
   */
  render?: ReactElement;
}

/**
 * The bar at the top of an application or a screen: start content, such as a navigation button or
 * the application's mark, the title, which truncates first, and the actions at the end, in one
 * row that never wraps, at the top bar height. It can stick to the top as the page scrolls, show
 * page progress along its bottom edge, or be the window's own title bar.
 */
export function TopBar({
  start,
  title,
  actions,
  sticky = false,
  titleBar = false,
  loading = false,
  loadingLabel,
  render,
  skeleton = false,
  className,
  ...props
}: TopBarProps) {
  const messages = useMessages('topBar', topBar);
  const content = (
    <>
      {start != null && (
        <Row align="center" gap={2} className="env-top-bar-start">
          {start}
        </Row>
      )}
      <div className="env-top-bar-title">{title}</div>
      {actions != null && (
        <Row align="center" gap={2} className="env-top-bar-actions">
          {actions}
        </Row>
      )}
    </>
  );
  return (
    <Row
      align="center"
      gap={3}
      render={render}
      {...props}
      {...skeletonAttributes(skeleton)}
      className={classNames('env-top-bar', className)}
      data-sticky={sticky ? '' : undefined}
      data-title-bar={titleBar ? '' : undefined}
      data-loading={loading ? '' : undefined}
    >
      {/* In a title bar, buttons that set no variant are ghost, and controls take the small
          height, as the window controls beside them. */}
      <SkeletonScope skeleton={skeleton}>
        {titleBar ? (
          <ControlDefaults variant="ghost" size="sm">
            {content}
          </ControlDefaults>
        ) : (
          content
        )}
      </SkeletonScope>
      <LoadingBar
        active={loading}
        label={loadingLabel ?? messages.loadingPage}
        contained
        className="env-top-bar-loading-bar"
      />
    </Row>
  );
}
