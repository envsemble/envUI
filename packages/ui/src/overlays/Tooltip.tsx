'use client';

import { mergeProps } from '@base-ui/react/merge-props';
import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import {
  Fragment,
  cloneElement,
  isValidElement,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  type AriaAttributes,
  type ComponentPropsWithoutRef,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefObject,
} from 'react';
import { classNames } from '../internal/classNames.js';
import { hoverDetailClass, isTextTrigger } from '../internal/trigger/hoverDetail.js';
import { useMergedRefs } from '../internal/react/useMergedRefs.js';
import { useControllableState } from '../internal/react/useControllableState.js';
import {
  HoverCardTriggerContext,
  isTriggerOwner,
  markTooltip,
} from '../internal/trigger/triggerOwner.js';
import {
  TooltipDescribesContext,
  TooltipNestingContext,
  TooltipPopup,
  type TooltipSide,
  tooltipDelay,
} from '../internal/popup/TooltipPopup.js';
import { accessibleName } from './internal/accessibleName.js';
import {
  containedOpenChange,
  usePortalContainer,
} from '../internal/popup/PortalContainerContext.js';
import { reportInDevelopment } from '../internal/developmentReport.js';
import { ownName, useStandIn, useTriggerName } from './internal/tooltipTriggerName.js';
import type { PopoverOpenChangeDetails, PopoverOpenChangeReason } from './Popover.js';
import { idRefs } from '../internal/dom/idRefs.js';
import '../styles/Base.css';
import '../styles/Tooltip.css';

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
   * Whether a text trigger takes the quiet dotted underline, env-hover-detail, that says it shows
   * more on hover or focus. False leaves its class alone, for text styled its own way, such as
   * @mentions in a feed.
   * @default true
   */
  underline?: boolean;
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

const isExpanded = (props: TriggerProps) =>
  props['aria-expanded'] === true || props['aria-expanded'] === 'true';

function componentNameForReport(type: unknown): string {
  if (typeof type === 'string') return type;
  const named = type as { displayName?: string; name?: string } | null;
  return named?.displayName || named?.name || 'a component';
}

type Forwarded = Omit<
  TooltipProps,
  | 'content'
  | 'children'
  | 'side'
  | 'align'
  | 'delay'
  | 'popupClassName'
  | 'open'
  | 'onOpenChange'
  | 'underline'
>;

function useControlWithForwardedProps(children: ReactElement<TriggerProps>, forwarded: Forwarded) {
  const forwardedRef = forwarded.ref;
  const childRef = children.props.ref;
  const controlRef = useMergedRefs(forwardedRef, childRef);
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
    underline = true,
    ...forwarded
  } = props;
  const hoverCardTrigger = useContext(HoverCardTriggerContext);
  const takesPropsAndRef = isValidElement(children) && children.type !== Fragment;
  if (!takesPropsAndRef) {
    reportInDevelopment(
      () =>
        process.env.NODE_ENV !== 'production' &&
        'A Tooltip wraps one element that takes props and a ref, such as a Button or an IconButton; ' +
          `it got ${isValidElement(children) ? 'a Fragment' : typeof children}, and shows no tooltip.`,
    );
    return <>{children}</>;
  }
  const owner = children.props;
  if (isTriggerOwner(children.type, owner) && isValidElement(owner.trigger))
    return cloneElement(children, {
      trigger: <Tooltip {...props}>{owner.trigger as ReactElement<TriggerProps>}</Tooltip>,
    });
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
      underline={underline}
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
  return useControlWithForwardedProps(children, forwarded);
}

function focusReturnedFromPopup(popupId: string | null, event: Event) {
  const from = (event as FocusEvent).relatedTarget;
  if (!(from instanceof Node) || !from.isConnected) return true;
  return popupId !== null && Boolean(document.getElementById(popupId)?.contains(from));
}

function useFocusReturnFromPopup(expanded: boolean, trigger: RefObject<HTMLElement | null>) {
  const returning = useRef(false);
  const wasExpanded = useRef(expanded);
  const popupId = useRef<string | null>(null);
  useLayoutEffect(() => {
    const closed = wasExpanded.current && !expanded;
    wasExpanded.current = expanded;
    if (expanded) popupId.current = trigger.current?.getAttribute('aria-controls') ?? null;
    if (!closed) return;
    returning.current = true;
    const endWaitOnKeyPress = () => {
      returning.current = false;
    };
    document.addEventListener('keydown', endWaitOnKeyPress, { capture: true, once: true });
    return () => document.removeEventListener('keydown', endWaitOnKeyPress, { capture: true });
  }, [expanded, trigger]);
  return (reason: string, event: Event) => {
    if (!returning.current) return false;
    if (reason === 'trigger-focus' && focusReturnedFromPopup(popupId.current, event)) return true;
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
  underline,
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
  underline: boolean;
  forwarded: Forwarded;
}) {
  const control = useControlWithForwardedProps(children, forwarded);
  const trigger = control.props;
  const isDisabled = Boolean(trigger.disabled);
  const expanded = isExpanded(trigger);
  const popupId = `${useId()}-tooltip`;
  const [openState, setOpen, keepOwn] = useControllableState({
    value: controlledOpen,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const popupOpenedOverTooltip = openState && expanded;
  if (popupOpenedOverTooltip) keepOwn(false);
  const open = openState && !expanded;
  const portal = usePortalContainer();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const focusReturning = useFocusReturnFromPopup(expanded, triggerRef);
  const fallbackName = ownName(trigger);
  const [name, setName] = useTriggerName(triggerRef, open, isDisabled, fallbackName);
  const stand = useStandIn(triggerRef, isDisabled, fallbackName);
  const childType = children.type;
  useLayoutEffect(
    function reportChildThatKeepsRef() {
      if (!isDisabled && !triggerRef.current)
        reportInDevelopment(
          () =>
            process.env.NODE_ENV !== 'production' &&
            `A Tooltip's child, ${componentNameForReport(childType)}, doesn't pass the ref on to its element, so ` +
              'no tooltip opens: have it take ref as a prop and give it to its element.',
        );
    },
    [isDisabled, childType],
  );
  const standsIn = isDisabled && stand.name !== undefined && stand.role !== undefined;
  const ownWords = isDisabled ? stand.name : name;
  const repeatsOwnName = typeof content === 'string' && content.trim() === ownWords;
  const describes =
    useContext(TooltipDescribesContext) && ownWords !== undefined && !repeatsOwnName;
  const describedBy =
    open && describes && (!isDisabled || standsIn)
      ? idRefs(trigger['aria-describedby'], popupId)
      : trigger['aria-describedby'];
  const freshRootPerTriggerElement = isDisabled ? 'disabled' : 'enabled';
  return (
    <TooltipNestingContext value>
      <BaseTooltip.Root
        key={freshRootPerTriggerElement}
        open={open}
        onOpenChange={containedOpenChange(portal, triggerRef, (next, details) => {
          if (next && expanded) return;
          if (next && focusReturning(details.reason, details.event)) return;
          if (next && !isDisabled) setName(accessibleName(triggerRef.current) ?? ownName(trigger));
          setOpen(next, { reason: details.reason as PopoverOpenChangeReason });
        })}
      >
        <BaseTooltip.Trigger
          ref={triggerRef}
          delay={delay}
          aria-describedby={describedBy}
          render={
            isDisabled ? (
              <span
                className="env-tooltip-disabled-target"
                role={standsIn ? stand.role : undefined}
                aria-label={standsIn ? stand.name : undefined}
                aria-disabled={standsIn || undefined}
                tabIndex={standsIn ? 0 : undefined}
                {...((standsIn ? stand.states : {}) as AriaAttributes)}
              />
            ) : (
              cloneElement(control, {
                'aria-describedby': describedBy,
                ...(underline &&
                  isTextTrigger(children) && {
                    className: classNames(
                      (control.props as { className?: string }).className,
                      hoverDetailClass,
                    ),
                  }),
              } as TriggerProps)
            )
          }
        >
          {isDisabled
            ? cloneElement(control, standsIn ? ({ 'aria-hidden': true } as object) : {})
            : undefined}
        </BaseTooltip.Trigger>
        <TooltipPopup
          content={content}
          side={side}
          align={align}
          trigger={triggerRef}
          className={popupClassName}
          popupProps={{ id: popupId }}
        />
      </BaseTooltip.Root>
    </TooltipNestingContext>
  );
}
