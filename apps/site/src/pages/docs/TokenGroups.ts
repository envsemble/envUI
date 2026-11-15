export const tokenGroups: { title: string; prefixes: string[]; component?: boolean }[] = [
  { title: 'Color roles', prefixes: ['color'] },
  { title: 'Component colors', prefixes: ['color'], component: true },
  { title: 'Elevation', prefixes: ['elevation'] },
  { title: 'Typography', prefixes: ['font', 'type', 'body'] },
  { title: 'Spacing', prefixes: ['space'] },
  { title: 'Corners', prefixes: ['radius'] },
  {
    title: 'Sizes',
    prefixes: ['control', 'field', 'row', 'tree', 'icon', 'picture', 'title-bar', 'topbar'],
  },
  { title: 'Motion', prefixes: ['motion'] },
  { title: 'States', prefixes: ['state'] },
  { title: 'Other tokens', prefixes: [] },
];

export function groupOf(token: { id: string }) {
  const prefix = token.id.split('.')[0];
  const component = prefix === 'color' && !/^color\.(?:bg|fg|border)\./.test(token.id);
  return (
    tokenGroups.find(
      (group) => group.prefixes.includes(prefix) && Boolean(group.component) === component,
    ) ?? tokenGroups.at(-1)!
  );
}

export const themes = [
  ['light', 'Light'],
  ['dark', 'Dark'],
  ['light-high-contrast', 'Light high contrast'],
  ['dark-high-contrast', 'Dark high contrast'],
] as const;

const hexPart = (value: number) => Math.round(value).toString(16).padStart(2, '0');

export function tokenValueText(resolved: unknown): string {
  if (resolved === undefined) return '—';
  if (typeof resolved !== 'string')
    return Object.entries(resolved as Record<string, unknown>)
      .map(([property, part]) => `${property}: ${part}`)
      .join('; ');
  const rgb = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:\s*[/,]\s*([\d.]+%?))?\s*\)$/.exec(
    resolved,
  );
  if (!rgb) return resolved;
  const [, red, green, blue, alpha] = rgb;
  const opacity =
    alpha === undefined ? 1 : alpha.endsWith('%') ? parseFloat(alpha) / 100 : parseFloat(alpha);
  return `#${[red, green, blue].map((part) => hexPart(Number(part))).join('')}${
    opacity < 1 ? hexPart(opacity * 255) : ''
  }`;
}
