// The groups of the token reference, shared by the reference (TokenReference.tsx) and the outline
// of it the Docs' Design tokens page shows while it loads (scripts/site/PartOutlines.ts). It runs
// in Node and in the browser, so it imports nothing.

/**
 * The groups of the reference, by the first part of the tokens' names, in order. The color roles
 * are color.bg, color.fg and color.border; the other colors are system tokens named for a component.
 */
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
  // Tokens of a family the groups above don't name yet, so every token is listed.
  { title: 'Other tokens', prefixes: [] },
];

/** The group a token is listed in, by its id, such as color.fg.muted. */
export function groupOf(token: { id: string }) {
  const prefix = token.id.split('.')[0];
  const component = prefix === 'color' && !/^color\.(?:bg|fg|border)\./.test(token.id);
  return (
    tokenGroups.find(
      (group) => group.prefixes.includes(prefix) && Boolean(group.component) === component,
    ) ?? tokenGroups.at(-1)!
  );
}

/** The themes a color takes a value in, by their names. */
export const themes = [
  ['light', 'Light'],
  ['dark', 'Dark'],
  ['light-high-contrast', 'Light high contrast'],
  ['dark-high-contrast', 'Dark high contrast'],
] as const;

const hexPart = (value: number) => Math.round(value).toString(16).padStart(2, '0');

/**
 * A token's value as the reference shows it: a color in one format, hex, with its alpha as a
 * fourth pair where it has one, as rgb(31 31 34 / 0.1) is #1f1f221a; anything else as written,
 * and a composite value as its properties, such as a shadow's.
 */
export function tokenValueText(resolved: unknown): string {
  if (resolved === undefined) return '—';
  if (typeof resolved !== 'string')
    // A composite token's value is an object of its parts.
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
