/** A CSS length as given, or a bare number, also written as text such as "40", of rem. */
export function remLength(length: string | number) {
  const text = String(length).trim();
  return /^\d*\.?\d+$/.test(text) ? `${text}rem` : text;
}

/** A length for an inline style, where a bare number, also written as text such as "600", is pixels. */
export function cssLength(length: string | number) {
  const text = String(length).trim();
  return /^\d*\.?\d+$/.test(text) ? `${text}px` : text;
}
