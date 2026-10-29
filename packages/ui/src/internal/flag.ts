/**
 * A boolean state attribute's value: present, as `''`, while `on` holds, and absent otherwise, as
 * Base UI renders its own flags, so CSS selects it as `[data-x]`.
 */
export function flag(on: unknown): '' | undefined {
  return on ? '' : undefined;
}
