'use client';

import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import {
  cloneElement,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type AriaAttributes,
  type ComponentPropsWithRef,
  type ReactElement,
  type ReactNode,
} from 'react';
import { TooltipNestingContext, TooltipPopup, type TooltipSide } from './internal/TooltipPopup.js';

/** The props of the control a Tooltip describes, as far as the tooltip reads them. */
interface TriggerProps {
  disabled?: boolean;
  children?: ReactNode;
  label?: ReactNode;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

export interface TooltipProps
  extends Omit<ComponentPropsWithRef<'div'>, 'content' | 'children' | 'title'> {
  /**
   * What the tooltip shows: a short, supplementary text, such as an icon-only control's name or
   * why a control is disabled. While it is open, a control with a name of its own is described by
   * it (aria-describedby); never the only place essential information appears.
   */
  content: ReactNode;
  /**
   * The one control it describes, such as an IconButton, which takes the trigger's props and ref.
   * A disabled control is wrapped in an element that hovering opens the tooltip on. Around a
   * button, link, tab or menu item, it is focusable and carries the control's name, role and state,
   * reported disabled, so keyboard focus opens it too.
   */
  children: ReactElement<TriggerProps>;
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
}

/** The control's own accessible name, where its props give one as text: a first guess. */
function ownName(props: TriggerProps): string | undefined {
  if (props['aria-label']) return props['aria-label'];
  if (typeof props.label === 'string') return props.label;
  if (typeof props.children === 'string' || typeof props.children === 'number')
    return String(props.children);
  return undefined;
}

/**
 * An element's accessible name as the page has it: its aria-labelledby text, its aria-label, its
 * labels, or its text. Enough to tell whether a control is named, and by what words.
 */
function accessibleName(element: Element | null | undefined): string | undefined {
  if (!element) return undefined;
  const clean = (text: string | null | undefined) => text?.replace(/\s+/g, ' ').trim() || undefined;
  const labelledBy = element.getAttribute('aria-labelledby');
  if (labelledBy) {
    const text = clean(
      labelledBy
        .split(/\s+/)
        .map((id) => element.ownerDocument.getElementById(id)?.textContent ?? '')
        .join(' '),
    );
    if (text) return text;
  }
  const label = clean(element.getAttribute('aria-label'));
  if (label) return label;
  const labels = (element as HTMLInputElement).labels;
  if (labels?.length) return clean(Array.from(labels, (each) => each.textContent).join(' '));
  return clean(element.textContent);
}

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

/**
 * A short label beside a control, shown while the pointer rests on it or it has keyboard focus,
 * such as an icon-only button's name or why a control is disabled. It closes on Esc and when the
 * control is pressed. className, style, ref and data attributes go to the tooltip's popup.
 */
export function Tooltip({
  content,
  children,
  side = 'top',
  delay = 400,
  ...popupProps
}: TooltipProps) {
  const trigger = children.props;
  const isDisabled = Boolean(trigger.disabled);
  const popupId = `${useId()}-tooltip`;
  const [open, setOpen] = useState(false);
  // The tooltip takes the text direction at its trigger, the control or its wrapper.
  const triggerRef = useRef<HTMLButtonElement>(null);
  // The trigger's name, read from the page as the tooltip opens, so a control named by its
  // content, such as a Toolbar.Button or a button with an icon and text, counts as named.
  const [name, setName] = useState(() => ownName(trigger));
  // A disabled control's wrapper stands in for it, read once it is in the page: its name and role,
  // and, for a button or tab, the states it carries, followed while they change.
  const [stand, setStand] = useState<StandIn>({ states: {} });
  useLayoutEffect(() => {
    if (!isDisabled) return;
    const control = triggerRef.current?.firstElementChild;
    const read = () => {
      const next = readStandIn(control, ownName(trigger));
      setStand((current) => (sameStandIn(current, next) ? current : next));
    };
    read();
    if (!control) return;
    const observer = new MutationObserver(read);
    observer.observe(control, { attributes: true, attributeFilter: [...copiedStates] });
    return () => observer.disconnect();
  }, [isDisabled, trigger]);
  const standsIn = isDisabled && stand.name !== undefined && stand.role !== undefined;
  const ownWords = isDisabled ? stand.name : name;
  // A control named by the same words needs no description that repeats them.
  const describes =
    ownWords !== undefined && !(typeof content === 'string' && content.trim() === ownWords);
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
        onOpenChange={(next) => {
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
              children
            )
          }
        >
          {isDisabled
            ? cloneElement(children, standsIn ? ({ 'aria-hidden': true } as object) : {})
            : undefined}
        </BaseTooltip.Trigger>
        <TooltipPopup
          content={content}
          side={side}
          trigger={triggerRef}
          popupProps={{ ...popupProps, id: popupId }}
        />
      </BaseTooltip.Root>
    </TooltipNestingContext>
  );
}
