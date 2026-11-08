/** The root's font size in pixels, what a rem is, in the document of `element` or else this one. */
export function remPixels(element?: Element) {
  const root = (element?.ownerDocument ?? document).documentElement;
  return Number.parseFloat(getComputedStyle(root).fontSize) || 16;
}

/** A number to a hundredth, as sizes in rem are kept and reported. */
export const roundToHundredth = (value: number) => Math.round(value * 100) / 100;

/** A CSS length as given, or a bare number, also written as text such as "40", of rem. */
export function remLength(length: string | number) {
  const text = String(length).trim();
  return /^\d*\.?\d+$/.test(text) ? `${text}rem` : text;
}
