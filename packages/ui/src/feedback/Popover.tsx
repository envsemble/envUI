'use client';

import { Popover as BasePopover } from '@base-ui/react/popover';
import { useState, type ReactElement, type ReactNode } from 'react';
import { classNames } from '../internal/classNames.js';
import { Theme, useTheme } from '../foundations/Theme.js';

export interface PopoverProps {
  /** The control that opens the popover; it receives the expanded state and ref. */
  trigger: ReactElement;
  /** A heading that also names the popover. */
  title?: ReactNode;
  /** Content, or a function that receives close for actions inside the popover. */
  children: ReactNode | ((close: () => void) => ReactNode);
  /** Accessible name when there is no title. */
  'aria-label'?: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** standard (default) about 20 rem wide; wide about 28 rem. */
  width?: 'standard' | 'wide';
  className?: string;
}

/** A floating panel opened from a trigger, for details or a small form beside the control. */
export function Popover({
  trigger,
  title,
  children,
  'aria-label': label,
  side = 'bottom',
  align = 'center',
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  width = 'standard',
  className,
}: PopoverProps) {
  const theme = useTheme();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = controlledOpen ?? uncontrolledOpen;
  function setOpen(next: boolean) {
    if (controlledOpen === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  }
  const close = () => setOpen(false);
  return (
    <BasePopover.Root open={open} onOpenChange={(next) => setOpen(next)}>
      <BasePopover.Trigger render={trigger} />
      <BasePopover.Portal>
        <Theme theme={theme} className="env-popover-theme">
          <BasePopover.Positioner
            side={side}
            align={align}
            sideOffset={8}
            collisionPadding={8}
            className="env-popover-positioner"
          >
            <BasePopover.Popup
              className={classNames('env-popover', className)}
              data-width={width}
              aria-label={title == null ? label : undefined}
            >
              {title != null && (
                <BasePopover.Title className="env-popover-title">{title}</BasePopover.Title>
              )}
              {typeof children === 'function' ? children(close) : children}
            </BasePopover.Popup>
          </BasePopover.Positioner>
        </Theme>
      </BasePopover.Portal>
    </BasePopover.Root>
  );
}
