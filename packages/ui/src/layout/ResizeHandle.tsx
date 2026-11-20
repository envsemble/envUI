'use client';

import { useEffect, useRef, type ComponentPropsWithRef } from 'react';
import { classNames } from '../internal/classNames.js';
import { mergeRefs } from '../internal/react/setRef.js';
import { useResize, type ResizeOptions } from '../internal/resize/useResize.js';
import { useLatest } from '../internal/react/useLatest.js';
import { flag } from '../internal/flag.js';
import { chainHandlers } from '../internal/react/chainHandlers.js';
import '../styles/Base.css';
import '../styles/ResizeHandle.css';

export type ResizeHandleProps = ResizeOptions &
  Omit<ComponentPropsWithRef<'div'>, 'onChange' | 'children' | 'role' | 'tabIndex'> & {
    /** The handle's name, which says what it resizes, such as Resize the project list. */
    label: string;
    /**
     * Shows a grip of three dots at the handle's middle. false leaves the handle invisible until
     * the pointer is over it, it has keyboard focus or it is dragged.
     * @default true
     */
    grip?: boolean;
  };

/**
 * A handle that resizes what is beside it, such as two panes or a panel's edge: a focusable
 * separator, named by its label, that the pointer drags and the arrow keys, Page Up, Page Down,
 * Home and End move, with aria-valuenow, aria-valuemin, aria-valuemax and aria-valuetext. Its track
 * is invisible, with a grip of three dots at its middle; a 1 px line shows along it under the
 * pointer and while it is dragged, and a 2 px line in the focus color with keyboard focus. The handle's box is
 * what the pointer reaches: place and size it with a class on the edge it moves. The application
 * keeps the size; give the handle `aria-controls` with the id of what it resizes. Handlers given to
 * it run first, and one that calls preventDefault stops the handle's own.
 *
 *   <ResizeHandle axis="inline" label="Resize the sidebar" aria-controls="sidebar" value={width}
 *     min={12} max={30} unit="rem" step={1} onChange={(next) => setWidth(next)}
 *     className="app-sidebar-edge" />
 */
export function ResizeHandle({
  axis,
  value,
  min,
  max,
  room,
  step,
  largeStep,
  unit,
  percentOf,
  reverse,
  onChange,
  valueText,
  disabled,
  label,
  grip = true,
  className,
  ref,
  ...props
}: ResizeHandleProps) {
  const { handleProps, measureRoomTheLargestValueFollows: measure } = useResize({
    axis,
    value,
    min,
    max,
    room,
    step,
    largeStep,
    unit,
    percentOf,
    reverse,
    onChange,
    valueText,
    disabled,
  });
  const element = useRef<HTMLDivElement | null>(null);
  const latestMeasure = useLatest(measure);
  const measures = room !== undefined;
  useEffect(
    function measureRoomOncePlacedAndAsWindowResizes() {
      const handle = element.current;
      if (!measures || !handle) return;
      const read = () => latestMeasure.current(handle);
      read();
      const view = handle.ownerDocument.defaultView;
      view?.addEventListener('resize', read);
      return () => view?.removeEventListener('resize', read);
    },
    [measures, latestMeasure],
  );
  const {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    onLostPointerCapture,
    onKeyDown,
    onFocus,
    ...own
  } = handleProps;
  return (
    <div
      {...props}
      {...own}
      onPointerDown={chainHandlers(props.onPointerDown, onPointerDown)}
      onPointerMove={chainHandlers(props.onPointerMove, onPointerMove)}
      onPointerUp={chainHandlers(props.onPointerUp, onPointerUp)}
      onPointerCancel={chainHandlers(props.onPointerCancel, onPointerCancel)}
      onLostPointerCapture={chainHandlers(props.onLostPointerCapture, onLostPointerCapture)}
      onKeyDown={chainHandlers(props.onKeyDown, onKeyDown)}
      onFocus={chainHandlers(props.onFocus, onFocus)}
      ref={mergeRefs(element, ref)}
      aria-label={label}
      data-grip={flag(grip)}
      className={classNames('env-resize-handle', className)}
    />
  );
}
