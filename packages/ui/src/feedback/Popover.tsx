'use client';

import { Popover as BasePopover } from '@base-ui/react/popover';
import { useState, type ReactElement, type ReactNode } from 'react';
import { classNames } from '../internal/classNames.js';
import { Theme, useTheme } from '../foundations/Theme.js';

export interface PopoverProps {
  /**
   * The control that opens and closes the popover, such as a Button or an IconButton. It must take
   * a ref and props: it receives the press handler, aria-haspopup and aria-expanded.
   */
  trigger: ReactElement;
  /** A heading at the top, such as the name of what the popover describes; it names the popover. */
  title?: ReactNode;
  /**
   * The popover's content, or a function that receives close, for an action inside it that should
   * close the popover once it is done, such as a form's submit.
   */
  children: ReactNode | ((close: () => void) => ReactNode);
  /** The popover's accessible name when it has no title, such as Rename document. */
  'aria-label'?: string;
  /** The side of the trigger the popover opens on; it flips to the other side without room. */
  side?: 'top' | 'bottom' | 'left' | 'right';
  /** How the popover lines up with the trigger along that side: its start, center or end. */
  align?: 'start' | 'center' | 'end';
  /** Whether a controlled popover is open; update it from onOpenChange. */
  open?: boolean;
  /** Whether an uncontrolled popover starts open. */
  defaultOpen?: boolean;
  /**
   * Receives the requested state each time the popover asks to open or close: from the trigger,
   * Esc, a press outside, focus leaving it or close.
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * The popover's width: standard, 20 rem, for details and a field or two; wide, 28 rem, for a
   * longer form. Both narrow to fit the window.
   * @default 'standard'
   */
  width?: 'standard' | 'wide';
  /** A class for the popover's surface. */
  className?: string;
}

/**
 * A floating panel beside its trigger, for details or a small form: it opens on press, moves focus
 * into itself, and closes with Esc, a press outside or when focus leaves it.
 */
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
