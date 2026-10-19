/**
 * The English defaults of the `linkDialog` messages: The link dialog of MarkdownEditor and
 * RichTextEditor. EnvUIProvider's `messages.linkDialog` overrides any of them.
 */
export const linkDialog = {
  /** The dialog's title. */
  title: 'Insert link',
  /** The confirm button's label. */
  insert: 'Insert link',
  /** The text field's label. */
  text: 'Text',
  /** The URL field's label. */
  url: 'URL or path',
  /** The URL field's placeholder, an example of what it takes. */
  urlPlaceholder: 'https://example.com or /documents/example',
  /** The error for an empty destination. */
  invalidUrl: 'Enter a valid URL.',
  /** The error for a destination that is neither a URL nor a path. */
  invalidPath: 'Enter a valid URL or relative path.',
};

export type LinkDialogMessages = typeof linkDialog;
