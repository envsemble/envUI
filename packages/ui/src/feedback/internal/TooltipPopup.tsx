import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import { createContext, type ReactNode } from 'react';
import { Theme, useTheme } from '../../foundations/Theme.js';

export type TooltipSide = 'top' | 'bottom' | 'left' | 'right' | 'inline-start' | 'inline-end';

/** True inside a Tooltip, so controls that show their own tooltip leave it to the outer one. */
export const TooltipNestingContext = createContext(false);

/** The tooltip's popup in a portal beside its trigger, in the trigger's theme. */
export function TooltipPopup({ content, side }: { content: ReactNode; side: TooltipSide }) {
  const theme = useTheme();
  return (
    <BaseTooltip.Portal>
      <Theme theme={theme} className="env-tooltip-theme">
        <BaseTooltip.Positioner side={side} sideOffset={6} className="env-tooltip-positioner">
          <BaseTooltip.Popup className="env-tooltip">{content}</BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </Theme>
    </BaseTooltip.Portal>
  );
}
