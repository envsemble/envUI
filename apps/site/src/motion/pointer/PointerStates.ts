export const hoverMark = 'data-catalogue-hover';
export const pressMark = 'data-catalogue-pressed';
export const focusMark = 'data-catalogue-focus';
export const focusWithinMark = 'data-catalogue-focus-within';

export function mark(element: Element, name: string, on: boolean) {
  if (element.closest('[contenteditable="true"]')) return;
  element.toggleAttribute(name, on);
}

const marks = {
  hover: hoverMark,
  active: pressMark,
  'focus-visible': focusMark,
  'focus-within': focusWithinMark,
  focus: focusMark,
};

const mirror = typeof CSSStyleSheet === 'undefined' ? null : new CSSStyleSheet();
let mirroredSheets = -1;

type Wrap = (text: string) => string;

function mirrorRules(rules: CSSRuleList, out: string[], wrap: Wrap) {
  for (const rule of rules) {
    if (rule instanceof CSSStyleRule) {
      const selector = rule.selectorText;
      if (!/:(hover|active|focus)/.test(selector)) continue;
      if (/:not\([^)]*:(hover|active|focus)/.test(selector)) {
        if (!selector.includes('data-catalogue-'))
          rule.selectorText = selector.replace(
            /:(hover|active|focus-visible|focus-within|focus)\b(?!-)/g,
            (state, name: keyof typeof marks) => `:is(${state}, [${marks[name]}])`,
          );
        continue;
      }
      const marked = selector
        .replace(/:hover\b/g, `[${hoverMark}]`)
        .replace(/:active\b/g, `[${pressMark}]`)
        .replace(/:focus-visible\b/g, `[${focusMark}]`)
        .replace(/:focus-within\b/g, `[${focusWithinMark}]`)
        .replace(/:focus\b(?!-)/g, `[${focusMark}]`);
      out.push(wrap(`${marked} { ${rule.style.cssText} }`));
    } else if (rule instanceof CSSMediaRule || rule instanceof CSSSupportsRule) {
      const at = rule instanceof CSSMediaRule ? '@media' : '@supports';
      mirrorRules(rule.cssRules, out, (text) => wrap(`${at} ${rule.conditionText} { ${text} }`));
    } else if (typeof CSSContainerRule !== 'undefined' && rule instanceof CSSContainerRule) {
      mirrorRules(rule.cssRules, out, (text) =>
        wrap(`@container ${rule.conditionText} { ${text} }`),
      );
    } else if (typeof CSSLayerBlockRule !== 'undefined' && rule instanceof CSSLayerBlockRule) {
      mirrorRules(rule.cssRules, out, (text) => wrap(`@layer ${rule.name} { ${text} }`));
    }
  }
}

export function mirrorPointerStates() {
  if (!mirror || document.styleSheets.length === mirroredSheets) return;
  mirroredSheets = document.styleSheets.length;
  const rules: string[] = [];
  for (const sheet of document.styleSheets) {
    try {
      mirrorRules(sheet.cssRules, rules, (text) => text);
    } catch {
      continue;
    }
  }
  mirror.replaceSync(rules.join('\n'));
  if (!document.adoptedStyleSheets.includes(mirror))
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, mirror];
}
