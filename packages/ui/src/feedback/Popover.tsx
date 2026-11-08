'use client';

import { Popover as BasePopover } from '@base-ui/react/popover';
import { useRef, type ComponentPropsWithRef, type ReactElement, type ReactNode } from 'react';
import { classNames } from '../internal/classNames.js';
import { markTriggerOwner } from '../internal/triggerOwner.js';
import { PopupSurface, type PopupSide } from '../internal/PopupSurface.js';
import { containedOpenChange, usePortalContainer } from '../internal/PortalContainerContext.js';
import type { OverlayOpenChangeReason } from '../internal/overlayOpenChangeReason.js';
import { Grid } from '../foundations/Layout.js';
import type { SkeletonProps } from '../internal/skeleton.js';
import { useOpenState } from '../internal/useOpenState.js';
import '../styles/Base.css';
import '../styles/Popover.css';

const parts = {
  Portal: BasePopover.Portal,
  Positioner: BasePopover.Positioner,
  Popup: BasePopover.Popup,
};

/**
 * Why a popover or a hover card asks to open or close: a press on or a hover over its trigger, focus
 * on it, Escape, a press outside, focus leaving, its own close, or the application.
 */
export type PopoverOpenChangeReason = Extract<
  OverlayOpenChangeReason,
  | 'trigger-press'
  | 'trigger-hover'
  | 'trigger-focus'
  | 'outside-press'
  | 'escape-key'
  | 'close-press'
  | 'focus-out'
  | 'imperative-action'
  | 'none'
>;

/** What a popover's or hover card's onOpenChange receives beside the requested state. */
export interface PopoverOpenChangeDetails {
  /** Why it asks to open or close. */
  reason: PopoverOpenChangeReason;
}

export interface PopoverProps
  extends Omit<ComponentPropsWithRef<'div'>, 'title' | 'children' | 'defaultValue'>, SkeletonProps {
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
  /**
   * The side of the trigger the popover opens on: top, bottom, left, right, or inline-start and
   * inline-end, which follow the text direction. It flips to the other side without room.
   * @default 'bottom'
   */
  side?: PopupSide;
  /**
   * How the popover lines up with the trigger along that side: its start, center or end.
   * @default 'center'
   */
  align?: 'start' | 'center' | 'end';
  /** Whether a controlled popover is open; update it from onOpenChange. */
  open?: boolean;
  /**
   * Whether an uncontrolled popover starts open.
   * @default false
   */
  defaultOpen?: boolean;
  /**
   * Receives the requested state, and why, each time the popover asks to open or close: from the
   * trigger, Esc, a press outside, focus leaving it or close (`close-press`).
   */
  onOpenChange?: (open: boolean, details: PopoverOpenChangeDetails) => void;
  /**
   * The widest the popover grows: md, 20 rem, for details and a field or two; lg, 28 rem, for a
   * longer form. It is as wide as its content from 12 rem up, and narrows to fit the window.
   * @default 'md'
   */
  width?: 'md' | 'lg';
}

/**
 * A floating panel beside its trigger, for details or a small form: it opens on press, moves focus
 * into itself, and closes with Esc, a press outside or when focus leaves it. className, style, ref
 * and data attributes go to the popover's surface.
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
  width = 'md',
  skeleton = false,
  className,
  ...popupProps
}: PopoverProps) {
  const [open, changeOpen] = useOpenState({ open: controlledOpen, defaultOpen, onOpenChange });
  const setOpen = (next: boolean, reason: PopoverOpenChangeReason) => changeOpen(next, { reason });
  const close = () => setOpen(false, 'close-press');
  // The popup takes the text direction at its trigger.
  const triggerRef = useRef<HTMLButtonElement>(null);
  const portal = usePortalContainer();
  return (
    <BasePopover.Root
      open={open}
      onOpenChange={containedOpenChange(portal, triggerRef, (next, details) =>
        setOpen(next, details.reason),
      )}
    >
      <BasePopover.Trigger ref={triggerRef} render={trigger} />
      <PopupSurface
        parts={parts}
        trigger={triggerRef}
        side={side}
        align={align}
        width={width}
        skeleton={skeleton}
        className={classNames('env-popover', className)}
        layout={<Grid gap={3} padding={5} />}
        popupProps={{ ...popupProps, 'aria-label': title == null ? label : undefined }}
      >
        {title != null && (
          <BasePopover.Title className="env-popover-title">{title}</BasePopover.Title>
        )}
        {typeof children === 'function' ? children(close) : children}
      </PopupSurface>
    </BasePopover.Root>
  );
}

markTriggerOwner(Popover);
