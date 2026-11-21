import type { CommandPaletteGroup, CommandPaletteItem } from '@envsemble/envui';

export const files: CommandPaletteGroup = {
  label: (
    <>
      Files <b>2</b>
    </>
  ),
  items: [{ id: 'readme', label: 'README.md', itemProps: { 'data-testid': 'readme' } }],
};

// @ts-expect-error
export const noFlatGroupKey: CommandPaletteItem = { id: 'a', label: 'A', group: 'Files' };
// @ts-expect-error
export const itemHasNoItems: CommandPaletteItem = { id: 'a', label: 'A', items: [] };
export const ariaStaysTheOptions: CommandPaletteItem = {
  id: 'a',
  label: 'A',
  // @ts-expect-error
  itemProps: { 'aria-label': 'B' },
};
