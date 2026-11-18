import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ThemeContrast } from '@envsemble/envui';
import type { LegendEntry } from './FoundationFrame';
import { remeasure } from '../../shared/Remeasure';

export interface FigureWords {
  legend: readonly LegendEntry[];
}

export function useNarrow(widthRem: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [narrow, setNarrow] = useState(false);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const measure = () => {
      const rem = parseFloat(getComputedStyle(element).fontSize) || 16;
      setNarrow(element.getBoundingClientRect().width < widthRem * rem);
    };
    return remeasure(measure, { first: 'now', resize: [element] }).stop;
  }, [widthRem]);
  return [ref, narrow] as const;
}

export function useHighContrast(contrast: ThemeContrast) {
  const [systemWantsMoreContrast, setSystemWantsMoreContrast] = useState(false);
  useEffect(() => {
    const query = matchMedia('(prefers-contrast: more)');
    const change = () => setSystemWantsMoreContrast(query.matches);
    change();
    query.addEventListener('change', change);
    return () => query.removeEventListener('change', change);
  }, []);
  return contrast === 'high' || (contrast === 'system' && systemWantsMoreContrast);
}
