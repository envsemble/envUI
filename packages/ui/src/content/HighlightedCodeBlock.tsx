'use client';

import { Fragment, useRef } from 'react';
import { CodeBlockFrame } from './internal/CodeBlockFrame.js';
import { useCodeContrast } from './internal/useCodeContrast.js';
import { useCodeHighlighting } from './internal/useCodeHighlighting.js';
import type { CodeToken } from './internal/codeHighlighting.js';
import { tokenStyle } from './internal/codeTokenStyle.js';
import type { CodeBlockProps } from './CodeBlock.js';

export interface HighlightedCodeBlockProps extends CodeBlockProps {
  /**
   * The language to highlight: js, jsx, ts, tsx, java, json, html, xml, css, sql, sh, bash, yaml,
   * md or ini, or their full names. Other values, and none, leave the source plain text.
   */
  language?: string;
}

function Tokens({ source, tokens }: { source: string; tokens: CodeToken[][] }) {
  const lineEndings = source.match(/\r\n|\r|\n/g) ?? [];
  return tokens.map((line, index) => (
    <Fragment key={index}>
      {line.map((token, tokenIndex) => (
        <span key={tokenIndex} style={tokenStyle(token)} className="env-code-block-token">
          {token.content}
        </span>
      ))}
      {lineEndings[index] ?? ''}
    </Fragment>
  ));
}

/**
 * Source with its syntax colored, in the code theme of the app theme, with that code theme's own
 * colors; copy always uses the original string. The highlighter loads with the first block that
 * names a language it knows. For a command or output, CodeBlock shows plain text without it.
 */
export function HighlightedCodeBlock({
  children: source,
  language,
  label,
  headerEnd,
  copyable = false,
  wrap = false,
  ...props
}: HighlightedCodeBlockProps) {
  const preRef = useRef<HTMLPreElement>(null);
  const contrast = useCodeContrast(preRef);
  const tokens = useCodeHighlighting(source, language, contrast === 'high');
  return (
    <CodeBlockFrame
      {...props}
      source={source}
      language={language}
      label={label}
      headerEnd={headerEnd}
      copyable={copyable}
      wrap={wrap}
      preRef={preRef}
    >
      {tokens ? <Tokens source={source} tokens={tokens} /> : source}
    </CodeBlockFrame>
  );
}
