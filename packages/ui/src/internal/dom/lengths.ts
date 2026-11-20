/** A rem in pixels where the root's font size can't be read, as on the server: the browsers' default. */
export const defaultRemPixels = 16;

/** The root's font size in pixels, what a rem is, in the document of `element` or else this one. */
export function remPixels(element?: Element) {
  const root = (element?.ownerDocument ?? document).documentElement;
  return Number.parseFloat(getComputedStyle(root).fontSize) || defaultRemPixels;
}

/**
 * How far, in CSS pixels, a pointer moves with its button down before it drags what it pressed,
 * such as a tab, a list's row or a time wheel, rather than pressing it.
 */
export const dragThreshold = 4;

/** A computed length, such as `12.5px`, as its number of px; 0 for none, such as `auto`. */
export function pixelsOf(value: string) {
  const pixels = Number.parseFloat(value);
  return Number.isNaN(pixels) ? 0 : pixels;
}

/** A number to a hundredth, as sizes in rem are kept and reported. */
export const roundToHundredth = (value: number) => Math.round(value * 100) / 100;

/** A CSS length as given, or a bare number, also written as text such as "40", of rem. */
export function remLength(length: string | number) {
  const text = String(length).trim();
  return /^\d*\.?\d+$/.test(text) ? `${text}rem` : text;
}
