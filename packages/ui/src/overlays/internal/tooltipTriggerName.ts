'use client';

import { useLayoutEffect, useState, type ReactNode, type RefObject } from 'react';
import { accessibleName } from './accessibleName.js';

/** The props a control's own name can come from. */
interface NamingProps {
  'aria-label'?: string;
  label?: ReactNode;
  children?: ReactNode;
}

/** The control's own accessible name, where its props give one as text: a first guess. */
export function ownName(props: NamingProps): string | undefined {
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
  // An input's type; undefined on any other element.
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
 * The trigger's name, read from the page as the tooltip opens and followed while it is open, so a
 * control named by its content, such as a Toolbar.Button or a button with an icon and text, counts
 * as named, and one whose name changes with the tooltip, such as Copy becoming Copied, keeps
 * counting as named by the tooltip's words. Returns the setter too, to read it again as the tooltip
 * opens.
 */
export function useTriggerName(
  trigger: RefObject<HTMLElement | null>,
  open: boolean,
  disabled: boolean,
  fallbackName: string | undefined,
) {
  const [name, setName] = useState(fallbackName);
  useLayoutEffect(() => {
    const control = trigger.current;
    if (!open || disabled || !control) return;
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
  }, [trigger, open, disabled, fallbackName]);
  return [name, setName] as const;
}

/**
 * What the wrapper of a disabled control stands in for it with, read once it is in the page: its
 * name and role, and, for a button or tab, the states it carries, followed while they change, also
 * as the control is replaced, rather than read again on each render.
 */
export function useStandIn(
  wrapper: RefObject<HTMLElement | null>,
  disabled: boolean,
  fallbackName: string | undefined,
) {
  const [stand, setStand] = useState<StandIn>({ states: {} });
  useLayoutEffect(() => {
    const element = wrapper.current;
    if (!disabled || !element) return;
    const read = () => {
      const next = readStandIn(element.firstElementChild, fallbackName);
      setStand((current) => (sameStandIn(current, next) ? current : next));
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(element, {
      attributes: true,
      attributeFilter: [...copiedStates, ...nameAttributes],
      childList: true,
      characterData: true,
      subtree: true,
    });
    return () => observer.disconnect();
  }, [wrapper, disabled, fallbackName]);
  return stand;
}
