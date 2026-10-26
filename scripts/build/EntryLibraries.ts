import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

/**
 * The entries whose libraries applications install themselves. envUI lists none of them as a
 * dependency or peer, as GitHub Packages drops `peerDependenciesMeta` and npm would then install
 * every peer; docs/setup.md names each entry's libraries instead.
 */
export const libraryEntries = ['content', 'rich-text', 'diff', 'color'];

/** The libraries every entry may import, which envUI declares itself. */
const declared = new Set(['react', 'react-dom', '@base-ui/react']);

/** The package a bare import names: `@tiptap/pm/state` is `@tiptap/pm`, `shiki/core` is `shiki`. */
function packageName(specifier) {
  const parts = specifier.split('/');
  return specifier.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
}

/** The source file a relative import names, as `./Button.js` names `Button.tsx`. */
function sourceFile(from, specifier) {
  const base = resolve(dirname(from), specifier).replace(/\.js$/, '');
  for (const candidate of [`${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`])
    if (existsSync(candidate)) return candidate;
  return undefined;
}

/**
 * The specifiers a module imports at runtime: static imports and re-exports that aren't type-only,
 * side-effect imports and dynamic imports.
 */
function runtimeImports(code) {
  const specifiers: string[] = [];
  for (const [, typeOnly, specifier] of code.matchAll(
    /\b(?:import|export)\s+(type\s+)?[^'";]*?\bfrom\s*['"]([^'"]+)['"]/g,
  ))
    if (!typeOnly) specifiers.push(specifier);
  for (const [, specifier] of code.matchAll(/\bimport\s*\(?\s*['"]([^'"]+)['"]/g))
    specifiers.push(specifier);
  return specifiers;
}

/** The third-party libraries an entry's modules import at runtime. */
export async function importedLibraries(repositoryRoot, entry) {
  const source = resolve(repositoryRoot, 'packages/ui/src');
  const start = resolve(source, `${entry === 'main' ? 'index' : entry}.ts`);
  const libraries = new Set<string>();
  const seen = new Set<string>();
  const pending: string[] = [start];
  while (pending.length) {
    const file = pending.pop()!;
    if (seen.has(file)) continue;
    seen.add(file);
    const code = await readFile(file, 'utf8');
    for (const specifier of runtimeImports(code)) {
      if (specifier.startsWith('.')) {
        const next = sourceFile(file, specifier);
        if (next) pending.push(next);
      } else if (!specifier.startsWith('node:')) {
        const name = packageName(specifier);
        if (!declared.has(name)) libraries.add(name);
      }
    }
  }
  return libraries;
}

/** Each entry's libraries and versions, from its `npm install` command in docs/setup.md. */
export async function documentedLibraries(repositoryRoot) {
  const setup = await readFile(resolve(repositoryRoot, 'docs/setup.md'), 'utf8');
  const documented = {};
  for (const entry of libraryEntries) {
    const pattern = new RegExp(
      `^- \`@envsemble/envui/${entry}\`:\\n\\n {2}\`\`\`sh\\n {2}npm install ([^\\n]+)\\n`,
      'm',
    );
    const match = setup.match(pattern);
    if (!match) throw new Error(`docs/setup.md has no install command for the ${entry} entry.`);
    documented[entry] = match[1].split(' ').map((spec) => {
      const at = spec.lastIndexOf('@');
      return { name: spec.slice(0, at), range: spec.slice(at + 1) };
    });
  }
  return documented;
}
