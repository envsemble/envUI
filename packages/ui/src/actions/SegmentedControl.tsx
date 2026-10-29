'use client';

import { DirectionProvider } from '@base-ui/react/direction-provider';
import { Radio } from '@base-ui/react/radio';
import { RadioGroup } from '@base-ui/react/radio-group';
import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import {
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type ReactNode,
} from 'react';
import type { ControlSize } from '../foundations/Theme.js';
import { TooltipPopup, tooltipDelay } from '../internal/TooltipPopup.js';
import { classNames } from '../internal/classNames.js';
import { DecorativeIcon } from '../internal/DecorativeIcon.js';
import { useDirectionScope } from '../internal/useDirection.js';
import { useFormatters } from '../internal/useFormatters.js';
import { Check } from '../icons/Check.js';
import { flag } from '../internal/flag.js';
import '../styles/Base.css';
import '../styles/SegmentedControl.css';

/** One item of a SegmentedControl. */
export interface SegmentedControlItem {
  /** The value onValueChange reports when this item is chosen. */
  value: string;
  /** The item's short visible name, such as Open or Board; it names the item. */
  label: ReactNode;
  /**
   * A small muted number after the label, such as the items in a view, in the locale's number
   * format; it is read as part of the item's name, such as Open 12.
   */
  count?: number;
  /** A decorative icon before the label, at the control icon size of 1 rem. */
  icon?: ReactNode;
  /** Show the item but don't let people choose it; the arrow keys skip it. */
  disabled?: boolean;
}

export interface SegmentedControlProps
  extends Omit<
    ComponentPropsWithRef<'div'>,
    'children' | 'onChange' | 'defaultValue' | 'dir' | 'aria-label'
  > {
  /** The items, two to five, in the order they show. */
  items: readonly SegmentedControlItem[];
  /** The chosen item's value, for a control the application keeps; update it from onValueChange. */
  value?: string;
  /**
   * The item an uncontrolled control starts with chosen.
   * @default the first item's value
   */
  defaultValue?: string;
  /** Receives the value of the item people choose, by pressing it or with the arrow keys. */
  onValueChange?: (value: string) => void;
  /** The group's accessible name, such as Work items; the control has no visible label. */
  'aria-label': string;
  /**
   * The height, as on every control: sm, md or lg in the current scale, so it lines up with buttons
   * and fields of the same size. Without it, it takes the control height of its container, md
   * unless the container sets another.
   */
  size?: ControlSize;
  /**
   * Fill the available width, split evenly between the items; a label too long for its share is
   * cut short with an ellipsis and shows whole in a tooltip. Without it the control is as wide as
   * its items, and scrolls in a container too narrow for them.
   */
  fullWidth?: boolean;
  /** Disable every item; the control can't be focused or changed. */
  disabled?: boolean;
}

/**
 * One choice among a few items, such as views or filters of the same content, as connected outlined
 * segments after Material's segmented buttons: the chosen one takes the selected fill and a check.
 * A radio group, with one tab stop and arrow keys.
 */
export function SegmentedControl({
  items,
  value,
  defaultValue = items[0]?.value,
  onValueChange,
  'aria-label': label,
  size,
  fullWidth = false,
  disabled = false,
  className,
  ref,
  onFocus,
  ...props
}: SegmentedControlProps) {
  // The arrow keys follow the text direction, which Base UI only knows from its own provider.
  const scope = useDirectionScope<HTMLDivElement>(ref);
  return (
    <DirectionProvider direction={scope.direction}>
      <RadioGroup
        {...props}
        ref={scope.ref}
        onFocus={(event) => {
          scope.onFocus();
          onFocus?.(event);
        }}
        value={value}
        defaultValue={defaultValue}
        onValueChange={(next) => onValueChange?.(next as string)}
        disabled={disabled}
        aria-label={label}
        className={classNames('env-segmented-control', className)}
        data-size={size}
        data-full-width={flag(fullWidth)}
      >
        {items.map((item) => (
          <Segment key={item.value} item={item} fullWidth={fullWidth} />
        ))}
      </RadioGroup>
    </DirectionProvider>
  );
}

function Segment({ item, fullWidth }: { item: SegmentedControlItem; fullWidth: boolean }) {
  const labelRef = useRef<HTMLSpanElement>(null);
  const formatters = useFormatters();
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
      value={item.value}
      disabled={item.disabled}
      nativeButton
      render={<button type="button" />}
      className="env-segmented-control-item"
    >
      {/* The chosen segment shows a check, in place of its icon where it has one. */}
      <span className="env-icon env-segmented-control-item-indicator" aria-hidden="true">
        <Check />
      </span>
      {item.icon != null && <DecorativeIcon>{item.icon}</DecorativeIcon>}
      <span ref={labelRef} className="env-segmented-control-item-label">
        {item.label}
      </span>
      {item.count !== undefined && (
        <>
          {' '}
          <span className="env-segmented-control-item-count">
            {formatters.number().format(item.count)}
          </span>
        </>
      )}
    </Radio.Root>
  );
  if (!fullWidth) return segment;
  return (
    <BaseTooltip.Root disabled={!cut}>
      <BaseTooltip.Trigger delay={tooltipDelay} render={segment} />
      {cut && <TooltipPopup content={item.label} side="top" />}
    </BaseTooltip.Root>
  );
}
