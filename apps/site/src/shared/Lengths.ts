/**
 * The CSS pixels in one rem: the root element's font size, which the reader's browser and the
 * site's Display settings set. Read it when it is needed, since either can change it.
 */
export function remPixels() {
  return Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
}
