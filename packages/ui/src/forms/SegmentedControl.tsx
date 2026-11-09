'use client';

import { DirectionProvider } from '@base-ui/react/direction-provider';
import { Radio } from '@base-ui/react/radio';
import { RadioGroup } from '@base-ui/react/radio-group';
import {
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type ReactNode,
} from 'react';
import type { ControlSize } from '../foundations/Theme.js';
import { CutLabelTooltip } from '../internal/popup/TooltipPopup.js';
import { classNames } from '../internal/classNames.js';
import { DecorativeIcon } from '../internal/icon/DecorativeIcon.js';
import { useDirectionScope } from '../internal/provider/useDirection.js';
import { useFormatters } from '../internal/provider/useFormatters.js';
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

export interface SegmentedControlProps extends Omit<
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
 * One choice among a few items, such as views or filters of the same content: segments in a
 * recessed track, the chosen one raised on a thumb. A radio group, with one tab stop and arrow keys.
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
  // The thumb travels to the chosen segment.
  const thumb = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => (thumb.current ? followThumb(thumb.current) : undefined), []);
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
        onValueChange={(next) => onValueChange?.(next)}
        disabled={disabled}
        aria-label={label}
        className={classNames('env-segmented-control', className)}
        data-size={size}
        data-full-width={flag(fullWidth)}
      >
        {items.map((item) => (
          <Segment key={item.value} item={item} fullWidth={fullWidth} />
        ))}
        <span ref={thumb} className="env-segmented-control-thumb" aria-hidden="true" />
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
    <CutLabelTooltip cut={cut} label={item.label} side="top">
      {segment}
    </CutLabelTooltip>
  );
}

/**
 * Places a segmented control's thumb over its chosen segment (the item with data-checked): its box,
 * measured against the track, as --env-segmented-control-thumb-left, -top, -width and -height,
 * physical, set on the thumb directly, so a change renders nothing. The thumb shows once it has
 * measured a chosen segment (`data-placed`) and hides while none is chosen; until then, as in the
 * server's markup, the chosen segment draws its own. It follows the choice, the segments' sizes and
 * the track's. Returns the cleanup.
 */
function followThumb(thumb: HTMLElement): () => void {
  const track = thumb.parentElement;
  if (!track) return () => {};
  const place = () => {
    const chosen = track.querySelector<HTMLElement>(
      ':scope > .env-segmented-control-item[data-checked]',
    );
    if (!chosen) {
      thumb.removeAttribute('data-placed');
      return;
    }
    const box = chosen.getBoundingClientRect();
    const trackBox = track.getBoundingClientRect();
    // The track's own scale, such as a dialog's as it grows in, which the layout sizes leave out.
    const scaleX = track.offsetWidth > 0 ? trackBox.width / track.offsetWidth : 1;
    const scaleY = track.offsetHeight > 0 ? trackBox.height / track.offsetHeight : 1;
    const left = (box.left - trackBox.left) / scaleX + track.scrollLeft - track.clientLeft;
    const top = (box.top - trackBox.top) / scaleY + track.scrollTop - track.clientTop;
    thumb.style.setProperty('--env-segmented-control-thumb-left', `${left}px`);
    thumb.style.setProperty('--env-segmented-control-thumb-top', `${top}px`);
    thumb.style.setProperty('--env-segmented-control-thumb-width', `${box.width / scaleX}px`);
    thumb.style.setProperty('--env-segmented-control-thumb-height', `${box.height / scaleY}px`);
    thumb.setAttribute('data-placed', '');
  };
  place();
  const view = track.ownerDocument.defaultView;
  const resize =
    view && 'ResizeObserver' in view ? new view.ResizeObserver(() => place()) : undefined;
  const observeSegments = () => {
    if (!resize) return;
    resize.disconnect();
    resize.observe(track);
    for (const segment of track.querySelectorAll(':scope > .env-segmented-control-item'))
      resize.observe(segment);
  };
  observeSegments();
  // The choice, and segments added or taken away.
  const mutations =
    view && 'MutationObserver' in view
      ? new view.MutationObserver((records) => {
          if (records.some((record) => record.type === 'childList')) observeSegments();
          place();
        })
      : undefined;
  mutations?.observe(track, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['data-checked'],
  });
  return () => {
    resize?.disconnect();
    mutations?.disconnect();
  };
}
