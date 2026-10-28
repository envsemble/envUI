import type { RichTextReference } from '../types.js';

export function referenceFromAttributes(attributes: Record<string, unknown>): RichTextReference {
  return {
    id: String(attributes.id ?? ''),
    label: String(attributes.label ?? attributes.id ?? ''),
    kind: typeof attributes.kind === 'string' ? attributes.kind : undefined,
    href: typeof attributes.href === 'string' ? attributes.href : undefined,
    char: String(attributes.mentionSuggestionChar ?? ''),
  };
}

/** Relative paths and ordinary web/mail/telephone URLs; no domain-specific schemes. */
export function safeRichTextUrl(url: unknown): boolean {
  if (typeof url !== 'string') return false;
  // Strips control characters and spaces, which browsers ignore inside a URL scheme.
  // eslint-disable-next-line no-control-regex
  const normalized = url.replace(/[\u0000-\u0020\u007f-\u009f]/g, '');
  return (
    normalized.length > 0 &&
    (!/^[a-z][a-z\d+.-]*:/i.test(normalized) || /^(https?:|mailto:|tel:)/i.test(normalized))
  );
}
