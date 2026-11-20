'use client';

import type { ReactNode } from 'react';
import { I18nProvider } from '@react-aria/i18n';
import { useResolvedLocale } from '../../../internal/provider/locale.js';
import type { Color } from '@react-stately/color';
import { formatColor, type ColorFormat } from './colorValue.js';

export function ColorLocale({ children }: { children: ReactNode }) {
  const locale = useResolvedLocale();
  return <I18nProvider locale={locale}>{children}</I18nProvider>;
}

export function displayColor(color: Color, format: ColorFormat) {
  const text = formatColor(color, format);
  return format === 'hex' ? text.toUpperCase() : text;
}
