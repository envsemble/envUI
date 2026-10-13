import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import type { ReactElement, ReactNode } from 'react';
import { TooltipNestingContext, TooltipPopup, type TooltipSide } from './internal/TooltipPopup.js';

export interface TooltipProps {
  /** Short supplementary text; never the only place essential information appears. */
  content: ReactNode;
  /** The described control. A disabled control is wrapped so it can still be focused and hovered. */
  children: ReactElement<{ disabled?: boolean }>;
  /** top (default), bottom, left, right, or inline-start and inline-end, which follow the text direction. */
  side?: TooltipSide;
  /** Milliseconds before the tooltip opens on hover; focus opens it immediately. Defaults to 400. */
  delay?: number;
}

/** A small label that describes a control on hover and keyboard focus. */
export function Tooltip({ content, children, side = 'top', delay = 400 }: TooltipProps) {
  const isDisabled = Boolean(children.props.disabled);
  return (
    <TooltipNestingContext value>
      <BaseTooltip.Root>
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
