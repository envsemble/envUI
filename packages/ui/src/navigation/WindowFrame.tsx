'use client';

import { useCallback, useState, type ComponentPropsWithRef, type ReactNode, type Ref } from 'react';
import { classNames } from '../internal/classNames.js';
import { setRef } from '../internal/setRef.js';
import { useScrollKeys } from './internal/useScrollKeys.js';

export interface WindowFrameProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** The window's title bar at the top, typically a TitleBar. */
  titleBar: ReactNode;
  /** The window's content, which scrolls below the title bar. */
  children?: ReactNode;
  /** The element that scrolls the content, to read and restore scroll positions. */
  scrollRef?: Ref<HTMLDivElement>;
}

/**
 * A window without the application shell, such as a start page: it fills the window with the title
 * bar on top and the content scrolling below it, so the window controls drawn over the title bar
 * never cover a scrollbar. The keyboard scrolls the content as it would the document.
 */
export function WindowFrame({
  titleBar,
  children,
  scrollRef,
  className,
  ref,
  ...props
}: WindowFrameProps) {
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const [scroller, setScroller] = useState<HTMLDivElement | null>(null);
  useScrollKeys(root, scroller);
  const attachRoot = useCallback(
    (node: HTMLDivElement | null) => {
      setRoot(node);
      setRef(ref, node);
    },
    [ref],
  );
  const attachScroller = useCallback(
    (node: HTMLDivElement | null) => {
      setScroller(node);
      setRef(scrollRef, node);
    },
    [scrollRef],
  );
  return (
    <div {...props} ref={attachRoot} className={classNames('env-window-frame', className)}>
      {titleBar}
      <div ref={attachScroller} className="env-window-frame-content" tabIndex={-1}>
        {children}
      </div>
    </div>
  );
}
