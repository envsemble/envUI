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
import { keepsOpen, usePortalContainer } from '../internal/PortalContainerContext.js';
import { reportInDevelopment } from '../internal/developmentReport.js';
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

export interface TooltipProps
  extends Omit<ComponentPropsWithoutRef<'button'>, 'content' | 'children' | 'title'> {
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
}

/** The control's own accessible name, where its props give one as text: a first guess. */
function ownName(props: TriggerProps): string | undefined {
  if (props['aria-label']) return props['aria-label'];
  if (typeof props.label === 'string') return props.label;
  if (typeof props.children === 'string' || typeof props.children === 'number')
    return String(props.children);
  return undefined;
}

/** The attributes that change a control's name or a stand-in's role and states. */
const nameAttributes = ['aria-label', 'aria-labelledby', 'alt', 'hidden', 'aria-hidden', 'role'];

const standInRoles = ['button', 'link', 'tab', 'menuitem'] as const;
type StandInRole = (typeof standInRoles)[number];
const buttonTypes = ['button', 'submit', 'reset', 'image'];

/**
 * The role the wrapper of a disabled control takes in its place, or none. Only roles that require
 * no state stand in: a checkbox, radio, switch, slider or combobox needs its checked, value or
 * expanded state, which a stand-in would have to copy and keep in step. Those get no stand-in: the
 * wrapper is no tab stop, and the control itself stays exposed, disabled, with its own state.
 */
function standInRole(element: Element | null | undefined): StandInRole | undefined {
  if (!element) return undefined;
  const tag = element.tagName.toLowerCase();
  const type = (element as HTMLInputElement).type;
  let role = element.getAttribute('role')?.split(/\s+/)[0];
  if (!role && (tag === 'button' || (tag === 'input' && buttonTypes.includes(type))))
    role = 'button';
  if (!role && (tag === 'a' || tag === 'area') && element.hasAttribute('href')) role = 'link';
  return standInRoles.find((each) => each === role);
}

/** The states a button or tab stand-in copies from its control: a toggle's, a menu trigger's. */
const copiedStates = ['aria-pressed', 'aria-expanded', 'aria-haspopup', 'aria-selected'] as const;

/** What a disabled control's wrapper takes from it: its name, role and states. */
interface StandIn {
  name?: string;
  role?: StandInRole;
  states: Partial<Record<(typeof copiedStates)[number], string>>;
}

function readStandIn(control: Element | null | undefined, fallbackName?: string): StandIn {
  const role = standInRole(control);
  const states: StandIn['states'] = {};
  if (control && (role === 'button' || role === 'tab'))
    for (const state of copiedStates) {
      const value = control.getAttribute(state);
      if (value !== null) states[state] = value;
    }
  return { name: accessibleName(control) ?? fallbackName, role, states };
}

const sameStandIn = (a: StandIn, b: StandIn) =>
  a.name === b.name &&
  a.role === b.role &&
  copiedStates.every((state) => a.states[state] === b.states[state]);

/** Whether a control's popup, such as its menu, is open, by its aria-expanded state. */
const isExpanded = (props: TriggerProps) =>
  props['aria-expanded'] === true || props['aria-expanded'] === 'true';

/** A component's name for a report. */
function typeName(type: unknown): string {
  if (typeof type === 'string') return type;
  const named = type as { displayName?: string; name?: string } | null;
  return named?.displayName || named?.name || 'a component';
}

type Forwarded = Omit<TooltipProps, 'content' | 'children' | 'side' | 'delay' | 'popupClassName'>;

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
        ...(mergeProps(forwarded as object, children.props as object) as TriggerProps),
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
    delay = tooltipDelay,
    defaultOpen = false,
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
    return <>{children as ReactNode}</>;
  }
  // Around an envUI component that takes its control as trigger, such as Menu.Root or Popover,
  // the tooltip goes to that control, where the component's own props, ref and popup stay its own.
  const owner = children.props;
  if (isTriggerOwner(children.type, owner) && isValidElement(owner.trigger))
    return cloneElement(children, {
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
      delay={delay}
      defaultOpen={defaultOpen}
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

function TooltipTrigger({
  content,
  children,
  side,
  delay,
  defaultOpen,
  popupClassName,
  forwarded,
}: {
  content: ReactNode;
  children: ReactElement<TriggerProps>;
  side: TooltipSide;
  delay: number;
  defaultOpen: boolean;
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
  const [open, setOpen] = useState(defaultOpen);
  if (open && expanded) setOpen(false);
  const portal = usePortalContainer();
  // The tooltip takes the text direction at its trigger, the control or its wrapper.
  const triggerRef = useRef<HTMLButtonElement>(null);
  // Once the popup closes, such as on Esc, focus returns to the control: that focus opens no
  // tooltip, which would take a second Esc. The next key press or pointer entry ends the wait, so
  // focus from the keyboard opens it again, as does focus that comes from elsewhere in the page,
  // such as after a click outside moved it away. A ref, as the key press that moves focus comes
  // before any render.
  const returning = useRef(false);
  const wasExpanded = useRef(expanded);
  const popupIdRef = useRef<string | null>(null);
  useLayoutEffect(() => {
    const closed = wasExpanded.current && !expanded;
    wasExpanded.current = expanded;
    if (expanded) popupIdRef.current = triggerRef.current?.getAttribute('aria-controls') ?? null;
    if (!closed) return;
    returning.current = true;
    const end = () => {
      returning.current = false;
    };
    document.addEventListener('keydown', end, { capture: true, once: true });
    return () => document.removeEventListener('keydown', end, { capture: true });
  }, [expanded]);
  // The trigger's name, read from the page as the tooltip opens and followed while it is open, so a
  // control named by its content, such as a Toolbar.Button or a button with an icon and text,
  // counts as named, and one whose name changes with the tooltip, such as Copy becoming Copied,
  // keeps counting as named by the tooltip's words.
  const [name, setName] = useState(() => ownName(trigger));
  const fallbackName = ownName(trigger);
  useLayoutEffect(() => {
    const control = triggerRef.current;
    if (!open || isDisabled || !control) return;
    const read = () => setName(accessibleName(control) ?? fallbackName);
    read();
    const observer = new MutationObserver(read);
    observer.observe(control, {
      attributes: true,
      attributeFilter: nameAttributes,
      childList: true,
      characterData: true,
      subtree: true,
    });
    return () => observer.disconnect();
  }, [open, isDisabled, fallbackName]);
  // A disabled control's wrapper stands in for it, read once it is in the page: its name and role,
  // and, for a button or tab, the states it carries, followed while they change, also as the
  // control is replaced, rather than read again on each render.
  const [stand, setStand] = useState<StandIn>({ states: {} });
  useLayoutEffect(() => {
    const wrapper = triggerRef.current;
    if (!isDisabled || !wrapper) return;
    const read = () => {
      const next = readStandIn(wrapper.firstElementChild, fallbackName);
      setStand((current) => (sameStandIn(current, next) ? current : next));
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(wrapper, {
      attributes: true,
      attributeFilter: [...copiedStates, ...nameAttributes],
      childList: true,
      characterData: true,
      subtree: true,
    });
    return () => observer.disconnect();
  }, [isDisabled, fallbackName]);
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
        onOpenChange={(next, details) => {
          if (keepsOpen(portal, next, details, triggerRef.current)) {
            details.cancel();
            return;
          }
          if (next && expanded) return;
          if (next && returning.current) {
            if (
              details.reason === 'trigger-focus' &&
              returnsFrom(popupIdRef.current, details.event)
            )
              return;
            returning.current = false;
          }
          if (next && !isDisabled) setName(accessibleName(triggerRef.current) ?? ownName(trigger));
          setOpen(next);
        }}
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
              // state it can't carry (see standInRole).
              <span
                className="env-tooltip-disabled-target"
                role={standsIn ? stand.role : undefined}
                aria-label={standsIn ? stand.name : undefined}
                aria-disabled={standsIn || undefined}
                tabIndex={standsIn ? 0 : undefined}
                {...((standsIn ? stand.states : {}) as AriaAttributes)}
              />
            ) : (
              // The control's own aria-describedby would win over the trigger's, so it carries
              // the joined one. Text that shows more takes the dotted underline.
              cloneElement(control, {
                'aria-describedby': describedBy,
                ...(isTextTrigger(children) && {
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
          trigger={triggerRef}
          popupProps={{ id: popupId, className: popupClassName }}
        />
      </BaseTooltip.Root>
    </TooltipNestingContext>
  );
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
