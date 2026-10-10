import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import type { ReactElement, ReactNode } from 'react';
import { Theme, useTheme } from '../foundations/Theme.js';

export interface TooltipProps {
  /** Short supplementary text; never the only place essential information appears. */
  content: ReactNode;
  /** The described control. A disabled control is wrapped so it can still be focused and hovered. */
  children: ReactElement<{ disabled?: boolean }>;
  side?: 'top' | 'bottom' | 'left' | 'right';
  /** Milliseconds before the tooltip opens on hover; focus opens it immediately. Defaults to 400. */
  delay?: number;
}

/** A small label that describes a control on hover and keyboard focus. */
export function Tooltip({ content, children, side = 'top', delay = 400 }: TooltipProps) {
  const theme = useTheme();
  const isDisabled = Boolean(children.props.disabled);
  return (
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
      <BaseTooltip.Portal>
        <Theme theme={theme} className="env-tooltip-theme">
          <BaseTooltip.Positioner side={side} sideOffset={6} className="env-tooltip-positioner">
            <BaseTooltip.Popup className="env-tooltip">{content}</BaseTooltip.Popup>
          </BaseTooltip.Positioner>
        </Theme>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  );
}
