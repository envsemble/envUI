'use client';

import { Fragment, useEffect, useRef, type ComponentPropsWithRef } from 'react';
import { IconButton } from '../actions/Button.js';
import { IconContentCopy } from '../icons/ContentCopy.js';
import { IconCheck } from '../icons/Check.js';
import { useTheme } from '../foundations/Theme.js';
import { codeBlock as codeBlockMessages } from '../foundations/messages/codeBlock.js';
import { classNames } from '../internal/classNames.js';
import { Row } from '../foundations/Layout.js';
import { useMessages } from '../internal/EnvUIContext.js';
import { useCopy } from '../internal/useCopy.js';
import { codeThemeStyle } from './internal/codeColors.js';
import { useCodeContrast } from './internal/useCodeContrast.js';
import { useCodeHighlighting } from './internal/useCodeHighlighting.js';
import { tokenStyle } from './internal/codeTokenStyle.js';
import { flag } from '../internal/flag.js';
import '../styles/Base.css';
import '../styles/Code.css';

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
 * uses the original string. Its words come from EnvUIProvider's messages.codeBlock.
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
  const messages = useMessages('codeBlock', codeBlockMessages);
  const preRef = useRef<HTMLPreElement>(null);
  const contrast = useCodeContrast(preRef);
  const tokens = useCodeHighlighting(source, language, contrast === 'high');
  // Copied or failed shows for three seconds; where the clipboard fails, the code is selected for
  // people to copy themselves.
  const { copy, status, reset } = useCopy({ resetAfter: 3_000 });
  useEffect(() => reset(), [source, reset]);

  async function copySource(button: HTMLElement) {
    if (await copy(source, button)) return;
    const pre = preRef.current;
    if (!pre) return;
    const range = pre.ownerDocument.createRange();
    range.selectNodeContents(pre);
    const selection = pre.ownerDocument.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }
  const lineEndings = source.match(/\r\n|\r|\n/g) ?? [];
  return (
    <div
      {...props}
      className={classNames('env-code-block', className)}
      data-wrap={flag(wrap)}
      style={{ ...codeThemeStyle(theme), ...style }}
    >
      {(label || copyable) && (
        <Row wrap align="center" justify="between" gap={4} className="env-code-block-header">
          <span>{label ?? language ?? messages.title}</span>
          {copyable && (
            <IconButton
              variant="ghost"
              icon={status === 'copied' ? <IconCheck /> : <IconContentCopy />}
              aria-label={status === 'copied' ? messages.copied : messages.copy}
              onClick={(event) => void copySource(event.currentTarget)}
            />
          )}
        </Row>
      )}
      <pre
        ref={preRef}
        tabIndex={0}
        aria-label={label ?? messages.label({ language: language ?? messages.plainText })}
      >
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
        <span className="env-code-block-copy-status" role="status">
          {status === 'copied'
            ? messages.copiedStatus
            : status === 'failed'
              ? messages.selected
              : ''}
        </span>
      )}
    </div>
  );
}
