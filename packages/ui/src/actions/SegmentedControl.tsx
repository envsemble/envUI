import { Radio } from '@base-ui/react/radio';
import { RadioGroup } from '@base-ui/react/radio-group';
import type { ReactNode } from 'react';
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
    >
      {options.map((option) => (
        <Radio.Root
          key={option.value}
          value={option.value}
          disabled={option.disabled}
          nativeButton
          render={<button type="button" />}
          className="env-segment"
        >
          {option.icon != null && <DecorativeIcon>{option.icon}</DecorativeIcon>}
          <span className="env-segment-label">{option.label}</span>
          {option.count !== undefined && (
            <>
              {' '}
              <span className="env-segment-count">{option.count}</span>
            </>
          )}
        </Radio.Root>
      ))}
    </RadioGroup>
  );
}
