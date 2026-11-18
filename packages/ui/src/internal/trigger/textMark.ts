const textKey = Symbol.for('envui.text');

/** Marks envUI's Text, so a HoverCard or Tooltip can tell a text trigger. */
export function markText<Component extends object>(component: Component): Component {
  return Object.assign(component, { [textKey]: true });
}

/** Whether a component type is one markText marked. */
export function isMarkedText(type: object): boolean {
  return (type as Record<symbol, unknown>)[textKey] === true;
}
