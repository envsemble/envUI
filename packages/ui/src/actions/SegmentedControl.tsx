'use client';

import { Radio } from '@base-ui/react/radio';
import { RadioGroup } from '@base-ui/react/radio-group';
import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { TooltipPopup } from '../feedback/internal/TooltipPopup.js';
import { classNames } from '../internal/classNames.js';
import { DecorativeIcon } from '../internal/DecorativeIcon.js';

export interface SegmentedControlOption {
  value: string;
  label: ReactNode;
  /** A small muted number after the label, such as the items in a view. */
  count?: number;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface SegmentedControlProps {
  /** Two to five options. */
  options: readonly SegmentedControlOption[];
  value: string;
  onValueChange: (value: string) => void;
  /** Accessible name of the group. */
  'aria-label': string;
  /** standard (default) matches buttons; compact matches compact fields and toolbars. */
  size?: 'standard' | 'compact';
  /**
   * Fill the available width, split evenly between the options; a label too long for its share is
   * cut short with an ellipsis and shows whole in a tooltip. Without it the control is as wide as
   * its options, and scrolls in a container too narrow for them.
   */
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
}

/** One choice among a few options on a pill rail; the chosen segment takes the primary colors. */
export function SegmentedControl({
  options,
  value,
  onValueChange,
  'aria-label': label,
  size = 'standard',
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
