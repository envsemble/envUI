// The third-party libraries an entry point loads, which applications install themselves. envUI
// lists none of them as a dependency or peer, as GitHub Packages drops `peerDependenciesMeta` and
// npm would then install every peer; docs/setup.md names each entry point's libraries instead.
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

/**
 * The libraries every entry point may import, which envUI declares itself, and envUI, which dev
 * mode's usage example imports in a comment the scan below doesn't tell from code.
 */
const declared = new Set(['react', 'react-dom', '@base-ui/react', '@envsemble/envui']);

/** The package a bare import names: `@tiptap/pm/state` is `@tiptap/pm`, `shiki/core` is `shiki`. */
function packageName(specifier: string) {
  const parts = specifier.split('/');
  return specifier.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
}

/** The source file a relative import names, as `./Button.js` names `Button.tsx`. */
function sourceFile(from: string, specifier: string) {
  const base = resolve(dirname(from), specifier).replace(/\.js$/, '');
  for (const candidate of [`${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`])
    if (existsSync(candidate)) return candidate;
  return undefined;
}

/**
 * The specifiers a module imports at runtime: static imports and re-exports that aren't type-only,
 * side-effect imports and dynamic imports.
 */
function runtimeImports(code: string) {
  const specifiers: string[] = [];
  for (const [, typeOnly, specifier] of code.matchAll(
    /\b(?:import|export)\s+(type\s+)?[^'";]*?\bfrom\s*['"]([^'"]+)['"]/g,
  ))
    if (!typeOnly) specifiers.push(specifier);
  for (const [, specifier] of code.matchAll(/\bimport\s*\(?\s*['"]([^'"]+)['"]/g))
    specifiers.push(specifier);
  return specifiers;
}

/** The third-party libraries an entry point's modules import at runtime, from its source file. */
export async function importedLibraries(start: string) {
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

/**
 * The libraries and versions of each entry point docs/setup.md gives an `npm install` command, by
 * its specifier.
 */
export async function documentedLibraries(repositoryRoot: string) {
  const setup = await readFile(resolve(repositoryRoot, 'docs/setup.md'), 'utf8');
  const documented: Record<string, { name: string; range: string }[]> = {};
  for (const [, specifier, command] of setup.matchAll(
    /^- `(@envsemble\/envui[\w/-]*)`:\n\n {2}```sh\n {2}npm install ([^\n]+)\n/gm,
  ))
    documented[specifier] = command.split(' ').map((spec) => {
      const at = spec.lastIndexOf('@');
      return { name: spec.slice(0, at), range: spec.slice(at + 1) };
    });
  return documented;
}
