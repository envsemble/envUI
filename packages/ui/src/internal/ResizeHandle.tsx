'use client';

import type { ComponentPropsWithRef } from 'react';
import { classNames } from './classNames.js';
import { useResize, type ResizeOptions } from './useResize.js';

export type ResizeHandleProps = ResizeOptions &
  Omit<ComponentPropsWithRef<'div'>, 'onChange' | 'children'> & {
    /** The handle's name, such as Resize panes. */
    label: string;
  };

/**
 * A window splitter's handle on useResize: a focusable separator, named by its label, that shows a
 * line on hover, keyboard focus and while dragging. The owner places it on the edge it moves.
 *
 *   <ResizeHandle axis="inline" label="Resize panes" value={width} min={16} max={40} unit="rem"
 *     onChange={(next) => setWidth(next)} className="env-panes-divider" />
 */
export function ResizeHandle({
  axis,
  value,
  min,
  max,
  step,
  largeStep,
  unit,
  reverse,
  onChange,
  valueText,
  disabled,
  label,
  className,
  ...props
}: ResizeHandleProps) {
  const { handleProps } = useResize({
    axis,
    value,
    min,
    max,
    step,
    largeStep,
    unit,
    reverse,
    onChange,
    valueText,
    disabled,
  });
  return (
    <div
      {...props}
      {...handleProps}
      aria-label={label}
      className={classNames('env-resize-handle', className)}
    />
  );
}
