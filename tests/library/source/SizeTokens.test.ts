import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { importSource } from '../../support/ImportSource.ts';
import { repositoryRoot } from '../../../scripts/RepositoryPaths.ts';

const sizes = await importSource('SizeTokens', 'packages/ui/src/internal/sizeTokens.ts');
interface Token {
  id: string;
  values: { light: { resolved: string } };
}

const { tokens }: { tokens: Token[] } = JSON.parse(
  readFileSync(join(repositoryRoot, 'packages/ui/src/generated/tokens.json'), 'utf8'),
);
const rem = (id: string) => {
  const token = tokens.find((candidate) => candidate.id === id);
  assert.ok(token, `${id} is a token`);
  const value = token.values.light.resolved;
  assert.match(value, /^[\d.]+rem$/, `${id} is a length in rem`);
  return Number.parseFloat(value);
};

test('the sizes components take as defaults in script are their tokens', () => {
  assert.deepEqual(
    {
      navigationDrawerWidthRem: sizes.navigationDrawerWidthRem,
      panesSizeRem: sizes.panesSizeRem,
      panesOtherMinRem: sizes.panesOtherMinRem,
      sheetWidthRem: sizes.sheetWidthRem,
      rowContentHeightRem: sizes.rowContentHeightRem,
      treeRowPaddingBlockRem: sizes.treeRowPaddingBlockRem,
    },
    {
      navigationDrawerWidthRem: rem('navigation-drawer.width'),
      panesSizeRem: rem('panes.size'),
      panesOtherMinRem: rem('panes.other-min'),
      sheetWidthRem: { md: rem('sheet.width-md'), lg: rem('sheet.width-lg') },
      rowContentHeightRem: rem('row.content-height'),
      treeRowPaddingBlockRem: {
        sm: rem('tree.row-padding-block-sm'),
        md: rem('tree.row-padding-block-md'),
        lg: rem('tree.row-padding-block-lg'),
      },
    },
  );
});
