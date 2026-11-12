/** The values the site gives its elements' attributes, written as the library writes its own. */

/** Joins optional CSS classes, in the order given. */
export function classNames(...values: Array<string | undefined | false>) {
  return values.filter(Boolean).join(' ');
}

/**
 * A boolean state attribute's value: present, as `''`, while `on` holds, and absent otherwise, so
 * CSS selects it as `[data-x]`.
 */
export function flag(on: unknown): '' | undefined {
  return on ? '' : undefined;
}
