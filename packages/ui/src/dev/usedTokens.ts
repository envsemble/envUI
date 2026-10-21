// The tokens an element's styles use: the custom properties its matching style rules, and its
// own style attribute, read with var(). Read for one element at a time, the selected one.

/** A custom property an element's styles read, and its value there now. */
export interface UsedToken {
  name: string;
  value: string;
}

interface RuleVariables {
  selector: string;
  names: string[];
}

/** The custom properties a declaration block reads. */
export const variablesIn = (cssText: string) => [
  ...new Set(Array.from(cssText.matchAll(/var\(\s*(--[\w-]+)/g), (match) => match[1])),
];

const pseudoElements =
  /::?(?:before|after|marker|placeholder|selection|backdrop|first-line|first-letter|file-selector-button)\b|::[\w-]+(?:\([^)]*\))?/g;

let cached: { key: string; rules: RuleVariables[] } | null = null;

/** Every style rule that reads a custom property, with its selector; kept until the sheets change. */
function rulesWithVariables(): RuleVariables[] {
  const sheets = Array.from(document.styleSheets);
  const key = sheets
    .map((sheet) => {
      try {
        return `${sheet.href ?? 'inline'}:${sheet.cssRules.length}`;
      } catch {
        return 'foreign';
      }
    })
    .join('|');
  if (cached?.key === key) return cached.rules;
  const rules: RuleVariables[] = [];
  const visit = (list: CSSRuleList, scope: string | null) => {
    for (const rule of Array.from(list)) {
      if (rule instanceof CSSStyleRule) {
        // A nested rule's selector is relative to its parent's; `&` stands for it.
        const selector =
          scope && rule.selectorText.includes('&')
            ? rule.selectorText.replaceAll('&', `:is(${scope})`)
            : scope
              ? `:is(${scope}) ${rule.selectorText}`
              : rule.selectorText;
        const names = variablesIn(rule.style.cssText);
        // What a pseudo-element of an element reads counts as the element's own.
        if (names.length) rules.push({ selector: selector.replace(pseudoElements, ''), names });
        if (rule.cssRules?.length) visit(rule.cssRules, selector);
      } else if ('cssRules' in rule) {
        if (rule instanceof CSSMediaRule && !window.matchMedia(rule.conditionText).matches)
          continue;
        visit((rule as CSSGroupingRule).cssRules, scope);
      }
    }
  };
  for (const sheet of sheets) {
    try {
      visit(sheet.cssRules, null);
    } catch {
      // A style sheet from another origin can't be read.
    }
  }
  cached = { key, rules };
  return rules;
}

/**
 * The `--env-*` custom properties an element's styles read, with their values on it now: from the
 * style rules it matches (those in container queries included, whether or not they hold) and its
 * style attribute.
 */
export function tokensUsedBy(element: HTMLElement): UsedToken[] {
  const names = new Set<string>(variablesIn(element.getAttribute('style') ?? ''));
  for (const rule of rulesWithVariables()) {
    let matches = false;
    try {
      matches = element.matches(rule.selector);
    } catch {
      // A selector this engine can't test, such as one with a pseudo-element.
    }
    if (matches) for (const name of rule.names) names.add(name);
  }
  const style = getComputedStyle(element);
  return [...names]
    .filter((name) => name.startsWith('--env-'))
    .sort()
    .map((name) => ({ name, value: style.getPropertyValue(name).trim() }));
}
