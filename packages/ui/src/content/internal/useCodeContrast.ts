'use client';

import { useEffect, useState, type RefObject } from 'react';
import { useTheme } from '../../foundations/Theme.js';
import type { CodeContrast } from './codeColors.js';

export function useCodeContrast(ref: RefObject<HTMLElement | null>): CodeContrast {
  const { contrast: themeContrast } = useTheme();
  const [contrast, setContrast] = useState<CodeContrast>(
    themeContrast === 'high' ? 'high' : 'standard',
  );
  useEffect(() => {
    const element = ref.current;
    const theme = element?.closest('.env-theme');
    const systemAsksForMoreContrast = window.matchMedia?.('(prefers-contrast: more)');
    const update = () => {
      const themeSetting = theme?.getAttribute('data-env-contrast');
      const followsSystem = themeSetting !== 'high' && themeSetting !== 'standard';
      setContrast(
        themeSetting === 'high' || (followsSystem && systemAsksForMoreContrast?.matches)
          ? 'high'
          : 'standard',
      );
    };
    update();
    systemAsksForMoreContrast?.addEventListener('change', update);
    const observer = new MutationObserver(update);
    if (theme)
      observer.observe(theme, { attributes: true, attributeFilter: ['data-env-contrast'] });
    return () => {
      systemAsksForMoreContrast?.removeEventListener('change', update);
      observer.disconnect();
    };
  }, [ref, themeContrast]);
  return contrast;
}
