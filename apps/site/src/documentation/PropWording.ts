/*
 * The words of a Props table, which the packaged Markdown's Props sections (scripts/docs/Compiler.ts)
 * and the Docs' tables (apps/site/src/pages/docs/PropsTables.tsx) both write, as Markdown or as plain
 * text: a prop's description with when it is required or deprecated, and the elements whose native
 * props an export takes. It runs in Node and in the browser, so it imports nothing but types.
 */
import type { PropEntry } from './DocumentationTypes.ts';

/** Markdown, with code in backticks, or plain text, as the Docs' tables show it. */
type Wording = 'markdown' | 'text';

const orList = (items: string[]) =>
  items.length === 1 ? items[0] : `${items.slice(0, -1).join(', ')} or ${items.at(-1)}`;

/**
 * The description of a prop as its table shows it, with when it is required or deprecated; as
 * text, the condition it is required under loses its backticks.
 */
export function propDescription(prop: PropEntry, wording: Wording) {
  const when = wording === 'text' ? prop.requiredWhen?.replaceAll('`', '') : prop.requiredWhen;
  return [
    prop.deprecated ? `Deprecated${prop.deprecated === true ? '' : `: ${prop.deprecated}`}.` : '',
    when ? (when === 'in some forms' ? 'Required in some forms.' : `Required when ${when}.`) : '',
    prop.source === 'base-ui' ? 'Passed to Base UI.' : '',
    prop.description,
  ]
    .filter(Boolean)
    .join(' ');
}

/**
 * The sentence that names the elements whose native props an export takes, '' for none. The
 * packaged Markdown's index says once what native props are, so its sentence only names them; a
 * table in the Docs, read alone, says what they are each time.
 */
export function nativePropsSentence(elements: string[], wording: Wording) {
  if (!elements.length) return '';
  if (wording === 'markdown')
    return `Native props: ${orList(elements.map((element) => (element === 'element' ? 'HTML element' : `\`<${element}>\``)))}.`;
  const tags = elements.map((element) =>
    element === 'element' ? 'an HTML element' : `<${element}>`,
  );
  return `Also accepts the native props of ${orList(tags)}, such as ref, className and aria-* attributes.`;
}
