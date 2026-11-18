'use client';

import { createContext, isValidElement } from 'react';

const triggerOwnerKey = Symbol.for('envui.triggerOwner');
const tooltipKey = Symbol.for('envui.tooltip');
const lazyType = Symbol.for('react.lazy');

const notLoadedOrFailed = Symbol('notLoadedOrFailed');

const lazyWrappersBeforeALoop = 8;

interface ReactLazyPrivateFields {
  $$typeof: symbol;
  _payload: unknown;
  _init: (payload: unknown) => unknown;
}

const isLazy = (type: unknown): type is ReactLazyPrivateFields =>
  typeof type === 'object' &&
  type !== null &&
  (type as ReactLazyPrivateFields).$$typeof === lazyType;

function resolveThroughLazyWrappers(type: unknown): unknown {
  let current = type;
  for (let depth = 0; isLazy(current); depth += 1) {
    if (depth === lazyWrappersBeforeALoop) return notLoadedOrFailed;
    try {
      current = current._init(current._payload);
    } catch {
      return notLoadedOrFailed;
    }
  }
  return current;
}

const marked = (type: unknown, key: symbol) =>
  (typeof type === 'function' || (typeof type === 'object' && type !== null)) &&
  (type as Record<symbol, unknown>)[key] === true;

/**
 * Marks a component as one that takes an element `trigger`. Where the result is assigned, mark
 * the call `@__PURE__`, so a bundler drops a component an application leaves unused.
 */
export function markTriggerOwner<Component extends object>(component: Component): Component {
  return Object.assign(component, { [triggerOwnerKey]: true });
}

/**
 * Whether an element's type is an envUI component that takes an element `trigger`. A lazy type
 * that hasn't loaded counts as one where its `trigger` prop is an element.
 */
export function isTriggerOwner(type: unknown, props?: { trigger?: unknown }): boolean {
  const resolved = resolveThroughLazyWrappers(type);
  if (resolved === notLoadedOrFailed) return isValidElement(props?.trigger);
  return marked(resolved, triggerOwnerKey);
}

/** Marks the Tooltip, so a HoverCard can tell one given as its trigger. */
export function markTooltip<Component extends object>(component: Component): Component {
  return Object.assign(component, { [tooltipKey]: true });
}

/** Whether an element's type is envUI's Tooltip, through a lazy wrapper that has loaded. */
export function isTooltip(type: unknown): boolean {
  return marked(resolveThroughLazyWrappers(type), tooltipKey);
}

/**
 * True around a Tooltip a HoverCard renders as its trigger, which shows no tooltip: the card opens
 * on the same hover and focus, and says more.
 */
export const HoverCardTriggerContext = createContext(false);
