// Dev mode's small shared controls: an icon button whose name shows in a tooltip at once, as every
// icon-only control of dev mode does, and the buttons that hide and show its sidebars.

import type { ComponentPropsWithRef, ReactNode } from 'react';
import { IconButton } from '../../actions/Button.js';
import { Tooltip } from '../../overlays/Tooltip.js';
import type { TooltipSide } from '../../internal/popup/TooltipPopup.js';
import type { ControlSize } from '../../foundations/Theme.js';
import { IconLeftPanelClose } from '../../icons/LeftPanelClose.js';
import { IconLeftPanelOpen } from '../../icons/LeftPanelOpen.js';
import { IconRightPanelClose } from '../../icons/RightPanelClose.js';
import { IconRightPanelOpen } from '../../icons/RightPanelOpen.js';

/** No wait before an icon button's tooltip: its name is all it shows, so it shows at once. */
export const instant = 0;

export interface HintedIconButtonProps extends Omit<
  ComponentPropsWithRef<'button'>,
  'children' | 'aria-label'
> {
  /** The button's name, which its tooltip shows at once on hover and focus. */
  label: string;
  icon: ReactNode;
  /** The side its tooltip opens on. */
  side?: TooltipSide;
  /** Whether it is on, for a toggle. */
  pressed?: boolean;
  /** The button's variant; ghost by default. */
  variant?: 'ghost' | 'secondary' | 'outline';
  /** As IconButton's; without it, the control height of the container. */
  size?: ControlSize;
}

/** An icon-only button named by its label, which a tooltip shows with no delay. */
export function HintedIconButton({
  label,
  icon,
  side = 'bottom',
  pressed,
  variant = 'ghost',
  ...props
}: HintedIconButtonProps) {
  return (
    <Tooltip content={label} delay={instant} side={side}>
      <IconButton
        {...props}
        variant={variant}
        icon={icon}
        aria-label={label}
        aria-pressed={pressed}
      />
    </Tooltip>
  );
}

export type Side = 'tree' | 'inspector';

const sideNames: Record<Side, string> = { tree: 'the nodes', inspector: 'the inspector' };

/**
 * The button that hides or shows a sidebar, in the top corner of the window on the sidebar's side:
 * in the sidebar's header while it shows, and floating over the 3D view in the same place while it
 * is hidden, so it is always where it was.
 */
export function SidebarToggle({
  side,
  shown,
  onClick,
  className,
}: {
  side: Side;
  shown: boolean;
  onClick: () => void;
  className?: string;
}) {
  const start = side === 'tree';
  return (
    <HintedIconButton
      label={`${shown ? 'Hide' : 'Show'} ${sideNames[side]}`}
      icon={
        start ? (
          shown ? (
            <IconLeftPanelClose />
          ) : (
            <IconLeftPanelOpen />
          )
        ) : shown ? (
          <IconRightPanelClose />
        ) : (
          <IconRightPanelOpen />
        )
      }
      side={start ? 'inline-end' : 'inline-start'}
      size="sm"
      onClick={onClick}
      className={className}
    />
  );
}
