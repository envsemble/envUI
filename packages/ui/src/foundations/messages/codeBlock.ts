/**
 * The English defaults of the `codeBlock` messages: CodeBlock. EnvUIProvider's
 * `messages.codeBlock` overrides any of them.
 */
export const codeBlock = {
  /** The heading of a block without a label or language. */
  title: 'Code',
  /** The copy button's name. */
  copy: 'Copy code',
  /** The copy button's name once the code is copied. */
  copied: 'Code copied',
  /** Announced once the code is copied. */
  copiedStatus: 'Copied.',
  /** Names the code region, such as TypeScript code. */
  label: ({ language }: { language: string }) => `${language} code`,
  /** The language of code without one. */
  plainText: 'Plain text',
  /** Announced when the clipboard is unavailable and the code is selected instead. */
  selected: 'Code selected. Use your keyboard or context menu to copy.',
};

export type CodeBlockMessages = typeof codeBlock;
