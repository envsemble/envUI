import { withoutComments } from '../../scripts/site/CssComments.ts';

function closingParenthesis(selector: string, index: number) {
  let depth = 0;
  for (; index < selector.length; index++) {
    if (selector[index] === '(') depth++;
    else if (selector[index] === ')' && --depth === 0) return index;
  }
  return -1;
}

function withoutNegations(selector: string) {
  let result = '';
  for (let index = 0; index < selector.length; index++) {
    if (selector.startsWith(':not(', index)) {
      const end = closingParenthesis(selector, index + ':not'.length);
      if (end === -1) return selector;
      const group = selector.slice(index, end + 1);
      if (group.slice(':not('.length).includes(':not(')) result += group;
      index = end;
      continue;
    }
    result += selector[index];
  }
  return result;
}

function namesDocumentElement(selector: string): boolean {
  return /(?:^|[\s>+~(,|])html(?![\w-])/i.test(withoutNegations(selector));
}

function compounds(selector: string) {
  const parts: { combinator: string; compound: string }[] = [];
  let depth = 0;
  let current = '';
  let combinator = '';
  for (const character of selector) {
    if (character === '(' || character === '[') depth++;
    else if (character === ')' || character === ']') depth--;
    if (depth === 0 && /[\s>+~]/.test(character)) {
      if (current) {
        parts.push({ combinator, compound: current });
        current = '';
        combinator = ' ';
      }
      if (!/\s/.test(character)) combinator = character;
      continue;
    }
    current += character;
  }
  if (current) parts.push({ combinator, compound: current });
  return parts;
}

function siblingsStayScoped(selector: string): boolean {
  let within = false;
  for (const { combinator, compound } of compounds(selector).slice(1)) {
    if (combinator === ' ' || combinator === '>') within = true;
    else if (!within && !/\.env-/.test(compound)) return false;
  }
  return true;
}

const themedRootBody = 'html.env-theme > body';
const documentHoldingEnvUIElement = ':where(html:has(';

export function scopedSelector(selector: string): boolean {
  const list = splitSelectors(selector);
  if (list.length !== 1) return list.length > 1 && list.every(scopedSelector);
  const normalized = selector
    .replace(/\s*([>+~])\s*/g, ' $1 ')
    .replace(/\s+/g, ' ')
    .trim();
  if (normalized === themedRootBody) return true;
  if (
    !/[\s>+~,]/.test(normalized) &&
    /\.env-theme(?![\w-])/.test(normalized) &&
    namesDocumentElement(normalized)
  )
    return true;
  if (normalized.startsWith(documentHoldingEnvUIElement)) {
    const end = closingParenthesis(normalized, documentHoldingEnvUIElement.length - 1);
    const nothingFollows = normalized.slice(end + 1) === ')';
    if (end === -1 || !nothingFollows) return false;
    const inner = splitSelectors(normalized.slice(documentHoldingEnvUIElement.length, end));
    return inner.length > 0 && inner.every(scopedElement);
  }
  return scopedElement(normalized);
}

function scopedElement(selector: string): boolean {
  const list = splitSelectors(selector);
  if (list.length !== 1) return list.length > 1 && list.every(scopedElement);
  if (namesDocumentElement(selector) || !siblingsStayScoped(selector)) return false;
  if (/^(?:[a-zA-Z][\w-]*)?(?:\.env-|\[data-env-)/.test(selector)) return true;
  const group = [':where(', ':is('].find((opening) => selector.startsWith(opening));
  if (!group) return false;
  const end = closingParenthesis(selector, group.length - 1);
  if (end === -1) return false;
  const inner = splitSelectors(selector.slice(group.length, end));
  return inner.length > 0 && inner.every(scopedElement);
}

export function ruleSelectors(css: string) {
  const rules = withoutComments(css).replace(/@[^{};]*;/g, '');
  return [...rules.matchAll(/(?:^|(?<=[{}]))\s*([^{}]+)\{/g)].map((match) => match[1].trim());
}

export function splitSelectors(prelude: string) {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < prelude.length; index++) {
    const character = prelude[index];
    if (character === '(' || character === '[') depth++;
    else if (character === ')' || character === ']') depth--;
    else if (character === ',' && depth === 0) {
      parts.push(prelude.slice(start, index).trim());
      start = index + 1;
    }
  }
  parts.push(prelude.slice(start).trim());
  return parts;
}
