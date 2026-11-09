// The token sources as the resolver lists them: where they are, the tokens each declares, and the
// tokens two sources of one set or context both declare.
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { libraryDirectory, librarySourceDirectory } from '../../RepositoryPaths.ts';

/**
 * The token sources, and where the build writes, as file URLs ending in a slash; a test can build
 * other tokens elsewhere.
 */
export const defaultTokensDirectory = pathToFileURL(`${libraryDirectory}/tokens/`);
export const defaultOutDir = pathToFileURL(`${librarySourceDirectory}/`);
export const resolverIn = (directory: URL) => new URL('envui.resolver.json', directory);

/** A token document, or a group in one: nested groups and tokens, which hold a `$value`. */
export interface TokenDocument {
  [key: string]: unknown;
}

/** A source of a resolver set or modifier context: a file, a reference to a set, or tokens inline. */
type ResolverSource = TokenDocument & { $ref?: string };

interface ResolverFile {
  sets?: Record<string, { sources: ResolverSource[] }>;
  modifiers?: Record<string, { contexts: Record<string, ResolverSource[]> }>;
}

const readJson = <T>(file: URL): T => JSON.parse(readFileSync(file, 'utf8')) as T;

/** A token source file of the tokens directory, by its path there. */
export const readTokenSource = (path: string, tokensDirectory: URL) =>
  readJson<TokenDocument>(new URL(path, tokensDirectory));

const isGroup = (value: unknown): value is TokenDocument =>
  value !== null && typeof value === 'object';

/** IDs of the tokens a source document declares. */
export function declaredTokens(document: TokenDocument, path: string[] = [], ids: string[] = []) {
  for (const [key, value] of Object.entries(document)) {
    if (key.startsWith('$') && key !== '$root') continue;
    if (!isGroup(value)) continue;
    if ('$value' in value) ids.push([...path, key].filter((part) => part !== '$root').join('.'));
    else declaredTokens(value, [...path, key], ids);
  }
  return ids;
}

/**
 * The tokens a source document points at another token, by ID: `{ 'color.fg.muted':
 * 'contrast-high.fg.muted' }` for `"$value": "{contrast-high.fg.muted}"`.
 */
export function aliasTargets(
  document: TokenDocument,
  path: string[] = [],
  targets: Record<string, string> = {},
) {
  for (const [key, value] of Object.entries(document)) {
    if (key.startsWith('$') && key !== '$root') continue;
    if (!isGroup(value)) continue;
    const next = key === '$root' ? path : [...path, key];
    if ('$value' in value) {
      if (typeof value.$value === 'string') targets[next.join('.')] = value.$value.slice(1, -1);
    } else aliasTargets(value, next, targets);
  }
  return targets;
}

/**
 * The tokens that two sources of the same set, or of the same modifier context, declare, as
 * messages: the resolver merges the sources in order, so the last would silently replace the
 * first. A context overriding the base set, as the dark scheme and high contrast do, is how themes
 * work and is not reported.
 */
export function duplicateTokens(tokensDirectory = defaultTokensDirectory) {
  const resolverFile = resolverIn(tokensDirectory);
  const resolver = readJson<ResolverFile>(resolverFile);
  const groups: [string, ResolverSource[]][] = [
    ...Object.entries(resolver.sets ?? {}).map(([name, set]): [string, ResolverSource[]] => [
      `the ${name} set`,
      set.sources,
    ]),
    ...Object.entries(resolver.modifiers ?? {}).flatMap(([modifier, { contexts }]) =>
      Object.entries(contexts).map(([context, sources]): [string, ResolverSource[]] => [
        `the ${context} context of ${modifier}`,
        sources,
      ]),
    ),
  ];
  const messages: string[] = [];
  for (const [where, sources] of groups) {
    const files = new Map<string, string[]>();
    for (const [index, source] of sources.entries()) {
      // A source is a file, or tokens written inline; a reference to a set is that set's sources.
      if (source.$ref?.startsWith('#')) continue;
      const name = source.$ref?.replace(/^\.\//, '') ?? `inline source ${index + 1}`;
      const document = source.$ref
        ? readJson<TokenDocument>(new URL(source.$ref, resolverFile))
        : source;
      for (const id of declaredTokens(document)) files.set(id, [...(files.get(id) ?? []), name]);
    }
    for (const [id, names] of files)
      if (names.length > 1)
        messages.push(
          `${id} is declared in both ${names.join(' and ')}, which ${where} merges: declare it once.`,
        );
  }
  return messages;
}

/** IDs of the tokens one context of a resolver modifier overrides, read from its sources. */
export function contextTokens(
  modifier: string,
  context: string,
  tokensDirectory = defaultTokensDirectory,
) {
  const resolverFile = resolverIn(tokensDirectory);
  const resolver = readJson<ResolverFile>(resolverFile);
  const sources = resolver.modifiers?.[modifier]?.contexts[context];
  if (!sources) throw new Error(`The resolver has no ${context} context of ${modifier}.`);
  return sources.flatMap((source) =>
    declaredTokens(
      source.$ref ? readJson<TokenDocument>(new URL(source.$ref, resolverFile)) : source,
    ),
  );
}
