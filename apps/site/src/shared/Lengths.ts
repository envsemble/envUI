const browserDefaultFontPx = 16;

export function remPixels(element?: Element) {
  const root = (element?.ownerDocument ?? document).documentElement;
  return Number.parseFloat(getComputedStyle(root).fontSize) || browserDefaultFontPx;
}
