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
    prefixes: ['control', 'field', 'row', 'tree', 'icon', 'title-bar', 'topbar'],
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
