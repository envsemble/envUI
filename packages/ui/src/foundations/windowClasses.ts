import { remPixels } from '../internal/dom/lengths.js';

/**
 * The window classes: ranges of a container's width at which arrangement may change, each given by
 * the width where it starts. compact is narrower than 37.5 rem, medium from 37.5 rem, expanded from
 * 52.5 rem and large from 75 rem (600, 840 and 1200 px at a 16 px root).
 *
 * envUI measures them on a container, never on the viewport: the outermost theme boundary is the
 * `env-window` container. Style sheets write compact first and switch up, as in
 * `@container env-window (width >= 37.5rem)`, so content without a window stays compact. CSS can't
 * read a custom property inside a query, so they write these widths literally; the
 * `--env-window-class-*` tokens hold the same values.
 */
export const windowClasses = {
  compact: '0rem',
  medium: '37.5rem',
  expanded: '52.5rem',
  large: '75rem',
} as const;

/** A window class: compact (< 37.5 rem), medium (< 52.5 rem), expanded (< 75 rem) or large. */
export type WindowClass = keyof typeof windowClasses;

/**
 * The window class of a width in CSS pixels, such as useContainerSize's inlineSize, at the
 * document's root font size, as the window classes are in rem. Prefer a container query where only
 * styles change.
 *
 *   const size = useContainerSize(panel);
 *   const compact = size !== undefined && windowClassOf(size.inlineSize) === 'compact';
 */
export function windowClassOf(inlineSize: number): WindowClass {
  const rem = inlineSize / remPixels();
  let found: WindowClass = 'compact';
  // Object.entries types its keys as any string; these are windowClasses' own, from compact up.
  for (const [name, start] of Object.entries(windowClasses) as [WindowClass, string][])
    if (rem >= Number.parseFloat(start)) found = name;
  return found;
}
