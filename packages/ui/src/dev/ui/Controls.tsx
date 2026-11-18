import type { ComponentPropsWithRef, ReactNode } from 'react';
import { IconButton } from '../../actions/Button.js';
import { Tooltip } from '../../overlays/Tooltip.js';
import type { TooltipSide } from '../../internal/popup/TooltipPopup.js';
import type { ControlSize } from '../../foundations/Theme.js';
import { IconLeftPanelClose } from '../../icons/LeftPanelClose.js';
import { IconLeftPanelOpen } from '../../icons/LeftPanelOpen.js';
import { IconRightPanelClose } from '../../icons/RightPanelClose.js';
import { IconRightPanelOpen } from '../../icons/RightPanelOpen.js';

export const noTooltipDelay = 0;

export interface HintedIconButtonProps extends Omit<
  ComponentPropsWithRef<'button'>,
  'children' | 'aria-label'
> {
  label: string;
  icon: ReactNode;
  side?: TooltipSide;
  pressed?: boolean;
  variant?: 'ghost' | 'secondary' | 'outline';
  size?: ControlSize;
}

export function HintedIconButton({
  label,
  icon,
  side = 'bottom',
  pressed,
  variant = 'ghost',
  ...props
}: HintedIconButtonProps) {
  return (
    <Tooltip content={label} delay={noTooltipDelay} side={side}>
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
