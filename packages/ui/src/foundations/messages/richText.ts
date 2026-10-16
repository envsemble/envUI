/**
 * The English defaults of the `richText` messages: RichText and RichTextEditor, beside the editor
 * commands. EnvUIProvider's `messages.richText` overrides any of them.
 */
export const richText = {
  /** Names a task item's checkbox. */
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
  /** Names the suggestion list. */
  suggestions: 'Suggestions',
};

export type RichTextMessages = typeof richText;
