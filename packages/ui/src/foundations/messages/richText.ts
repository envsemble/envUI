/**
 * The English defaults of the `richText` messages: RichText and RichTextEditor, beside the editor
 * commands. EnvUIProvider's `messages.richText` overrides any of them.
 */
export const richText = {
  /** Names a task item's checkbox without text. */
  task: 'Task',
  /** Names the slash command list. */
  commands: 'Commands',
  /** Names the formatting toolbar. */
  toolbar: 'Rich text formatting',
  /** The attach button's name. */
  attach: 'Attach files',
  /** Shown while suggestions load. */
  suggestionsLoading: 'Loading suggestions…',
  /** Shown when no suggestion matches. */
  suggestionsEmpty: 'No results',
  /** Shown when the suggestions could not load. */
  suggestionsFailed: 'Suggestions could not load. Try typing again.',
  /** Names the suggestion list of a source without a label. */
  suggestions: 'Suggestions',
  /** Said when the document changed while the application's link picker was open. */
  changedWhilePicking: 'The document changed while the picker was open. Insert the link again.',
  /** Said when the application's link picker failed. */
  pickerFailed: 'The link picker could not finish. Try again.',
  /** Said while attachments upload. */
  uploading: 'Uploading attachments…',
  /** Said when an upload returned a URL the editor does not link to. */
  unsafeUpload: 'The upload returned an unsafe URL.',
  /** Said when the document changed while the files uploaded. */
  changedWhileUploading: 'The document changed during upload. Attach the files again.',
  /** Said when an upload failed without a message of its own. */
  uploadFailed: 'The upload failed. Try again.',
};

export type RichTextMessages = typeof richText;
