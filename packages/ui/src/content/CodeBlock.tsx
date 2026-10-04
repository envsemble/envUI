import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
} from 'react';
import { IconButton } from '../actions/Button.js';
import { ContentCopy } from '../icons/ContentCopy.js';
import { Check } from '../icons/Check.js';
import { useTheme, type ThemeValue } from '../foundations/Theme.js';
import { classNames } from '../internal/classNames.js';
import { codeThemes } from './internal/CodeThemes.js';
import { useCodeHighlighting } from './internal/useCodeHighlighting.js';
import type { CodeTokenStyle } from './internal/CodeHighlighting.js';

export interface CodeBlockProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  children: string;
  language?: string;
  label?: string;
  copyable?: boolean;
  wrap?: boolean;
  /** GitHub Light Default or GitHub Dark; follows the surrounding Theme by default. */
  theme?: ThemeValue;
}

/** Source display with unmodified GitHub colors; copy always uses the original string. */
export function CodeBlock({
  children: source,
  language,
  label,
  copyable = false,
  wrap = false,
  theme: suppliedTheme,
  className,
  style,
  ...props
}: CodeBlockProps) {
  const inheritedTheme = useTheme();
  const theme = suppliedTheme ?? inheritedTheme;
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
  const colors = codeThemes[theme].colors;
  return (
    <div
      {...props}
      className={classNames('env-code-block', className)}
      data-wrap={wrap || undefined}
      style={
        {
          '--env-code-background': colors?.['editor.background'],
          '--env-code-foreground': colors?.['editor.foreground'],
          ...style,
        } as CSSProperties
      }
    >
      {(label || copyable) && (
        <div className="env-code-block-heading">
          <span>{label ?? language ?? 'Code'}</span>
          {copyable && (
            <IconButton
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
                    <span key={tokenIndex} style={tokenStyle(token[theme])}>
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

function tokenStyle({ color, fontStyle = 0 }: CodeTokenStyle): CSSProperties {
  return {
    color,
    fontStyle: fontStyle & 1 ? 'italic' : undefined,
    fontWeight: fontStyle & 2 ? 700 : undefined,
    textDecoration:
      [fontStyle & 4 ? 'underline' : '', fontStyle & 8 ? 'line-through' : '']
        .filter(Boolean)
        .join(' ') || undefined,
  };
}
