'use client';

import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import { createContext, type ReactElement, type ReactNode, type RefObject } from 'react';
import { classNames } from '../classNames.js';
import {
  PopupSurface,
  type PopupElementProps,
  type PopupSide,
  type PopupSurfaceProps,
} from './PopupSurface.js';
import '../../styles/Base.css';
import '../../styles/Tooltip.css';

export type TooltipSide = PopupSide;

/** True inside a Tooltip, so controls that show their own tooltip leave it to the outer one. */
/**
 * Milliseconds the pointer rests on a control before its tooltip opens: Tooltip's default, which
 * every control that shows its own name as a tooltip, and CalendarHeatmap's day details, wait too.
 */
export const tooltipDelay = 400;

export const TooltipNestingContext = createContext(false);

/**
 * False around a Tooltip whose content only repeats its control's name, such as an icon-only
 * control's name and keys that aria-keyshortcuts already announces, so it describes nothing.
 */
export const TooltipDescribesContext = createContext(true);

const parts = {
  Portal: BaseTooltip.Portal,
  Positioner: BaseTooltip.Positioner,
  Popup: BaseTooltip.Popup,
};

/**
 * The tooltip's popup in a portal beside its trigger, in the trigger's theme and text direction:
 * role="tooltip", so a trigger's aria-describedby can point at its id while it is open.
 */
export function TooltipPopup({
  content,
  side,
  align = 'center',
  trigger,
  anchor,
  sideOffset = 8,
  positionerClassName,
  className,
  popupProps,
}: {
  content: ReactNode;
  side: TooltipSide;
  /** How it lines up with the trigger along that side; center by default. */
  align?: 'start' | 'center' | 'end';
  /** The trigger, whose text direction the tooltip takes as it opens. */
  trigger?: RefObject<Element | null>;
  /** What it opens beside, where that isn't its trigger, such as one day of a calendar heatmap. */
  anchor?: PopupSurfaceProps['anchor'];
  /** The gap to the anchor in px; 8 by default, as every popup opens. */
  sideOffset?: number;
  /** The owner's positioner class, beside env-tooltip-positioner. */
  positionerClassName?: string;
  /** The owner's popup class, beside env-tooltip. */
  className?: string;
  /** More props for the popup element, such as id, ref and style. */
  popupProps?: PopupElementProps;
}) {
  return (
    <PopupSurface
      parts={parts}
      side={side}
      align={align}
      trigger={trigger}
      anchor={anchor}
      sideOffset={sideOffset}
      positionerClassName={classNames('env-tooltip-positioner', positionerClassName)}
      className={classNames('env-tooltip', className)}
      popupProps={{ role: 'tooltip', ...popupProps }}
    >
      {content}
    </PopupSurface>
  );
}

/**
 * A label cut short with an ellipsis, `cut`, shown in full in a tooltip, `label`, on hover and on
 * keyboard focus, such as a navigation drawer's or a breadcrumb's. The tooltip stays in place while
 * the label fits, so the element and its focus are kept as it resizes: its trigger is disabled
 * then, not its root, whose state would change right after it mounts and render each such tooltip
 * again, one by one, as a page with dozens of them hydrates.
 */
export function CutLabelTooltip({
  cut,
  label,
  side,
  children,
}: {
  cut: boolean;
  label: ReactNode;
  side: TooltipSide;
  /** The element whose label is cut short, which takes the trigger's props and ref. */
  children: ReactElement;
}) {
  return (
    <BaseTooltip.Root>
      <BaseTooltip.Trigger disabled={!cut} delay={tooltipDelay} render={children} />
      {cut && <TooltipPopup content={label} side={side} />}
    </BaseTooltip.Root>
  );
}
