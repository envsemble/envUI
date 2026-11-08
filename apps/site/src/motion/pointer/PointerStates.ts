/*
 * The states a stylesheet shows under a real pointer, `:hover`, `:active` and `:focus`, which no
 * event can set. The virtual pointer (VirtualPointer.ts) marks what it is over, presses and focuses
 * with these attributes instead, and mirrorPointerStates gives every such rule in the site's
 * stylesheets a copy that matches the attributes.
 */

export const hoverMark = 'data-catalogue-hover';
export const pressMark = 'data-catalogue-pressed';
export const focusMark = 'data-catalogue-focus';
export const focusWithinMark = 'data-catalogue-focus-within';

/**
 * Sets or clears one of the pointer's marks on an element, unless the element is inside an editable
 * region. An editor such as ProseMirror redraws what changes in its document, so a mark inside it
 * would replace the very element being pressed. The editor's frame, which is outside, still shows
 * hover and focus.
 */
export function mark(element: Element, name: string, on: boolean) {
  if (element.closest('[contenteditable="true"]')) return;
  element.toggleAttribute(name, on);
}

/** The attribute that stands in for each state. */
const marks = {
  hover: hoverMark,
  active: pressMark,
  'focus-visible': focusMark,
  'focus-within': focusWithinMark,
  focus: focusMark,
};

/** The site's rules for :hover and :active, rewritten for the pointer's marks. */
const mirror = typeof CSSStyleSheet === 'undefined' ? null : new CSSStyleSheet();
let mirroredSheets = -1;

/** Rewrites a rule's text inside the group rules around it, such as @media and @layer. */
type Wrap = (text: string) => string;

function mirrorRules(rules: CSSRuleList, out: string[], wrap: Wrap) {
  for (const rule of rules) {
    if (rule instanceof CSSStyleRule) {
      const selector = rule.selectorText;
      if (!/:(hover|active|focus)/.test(selector)) continue;
      // A rule for an element that isn't hovered would still match the marked element, such as a
      // labelled field's placeholder hidden while the field isn't focused, so its selector also
      // gets the marks.
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

/**
 * Gives every :hover and :active rule in the site's stylesheets a copy for the virtual pointer's
 * marks, in a stylesheet of its own after them, so a marked element looks as hovered or pressed as
 * it would under a real pointer. It writes them again when stylesheets are added, as when a page
 * loads.
 */
export function mirrorPointerStates() {
  if (!mirror || document.styleSheets.length === mirroredSheets) return;
  mirroredSheets = document.styleSheets.length;
  const rules: string[] = [];
  for (const sheet of document.styleSheets) {
    try {
      mirrorRules(sheet.cssRules, rules, (text) => text);
    } catch {
      // A stylesheet from another origin can't be read; the site has none with these states.
    }
  }
  mirror.replaceSync(rules.join('\n'));
  if (!document.adoptedStyleSheets.includes(mirror))
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, mirror];
}
