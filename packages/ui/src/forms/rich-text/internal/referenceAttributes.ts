import type { RichTextReference } from '../types.js';

export function referenceFromAttributes(attributes: Record<string, unknown>): RichTextReference {
  return {
    id: String(attributes.id ?? ''),
    label: String(attributes.label ?? attributes.id ?? ''),
    kind: typeof attributes.kind === 'string' ? attributes.kind : undefined,
    href: typeof attributes.href === 'string' ? attributes.href : undefined,
    trigger: String(attributes.mentionSuggestionChar ?? ''),
  };
}

export function safeRichTextUrl(url: unknown): boolean {
  if (typeof url !== 'string') return false;
  // eslint-disable-next-line no-control-regex
  const withoutCharactersBrowsersIgnoreInSchemes = url.replace(/[\u0000-\u0020\u007f-\u009f]/g, '');
  const relative = !/^[a-z][a-z\d+.-]*:/i.test(withoutCharactersBrowsersIgnoreInSchemes);
  const webMailOrTelephone = /^(https?:|mailto:|tel:)/i.test(
    withoutCharactersBrowsersIgnoreInSchemes,
  );
  return withoutCharactersBrowsersIgnoreInSchemes.length > 0 && (relative || webMailOrTelephone);
}
