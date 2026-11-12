// The state attributes and color properties the library's style sheets declare: the `[data-*]`
// selectors on a part class, with the values they compare, and the `@property` registrations of the
// color properties.
import { isPrivateState, styleSheets, type StateRecord } from './Library.ts';

const withoutComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');

/** Splits a selector list or a selector at `separators` outside brackets, parentheses and strings. */
function splitTopLevel(text: string, separators: RegExp) {
  const parts: string[] = [];
  let depth = 0;
  let quote: string | null = null;
  let start = 0;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quote) {
      if (character === '\\') index += 1;
      else if (character === quote) quote = null;
    } else if (character === '"' || character === "'") quote = character;
    else if (character === '(' || character === '[') depth += 1;
    else if (character === ')' || character === ']') depth -= 1;
    else if (depth === 0 && separators.test(character)) {
      parts.push(text.slice(start, index));
      start = index + 1;
    }
  }
  parts.push(text.slice(start));
  return parts.map((part) => part.trim()).filter(Boolean);
}

/**
 * The state attributes the style sheets select on a part class: `.env-x[data-y='z']` and
 * `.env-x:not([data-y])` put data-y on env-x. Selectors inside `:has()` describe other elements and
 * are read as selectors of their own.
 */
export function readStyles() {
  const states: StateRecord[] = [];
  const visit = (selector: string, path: string) => {
    const inner: string[] = [];
    const own = selector.replace(/:has\(((?:[^()]|\((?:[^()]|\([^()]*\))*\))*)\)/g, (_, body) => {
      inner.push(body);
      return '';
    });
    for (const body of inner) for (const part of splitTopLevel(body, /,/)) visit(part, path);
    for (const compound of splitTopLevel(own, /[\s>+~]/)) {
      const names = [...compound.matchAll(/\.(env-[a-z\d]+(?:-[a-z\d]+)*)(?![\w-])/g)].map(
        (match) => match[1],
      );
      if (!names.length) continue;
      for (const match of compound.matchAll(
        /\[\s*(data-[\w-]+)\s*(?:[~|^$*]?=\s*(?:"([^"]*)"|'([^']*)'|([^\]\s]+)))?\s*(?:[is]\s*)?\]/g,
      )) {
        if (isPrivateState(match[1])) continue;
        const value = match[2] ?? match[3] ?? match[4];
        states.push({
          attribute: match[1],
          values: new Set(value === undefined ? [] : [value]),
          classes: names,
          path,
        });
      }
    }
  };
  for (const { path, css } of styleSheets())
    for (const match of withoutComments(css).matchAll(/(?:^|[;{}])\s*([^;{}@][^;{}]*)\{/g))
      for (const selector of splitTopLevel(match[1], /,/)) visit(selector, path);
  return states;
}

/**
 * The color properties the style sheets register, as the public color properties are: each
 * `@property` that doesn't inherit, with the file that registers it.
 */
export function readColorProperties() {
  const properties = new Map<string, string>();
  for (const { path, css } of styleSheets())
    for (const match of withoutComments(css).matchAll(
      /@property\s+(--env-[a-z\d-]+)\s*\{([^}]*)\}/g,
    ))
      if (/inherits\s*:\s*false/.test(match[2])) properties.set(match[1], path);
  return properties;
}
