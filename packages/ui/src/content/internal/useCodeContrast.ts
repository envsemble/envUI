'use client';

import { useEffect, useState, type RefObject } from 'react';
import { useTheme } from '../../foundations/Theme.js';
import type { CodeContrast } from './codeColors.js';
import { explicitContrasts, isOneOf, rootAttributes } from '../../internal/theme/themeRoot.js';

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
      const themeSetting = theme?.getAttribute(rootAttributes.contrast);
      const followsSystem = !isOneOf(explicitContrasts, themeSetting);
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
      observer.observe(theme, { attributes: true, attributeFilter: [rootAttributes.contrast] });
    return () => {
      systemAsksForMoreContrast?.removeEventListener('change', update);
      observer.disconnect();
    };
  }, [ref, themeContrast]);
  return contrast;
}
