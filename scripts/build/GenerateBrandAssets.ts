import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { writeIfChanged } from './GeneratedFiles.ts';
import { repositoryRoot } from '../RepositoryPaths.ts';

/**
 * Preserve the supplied artwork while making its monochrome paint theme-aware. The lockup is the
 * catalogue's own: envUI ships no logos.
 */
export async function generateBrandAssets() {
  const [black, white] = await Promise.all(
    ['black', 'white'].map((color) =>
      readFile(resolve(repositoryRoot, `assets/brand/envUI/envUI-lockup-${color}.svg`), 'utf8'),
    ),
  );
  function geometry(source: string) {
    const viewBox = source.match(/viewBox="([^"]+)"/)?.[1];
    const paths = [...source.matchAll(/<path\b[^>]*\bd="([^"]+)"[^>]*\/\s*>/g)];
    const tags = [...source.matchAll(/<([\w:-]+)\b/g)].map((match) => match[1]);
    if (!viewBox || paths.length !== 1 || tags.join(',') !== 'svg,title,path')
      throw new Error('envUI lockup must contain one path and a viewBox.');
    const path = paths[0][0];
    if (!/fill-rule="evenodd"/.test(path) || !/clip-rule="evenodd"/.test(path))
      throw new Error('Preserve the envUI lockup winding rules.');
    return { viewBox, path: paths[0][1] };
  }
  const artwork = geometry(black);
  if (JSON.stringify(artwork) !== JSON.stringify(geometry(white)))
    throw new Error('envUI black and white lockups must share the same geometry.');
  const [, , width, height] = artwork.viewBox.split(/\s+/).map(Number);
  const output = `// Generated from assets/brand/envUI by scripts/build/GenerateBrandAssets.ts.
import { Icon, type IconProps } from '@envsemble/envui';

export type EnvUILogoProps = IconProps;

/** The catalogue's envUI lockup; inherits its containing theme's text color. */
export function EnvUILogo({ label = 'envUI', ...props }: EnvUILogoProps) {
  return (
    <Icon
      viewBox=${JSON.stringify(artwork.viewBox)}
      width="${width / height}em"
      height="1em"
      label={label}
      {...props}
    >
      <path
        d=${JSON.stringify(artwork.path)}
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </Icon>
  );
}
`;
  const target = resolve(repositoryRoot, 'apps/site/src/brand/EnvUILogo.tsx');
  writeIfChanged(target, output);
}

if (import.meta.main) {
  await generateBrandAssets();
  console.log('Generated the theme-aware envUI logo from the supplied SVG assets.');
}
