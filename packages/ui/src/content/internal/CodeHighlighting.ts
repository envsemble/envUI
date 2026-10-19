import { createHighlighterCore } from 'shiki/core';
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
import { codeTheme } from './CodeThemes.js';

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

/** The code themes every token carries, by the key of its style. */
const themes = {
  light: () => codeTheme('light'),
  dark: () => codeTheme('dark'),
  lightHigh: () => codeTheme('light', 'high'),
  darkHigh: () => codeTheme('dark', 'high'),
};

let highlighter: ReturnType<typeof createHighlighterCore> | undefined;
const cache = new Map<string, CodeToken[][]>();
let cachedCharacters = 0;

/** One runtime and a bounded cache for the explicitly bundled languages. */
export async function highlightCode(source: string, language: string): Promise<CodeToken[][]> {
  const key = `${language}\0${source}`;
  const existing = cache.get(key);
  if (existing) return existing;
  highlighter ??= createHighlighterCore({
    engine: createJavaScriptRegexEngine(),
    themes: Object.values(themes).map((theme) => theme()),
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
  });
  const runtime = await highlighter;
  // Another consumer may have filled the cache while this shared runtime initialized.
  const initialized = cache.get(key);
  if (initialized) return initialized;
  const tokens = runtime
    .codeToTokensWithThemes(source, {
      lang: language,
      themes: Object.fromEntries(
        Object.entries(themes).map(([key, theme]) => [key, theme().name!]),
      ),
    })
    .map((line) =>
      line.map((token) => ({
        content: token.content,
        light: token.variants.light!,
        dark: token.variants.dark!,
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
