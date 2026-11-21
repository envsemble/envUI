import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { build } from 'esbuild';
import postcss from 'postcss';
import { styleSheetsDirectory } from '../../scripts/RepositoryPaths.ts';

export function libraryStyleSheets() {
  return readdirSync(styleSheetsDirectory)
    .filter((name) => name.endsWith('.css'))
    .sort()
    .map((name) => ({ name, text: readFileSync(join(styleSheetsDirectory, name), 'utf8') }));
}

export async function shippedStyleSheet() {
  const result = await build({
    entryPoints: [join(styleSheetsDirectory, 'index.css')],
    bundle: true,
    write: false,
    loader: { '.woff2': 'file', '.svg': 'file' },
    assetNames: 'assets/[name]',
    outfile: join(styleSheetsDirectory, 'out.css'),
    logLevel: 'silent',
  });
  const sheet = result.outputFiles.find((file) => file.path.endsWith('.css'));
  if (!sheet) throw new Error('esbuild wrote no style sheet');
  return sheet.text;
}

export function declarations(css: string) {
  const found: { selector: string; prop: string; value: string }[] = [];
  postcss.parse(css).walkDecls((declaration) => {
    const parent = declaration.parent as postcss.Rule | postcss.AtRule;
    const selector =
      parent.type === 'rule' ? parent.selector : `@${parent.name} ${parent.params}`.trim();
    found.push({
      selector: selector.replace(/\s+/g, ' '),
      prop: declaration.prop,
      value: declaration.value,
    });
  });
  return found;
}
