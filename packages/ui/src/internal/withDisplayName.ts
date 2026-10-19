/**
 * Names a part of a compound component, such as Menu.Item, for React DevTools and warnings. Mark
 * each call with a `@__PURE__` annotation: a pure call, unlike a `displayName` assignment, lets a
 * bundler drop the parts an application does not use.
 */
export function withDisplayName<Component extends object>(
  component: Component,
  displayName: string,
) {
  return Object.assign(component, { displayName });
}
