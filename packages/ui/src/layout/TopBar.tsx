'use client';

import type { ComponentPropsWithRef, ReactElement, ReactNode } from 'react';
import { LoadingBar } from './internal/LoadingBar.js';
import { Slot } from '../internal/layout/Slot.js';
import { Row } from './Layout.js';
import { topBar } from '../foundations/messages/topBar.js';
import { classNames } from '../internal/classNames.js';
import { ControlDefaults } from '../internal/control/ControlDefaults.js';
import { useMessages } from '../internal/provider/EnvUIContext.js';
import { inSkeleton, skeletonAttributes, type SkeletonProps } from '../internal/skeleton.js';
import type { NavigationBackground } from '../navigation/navigationBackground.js';
import { flag } from '../internal/flag.js';
import '../styles/Base.css';
import '../styles/TopBar.css';

export interface TopBarProps
  extends Omit<ComponentPropsWithRef<'div'>, 'title' | 'children'>, SkeletonProps {
  /**
   * Content before the title, at the inline start: a navigation IconButton, such as one that opens
   * a navigation drawer, a back IconButton, or the application's mark. It keeps its size.
   */
  start?: ReactNode;
  /**
   * The title, such as the application's or the section's name, after the start content. Text
   * given as a string truncates before anything else shrinks; any other content keeps its own look
   * and decides how it fits. It is no heading: the page's own heading is its PageHeader's.
   */
  title?: ReactNode;
  /**
   * Content centered in the bar, between the title and the end content, such as a search trigger
   * or a document's name. The start and end sides take equal room, so it stays centered over the
   * bar's middle as long as they fit.
   */
  center?: ReactNode;
  /**
   * The content at the inline end, such as a search trigger, a theme toggle and an account menu,
   * in the order people read them. It keeps its size.
   */
  end?: ReactNode;
  /**
   * Keeps the bar at the top of the scrolling area as it scrolls, for a bar in a page whose
   * document scrolls. In a Scaffold's top bar region it is unneeded: the body scrolls under it.
   * @default false
   */
  sticky?: boolean;
  /**
   * The bar is the window's title bar, in an installed web app or a desktop shell that draws its
   * own (the Window Controls Overlay): empty space drags the window, it leaves room for the window
   * controls the system draws, the title is centered with the center content, and its controls are
   * small, with buttons that set no variant ghost. Put it in a Scaffold with topBarSpan="full".
   * @default false
   */
  titleBar?: boolean;
  /**
   * The bar's background, named as Surface's and Card's: default, the default surface color, the
   * app frame's own fill that stands apart from the page; page, the page's background, the same as
   * the content beside it, from which a Scaffold sets it apart with a hairline. On a surface, such
   * as a Sheet, both take the surface's color.
   * @default 'default'
   */
  background?: NavigationBackground;
  /** Shows page progress along the bar's bottom edge, such as while the next page loads. */
  loading?: boolean;
  /**
   * The progress bar's name.
   * @default 'Loading page', or EnvUIProvider's messages.topBar.loading
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
 * the application's mark, the title, content centered in the bar and content at the end, in one
 * row that never wraps, at the top bar height. Each holds what the application gives it without
 * styling it. It can stick to the top as the page scrolls, show page progress along its bottom
 * edge, or be the window's own title bar.
 */
export function TopBar({
  start,
  title,
  center,
  end,
  sticky = false,
  titleBar = false,
  loading = false,
  loadingLabel,
  background = 'default',
  render,
  skeleton = false,
  className,
  ...props
}: TopBarProps) {
  const messages = useMessages('topBar', topBar);
  const titleSlot = (title != null || skeleton) && (
    <Slot className="env-top-bar-title" grow>
      {typeof title === 'string' ? <span className="env-top-bar-title-text">{title}</span> : title}
    </Slot>
  );
  const middle = center != null || (titleBar && titleSlot !== false);
  const content = (
    <>
      <div className="env-top-bar-lead">
        {start != null && (
          <Slot className="env-top-bar-start" layout="row" shrink="never">
            {start}
          </Slot>
        )}
        {!titleBar && titleSlot}
      </div>
      {middle && (
        <div className="env-top-bar-middle">
          {titleBar && titleSlot}
          {center != null && (
            <Slot className="env-top-bar-center" layout="row">
              {center}
            </Slot>
          )}
        </div>
      )}
      {end != null && (
        <Slot className="env-top-bar-end" layout="row" shrink="never">
          {end}
        </Slot>
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
      data-sticky={flag(sticky)}
      data-title-bar={flag(titleBar)}
      data-centered={flag(middle)}
      data-loading={flag(loading)}
      data-background={background}
    >
      {inSkeleton(
        skeleton,
        titleBar ? (
          <ControlDefaults variant="ghost" size="sm">
            {content}
          </ControlDefaults>
        ) : (
          content
        ),
      )}
      <LoadingBar
        active={loading}
        label={loadingLabel ?? messages.loading}
        className="env-top-bar-loading-bar"
      />
    </Row>
  );
}
