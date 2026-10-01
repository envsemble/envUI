/** Join optional CSS classes in the order supplied by the component. */
export function classNames(...values: Array<string | undefined | false>) {
  return values.filter(Boolean).join(' ');
}
