'use client';

import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import type { ReactElement, ReactNode } from 'react';
import { TooltipNestingContext, TooltipPopup, type TooltipSide } from './internal/TooltipPopup.js';

export interface TooltipProps {
  /**
   * What the tooltip shows: a short, supplementary text, such as an icon-only control's name or
   * why a control is disabled. It is visual only and not linked to the control for assistive
   * technology, so the control's name or the page says the same; never the only place essential
   * information appears.
   */
  content: ReactNode;
  /**
   * The one control it describes, such as an IconButton, which takes the trigger's props and ref.
   * A disabled control is wrapped in a focusable element, so hovering and keyboard focus still
   * open the tooltip.
   */
  children: ReactElement<{ disabled?: boolean }>;
  /**
   * The side of the control it opens on: top, bottom, left, right, or inline-start and inline-end,
   * which follow the text direction. Where the window has no room, it flips to the other side.
   */
  side?: TooltipSide;
  /**
   * Milliseconds the pointer rests on the control before the tooltip opens; keyboard focus opens it
   * at once.
   */
  delay?: number;
}

/**
 * A short label beside a control, shown while the pointer rests on it or it has keyboard focus,
 * such as an icon-only button's name or why a control is disabled. It closes on Esc and when the
 * control is pressed.
 */
export function Tooltip({ content, children, side = 'top', delay = 400 }: TooltipProps) {
  const isDisabled = Boolean(children.props.disabled);
  return (
    // A control that becomes enabled or disabled changes the trigger element; a fresh tooltip
    // listens to the new one, so hovering it still opens the tooltip.
    <TooltipNestingContext value>
      <BaseTooltip.Root key={isDisabled ? 'disabled' : 'enabled'}>
        <BaseTooltip.Trigger
          delay={delay}
          render={
            isDisabled ? (
              // Disabled controls receive no pointer or focus events, so the wrapper carries them.
              <span className="env-tooltip-disabled-target" tabIndex={0} />
            ) : (
              children
            )
          }
        >
          {isDisabled ? children : undefined}
        </BaseTooltip.Trigger>
        <TooltipPopup content={content} side={side} />
      </BaseTooltip.Root>
    </TooltipNestingContext>
  );
}
