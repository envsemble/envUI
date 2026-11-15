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

const maxHighlightedSourceLength = 50_000;
const maxHighlightedLineLength = 2_000;
const keepPlainSourceWhenHighlightingFails = () => {};

function givenStandardContrastTokens(source: string, language: string, highContrast: boolean) {
  return highContrast ? undefined : givenCodeTokens({ source, language });
}

export function useCodeHighlighting(source: string, language?: string, highContrast = false) {
  const resolvedLanguage = languageAliases[language?.toLowerCase() ?? ''];
  const eligible =
    Boolean(resolvedLanguage) &&
    source.length <= maxHighlightedSourceLength &&
    source.split(/\r\n|\r|\n/).every((line) => line.length <= maxHighlightedLineLength);
  const [result, setResult] = useState<{
    source: string;
    language: string;
    tokens: CodeToken[][];
  } | null>(() => {
    const tokens =
      eligible && resolvedLanguage
        ? givenStandardContrastTokens(source, resolvedLanguage, highContrast)
        : undefined;
    return tokens && resolvedLanguage ? { source, language: resolvedLanguage, tokens } : null;
  });
  useEffect(() => {
    if (!eligible || !resolvedLanguage) return;
    const tokens = givenStandardContrastTokens(source, resolvedLanguage, highContrast);
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
      .catch(keepPlainSourceWhenHighlightingFails);
    return () => {
      current = false;
    };
  }, [source, resolvedLanguage, eligible, highContrast]);
  return eligible && result?.source === source && result.language === resolvedLanguage
    ? result.tokens
    : null;
}
