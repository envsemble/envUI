// Reading the declarations of a style sheet: what Tokens.css declares in each theme rule, and the
// custom properties TokensHandwritten.css would replace a token with.

interface CssDeclaration {
  property: string;
  value: string;
  /** The preludes of the at-rules around the declaration, outermost first. */
  atRules: string[];
  /** The selector of its rule: the innermost, since nested style rules are not read apart. */
  selector: string | undefined;
}

/**
 * The declarations of a style sheet, each with its property, its value, the preludes of the
 * at-rules around it (outermost first) and the selector of its rule, with whitespace collapsed.
 * Comments are dropped; quoted strings and parentheses are read whole, so a `;` or a brace inside
 * them ends nothing. Nested style rules are not read apart: a declaration takes the innermost
 * selector.
 */
export function cssDeclarations(css: string) {
  const declarations: CssDeclaration[] = [];
  const blocks: { prelude: string; atRule: boolean }[] = [];
  let text = '';
  let quote: string | null = null;
  let depth = 0;
  const end = () => {
    const match = text.match(/^\s*(--[\w-]+|-?[A-Za-z][\w-]*)\s*:([\s\S]*)$/);
    if (match && blocks.length > 0)
      declarations.push({
        property: match[1],
        value: match[2].trim(),
        atRules: blocks.filter((block) => block.atRule).map((block) => block.prelude),
        selector: blocks.findLast((block) => !block.atRule)?.prelude,
      });
    text = '';
  };
  for (const character of css.replace(/\/\*[\s\S]*?\*\//g, '')) {
    if (quote) {
      if (character === quote) quote = null;
      text += character;
    } else if (character === '"' || character === "'") {
      quote = character;
      text += character;
    } else if (character === '(' || (character === ')' && depth > 0) || depth > 0) {
      depth += character === '(' ? 1 : character === ')' ? -1 : 0;
      text += character;
    } else if (character === '{') {
      const prelude = text.trim().replace(/\s+/g, ' ');
      blocks.push({ prelude, atRule: prelude.startsWith('@') });
      text = '';
    } else if (character === '}') {
      end();
      blocks.pop();
    } else if (character === ';') end();
    else text += character;
  }
  return declarations;
}

/**
 * The media queries under which TokensHandwritten.css may change a token's value: the touch sizes
 * under a coarse pointer, which the resolver has no modifier for. Only these: a token's value in
 * another condition, such as `prefers-contrast: more`, belongs in the tokens, where the token list
 * sees it, and a declaration under any other at-rule (`@layer`, `@supports`, `@container`,
 * another media query or a list of them) can apply in every theme, so it replaces the token.
 */
const conditionalMediaQueries = ['(pointer: coarse)'];

const compact = (text: string) => text.replace(/\s+/g, '').toLowerCase();
const conditional = new Set(conditionalMediaQueries.map((query) => compact(`@media ${query}`)));

/**
 * The custom properties a style sheet declares that replace a token wherever they apply: every
 * declaration, in any rule, except under a media query of conditionalMediaQueries.
 */
export function overridingCustomProperties(css: string) {
  return new Set(
    cssDeclarations(css)
      .filter(({ property }) => property.startsWith('--'))
      .filter(({ atRules }) => !atRules.some((prelude) => conditional.has(compact(prelude))))
      .map(({ property }) => property),
  );
}
