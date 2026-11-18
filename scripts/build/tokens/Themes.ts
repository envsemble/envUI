import type { TokenNormalized } from '@terrazzo/parser';
import { makeCSSVar } from '@terrazzo/token-tools/css';

export const envuiExtensions = (token: TokenNormalized) =>
  (token.$extensions?.['com.envsemble.envui'] ?? {}) as {
    lineHeightUnit?: string;
    cssUnit?: string;
    component?: string;
  };

export const prefix = 'env';

export const cssVariable = (id: string) => makeCSSVar(id, { prefix });

export const internalGroups = ['palette', 'contrast-high'];
export const isInternal = (id: string) => internalGroups.includes(id.split('.')[0]);

export const isSemanticColor = (id: string) => /^color\.(bg|fg|border)\./.test(id);

interface MediaRule {
  query: string;
  selector: string;
}

interface Scale {
  name: string;
  input: Record<string, string>;
  selector?: string;
  media?: MediaRule;
}

export const scales: Scale[] = [
  { name: 'comfortable', input: { scale: 'comfortable' } },
  {
    name: 'compact',
    input: { scale: 'compact' },
    selector: ".env-theme[data-env-scale='compact']",
    media: {
      query: '(pointer: fine)',
      selector: ".env-theme:not([data-env-scale='comfortable'])",
    },
  },
];

export const scaleRules = scales.filter(
  (scale): scale is Scale & { selector: string } => scale.selector !== undefined,
);

export type ThemeName = 'light' | 'dark' | 'light-high-contrast' | 'dark-high-contrast';

interface Theme {
  name: ThemeName;
  input: Record<string, string>;
  selectors: string[];
  media?: MediaRule;
}

export const themes: Theme[] = [
  {
    name: 'light',
    input: { colorScheme: 'light', contrast: 'standard' },
    selectors: ['.env-theme'],
  },
  {
    name: 'dark',
    input: { colorScheme: 'dark', contrast: 'standard' },
    selectors: [".env-theme[data-env-theme='dark']"],
  },
  {
    name: 'light-high-contrast',
    input: { colorScheme: 'light', contrast: 'high' },
    selectors: [".env-theme[data-env-contrast='high']"],
    media: {
      query: '(prefers-contrast: more)',
      selector: ".env-theme:not([data-env-contrast='standard'])",
    },
  },
  {
    name: 'dark-high-contrast',
    input: { colorScheme: 'dark', contrast: 'high' },
    selectors: [".env-theme[data-env-theme='dark'][data-env-contrast='high']"],
    media: {
      query: '(prefers-contrast: more)',
      selector: ".env-theme[data-env-theme='dark']:not([data-env-contrast='standard'])",
    },
  },
];
