'use client';

import { Fragment, useEffect, useRef, useState, type ComponentPropsWithRef } from 'react';
import { IconButton } from '../actions/Button.js';
import { ContentCopy } from '../icons/ContentCopy.js';
import { Check } from '../icons/Check.js';
import { useTheme } from '../foundations/Theme.js';
import { classNames } from '../internal/classNames.js';
import { codeThemeStyle } from './internal/CodeThemes.js';
import { useCodeHighlighting } from './internal/useCodeHighlighting.js';
import { tokenStyle } from './internal/codeTokenStyle.js';

export interface CodeBlockProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** The source, as one string; it is shown, highlighted and copied as it is. */
  children: string;
  /**
   * The language to highlight: js, jsx, ts, tsx, java, json, html, xml, css, sql, sh, bash, yaml,
   * md or ini, or their full names. Other values, and none, leave the source plain text.
   */
  language?: string;
  /** Names the block in its heading and for assistive technology, such as a file name. */
  label?: string;
  /** Shows a copy button in the heading that copies the source; false by default. */
  copyable?: boolean;
  /** Wraps long lines instead of scrolling them; false by default. */
  wrap?: boolean;
}

/**
 * Source display in the code theme of the app theme, with that code theme's own colors; copy always
 * uses the original string.
 */
export function CodeBlock({
  children: source,
  language,
  label,
  copyable = false,
  wrap = false,
  className,
  style,
  ...props
}: CodeBlockProps) {
  const { theme } = useTheme();
  const tokens = useCodeHighlighting(source, language);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'unavailable'>('idle');
  const preRef = useRef<HTMLPreElement>(null);
  useEffect(() => {
    if (copyStatus === 'idle') return;
    const timeout = setTimeout(() => setCopyStatus('idle'), 3_000);
    return () => clearTimeout(timeout);
  }, [copyStatus]);
  useEffect(() => setCopyStatus('idle'), [source]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(source);
      setCopyStatus('copied');
    } catch {
      const pre = preRef.current;
      if (pre) {
        const range = pre.ownerDocument.createRange();
        range.selectNodeContents(pre);
        const selection = pre.ownerDocument.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
      setCopyStatus('unavailable');
    }
  }
  const lineEndings = source.match(/\r\n|\r|\n/g) ?? [];
  return (
    <div
      {...props}
      className={classNames('env-code-block', className)}
      data-wrap={wrap || undefined}
      style={{ ...codeThemeStyle(theme), ...style }}
    >
      {(label || copyable) && (
        <div className="env-code-block-heading">
          <span>{label ?? language ?? 'Code'}</span>
          {copyable && (
            <IconButton
              variant="ghost"
              icon={copyStatus === 'copied' ? <Check /> : <ContentCopy />}
              aria-label={copyStatus === 'copied' ? 'Code copied' : 'Copy code'}
              onClick={copy}
            />
          )}
        </div>
      )}
      <pre ref={preRef} tabIndex={0} aria-label={label ?? `${language ?? 'Plain text'} code`}>
        <code>
          {tokens
            ? tokens.map((line, index) => (
                <Fragment key={index}>
                  {line.map((token, tokenIndex) => (
                    <span key={tokenIndex} style={tokenStyle(token[theme], token[`${theme}High`])}>
                      {token.content}
                    </span>
                  ))}
                  {lineEndings[index] ?? ''}
                </Fragment>
              ))
            : source}
        </code>
      </pre>
      {copyable && (
        <span className="env-code-copy-status" role="status">
          {copyStatus === 'copied'
            ? 'Copied.'
            : copyStatus === 'unavailable'
              ? 'Code selected. Use your keyboard or context menu to copy.'
              : ''}
        </span>
      )}
    </div>
  );
}
