'use client';

import { useEffect, useRef, type ComponentPropsWithRef } from 'react';
import { classNames } from './classNames.js';
import { setRef } from './setRef.js';
import { useResize, type ResizeOptions } from './useResize.js';
import '../styles/Base.css';
import '../styles/ResizeHandle.css';

export type ResizeHandleProps = ResizeOptions &
  Omit<ComponentPropsWithRef<'div'>, 'onChange' | 'children'> & {
    /** The handle's name, such as Resize panes. */
    label: string;
    /**
     * Shows a grip, three dots at its middle, in place of the line: for a handle between two
     * surfaces or on a surface's edge, as Panes.Divider, a side Sheet's and the Drawer's.
     */
    grip?: boolean;
  };

/**
 * A window splitter's handle on useResize: a focusable separator, named by its label, that shows a
 * line on hover, keyboard focus and while dragging, or with grip a grip of three dots that darkens
 * on hover and takes the focus color. The owner places it on the edge it moves.
 *
 *   <ResizeHandle axis="inline" label="Resize panes" value={width} min={16} max={40} unit="rem"
 *     onChange={(next) => setWidth(next)} className="env-panes-divider" />
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
  reverse,
  onChange,
  valueText,
  disabled,
  label,
  grip = false,
  className,
  ref,
  ...props
}: ResizeHandleProps) {
  const { handleProps, measure } = useResize({
    axis,
    value,
    min,
    max,
    room,
    step,
    largeStep,
    unit,
    reverse,
    onChange,
    valueText,
    disabled,
  });
  // The largest value it reports follows the room around it, read once it is placed and again as
  // the window resizes, so it is right before the handle is focused or moved.
  const element = useRef<HTMLDivElement | null>(null);
  const latestMeasure = useRef(measure);
  latestMeasure.current = measure;
  const measures = room !== undefined;
  useEffect(() => {
    const handle = element.current;
    if (!measures || !handle) return;
    const read = () => latestMeasure.current(handle);
    read();
    const view = handle.ownerDocument.defaultView;
    view?.addEventListener('resize', read);
    return () => view?.removeEventListener('resize', read);
  }, [measures]);
  return (
    <div
      {...props}
      {...handleProps}
      ref={(node) => {
        element.current = node;
        setRef(ref, node);
      }}
      aria-label={label}
      data-grip={grip ? '' : undefined}
      className={classNames('env-resize-handle', className)}
    />
  );
}
