/**
 * The English defaults of the `markdownEditor` messages: MarkdownEditor. EnvUIProvider's
 * `messages.markdownEditor` overrides any of them.
 */
export const markdownEditor = {
  /** The preview of an empty document. */
  empty: 'Nothing to preview.',
  /** Names the formatting toolbar. */
  toolbar: 'Markdown formatting',
  /** Names the Write and Preview switch. */
  views: 'Markdown editor views',
  /** The view of the source. */
  write: 'Write',
  /** The view of the rendered preview. */
  preview: 'Preview',
  /** Said when the text changed while the application's link picker was open. */
  changedWhilePicking: 'The text changed while the picker was open. Insert the link again.',
  /** Said when a link would make the text too long, or editing is unavailable. */
  tooLong: 'This change would exceed the maximum length, or editing is unavailable.',
  /** Said when a formatting command would make the text too long. */
  tooLongShort: 'This change would exceed the maximum length.',
  /** Said when the link could not be inserted. */
  linkFailed: 'The link could not be inserted.',
  /** Said when the application's link picker failed. */
  pickerFailed: 'The link picker could not finish. Try again.',
};
