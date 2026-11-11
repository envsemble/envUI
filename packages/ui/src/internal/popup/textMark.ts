/**
 * The mark on envUI's Text that lets a HoverCard or Tooltip tell a text trigger (see hoverDetail).
 * It lives apart from hoverDetail, which imports the hover detail's style sheets, so Text brings
 * them only into pages that show a HoverCard or Tooltip.
 */
const textKey = Symbol.for('envui.text');

/** Marks envUI's Text, so a HoverCard or Tooltip can tell a text trigger. */
export function markText<Component extends object>(component: Component): Component {
  return Object.assign(component, { [textKey]: true });
}

/** Whether a component type is one markText marked. */
export function isMarkedText(type: object): boolean {
  // A component, function or object alike, that markText marked carries the key, which React's
  // types know nothing of.
  return (type as Record<symbol, unknown>)[textKey] === true;
}
