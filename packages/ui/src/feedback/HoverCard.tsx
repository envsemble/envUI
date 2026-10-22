'use client';

import { PreviewCard as BasePreviewCard } from '@base-ui/react/preview-card';
import {
  isValidElement,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type FocusEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { classNames } from '../internal/classNames.js';
import { PopupSurface, type PopupSide } from '../internal/PopupSurface.js';
import { keepsOpen, usePortalContainer } from '../internal/PortalContainerContext.js';
import type { SkeletonProps } from '../internal/skeleton.js';
import { Grid } from '../foundations/Layout.js';
import { hoverDetailClass, isTextTrigger } from '../internal/hoverDetail.js';
import { HoverCardTriggerContext, isTooltip, markTriggerOwner } from '../internal/triggerOwner.js';
import type { PopoverOpenChangeDetails, PopoverOpenChangeReason } from './Popover.js';

const parts = {
  Portal: BasePreviewCard.Portal,
  Positioner: BasePreviewCard.Positioner,
  Popup: BasePreviewCard.Popup,
};

export interface HoverCardProps
  extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'defaultValue'>,
    SkeletonProps {
  /**
   * The element that opens the card on hover and keyboard focus; it receives the ref. Text, such
   * as a span or Text that holds text, takes a quiet dotted underline, env-hover-detail; a link or
   * another control keeps its own look.
   */
  trigger: ReactElement;
  /** The details. Supplementary: never the only place essential information appears. */
  children: ReactNode;
  /**
   * bottom, top, left or right, or inline-start and inline-end, which follow the text direction.
   * @default 'bottom'
   */
  side?: PopupSide;
  /**
   * Lines the card up with the trigger's centre, start or end along the side.
   * @default 'center'
   */
  align?: 'start' | 'center' | 'end';
  /**
   * Milliseconds the pointer rests on the trigger before the card opens; focus opens it at once.
   * @default 600
   */
  delay?: number;
  /**
   * Milliseconds before it closes once the pointer leaves the trigger and the card.
   * @default 300
   */
  closeDelay?: number;
  /**
   * The widest the card grows: md, 20 rem, or lg, 28 rem. It is as wide as its content from 12 rem
   * up, and narrows to fit the window.
   * @default 'md'
   */
  width?: 'md' | 'lg';
  /** Whether the card shows; with `onOpenChange` it controls the card. */
  open?: boolean;
  /**
   * Whether an uncontrolled card starts open.
   * @default false
   */
  defaultOpen?: boolean;
  /** Called with the new state, and why, when hover, focus or Esc opens or closes the card. */
  onOpenChange?: (open: boolean, details: PopoverOpenChangeDetails) => void;
}

function isFocusVisible(element: Element) {
  try {
    return element.matches(':focus-visible');
  } catch {
    return true;
  }
}

/**
 * Supplementary details that open beside their trigger on hover and keyboard focus, like a link
 * preview. className, style, ref and data attributes go to the card.
 */
export function HoverCard({
  trigger,
  children,
  side = 'bottom',
  align = 'center',
  delay = 600,
  closeDelay = 300,
  width = 'md',
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  skeleton = false,
  className,
  ...popupProps
}: HoverCardProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const portal = usePortalContainer();
  const open = controlledOpen ?? uncontrolledOpen;
  const openRef = useRef(open);
  // The card takes the text direction at its trigger.
  const triggerRef = useRef<HTMLAnchorElement>(null);
  openRef.current = open;
  // A Tooltip as the trigger passes the props on to its control, which is the one to tell.
  const control = isTooltip(trigger.type)
    ? (trigger.props as { children?: unknown }).children
    : trigger;
  const textTrigger = isValidElement(control) && isTextTrigger(control);
  function setOpen(next: boolean, reason: PopoverOpenChangeReason) {
    if (next === openRef.current) return;
    openRef.current = next;
    if (controlledOpen === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next, { reason });
  }
  // Base UI waits for the hover delay on focus too; keyboard focus opens the card at once.
  function openOnKeyboardFocus(event: FocusEvent<HTMLElement>) {
    if (isFocusVisible(event.currentTarget)) setOpen(true, 'trigger-focus');
  }
  return (
    <BasePreviewCard.Root
      open={open}
      onOpenChange={(next, details) => {
        if (keepsOpen(portal, next, details, triggerRef.current)) details.cancel();
        else setOpen(next, details.reason as PopoverOpenChangeReason);
      }}
    >
      {/* A Tooltip as the trigger, or around the HoverCard, shows no tooltip (see Tooltip). */}
      <HoverCardTriggerContext value={isTooltip(trigger.type)}>
        <BasePreviewCard.Trigger
          ref={triggerRef}
          render={trigger}
          className={textTrigger ? hoverDetailClass : undefined}
          delay={delay}
          closeDelay={closeDelay}
          onFocus={openOnKeyboardFocus}
        />
      </HoverCardTriggerContext>
      <PopupSurface
        parts={parts}
        trigger={triggerRef}
        side={side}
        align={align}
        width={width}
        skeleton={skeleton}
        className={classNames('env-hover-card', className)}
        layout={<Grid gap={3} padding={5} />}
        popupProps={popupProps}
      >
        {children}
      </PopupSurface>
    </BasePreviewCard.Root>
  );
}

markTriggerOwner(HoverCard);
