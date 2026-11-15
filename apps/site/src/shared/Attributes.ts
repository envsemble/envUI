export function classNames(...values: Array<string | undefined | false>) {
  return values.filter(Boolean).join(' ');
}

export function flag(on: unknown): '' | undefined {
  return on ? '' : undefined;
}
