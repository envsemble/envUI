'use client';

import { Radio } from '@base-ui/react/radio';
import { RadioGroup } from '@base-ui/react/radio-group';
import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import type { ControlSize } from '../foundations/Theme.js';
import { TooltipPopup } from '../feedback/internal/TooltipPopup.js';
import { classNames } from '../internal/classNames.js';
import { DecorativeIcon } from '../internal/DecorativeIcon.js';

/** One option of a SegmentedControl. */
export interface SegmentedControlOption {
  /** The value onValueChange reports when this option is chosen. */
  value: string;
  /** The option's short visible name, such as Open or Board; it names the option. */
  label: ReactNode;
  /**
   * A small muted number after the label, such as the items in a view; it is read as part of the
   * option's name, such as Open 12.
   */
  count?: number;
  /** A decorative icon before the label, at the control icon size of 1 rem. */
  icon?: ReactNode;
  /** Show the option but don't let people choose it; the arrow keys skip it. */
  disabled?: boolean;
}

export interface SegmentedControlProps {
  /** The options, two to five, in the order they show. */
  options: readonly SegmentedControlOption[];
  /** The chosen option's value. The control is always controlled: update it from onValueChange. */
  value: string;
  /** Receives the value of the option people choose, by pressing it or with the arrow keys. */
  onValueChange: (value: string) => void;
  /** The group's accessible name, such as Work items; the control has no visible label. */
  'aria-label': string;
  /**
   * The rail's height, as on every control: sm, md or lg in the current scale, so it lines up with
   * buttons and fields of the same size. Without it, the rail takes the control height of its
   * container, md unless the container sets another.
   */
  size?: ControlSize;
  /**
   * Fill the available width, split evenly between the options; a label too long for its share is
   * cut short with an ellipsis and shows whole in a tooltip. Without it the control is as wide as
   * its options, and scrolls in a container too narrow for them.
   */
  fullWidth?: boolean;
  /** Disable every option; the control can't be focused or changed. */
  disabled?: boolean;
  /** A class for the rail, such as for its placement in a layout. */
  className?: string;
}

/**
 * One choice among a few options on a pill rail, such as views or filters of the same content; the
 * chosen segment takes the primary colors. A radio group, with one tab stop and arrow keys.
 */
export function SegmentedControl({
  options,
  value,
  onValueChange,
  'aria-label': label,
  size,
  fullWidth = false,
  disabled = false,
  className,
}: SegmentedControlProps) {
  return (
    <RadioGroup
      value={value}
      onValueChange={(next) => onValueChange(next as string)}
      disabled={disabled}
      aria-label={label}
      className={classNames('env-segmented-control', className)}
      data-size={size}
      data-full-width={fullWidth || undefined}
    >
      {options.map((option) => (
        <Segment key={option.value} option={option} fullWidth={fullWidth} />
      ))}
    </RadioGroup>
  );
}

function Segment({ option, fullWidth }: { option: SegmentedControlOption; fullWidth: boolean }) {
  const labelRef = useRef<HTMLSpanElement>(null);
  // Whether a full-width segment cuts its label short, which its tooltip then shows whole.
  const [cut, setCut] = useState(false);
  useLayoutEffect(() => {
    const element = labelRef.current;
    if (!fullWidth || !element) {
      setCut(false);
      return;
    }
    const measure = () => setCut(element.scrollWidth > element.clientWidth);
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [fullWidth]);
  const segment = (
    <Radio.Root
      value={option.value}
      disabled={option.disabled}
      nativeButton
      render={<button type="button" />}
      className="env-segment"
    >
      {option.icon != null && <DecorativeIcon>{option.icon}</DecorativeIcon>}
      <span ref={labelRef} className="env-segment-label">
        {option.label}
      </span>
      {option.count !== undefined && (
        <>
          {' '}
          <span className="env-segment-count">{option.count}</span>
        </>
      )}
    </Radio.Root>
  );
  if (!fullWidth) return segment;
  return (
    <BaseTooltip.Root disabled={!cut}>
      <BaseTooltip.Trigger delay={400} render={segment} />
      {cut && <TooltipPopup content={option.label} side="top" />}
    </BaseTooltip.Root>
  );
}
