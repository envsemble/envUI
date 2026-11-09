'use client';

import { useEffect, useState } from 'react';
import type { CodeToken } from './codeHighlighting.js';
import { givenCodeTokens } from './givenCodeTokens.js';

const languageAliases: Record<string, string> = {
  js: 'javascript',
  javascript: 'javascript',
  jsx: 'jsx',
  ts: 'typescript',
  typescript: 'typescript',
  tsx: 'tsx',
  java: 'java',
  json: 'json',
  html: 'html',
  xml: 'html',
  css: 'css',
  sql: 'sql',
  sh: 'shellscript',
  bash: 'shellscript',
  shell: 'shellscript',
  shellscript: 'shellscript',
  yml: 'yaml',
  yaml: 'yaml',
  md: 'markdown',
  markdown: 'markdown',
  ini: 'ini',
};

/**
 * Render plain source on the server and first client render, then enrich it in place: with the
 * high-contrast colors too where `highContrast` asks for them. Source whose tokens were given
 * (givenCodeTokens.ts) renders highlighted from the first render.
 */
export function useCodeHighlighting(source: string, language?: string, highContrast = false) {
  const resolvedLanguage = languageAliases[language?.toLowerCase() ?? ''];
  const eligible =
    Boolean(resolvedLanguage) &&
    source.length <= 50_000 &&
    source.split(/\r\n|\r|\n/).every((line) => line.length <= 2_000);
  const [result, setResult] = useState<{
    source: string;
    language: string;
    tokens: CodeToken[][];
  } | null>(() => {
    const tokens =
      eligible && resolvedLanguage && !highContrast
        ? givenCodeTokens({ source, language: resolvedLanguage })
        : undefined;
    return tokens && resolvedLanguage ? { source, language: resolvedLanguage, tokens } : null;
  });
  useEffect(() => {
    if (!eligible || !resolvedLanguage) return;
    const tokens = highContrast
      ? undefined
      : givenCodeTokens({ source, language: resolvedLanguage });
    if (tokens) {
      setResult((shown) =>
        shown?.tokens === tokens ? shown : { source, language: resolvedLanguage, tokens },
      );
      return;
    }
    let current = true;
    import('./codeHighlighting.js')
      .then(({ highlightCode }) =>
        current ? highlightCode(source, resolvedLanguage, highContrast) : null,
      )
      .then((tokens) => {
        if (current && tokens) setResult({ source, language: resolvedLanguage, tokens });
      })
      .catch(() => {
        /* The original source stays visible if highlighting is unavailable. */
      });
    return () => {
      current = false;
    };
  }, [source, resolvedLanguage, eligible, highContrast]);
  return eligible && result?.source === source && result.language === resolvedLanguage
    ? result.tokens
    : null;
}
