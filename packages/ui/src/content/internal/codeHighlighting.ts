import { createHighlighterCore, type HighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
import javascript from '@shikijs/langs/javascript';
import jsx from '@shikijs/langs/jsx';
import typescript from '@shikijs/langs/typescript';
import tsx from '@shikijs/langs/tsx';
import java from '@shikijs/langs/java';
import json from '@shikijs/langs/json';
import html from '@shikijs/langs/html';
import css from '@shikijs/langs/css';
import sql from '@shikijs/langs/sql';
import shell from '@shikijs/langs/shellscript';
import yaml from '@shikijs/langs/yaml';
import markdown from '@shikijs/langs/markdown';
import ini from '@shikijs/langs/ini';
import { codeThemeName } from './codeColors.js';
import { codeTheme } from './codeThemes.js';

export interface CodeTokenStyle {
  color?: string;
  fontStyle?: number;
}
/**
 * A token with its style in each code theme: standard, and `High` for high contrast, which a token
 * may lack; it then keeps its standard color.
 */
export interface CodeToken {
  content: string;
  light: CodeTokenStyle;
  dark: CodeTokenStyle;
  lightHigh?: CodeTokenStyle;
  darkHigh?: CodeTokenStyle;
}

/** The code themes tokens carry, by the key of their style: standard, and high contrast on request. */
const themes = {
  standard: { light: () => codeTheme('light'), dark: () => codeTheme('dark') },
  high: { lightHigh: () => codeTheme('light', 'high'), darkHigh: () => codeTheme('dark', 'high') },
};

let highlighter: Promise<HighlighterCore> | undefined;
let highContrastLoaded: Promise<void> | undefined;
const cache = new Map<string, CodeToken[][]>();
let cachedCharacters = 0;

/**
 * One runtime and a bounded cache for the explicitly bundled languages. Tokens carry their
 * high-contrast styles only when `highContrast` asks for them: the high-contrast themes load then.
 */
export async function highlightCode(
  source: string,
  language: string,
  highContrast = false,
): Promise<CodeToken[][]> {
  const key = `${highContrast ? 'high' : 'standard'}\0${language}\0${source}`;
  const existing = cache.get(key);
  if (existing) return existing;
  highlighter ??= (async () =>
    createHighlighterCore({
      engine: createJavaScriptRegexEngine(),
      themes: await Promise.all(Object.values(themes.standard).map((theme) => theme())),
      langs: [
        javascript,
        jsx,
        typescript,
        tsx,
        java,
        json,
        html,
        css,
        sql,
        shell,
        yaml,
        markdown,
        ini,
      ],
    }))().catch((error: unknown) => {
    highlighter = undefined;
    throw error;
  });
  const runtime = await highlighter;
  if (highContrast) {
    highContrastLoaded ??= Promise.all(Object.values(themes.high).map((theme) => theme()))
      .then((loaded) => runtime.loadTheme(...loaded))
      .catch((error: unknown) => {
        highContrastLoaded = undefined;
        throw error;
      });
    await highContrastLoaded;
  }
  // Another consumer may have filled the cache while this shared runtime initialized.
  const initialized = cache.get(key);
  if (initialized) return initialized;
  const names: Record<string, string> = {
    light: codeThemeName('light', 'standard'),
    dark: codeThemeName('dark', 'standard'),
    ...(highContrast && {
      lightHigh: codeThemeName('light', 'high'),
      darkHigh: codeThemeName('dark', 'high'),
    }),
  };
  const tokens = runtime
    .codeToTokensWithThemes(source, { lang: language, themes: names })
    .map((line) =>
      line.map((token) => ({
        content: token.content,
        light: token.variants.light,
        dark: token.variants.dark,
        lightHigh: token.variants.lightHigh,
        darkHigh: token.variants.darkHigh,
      })),
    );
  cache.set(key, tokens);
  cachedCharacters += key.length;
  while (cache.size > 40 || cachedCharacters > 500_000) {
    const oldest = cache.keys().next().value;
    if (oldest === undefined) break;
    cachedCharacters -= oldest.length;
    cache.delete(oldest);
  }
  return tokens;
}
