// Whether a style sheet's selectors match only envUI's elements, so that loading envUI's CSS leaves
// the rest of an application's page as it was: a heuristic the package tests run on styles.css.

/** The index of the parenthesis that closes the group opening at index, or -1. */
function closingParenthesis(selector, index) {
  let depth = 0;
  for (; index < selector.length; index++) {
    if (selector[index] === '(') depth++;
    else if (selector[index] === ')' && --depth === 0) return index;
  }
  return -1;
}

/**
 * The selector without its :not() groups, which leave elements out rather than name them. A group
 * that holds another negation stays, since two negations name what they negate.
 */
function withoutNegations(selector) {
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

/** Whether a selector names the document element, in any case and namespace. */
function namesDocumentElement(selector) {
  return /(?:^|[\s>+~(,|])html(?![\w-])/i.test(withoutNegations(selector));
}

/** The compounds of a selector, each with the combinator before it, outside any group. */
function compounds(selector) {
  const parts = [];
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

/**
 * Whether the siblings a selector reaches stay envUI's: a sibling of an envUI element must carry an
 * envUI class itself, while siblings within one, after a descendant or child combinator, do.
 */
function siblingsStayScoped(selector) {
  let within = false;
  for (const { combinator, compound } of compounds(selector).slice(1)) {
    if (combinator === ' ' || combinator === '>') within = true;
    else if (!within && !/\.env-/.test(compound)) return false;
  }
  return true;
}

/**
 * A heuristic for selectors that match only envUI's elements: each starts at an envUI class, or at
 * a zero-specificity :where() around such selectors, and reaches siblings only within them or with
 * an envUI class. The document element appears only as a root that opted in with .env-theme, as one
 * compound, or in two whole selectors at zero specificity: the body of a themed root, and the
 * document element while it contains an envUI element.
 */
export function scopedSelector(selector) {
  const list = splitSelectors(selector);
  if (list.length !== 1) return list.length > 1 && list.every(scopedSelector);
  const normalized = selector
    .replace(/\s*([>+~])\s*/g, ' $1 ')
    .replace(/\s+/g, ' ')
    .trim();
  // A themed document root's body takes the body type, from envUI's base layer.
  if (normalized === 'html.env-theme > body') return true;
  if (
    !/[\s>+~,]/.test(normalized) &&
    /\.env-theme(?![\w-])/.test(normalized) &&
    namesDocumentElement(normalized)
  )
    return true;
  if (normalized.startsWith(':where(html:has(')) {
    const end = closingParenthesis(normalized, ':where(html:has'.length);
    // Nothing may follow, inside the :where() or after it.
    if (end === -1 || normalized.slice(end + 1) !== ')') return false;
    const inner = splitSelectors(normalized.slice(':where(html:has('.length, end));
    return inner.length > 0 && inner.every(scopedElement);
  }
  return scopedElement(normalized);
}

/**
 * A selector that starts at an envUI class or an envUI data-env- attribute, such as a layout
 * primitive's [data-env-layout], or a zero-specificity :where() around such selectors,
 * never names the document element, through which it would reach the whole page, and reaches
 * siblings only within envUI's elements or with an envUI class.
 */
function scopedElement(selector) {
  const list = splitSelectors(selector);
  if (list.length !== 1) return list.length > 1 && list.every(scopedElement);
  if (namesDocumentElement(selector) || !siblingsStayScoped(selector)) return false;
  if (/^(?:[a-zA-Z][\w-]*)?(?:\.env-|\[data-env-)/.test(selector)) return true;
  if (!selector.startsWith(':where(')) return false;
  const end = closingParenthesis(selector, ':where'.length);
  if (end === -1) return false;
  // What follows a :where() around envUI's elements matches within them.
  const inner = splitSelectors(selector.slice(':where('.length, end));
  return inner.length > 0 && inner.every(scopedElement);
}

/** The selectors of a style sheet's rules, without comments and @ statements such as @layer a; */
export function ruleSelectors(css) {
  const rules = css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/@[^{};]*;/g, '');
  return [...rules.matchAll(/(?:^|(?<=[{}]))\s*([^{}]+)\{/g)].map((match) => match[1].trim());
}

/** The selectors of a selector list, split at its top-level commas. */
export function splitSelectors(prelude) {
  const parts = [];
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
