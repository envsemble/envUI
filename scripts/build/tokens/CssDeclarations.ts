import { withoutComments } from '../../site/CssComments.ts';

interface CssDeclaration {
  property: string;
  value: string;
  atRules: string[];
  selector: string | undefined;
}

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
  for (const character of withoutComments(css)) {
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

const touchSizeMediaQueriesWithoutResolverModifier = ['(pointer: coarse)'];

const compact = (text: string) => text.replace(/\s+/g, '').toLowerCase();
const conditional = new Set(
  touchSizeMediaQueriesWithoutResolverModifier.map((query) => compact(`@media ${query}`)),
);

export function overridingCustomProperties(css: string) {
  return new Set(
    cssDeclarations(css)
      .filter(({ property }) => property.startsWith('--'))
      .filter(({ atRules }) => !atRules.some((prelude) => conditional.has(compact(prelude))))
      .map(({ property }) => property),
  );
}
