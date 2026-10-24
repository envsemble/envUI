'use client';

import type { ReactNode } from 'react';
import { I18nProvider } from '@react-aria/i18n';
import { useResolvedLocale } from '../../internal/useFormatters.js';
import type { Color } from '@react-stately/color';
import { formatColor, type ColorFormat } from './colorValue.js';

/**
 * React Aria's locale, for the names of channels and colors and the numbers in fields: the nearest
 * EnvUIProvider's, as every envUI component formats in.
 */
export function ColorLocale({ children }: { children: ReactNode }) {
  const locale = useResolvedLocale();
  return <I18nProvider locale={locale}>{children}</I18nProvider>;
}

/** A color as people read it in a format: hex in capitals, such as #6750A4, rgb() or hsl(). */
export function displayColor(color: Color, format: ColorFormat) {
  const text = formatColor(color, format);
  return format === 'hex' ? text.toUpperCase() : text;
}
