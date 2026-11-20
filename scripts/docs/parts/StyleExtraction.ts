import { withoutComments } from '../../site/CssComments.ts';
import { isPrivateState, styleSheets, type StateRecord } from './Library.ts';

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

function isOneGroup(inside: string) {
  let depth = 0;
  for (const character of inside) {
    if (character === '(') depth += 1;
    else if (character === ')') depth -= 1;
    if (depth < 0) return false;
  }
  return true;
}

export function readStyles() {
  const states: StateRecord[] = [];
  const visit = (selector: string, path: string) => {
    const inner: string[] = [];
    const own = selector.replace(/:has\(((?:[^()]|\((?:[^()]|\([^()]*\))*\))*)\)/g, (_, body) => {
      inner.push(body);
      return '';
    });
    for (const body of inner) for (const part of splitTopLevel(body, /,/)) visit(part, path);
    const ownCompounds = splitTopLevel(own, /[\s>+~]/).flatMap((compound) => {
      const group = /^:is\(([\s\S]*)\)$/.exec(compound);
      if (!group || !isOneGroup(group[1]) || splitTopLevel(group[1], /[\s>+~]/).length < 2)
        return [compound];
      for (const part of splitTopLevel(group[1], /,/)) visit(part, path);
      return [];
    });
    for (const compound of ownCompounds) {
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

export function readColorProperties() {
  const properties = new Map<string, string>();
  for (const { path, css } of styleSheets())
    for (const match of withoutComments(css).matchAll(
      /@property\s+(--env-[a-z\d-]+)\s*\{([^}]*)\}/g,
    ))
      if (/inherits\s*:\s*false/.test(match[2])) properties.set(match[1], path);
  return properties;
}
