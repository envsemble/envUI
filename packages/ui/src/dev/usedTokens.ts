import { cssRulesUnlessCrossOrigin, styleSheetsVersion } from './queries.js';

export interface UsedToken {
  name: string;
  value: string;
}

interface RuleVariables {
  selector: string;
  names: string[];
}

const customPropertiesReadIn = (cssText: string) => [
  ...new Set(Array.from(cssText.matchAll(/var\(\s*(--[\w-]+)/g), (match) => match[1])),
];

const pseudoElementSelectors =
  /::?(?:before|after|marker|placeholder|selection|backdrop|first-line|first-letter|file-selector-button)\b|::[\w-]+(?:\([^)]*\))?/g;

function nestedSelectorInFull(selectorText: string, parentSelector: string): string {
  return selectorText.includes('&')
    ? selectorText.replaceAll('&', `:is(${parentSelector})`)
    : `:is(${parentSelector}) ${selectorText}`;
}

function matchesWhereTheEngineCanTest(element: Element, selector: string): boolean {
  try {
    return element.matches(selector);
  } catch {
    return false;
  }
}

let cachedUntilSheetsChange: { key: string; rules: RuleVariables[] } | null = null;

function rulesWithVariables(): RuleVariables[] {
  const sheets = Array.from(document.styleSheets);
  const key = styleSheetsVersion(sheets);
  if (cachedUntilSheetsChange?.key === key) return cachedUntilSheetsChange.rules;
  const rules: RuleVariables[] = [];
  const visit = (list: CSSRuleList, scope: string | null) => {
    for (const rule of Array.from(list)) {
      if (rule instanceof CSSStyleRule) {
        const selector = scope ? nestedSelectorInFull(rule.selectorText, scope) : rule.selectorText;
        const names = customPropertiesReadIn(rule.style.cssText);
        const selectorOfTheElementItself = selector.replace(pseudoElementSelectors, '');
        if (names.length) rules.push({ selector: selectorOfTheElementItself, names });
        if (rule.cssRules?.length) visit(rule.cssRules, selector);
      } else if ('cssRules' in rule) {
        const mediaQueryFails =
          rule instanceof CSSMediaRule && !window.matchMedia(rule.conditionText).matches;
        if (mediaQueryFails) continue;
        visit((rule as CSSGroupingRule).cssRules, scope);
      }
    }
  };
  for (const sheet of sheets) {
    const sheetRules = cssRulesUnlessCrossOrigin(sheet);
    if (sheetRules) visit(sheetRules, null);
  }
  cachedUntilSheetsChange = { key, rules };
  return rules;
}

export function tokensUsedBy(element: HTMLElement): UsedToken[] {
  const names = new Set<string>(customPropertiesReadIn(element.getAttribute('style') ?? ''));
  for (const rule of rulesWithVariables()) {
    if (matchesWhereTheEngineCanTest(element, rule.selector))
      for (const name of rule.names) names.add(name);
  }
  const style = getComputedStyle(element);
  return [...names]
    .filter((name) => name.startsWith('--env-'))
    .sort()
    .map((name) => ({ name, value: style.getPropertyValue(name).trim() }));
}
