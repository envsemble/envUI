import { createContext } from 'react';

/**
 * Marks the envUI components that take their control as an element `trigger`, which a Tooltip
 * around them moves onto: Menu.Root, Popover, Dialog, Drawer, ConfirmDialog and HoverCard. An
 * explicit marker, so a Tooltip never moves onto the `trigger` prop of another component.
 */
const triggerOwnerKey = Symbol.for('envui.triggerOwner');

/** Marks a component as one that takes an element `trigger`. Mark each call `@__PURE__`. */
export function markTriggerOwner<Component extends object>(component: Component): Component {
  return Object.assign(component, { [triggerOwnerKey]: true });
}

/** Whether an element's type is an envUI component that takes an element `trigger`. */
export function isTriggerOwner(type: unknown): boolean {
  return (
    (typeof type === 'function' || (typeof type === 'object' && type !== null)) &&
    (type as Record<symbol, unknown>)[triggerOwnerKey] === true
  );
}

const tooltipKey = Symbol.for('envui.tooltip');

/** Marks the Tooltip, so a HoverCard can tell one given as its trigger. */
export function markTooltip<Component extends object>(component: Component): Component {
  return Object.assign(component, { [tooltipKey]: true });
}

/** Whether an element's type is envUI's Tooltip. */
export function isTooltip(type: unknown): boolean {
  return (
    typeof type === 'function' && (type as unknown as Record<symbol, unknown>)[tooltipKey] === true
  );
}

/**
 * True around a Tooltip a HoverCard renders as its trigger, which shows no tooltip: the card opens
 * on the same hover and focus, and says more.
 */
export const HoverCardTriggerContext = createContext(false);
