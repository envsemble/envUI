import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ThemeContrast } from '@envsemble/envui';
import type { LegendEntry } from './Figure';
import { remeasure } from '../../shared/Remeasure';

// What the figures of the Colors & themes foundation (Colors.tsx) share.

/** A figure's words, from the page's Markdown. */
export interface FigureWords {
  legend: readonly LegendEntry[];
}

/**
 * Whether the figure is narrower than a width in rem, by the width of its element: measured before
 * the figure is first painted, so it never shows its wide layout on a phone for a moment, which
 * its stage would keep the height of.
 */
export function useNarrow(width: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [narrow, setNarrow] = useState(false);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const measure = () => {
      const rem = parseFloat(getComputedStyle(element).fontSize) || 16;
      setNarrow(element.getBoundingClientRect().width < width * rem);
    };
    return remeasure(measure, { first: 'now', resize: [element] }).stop;
  }, [width]);
  return [ref, narrow] as const;
}

/**
 * Whether a Theme of this contrast shows the high-contrast colors: `high`, or `system` while the
 * system asks for more contrast, followed as it changes.
 */
export function useHighContrast(contrast: ThemeContrast) {
  const [system, setSystem] = useState(false);
  useEffect(() => {
    const query = matchMedia('(prefers-contrast: more)');
    const change = () => setSystem(query.matches);
    change();
    query.addEventListener('change', change);
    return () => query.removeEventListener('change', change);
  }, []);
  return contrast === 'high' || (contrast === 'system' && system);
}
