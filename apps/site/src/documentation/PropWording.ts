import type { PropEntry } from './DocumentationTypes.ts';

type Wording = 'markdown' | 'text';

const orList = (items: string[]) =>
  items.length === 1 ? items[0] : `${items.slice(0, -1).join(', ')} or ${items.at(-1)}`;

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

export function nativePropsSentence(elements: string[], wording: Wording) {
  if (!elements.length) return '';
  if (wording === 'markdown')
    return `Native props: ${orList(elements.map((element) => (element === 'element' ? 'HTML element' : `\`<${element}>\``)))}.`;
  const tags = elements.map((element) =>
    element === 'element' ? 'an HTML element' : `<${element}>`,
  );
  return `Also accepts the native props of ${orList(tags)}, such as ref, className and aria-* attributes.`;
}
