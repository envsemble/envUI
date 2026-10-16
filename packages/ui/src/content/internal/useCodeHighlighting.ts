'use client';

import { useEffect, useState } from 'react';
import type { CodeToken } from './CodeHighlighting.js';

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

/** Render plain source on the server and first client render, then enrich it in place. */
export function useCodeHighlighting(source: string, language?: string) {
  const resolvedLanguage = languageAliases[language?.toLowerCase() ?? ''];
  const eligible =
    Boolean(resolvedLanguage) &&
    source.length <= 50_000 &&
    source.split(/\r\n|\r|\n/).every((line) => line.length <= 2_000);
  const [result, setResult] = useState<{
    source: string;
    language: string;
    tokens: CodeToken[][];
  } | null>(null);
  useEffect(() => {
    if (!eligible || !resolvedLanguage) return;
    let current = true;
    import('./CodeHighlighting.js')
      .then(({ highlightCode }) => (current ? highlightCode(source, resolvedLanguage) : null))
      .then((tokens) => {
        if (current && tokens) setResult({ source, language: resolvedLanguage, tokens });
      })
      .catch(() => {
        /* The original source stays visible if highlighting is unavailable. */
      });
    return () => {
      current = false;
    };
  }, [source, resolvedLanguage, eligible]);
  return eligible && result?.source === source && result.language === resolvedLanguage
    ? result.tokens
    : null;
}
