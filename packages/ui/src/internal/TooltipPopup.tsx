'use client';

import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import { createContext, type ReactNode, type RefObject } from 'react';
import { classNames } from './classNames.js';
import { PopupSurface, type PopupSide, type PopupSurfaceProps } from './PopupSurface.js';

export type TooltipSide = PopupSide;

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

/**
 * The tooltip's popup in a portal beside its trigger, in the trigger's theme and text direction:
 * role="tooltip", so a trigger's aria-describedby can point at its id while it is open.
 */
export function TooltipPopup({
  content,
  side,
  trigger,
  anchor,
  sideOffset = 8,
  positionerClassName,
  popupProps,
}: {
  content: ReactNode;
  side: TooltipSide;
  /** The trigger, whose text direction the tooltip takes as it opens. */
  trigger?: RefObject<Element | null>;
  /** What it opens beside, where that isn't its trigger, such as one day of a calendar heatmap. */
  anchor?: PopupSurfaceProps['anchor'];
  /** The gap to the anchor in px; 8 by default, as every popup opens. */
  sideOffset?: number;
  /** The owner's positioner class, beside env-tooltip-positioner. */
  positionerClassName?: string;
  /** More props for the popup element: id, ref, className, style and data attributes. */
  popupProps?: Record<string, unknown>;
}) {
  const { className, ...rest } = popupProps ?? {};
  return (
    <PopupSurface
      parts={parts}
      side={side}
      trigger={trigger}
      anchor={anchor}
      sideOffset={sideOffset}
      positionerClassName={classNames('env-tooltip-positioner', positionerClassName)}
      className={classNames('env-tooltip', className as string | undefined)}
      popupProps={{ role: 'tooltip', ...rest }}
    >
      {content}
    </PopupSurface>
  );
}
