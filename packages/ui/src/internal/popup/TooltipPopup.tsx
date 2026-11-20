'use client';

import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import { createContext, type ReactElement, type ReactNode, type RefObject } from 'react';
import { classNames } from '../classNames.js';
import { PopupSurface, type PopupElementProps, type PopupSide } from './PopupSurface.js';
import '../../styles/Base.css';
import '../../styles/Tooltip.css';

export type TooltipSide = PopupSide;

/**
 * Milliseconds the pointer rests on a control before its tooltip opens: Tooltip's default, which
 * every control that shows its own name as a tooltip waits too.
 */
export const tooltipDelay = 400;

/** True inside a Tooltip, so controls that show their own tooltip leave it to the outer one. */
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

export interface TooltipPopupProps {
  content: ReactNode;
  side: TooltipSide;
  /** How it lines up with the trigger along that side; center by default. */
  align?: 'start' | 'center' | 'end';
  /** The trigger, whose text direction the tooltip takes as it opens. */
  trigger?: RefObject<Element | null>;
  /** The owner's popup class, beside env-tooltip. */
  className?: string;
  /** More props for the popup element, such as id, ref and style. */
  popupProps?: PopupElementProps;
}

/**
 * The tooltip's popup in a portal beside its trigger, in the trigger's theme and text direction:
 * role="tooltip", so a trigger's aria-describedby can point at its id while it is open.
 */
export function TooltipPopup({
  content,
  side,
  align = 'center',
  trigger,
  className,
  popupProps,
}: TooltipPopupProps) {
  return (
    <PopupSurface
      parts={parts}
      side={side}
      align={align}
      trigger={trigger}
      positionerClassName="env-tooltip-positioner"
      className={classNames('env-tooltip', className)}
      popupProps={{ role: 'tooltip', ...popupProps }}
    >
      {content}
    </PopupSurface>
  );
}

export interface CutLabelTooltipProps {
  cut: boolean;
  label: ReactNode;
  side: TooltipSide;
  /** The element whose label is cut short, which takes the trigger's props and ref. */
  children: ReactElement;
}

/**
 * A label cut short with an ellipsis, `cut`, shown in full in a tooltip, `label`, on hover and on
 * keyboard focus, such as a navigation drawer's or a breadcrumb's.
 */
export function CutLabelTooltip({ cut, label, side, children }: CutLabelTooltipProps) {
  const disableTriggerNotRootWhileLabelFits = !cut;
  return (
    <BaseTooltip.Root>
      <BaseTooltip.Trigger
        disabled={disableTriggerNotRootWhileLabelFits}
        delay={tooltipDelay}
        render={children}
      />
      {cut && <TooltipPopup content={label} side={side} />}
    </BaseTooltip.Root>
  );
}
