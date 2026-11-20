import { existsSync, readFileSync } from 'node:fs';
import type { BuildHookOptions, Plugin } from '@terrazzo/parser';
import { overridingCustomProperties } from './CssDeclarations.ts';
import { lintRules } from './LintRules.ts';
import {
  cssVariable,
  envuiExtensions,
  isInternal,
  scaleRules,
  scales,
  themes,
  type ThemeName,
} from './Themes.ts';
import { withoutComments } from '../../site/CssComments.ts';

type CssValue = string | Record<string, string>;

interface ThemeValue {
  css: CssValue | undefined;
  resolved: CssValue | undefined;
  aliasOf?: string;
  description?: string;
}

interface ListedToken {
  id: string;
  cssVariable: string;
  type: string;
  description?: string;
  deprecated?: unknown;
  component?: string;
  handwritten?: true;
  values: Record<ThemeName, ThemeValue>;
  scales?: Record<string, ThemeValue>;
}

type Resolve = (layer: string, name: string) => CssValue | undefined;

function declaredValues(getTransforms: BuildHookOptions['getTransforms']) {
  const declaredIn = (input: Record<string, string>) => {
    const values = new Map<string, CssValue>();
    for (const { localID, value } of getTransforms({ format: 'css', input })) {
      if (localID === undefined) continue;
      values.set(localID, value);
      if (value && typeof value === 'object')
        for (const [part, partValue] of Object.entries(value))
          values.set(`${localID}-${part}`, partValue);
    }
    return values;
  };
  const declared: Record<string, Map<string, CssValue>> = {};
  for (const theme of themes) declared[theme.name] = declaredIn(theme.input);
  for (const scale of scaleRules) declared[scale.name] = declaredIn(scale.input);
  const fallback: Record<string, string[]> = {
    dark: ['light'],
    'light-high-contrast': ['light'],
    'dark-high-contrast': ['dark', 'light'],
  };
  for (const scale of scaleRules) fallback[scale.name] = ['light'];
  const cssValue = (layer: string, name: string) =>
    [layer, ...(fallback[layer] ?? [])]
      .map((each) => declared[each].get(name))
      .find((value) => value !== undefined);
  const resolveValue = (layer: string, value: CssValue | undefined): CssValue | undefined => {
    if (value && typeof value === 'object')
      return Object.fromEntries(
        Object.entries(value).map(([part, partValue]) => [
          part,
          resolveValue(layer, partValue) as string,
        ]),
      );
    const alias = typeof value === 'string' ? value.match(/^var\((--[\w-]+)\)$/) : null;
    if (alias) return resolve(layer, alias[1]);
    return typeof value === 'string'
      ? value.replace(/var\((--[\w-]+)\)/g, (_, name: string) => resolve(layer, name) as string)
      : value;
  };
  const resolve: Resolve = (layer, name) => resolveValue(layer, cssValue(layer, name));
  return { declared, cssValue, resolve };
}

function checkCustomProperties(list: ListedToken[], handwrittenFile: URL) {
  const owners = new Map<string, string>();
  for (const token of list) {
    const parts = new Set(
      Object.values(token.values).flatMap(({ css }) =>
        css && typeof css === 'object' ? Object.keys(css) : [],
      ),
    );
    const names = [token.cssVariable, ...[...parts].map((part) => `${token.cssVariable}-${part}`)];
    for (const name of names) {
      if (owners.has(name))
        throw new Error(
          `${owners.get(name)} and ${token.id} both become ${name}: rename one of them.`,
        );
      owners.set(name, token.id);
    }
  }
  if (!existsSync(handwrittenFile)) return;
  for (const name of overridingCustomProperties(readFileSync(handwrittenFile, 'utf8')))
    if (owners.has(name))
      throw new Error(
        `TokensHandwritten.css declares ${name}, which the token ${owners.get(name)} becomes: move the hand-written value into the token, or give one of them another name.`,
      );
}

function handwrittenTokens(listFile: URL, cssFile: URL, resolve: Resolve): ListedToken[] {
  if (!existsSync(listFile)) return [];
  const listed = JSON.parse(readFileSync(listFile, 'utf8')) as Record<
    string,
    { type: string; description: string }
  >;
  const css = existsSync(cssFile) ? withoutComments(readFileSync(cssFile, 'utf8')) : '';
  return Object.entries(listed)
    .filter(([id]) => !id.startsWith('$'))
    .map(([id, { type, description }]) => {
      const name = cssVariable(id);
      const declared = css
        .match(new RegExp(`${name}\\s*:\\s*([^;]+);`))?.[1]
        .replace(/\s+/g, ' ')
        .trim();
      if (!declared)
        throw new Error(
          `tokens/handwritten.json lists ${id}, but TokensHandwritten.css declares no ${name}.`,
        );
      const values = Object.fromEntries(
        themes.map((theme) => [
          theme.name,
          {
            css: declared,
            resolved: declared.replace(
              /var\((--[\w-]+)\)/g,
              (_, used: string) => resolve(theme.name, used) as string,
            ),
          },
        ]),
      ) as Record<ThemeName, ThemeValue>;
      return { id, cssVariable: name, type, description, handwritten: true, values };
    });
}

const numericOrder = (a: string, b: string) => a.localeCompare(b, 'en', { numeric: true });

export function tokenList({
  handwrittenFile,
  handwrittenList,
}: {
  handwrittenFile: URL;
  handwrittenList: URL;
}): Plugin {
  return {
    name: 'envui',
    lint: () => lintRules,
    build({ getTransforms, outputFile, resolver, tokens }) {
      const modifiers = resolver.source.resolutionOrder
        .filter((item) => item.type === 'modifier')
        .map((item) => ({
          name: item.name,
          description: item.description,
          contexts: Object.keys(item.contexts),
          default: item.default,
        }));
      const { declared, cssValue, resolve } = declaredValues(getTransforms);
      const applied = Object.fromEntries(
        themes.map((theme) => [theme.name, resolver.apply(theme.input)]),
      );
      const list = Object.keys(tokens)
        .filter((id) => !isInternal(id))
        .sort(numericOrder)
        .map((id): ListedToken => {
          const name = cssVariable(id);
          const values = {} as Record<ThemeName, ThemeValue>;
          for (const theme of themes) {
            const token = applied[theme.name][id];
            const aliasOf = token.aliasChain?.find((target) => !isInternal(target));
            values[theme.name] = {
              css: cssValue(theme.name, name),
              resolved: resolve(theme.name, name),
              ...(aliasOf && { aliasOf }),
              ...(token.$description &&
                token.$description !== tokens[id].$description && {
                  description: token.$description,
                }),
            };
          }
          const scaled: Record<string, ThemeValue> = {};
          for (const scale of scaleRules) {
            if (!declared[scale.name].has(name)) continue;
            scaled[scale.name] = {
              css: cssValue(scale.name, name),
              resolved: resolve(scale.name, name),
            };
          }
          const { component } = envuiExtensions(tokens[id]);
          return {
            id,
            cssVariable: name,
            type: tokens[id].$type,
            ...(tokens[id].$description && { description: tokens[id].$description }),
            ...(tokens[id].$deprecated && { deprecated: tokens[id].$deprecated }),
            ...(component && { component }),
            values,
            ...(Object.keys(scaled).length > 0 && { scales: scaled }),
          };
        });
      checkCustomProperties(list, handwrittenFile);
      list.push(...handwrittenTokens(handwrittenList, handwrittenFile, resolve));
      list.sort((a, b) => numericOrder(a.id, b.id));
      outputFile(
        'generated/tokens.json',
        JSON.stringify({
          $comment:
            'Generated from packages/ui/tokens by `npm run tokens:build`. Do not edit: change the tokens and rebuild.',
          modifiers,
          themes,
          scales: scales.map(({ name, selector }) => ({ name, ...(selector && { selector }) })),
          tokens: list,
        }),
      );
    },
  };
}
