'use client';

import { mergeProps } from '@base-ui/react/merge-props';
import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import {
  Fragment,
  cloneElement,
  isValidElement,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type AriaAttributes,
  type ComponentPropsWithoutRef,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefObject,
} from 'react';
import { classNames } from '../internal/classNames.js';
import { hoverDetailClass, isTextTrigger } from '../internal/hoverDetail.js';
import { setRef } from '../internal/setRef.js';
import { HoverCardTriggerContext, isTriggerOwner, markTooltip } from '../internal/triggerOwner.js';
import {
  TooltipDescribesContext,
  TooltipNestingContext,
  TooltipPopup,
  type TooltipSide,
  tooltipDelay,
} from '../internal/TooltipPopup.js';
import { accessibleName } from '../internal/accessibleName.js';
import { containedOpenChange, usePortalContainer } from '../internal/PortalContainerContext.js';
import { reportInDevelopment } from '../internal/developmentReport.js';
import { ownName, useStandIn, useTriggerName } from './internal/tooltipTriggerName.js';
import type { PopoverOpenChangeDetails, PopoverOpenChangeReason } from './Popover.js';
import '../styles/Base.css';
import '../styles/Tooltip.css';

/** The props of the control a Tooltip describes, as far as the tooltip reads them. */
interface TriggerProps {
  disabled?: boolean;
  children?: ReactNode;
  label?: ReactNode;
  trigger?: ReactNode;
  ref?: Ref<HTMLElement>;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: AriaAttributes['aria-expanded'];
}

export interface TooltipProps extends Omit<
  ComponentPropsWithoutRef<'button'>,
  'content' | 'children' | 'title'
> {
  /**
   * What the tooltip shows: a short, supplementary text, such as an icon-only control's name or
   * why a control is disabled. While it is open, a control with a name of its own is described by
   * it (aria-describedby); never the only place essential information appears.
   */
  content: ReactNode;
  /**
   * The one control it describes, such as an IconButton, which takes the trigger's props and ref,
   * and the Tooltip's own native props and ref. Around a Menu.Root, Popover, Dialog, Sheet or
   * ConfirmDialog, the tooltip describes their `trigger`; around a HoverCard, it shows nothing. A disabled control
   * is wrapped in an element that hovering opens the tooltip on. Around a button, link, tab or menu
   * item, it is focusable and carries the control's name, role and state, reported disabled, so
   * keyboard focus opens it too. One element: text, a Fragment or a component that doesn't pass
   * the ref on to its element gets no tooltip, and says so while developing. Text, such as a
   * focusable span or Text that holds text, takes a quiet dotted underline, env-hover-detail.
   */
  children: ReactElement<TriggerProps>;
  /**
   * The control's ref, as the Tooltip passes its props on to the control, such as when the Tooltip
   * is the `trigger` of a Menu.Root or Popover, which give their trigger a ref.
   */
  ref?: Ref<HTMLElement>;
  /** Class of the tooltip's popup, beside env-tooltip. */
  popupClassName?: string;
  /**
   * The side of the control it opens on: top, bottom, left, right, or inline-start and inline-end,
   * which follow the text direction. Where the window has no room, it flips to the other side.
   * @default 'top'
   */
  side?: TooltipSide;
  /**
   * How the tooltip lines up with the control along that side: its start, center or end.
   * @default 'center'
   */
  align?: 'start' | 'center' | 'end';
  /**
   * Milliseconds the pointer rests on the control before the tooltip opens; keyboard focus opens it
   * at once.
   * @default 400
   */
  delay?: number;
  /**
   * Whether the tooltip starts open, such as in a picture of the interface; it then closes as an
   * opened one does.
   * @default false
   */
  defaultOpen?: boolean;
  /**
   * Whether the tooltip shows, for a tooltip the application controls with onOpenChange, such as
   * one a step of a tour opens.
   */
  open?: boolean;
  /**
   * Receives the requested state, and why, as the pointer rests on the control or leaves it, focus
   * reaches or leaves it, it is pressed or Esc closes the tooltip.
   */
  onOpenChange?: (open: boolean, details: TooltipOpenChangeDetails) => void;
}

/** What a tooltip's onOpenChange receives beside the requested state: a popover's details. */
export type TooltipOpenChangeDetails = PopoverOpenChangeDetails;

/** Whether a control's popup, such as its menu, is open, by its aria-expanded state. */
const isExpanded = (props: TriggerProps) =>
  props['aria-expanded'] === true || props['aria-expanded'] === 'true';

/** A component's name for a report. */
function typeName(type: unknown): string {
  if (typeof type === 'string') return type;
  const named = type as { displayName?: string; name?: string } | null;
  return named?.displayName || named?.name || 'a component';
}

type Forwarded = Omit<
  TooltipProps,
  'content' | 'children' | 'side' | 'align' | 'delay' | 'popupClassName' | 'open' | 'onOpenChange'
>;

/**
 * The control with the Tooltip's own props joined to its own, handlers chained and the control's
 * values first, as Base UI's render does, so a trigger's press handler, aria-expanded and ref
 * reach it.
 */
function useControl(children: ReactElement<TriggerProps>, forwarded: Forwarded) {
  const forwardedRef = forwarded.ref;
  const childRef = children.props.ref;
  const controlRef = useCallback(
    (node: HTMLElement | null) => {
      setRef(forwardedRef, node);
      setRef(childRef, node);
    },
    [forwardedRef, childRef],
  );
  return Object.keys(forwarded).length > 0
    ? cloneElement(children, {
        ...mergeProps(forwarded, children.props),
        ref: forwardedRef && childRef ? controlRef : (childRef ?? forwardedRef),
      })
    : children;
}

/**
 * A short label beside a control, shown while the pointer rests on it or it has keyboard focus,
 * such as an icon-only button's name or why a control is disabled. It closes on Esc and when the
 * control is pressed, and stays closed while the control's own popup, such as a menu, is open.
 * Native props and ref go to the control, so a Tooltip can be the trigger of a Menu.Root or
 * Popover; popupClassName styles the tooltip's popup.
 */
export function Tooltip(props: TooltipProps) {
  const {
    content,
    children,
    side = 'top',
    align = 'center',
    delay = tooltipDelay,
    defaultOpen = false,
    open,
    onOpenChange,
    popupClassName,
    ...forwarded
  } = props;
  const hoverCardTrigger = useContext(HoverCardTriggerContext);
  // Text, a Fragment or a list can't take the trigger's props and ref.
  if (!isValidElement(children) || children.type === Fragment) {
    // Says what a Tooltip can't do while developing, once per message, as React reports a prop.
    reportInDevelopment(
      () =>
        process.env.NODE_ENV !== 'production' &&
        'A Tooltip wraps one element that takes props and a ref, such as a Button or an IconButton; ' +
          `it got ${isValidElement(children) ? 'a Fragment' : typeof children}, and shows no tooltip.`,
    );
    return <>{children}</>;
  }
  // Around an envUI component that takes its control as trigger, such as Menu.Root or Popover,
  // the tooltip goes to that control, where the component's own props, ref and popup stay its own.
  const owner = children.props;
  if (isTriggerOwner(children.type, owner) && isValidElement(owner.trigger))
    return cloneElement(children, {
      // isValidElement narrows to the element, not its props.
      trigger: <Tooltip {...props}>{owner.trigger as ReactElement<TriggerProps>}</Tooltip>,
    });
  // A HoverCard's trigger opens the card on the same hover and focus, which the tooltip would
  // cover.
  if (hoverCardTrigger) {
    reportInDevelopment(
      () =>
        process.env.NODE_ENV !== 'production' &&
        "A Tooltip around a HoverCard, or as a HoverCard's trigger, shows no tooltip: the card " +
          'opens on the same hover and focus. Put what the tooltip says in the card.',
    );
    return (
      <HoverCardTriggerContext value={false}>
        <ControlWithoutTooltip forwarded={forwarded}>{children}</ControlWithoutTooltip>
      </HoverCardTriggerContext>
    );
  }
  return (
    <TooltipTrigger
      content={content}
      side={side}
      align={align}
      delay={delay}
      defaultOpen={defaultOpen}
      open={open}
      onOpenChange={onOpenChange}
      popupClassName={popupClassName}
      forwarded={forwarded}
    >
      {children}
    </TooltipTrigger>
  );
}

markTooltip(Tooltip);

function ControlWithoutTooltip({
  children,
  forwarded,
}: {
  children: ReactElement<TriggerProps>;
  forwarded: Forwarded;
}) {
  return useControl(children, forwarded);
}

/**
 * Whether focus came to the control back from its popup: from the popup, or from nowhere, as the
 * popup is gone by the time its focus returns. Focus from elsewhere in the page is no return.
 */
function returnsFrom(popupId: string | null, event: Event) {
  const from = (event as FocusEvent).relatedTarget;
  if (!(from instanceof Node) || !from.isConnected) return true;
  return popupId !== null && Boolean(document.getElementById(popupId)?.contains(from));
}

/**
 * Once the control's own popup closes, such as on Esc, focus returns to the control: that focus
 * opens no tooltip, which would take a second Esc. The next key press or pointer entry ends the
 * wait, so focus from the keyboard opens it again, as does focus that comes from elsewhere in the
 * page, such as after a click outside moved it away. A ref, as the key press that moves focus comes
 * before any render. Returns whether an opening is that returning focus, which ends the wait
 * otherwise.
 */
function useFocusReturn(expanded: boolean, trigger: RefObject<HTMLElement | null>) {
  const returning = useRef(false);
  const wasExpanded = useRef(expanded);
  const popupId = useRef<string | null>(null);
  useLayoutEffect(() => {
    const closed = wasExpanded.current && !expanded;
    wasExpanded.current = expanded;
    if (expanded) popupId.current = trigger.current?.getAttribute('aria-controls') ?? null;
    if (!closed) return;
    returning.current = true;
    const end = () => {
      returning.current = false;
    };
    document.addEventListener('keydown', end, { capture: true, once: true });
    return () => document.removeEventListener('keydown', end, { capture: true });
  }, [expanded, trigger]);
  return (reason: string, event: Event) => {
    if (!returning.current) return false;
    if (reason === 'trigger-focus' && returnsFrom(popupId.current, event)) return true;
    returning.current = false;
    return false;
  };
}

function TooltipTrigger({
  content,
  children,
  side,
  align,
  delay,
  defaultOpen,
  open: controlledOpen,
  onOpenChange,
  popupClassName,
  forwarded,
}: {
  content: ReactNode;
  children: ReactElement<TriggerProps>;
  side: TooltipSide;
  align: 'start' | 'center' | 'end';
  delay: number;
  defaultOpen: boolean;
  open: boolean | undefined;
  onOpenChange: TooltipProps['onOpenChange'];
  popupClassName?: string;
  forwarded: Forwarded;
}) {
  const control = useControl(children, forwarded);
  const trigger = control.props;
  const isDisabled = Boolean(trigger.disabled);
  // A control whose own popup is open, such as a menu button, shows no tooltip over it, so Esc
  // closes that popup and the tooltip doesn't cover it.
  const expanded = isExpanded(trigger);
  const popupId = `${useId()}-tooltip`;
  const [ownOpen, setOwnOpen] = useState(defaultOpen);
  if (ownOpen && expanded) setOwnOpen(false);
  const open = (controlledOpen ?? ownOpen) && !expanded;
  function setOpen(next: boolean, reason: PopoverOpenChangeReason) {
    if (controlledOpen === undefined) setOwnOpen(next);
    onOpenChange?.(next, { reason });
  }
  const portal = usePortalContainer();
  // The tooltip takes the text direction at its trigger, the control or its wrapper.
  const triggerRef = useRef<HTMLButtonElement>(null);
  const focusReturning = useFocusReturn(expanded, triggerRef);
  const fallbackName = ownName(trigger);
  const [name, setName] = useTriggerName(triggerRef, open, isDisabled, fallbackName);
  // A disabled control's wrapper stands in for it (see standInRole).
  const stand = useStandIn(triggerRef, isDisabled, fallbackName);
  // A component that doesn't pass the ref on to its element gives the tooltip nothing to open on.
  const childType = children.type;
  useLayoutEffect(() => {
    if (!isDisabled && !triggerRef.current)
      reportInDevelopment(
        () =>
          process.env.NODE_ENV !== 'production' &&
          `A Tooltip's child, ${typeName(childType)}, doesn't pass the ref on to its element, so ` +
            'no tooltip opens: have it take ref as a prop and give it to its element.',
      );
  }, [isDisabled, childType]);
  const standsIn = isDisabled && stand.name !== undefined && stand.role !== undefined;
  const ownWords = isDisabled ? stand.name : name;
  // A control named by the same words needs no description that repeats them.
  const describes =
    useContext(TooltipDescribesContext) &&
    ownWords !== undefined &&
    !(typeof content === 'string' && content.trim() === ownWords);
  const describedBy =
    open && describes && (!isDisabled || standsIn)
      ? [trigger['aria-describedby'], popupId].filter(Boolean).join(' ')
      : trigger['aria-describedby'];
  return (
    // A control that becomes enabled or disabled changes the trigger element; a fresh tooltip
    // listens to the new one, so hovering it still opens the tooltip.
    <TooltipNestingContext value>
      <BaseTooltip.Root
        key={isDisabled ? 'disabled' : 'enabled'}
        open={open}
        onOpenChange={containedOpenChange(portal, triggerRef, (next, details) => {
          if (next && expanded) return;
          if (next && focusReturning(details.reason, details.event)) return;
          if (next && !isDisabled) setName(accessibleName(triggerRef.current) ?? ownName(trigger));
          // Base UI's tooltip reasons are a popover's, and disabled for a root it disables, which
          // this tooltip never does: a control that becomes disabled gets a fresh root (key).
          setOpen(next, details.reason as PopoverOpenChangeReason);
        })}
      >
        <BaseTooltip.Trigger
          ref={triggerRef}
          delay={delay}
          aria-describedby={describedBy}
          render={
            isDisabled ? (
              // Disabled controls receive no pointer or focus events, so the wrapper carries them.
              // It takes the control's place for assistive technology, with its role, name and
              // states, disabled, and a tab stop, where it can read them and the role needs no
              // state it can't carry (see standInRole in internal/tooltipTriggerName.ts).
              <span
                className="env-tooltip-disabled-target"
                role={standsIn ? stand.role : undefined}
                aria-label={standsIn ? stand.name : undefined}
                aria-disabled={standsIn || undefined}
                tabIndex={standsIn ? 0 : undefined}
                // The copied states are ARIA attributes with their values as the control had them.
                {...((standsIn ? stand.states : {}) as AriaAttributes)}
              />
            ) : (
              // The control's own aria-describedby would win over the trigger's, so it carries
              // the joined one. Text that shows more takes the dotted underline.
              cloneElement(control, {
                'aria-describedby': describedBy,
                ...(isTextTrigger(children) && {
                  className: classNames(
                    // A text trigger is an element that takes a class name (isTextTrigger).
                    (control.props as { className?: string }).className,
                    hoverDetailClass,
                  ),
                }),
              } as TriggerProps)
            )
          }
        >
          {
            // aria-hidden goes on whatever element the control is.
            isDisabled
              ? cloneElement(control, standsIn ? ({ 'aria-hidden': true } as object) : {})
              : undefined
          }
        </BaseTooltip.Trigger>
        <TooltipPopup
          content={content}
          side={side}
          align={align}
          trigger={triggerRef}
          popupProps={{ id: popupId, className: popupClassName }}
        />
      </BaseTooltip.Root>
    </TooltipNestingContext>
  );
}
