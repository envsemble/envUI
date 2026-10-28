'use client';

import { useEffect, useState, type RefObject } from 'react';
import { useTheme } from '../../foundations/Theme.js';
import type { CodeContrast } from './codeColors.js';

/**
 * The contrast of the nearest Theme around an element, as the style sheet reads it: high where it
 * says so, standard where it says so, and otherwise high while the system asks for more contrast.
 * Code loads its high-contrast themes, and Diffs takes its colors as themes rather than from the
 * style sheet, by this.
 */
export function useCodeContrast(ref: RefObject<HTMLElement | null>): CodeContrast {
  const { contrast: themeContrast } = useTheme();
  const [contrast, setContrast] = useState<CodeContrast>(
    themeContrast === 'high' ? 'high' : 'standard',
  );
  useEffect(() => {
    const element = ref.current;
    const theme = element?.closest('.env-theme');
    const media = window.matchMedia?.('(prefers-contrast: more)');
    const update = () => {
      const attribute = theme?.getAttribute('data-env-contrast');
      setContrast(
        attribute === 'high' || (attribute !== 'standard' && media?.matches) ? 'high' : 'standard',
      );
    };
    update();
    media?.addEventListener('change', update);
    const observer = new MutationObserver(update);
    if (theme)
      observer.observe(theme, { attributes: true, attributeFilter: ['data-env-contrast'] });
    return () => {
      media?.removeEventListener('change', update);
      observer.disconnect();
    };
  }, [ref, themeContrast]);
  return contrast;
}
