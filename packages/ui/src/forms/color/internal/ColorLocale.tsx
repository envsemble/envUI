'use client';

import type { ReactNode } from 'react';
import { I18nProvider } from '@react-aria/i18n';
import { useResolvedLocale } from '../../../internal/provider/useFormatters.js';

export function ColorLocale({ children }: { children: ReactNode }) {
  const locale = useResolvedLocale();
  return <I18nProvider locale={locale}>{children}</I18nProvider>;
}
