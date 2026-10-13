/** A length for an inline style, where a bare number, also written as text such as "600", is pixels. */
export function cssLength(length: string | number) {
  const text = String(length).trim();
  return /^\d*\.?\d+$/.test(text) ? `${text}px` : text;
}
