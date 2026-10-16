'use client';

import { PreviewCard as BasePreviewCard } from '@base-ui/react/preview-card';
import { useRef, useState, type FocusEvent, type ReactElement, type ReactNode } from 'react';
import { classNames } from '../internal/classNames.js';
import { Theme, useTheme } from '../foundations/Theme.js';

export interface HoverCardProps {
  /** The element that opens the card on hover and keyboard focus; it receives the ref. */
  trigger: ReactElement;
  /** The details. Supplementary: never the only place essential information appears. */
  children: ReactNode;
  /** bottom (default), top, left or right, or inline-start and inline-end, which follow the text direction. */
  side?: 'top' | 'bottom' | 'left' | 'right' | 'inline-start' | 'inline-end';
  /** Lines the card up with the trigger's centre (default), start or end along the side. */
  align?: 'start' | 'center' | 'end';
  /** Milliseconds the pointer rests on the trigger before the card opens (600); focus opens it at once. */
  delay?: number;
  /** Milliseconds before it closes once the pointer leaves the trigger and the card (300). */
  closeDelay?: number;
  /** standard (default) about 20 rem wide; wide about 28 rem. */
  width?: 'standard' | 'wide';
  /** Whether the card shows; with `onOpenChange` it controls the card. */
  open?: boolean;
  /** Whether an uncontrolled card starts open; closed by default. */
  defaultOpen?: boolean;
  /** Called with the new state when hover, focus or Esc opens or closes the card. */
  onOpenChange?: (open: boolean) => void;
  /** Classes for the card. */
  className?: string;
}

function isFocusVisible(element: Element) {
  try {
    return element.matches(':focus-visible');
  } catch {
    return true;
  }
}

/** Supplementary details that open beside their trigger on hover and keyboard focus, like a link preview. */
export function HoverCard({
  trigger,
  children,
  side = 'bottom',
  align = 'center',
  delay = 600,
  closeDelay = 300,
  width = 'standard',
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  className,
}: HoverCardProps) {
  const theme = useTheme();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = controlledOpen ?? uncontrolledOpen;
  const openRef = useRef(open);
  openRef.current = open;
  function setOpen(next: boolean) {
    if (next === openRef.current) return;
    openRef.current = next;
    if (controlledOpen === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  }
  // Base UI waits for the hover delay on focus too; keyboard focus opens the card at once.
  function openOnKeyboardFocus(event: FocusEvent<HTMLElement>) {
    if (isFocusVisible(event.currentTarget)) setOpen(true);
  }
  return (
    <BasePreviewCard.Root open={open} onOpenChange={(next) => setOpen(next)}>
      <BasePreviewCard.Trigger
        render={trigger}
        delay={delay}
        closeDelay={closeDelay}
        onFocus={openOnKeyboardFocus}
      />
      <BasePreviewCard.Portal>
        <Theme {...theme} className="env-popover-theme">
          <BasePreviewCard.Positioner
            side={side}
            align={align}
            sideOffset={8}
            collisionPadding={8}
            className="env-popover-positioner"
          >
            <BasePreviewCard.Popup
              className={classNames('env-popover', 'env-hover-card', className)}
              data-width={width}
            >
              {children}
            </BasePreviewCard.Popup>
          </BasePreviewCard.Positioner>
        </Theme>
      </BasePreviewCard.Portal>
    </BasePreviewCard.Root>
  );
}
