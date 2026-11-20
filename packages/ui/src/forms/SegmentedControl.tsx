'use client';

import { DirectionProvider } from '@base-ui/react/direction-provider';
import { Radio } from '@base-ui/react/radio';
import { RadioGroup } from '@base-ui/react/radio-group';
import {
  useLayoutEffect,
  useRef,
  type ComponentPropsWithoutRef,
  type ComponentPropsWithRef,
  type ReactNode,
} from 'react';
import type { ControlSize } from '../foundations/Theme.js';
import { CutLabelTooltip } from '../internal/popup/TooltipPopup.js';
import { classNames } from '../internal/classNames.js';
import { DecorativeIcon } from '../internal/icon/DecorativeIcon.js';
import { Slot } from '../internal/layout/Slot.js';
import { VisuallyHidden } from '../content/VisuallyHidden.js';
import { useDirectionScope } from '../internal/provider/useDirection.js';
import { useFormatters } from '../internal/provider/useFormatters.js';
import { useRowControlNaming } from '../internal/field/rowControl.js';
import { flag } from '../internal/flag.js';
import { useCutShort } from '../internal/popup/useCutShort.js';
import '../styles/Base.css';
import '../styles/SegmentedControl.css';

/** One item of a SegmentedControl. */
export interface SegmentedControlItem {
  /** The value onValueChange reports when this item is chosen. */
  value: string;
  /**
   * The item's short visible name, such as Open or Board: text, or any content, such as a status
   * dot beside the text. It names the item. In a full-width control a name too long for its share
   * ends in an ellipsis, and its tooltip shows the same content whole.
   */
  label: ReactNode;
  /**
   * Show the label on the segment. Without it the segment shows only its icon, as in a List and
   * Grid view switch: the label still names it, and shows in a tooltip on hover and keyboard focus.
   * @default true
   */
  visibleLabel?: boolean;
  /**
   * A small muted number after the label, such as the items in a view, in the locale's number
   * format; it is read as part of the item's name, such as Open 12.
   */
  count?: number;
  /** A decorative icon before the label, at the control icon size of 1 rem. */
  icon?: ReactNode;
  /**
   * Content after the label and the count, such as a Badge, which keeps its size; it is read as
   * part of the item's name.
   */
  end?: ReactNode;
  /** Show the item but don't let people choose it; the arrow keys skip it. */
  disabled?: boolean;
  /**
   * More props for the segment's button, such as a title or data attributes for tests. Its class
   * joins the segment's; the segment's role, id, ARIA attributes, value and disabled state stay its
   * own.
   */
  itemProps?: SegmentedControlItemElementProps;
}

/** What a SegmentedControl item's itemProps can set on its button. */
export type SegmentedControlItemElementProps = Omit<
  ComponentPropsWithoutRef<'button'>,
  | 'children'
  | 'id'
  | 'role'
  | 'type'
  | 'value'
  | 'name'
  | 'disabled'
  | 'tabIndex'
  | 'dangerouslySetInnerHTML'
  | `aria-${string}`
> & { [attribute: `data-${string}`]: string | number | boolean | undefined };

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
  /**
   * The group's accessible name, such as Work items; the control has no visible label. Without it,
   * a List.Item whose control it is names it, or name it with aria-labelledby.
   */
  'aria-label'?: string;
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
  const naming = useRowControlNaming({ ...props, 'aria-label': label });
  const directionScope = useDirectionScope<HTMLDivElement>(ref);
  const thumb = useRef<HTMLSpanElement>(null);
  useLayoutEffect(
    () => (thumb.current ? keepThumbOverChosenSegment(thumb.current) : undefined),
    [],
  );
  return (
    <DirectionProvider direction={directionScope.direction}>
      <RadioGroup
        {...props}
        {...naming}
        ref={directionScope.ref}
        onFocus={(event) => {
          directionScope.onFocus();
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
  const labelShown = item.visibleLabel !== false;
  const labelCutShort = useCutShort(labelRef, fullWidth && labelShown);
  const { className: itemClassName, ...itemProps } = item.itemProps ?? {};
  const segment = (
    <Radio.Root
      value={item.value}
      disabled={item.disabled}
      nativeButton
      render={<button {...itemProps} type="button" />}
      className={classNames('env-segmented-control-item', itemClassName)}
    >
      {item.icon != null && (
        <Slot
          className="env-segmented-control-item-icon"
          element="span"
          layout="row"
          shrink="never"
        >
          <DecorativeIcon>{item.icon}</DecorativeIcon>
        </Slot>
      )}
      {labelShown ? (
        <span ref={labelRef} className="env-segmented-control-item-label">
          {item.label}
        </span>
      ) : (
        <VisuallyHidden>{item.label}</VisuallyHidden>
      )}
      {item.count !== undefined && (
        <>
          {' '}
          <span className="env-segmented-control-item-count">
            {formatters.number().format(item.count)}
          </span>
        </>
      )}
      {item.end != null && (
        <>
          {' '}
          <Slot
            className="env-segmented-control-item-end"
            element="span"
            layout="row"
            shrink="never"
          >
            {item.end}
          </Slot>
        </>
      )}
    </Radio.Root>
  );
  if (!fullWidth && labelShown) return segment;
  return (
    <CutLabelTooltip cut={!labelShown || labelCutShort} label={item.label} side="top">
      {segment}
    </CutLabelTooltip>
  );
}

function keepThumbOverChosenSegment(thumb: HTMLElement): () => void {
  const track = thumb.parentElement;
  if (!track) return () => {};
  let placedOver: HTMLElement | null = null;
  const view = track.ownerDocument.defaultView;
  const arrivedOnceTravelEnds = () => {
    if (!thumb.getAnimations().length) thumb.removeAttribute('data-traveling');
  };
  const place = () => {
    const chosen = track.querySelector<HTMLElement>(
      ':scope > .env-segmented-control-item[data-checked]',
    );
    if (!chosen) {
      placedOver = null;
      thumb.removeAttribute('data-placed');
      thumb.removeAttribute('data-traveling');
      return;
    }
    if (placedOver !== null && placedOver !== chosen) {
      thumb.setAttribute('data-traveling', '');
      view?.requestAnimationFrame(arrivedOnceTravelEnds);
    }
    placedOver = chosen;
    const box = chosen.getBoundingClientRect();
    const trackBox = track.getBoundingClientRect();
    const transformScaleX = track.offsetWidth > 0 ? trackBox.width / track.offsetWidth : 1;
    const transformScaleY = track.offsetHeight > 0 ? trackBox.height / track.offsetHeight : 1;
    const left = (box.left - trackBox.left) / transformScaleX + track.scrollLeft - track.clientLeft;
    const top = (box.top - trackBox.top) / transformScaleY + track.scrollTop - track.clientTop;
    thumb.style.setProperty('--_segmented-control-thumb-left', `${left}px`);
    thumb.style.setProperty('--_segmented-control-thumb-top', `${top}px`);
    thumb.style.setProperty('--_segmented-control-thumb-width', `${box.width / transformScaleX}px`);
    thumb.style.setProperty(
      '--_segmented-control-thumb-height',
      `${box.height / transformScaleY}px`,
    );
    thumb.setAttribute('data-placed', '');
  };
  place();
  thumb.addEventListener('transitionend', arrivedOnceTravelEnds);
  thumb.addEventListener('transitioncancel', arrivedOnceTravelEnds);
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
  const choiceAndSegmentsObserver =
    view && 'MutationObserver' in view
      ? new view.MutationObserver((records) => {
          if (records.some((record) => record.type === 'childList')) observeSegments();
          place();
        })
      : undefined;
  choiceAndSegmentsObserver?.observe(track, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['data-checked'],
  });
  return () => {
    thumb.removeEventListener('transitionend', arrivedOnceTravelEnds);
    thumb.removeEventListener('transitioncancel', arrivedOnceTravelEnds);
    resize?.disconnect();
    choiceAndSegmentsObserver?.disconnect();
  };
}
