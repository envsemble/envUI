'use client';

import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import { createContext, type ReactNode, type RefObject } from 'react';
import { classNames } from '../../internal/classNames.js';
import { PopupSurface, type PopupSide } from '../../internal/PopupSurface.js';

export type TooltipSide = PopupSide;

/** True inside a Tooltip, so controls that show their own tooltip leave it to the outer one. */
export const TooltipNestingContext = createContext(false);

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
  trigger,
  popupProps,
}: {
  content: ReactNode;
  side: TooltipSide;
  /** The trigger, whose text direction the tooltip takes as it opens. */
  trigger?: RefObject<Element | null>;
  /** More props for the popup element: id, ref, className, style and data attributes. */
  popupProps?: Record<string, unknown>;
}) {
  const { className, ...rest } = popupProps ?? {};
  return (
    <PopupSurface
      parts={parts}
      side={side}
      trigger={trigger}
      sideOffset={6}
      positionerClassName="env-tooltip-positioner"
      className={classNames('env-tooltip', className as string | undefined)}
      popupProps={{ role: 'tooltip', ...rest }}
    >
      {content}
    </PopupSurface>
  );
}
