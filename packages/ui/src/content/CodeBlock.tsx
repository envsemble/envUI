import type { ComponentPropsWithRef } from 'react';
import { CodeBlockFrame } from './internal/CodeBlockFrame.js';

export interface CodeBlockProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** The source, as one string; it is shown and copied as it is. */
  children: string;
  /** Names the block in its heading and for assistive technology, such as a file name. */
  label?: string;
  /** Shows a copy button in the heading that copies the source; false by default. */
  copyable?: boolean;
  /** Wraps long lines instead of scrolling them; false by default. */
  wrap?: boolean;
}

/**
 * Source, a command or output as plain text in the code theme of the app theme, such as a command
 * to copy; copy always uses the original string. It loads no highlighter: HighlightedCodeBlock, from
 * `@envsemble/envui/code`, colors a language's syntax. Its words come from EnvUIProvider's
 * messages.codeBlock.
 */
export function CodeBlock({
  children: source,
  label,
  copyable = false,
  wrap = false,
  ...props
}: CodeBlockProps) {
  return (
    <CodeBlockFrame
      {...props}
      source={source}
      language={undefined}
      label={label}
      copyable={copyable}
      wrap={wrap}
    >
      {source}
    </CodeBlockFrame>
  );
}
