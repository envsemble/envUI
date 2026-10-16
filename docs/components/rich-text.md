---
title: RichText
summary: Formatted text people edit as it looks, saved as Markdown with references, and shown again
  read-only.
status: beta
since: 0.1.0
category: Content & guidance
aliases:
  - RichTextEditor
  - rich text editor
  - WYSIWYG
  - WYSIWYG editor
  - editor
  - formatted text
  - document editor
  - contenteditable
  - mentions
  - '@mentions'
  - references
  - slash commands
  - Tiptap
  - createRichTextExtensions
useWhen:
  - People write formatted text and see it as it will look, such as meeting notes, a brief or release notes.
  - Text mentions people, topics or files the application knows, saved with their IDs (references).
  - Formatted text saved earlier shows again read-only, rendered the same way, such as on a detail page (RichText).
avoidWhen:
  - text: People edit Markdown source directly, with a preview.
    use: MarkdownEditor
  - text: Showing Markdown from anywhere, with the full CommonMark syntax, footnotes and plugins.
    use: Markdown
  - text: Plain text over several lines, without formatting.
    use: Textarea
  - text: A message in a conversation, sent with Enter.
    use: Composer
  - text: A single line of text, such as a title.
    use: TextField
related:
  - markdown
  - text-field
  - composer
  - message
  - composition
  - accessibility
components:
  - RichText
  - RichTextEditor
  - createRichTextExtensions
---

# RichText

## Overview

RichTextEditor is a labelled field for formatted text that people edit as it looks: headings, emphasis, lists, task lists, quotes, code, links and tables, with a formatting toolbar and the usual keyboard shortcuts. Its value is Markdown, so applications save and diff plain text. It is built on Tiptap, which owns the document, the selection, undo and paste; envUI gives it the field, the toolbar and its looks.

The family comes from the optional `@envsemble/envui/rich-text` entry, which needs Tiptap and marked installed as described in [setup](../setup.md):

- **RichTextEditor** edits the Markdown, with references people insert by typing a trigger such as @, optional slash commands, attachments the application uploads and links from its own picker.
- **RichText** shows saved Markdown read-only with the editor's own schema, so it looks the same and its references work the same. It renders on a server too.
- **createRichTextExtensions** returns the Tiptap extensions both share, for other Tiptap integrations that need the same schema.

```tsx example=EditAndPreview

```

## Anatomy

1. **Label** (`label`): above the toolbar; it names the document.
2. **Toolbar** (`toolbar`): a row of icon buttons named "Rich text formatting", the commands in order, then Undo, Redo and, with `onUpload`, Attach files. It scrolls sideways where it doesn't fit.
3. **Document**: the editing area, at least 10 rem tall and growing with its content, with 1 rem padding. Outlined, it has a 0.0625 rem border, 0.25 rem corners and the field background.
4. **References**: the trigger and the label, such as @Priya Shah, on the field background with 0.25 rem corners; a link or a button where they lead somewhere.
5. **Suggestions**: a list under the caret while people type after a trigger, 12 to 24 rem wide, scrolling beyond 18 rem.
6. **Hint** (`hint`) and **error** (`error`): below the document, the error with its icon.
7. **Status**: below the document, a message about an upload or a link, such as "Uploading attachments…"; hidden while empty.

The parts are 0.75 rem apart. Insert link opens a dialog with Text and URL or path fields, unless the application brings its own picker.

## Variants and sizes

- **`outlined`**, the default, puts the document in a bordered well on the field background, for a form, a dialog or a pane.
- **`plain`** drops the border and the fill, for a document that is the page's content, such as notes in a detail view.

| Command         | Toolbar button | Does                                                       |
| --------------- | -------------- | ---------------------------------------------------------- |
| `heading`       | Heading        | Turns the paragraph into a level 2 heading, and back.      |
| `bold`          | Bold           | Bold text.                                                 |
| `italic`        | Italic         | Italic text.                                               |
| `strike`        | Strikethrough  | Struck-through text.                                       |
| `bullet-list`   | Bulleted list  | A bulleted list.                                           |
| `numbered-list` | Numbered list  | A numbered list.                                           |
| `task-list`     | Task list      | A list of tasks with checkboxes.                           |
| `quote`         | Quote          | A quote.                                                   |
| `inline-code`   | Inline code    | Code within a line.                                        |
| `code-block`    | Code block     | A block of code.                                           |
| `link`          | Insert link    | Links the selection, or inserts a link at the caret.       |
| `table`         | Insert table   | A table of three rows and three columns with a header row. |

<!-- specimen: States -->

- `toolbar` takes the commands to show, in order, or `false` for none. Keep to what the content needs, such as bold, italic and links for a comment.
- Text in the document is 0.9375 rem, and 1 rem on touch screens, so mobile browsers don't zoom the page when it takes focus.
- The editor fills the width of its container; the document grows with its content, so give a long document room or let the page scroll.

## States and behaviour

- **Markdown values**: `value` and `onValueChange` control the editor, or `defaultValue` starts it. `onValueChange` receives Markdown after every edit, normalized by the schema, so it can differ from the Markdown it was given, such as `*` for `_` around italics. A new `value` from outside, such as another draft, replaces the document and keeps the caret where it can.
- **Markdown it keeps**: headings, bold, italic, strikethrough, inline code, code blocks, bulleted, numbered and task lists, quotes, links, images, ordinary tables and references. Raw HTML in the Markdown shows as text, on a server and in the browser alike. Syntax outside the schema, such as footnotes or merged table cells, needs an extension or the Markdown component.
- **Typing Markdown**: Markdown typed into the document formats as it goes, such as `## ` for a heading, `- ` for a list or `**bold**`.
- **Toolbar state**: the buttons of formatting at the caret show as pressed and report `aria-pressed`; Undo and Redo are unavailable while there is nothing to undo or redo.
- **References**: typing a source's trigger, such as @, at the start of a line or after a space opens its suggestions, filtered by what follows. While the lookup runs, the list says "Loading suggestions…"; it says "No results" when nothing matches and "Suggestions could not load. Try typing again." when the lookup fails. Choosing an option inserts the reference and a space. A reference with `href` is a link, which the editor never follows while it is editable; without one, `onReferenceClick` makes it a button. The Markdown keeps its ID, label, kind, destination and trigger.
- **Slash commands**: with `slashCommands`, typing / at the start of a line or after a space offers Heading, the three lists, Quote, Code block and Insert table, then the application's commands, filtered by what follows. A / reference source can't be used beside them, and two sources can't share a trigger.
- **Links**: Insert link opens a dialog for the text and the URL, or calls `onRequestLink` for the application's own picker. A selection becomes a link to the URL; at the caret, the link's text is inserted. Only relative paths and http, https, mailto and tel URLs are accepted; another URL shows "Enter a safe URL or relative path." in the status. Clicking a link calls `onLinkClick`; the editor never follows it while editable.
- **Attachments**: with `onUpload`, Attach files opens the file picker, filtered by `accept`, for one or, by default, several files. While they upload, the status says "Uploading attachments…" and the toolbar waits. Images become Markdown images with the label as their alternative text; other files become references. A failed upload shows its message in the status, and an upload that finishes after the document changed is not inserted: the status asks people to attach the files again.
- **Read only**: `readOnly` keeps the document as it is: the toolbar is disabled and the document can't be focused, but its links and references can, and a form still submits the value.
- **Disabled**: `disabled` makes the editor unavailable at the shared disabled opacity: it can't be edited or focused, the toolbar is disabled and a form leaves its value out. Becoming read-only or disabled closes open suggestions and cancels an upload or a link request.
- **Invalid**: while `error` is set, the document reports `aria-invalid`, its border turns red and the message shows below it.
- **Form submission**: with `name`, the Markdown is submitted with the form; `form` names a form the editor sits outside of. A form's reset returns an uncontrolled editor to `defaultValue`.
- **Theme**: the suggestions take the theme of the editor, also inside a scoped Theme.
- **RichText**: renders the Markdown with the same schema and envUI's own parts: links through `LinkProvider`, inline code and code blocks as Code and CodeBlock, and tasks as disabled checkboxes named by their text. Unsafe links show as text and unsafe images as their alternative text. `onReferenceClick` and `onLinkClick` receive activations; call `preventDefault` to stop the browser following them.
- **Server rendering**: RichText renders on a server. RichTextEditor renders its field there and its document once it runs in the browser.

## Content guidelines

- Name the document in the label, such as "Meeting notes" or "Release notes", and put lasting guidance in the hint.
- Use the placeholder for what to write and how to insert what the editor offers, such as "Type @ to mention someone, or # for a topic".
- Name each reference source after what it lists, such as People or Topics; the name is the suggestion list's accessible name.
- Name slash commands after the block they add, such as "Meeting agenda".
- Give image attachments a label that describes the image; it becomes the alternative text.
- Write an error that says how to fix the document, such as "Write what changed before publishing."

## Do and don't

### Do

- Save the Markdown from `onValueChange`, and show it again with RichText and the same `extensions`.
- Keep `references`, `extensions` and `slashCommands` arrays the same between renders, such as at module scope; a new array starts a new editing session and loses undo.
- Resolve reference IDs in the application: envUI saves them and hands them back, but gives `id` and `kind` no meaning.
- Use the signal in reference lookups and uploads to cancel work that is no longer needed.
- Change the document from outside through `ref.editor`, Tiptap's command API.

### Don't

- Don't use RichTextEditor where people should see and edit Markdown source; use [MarkdownEditor](../components/markdown.md).
- Don't use the same trigger for two reference sources, or / for a source beside slash commands; the editor throws.
- Don't rely on RichText to show any Markdown: it shows what its schema keeps. Use [Markdown](../components/markdown.md) for Markdown from elsewhere.
- Don't expect the editor to follow links or references; navigation belongs to `onLinkClick` and `onReferenceClick`.

## Accessibility

### Keyboard

<kbd>Ctrl</kbd> is <kbd>⌘</kbd> and <kbd>Alt</kbd> is <kbd>⌥</kbd> on a Mac.

| Key                                                                                      | Action                                                                                                                                                               |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd>                                          | Moves focus to the toolbar, which is one tab stop, then to the document and on. Outside a list, <kbd>Tab</kbd> in the document moves focus on rather than indenting. |
| <kbd>←</kbd>, <kbd>→</kbd> in the toolbar                                                | Moves between its buttons, wrapping at the ends and skipping unavailable ones.                                                                                       |
| <kbd>Enter</kbd> or <kbd>Space</kbd> on a toolbar button                                 | Applies its formatting or runs it, such as Insert link.                                                                                                              |
| <kbd>Ctrl</kbd>+<kbd>B</kbd>, <kbd>Ctrl</kbd>+<kbd>I</kbd>, <kbd>Ctrl</kbd>+<kbd>E</kbd> | Bold, italic and inline code.                                                                                                                                        |
| <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>S</kbd>                                            | Strikethrough.                                                                                                                                                       |
| <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>1</kbd> to <kbd>6</kbd>                              | A heading of that level.                                                                                                                                             |
| <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>7</kbd>, <kbd>8</kbd> or <kbd>9</kbd>              | A numbered list, a bulleted list or a task list.                                                                                                                     |
| <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>B</kbd>                                            | A quote.                                                                                                                                                             |
| <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>C</kbd>                                              | A code block.                                                                                                                                                        |
| <kbd>Ctrl</kbd>+<kbd>Z</kbd>                                                             | Undoes the last change.                                                                                                                                              |
| <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Z</kbd> or <kbd>Ctrl</kbd>+<kbd>Y</kbd>            | Redoes it.                                                                                                                                                           |
| <kbd>Shift</kbd>+<kbd>Enter</kbd>                                                        | A line break within the paragraph.                                                                                                                                   |
| <kbd>Tab</kbd> in a list item                                                            | Indents the item under the one above; where it can't be indented, moves focus on.                                                                                    |
| <kbd>Shift</kbd>+<kbd>Tab</kbd> in a list item                                           | Outdents the item, or turns a top-level item into a paragraph, and keeps focus in the document.                                                                      |
| <kbd>Enter</kbd> in an empty list item                                                   | Ends the list.                                                                                                                                                       |
| A reference trigger, such as <kbd>@</kbd>, or <kbd>/</kbd> with slash commands           | Opens the suggestions, filtered by what follows.                                                                                                                     |
| <kbd>↓</kbd>, <kbd>↑</kbd> in the suggestions                                            | Highlights the next or previous option, wrapping at the ends.                                                                                                        |
| <kbd>Enter</kbd> in the suggestions                                                      | Inserts the highlighted option.                                                                                                                                      |
| <kbd>Esc</kbd> in the suggestions                                                        | Closes them and keeps what was typed.                                                                                                                                |
| <kbd>Esc</kbd> in the link dialog                                                        | Closes it and returns focus to the document.                                                                                                                         |
| <kbd>Enter</kbd> on a reference or a link in RichText or a read-only editor              | Activates it, and <kbd>Space</kbd> a reference that is a button.                                                                                                     |

### envUI provides

- The document as a `textbox` with `aria-multiline`, named by the label or `aria-label`, described by the hint and the error, and reporting `aria-invalid`, `aria-readonly` and `aria-disabled`.
- A toolbar named "Rich text formatting" with one tab stop and arrow keys, each button named, with its name also in a native tooltip, `aria-pressed` for formatting at the caret, and unavailable buttons left out of the arrow-key order.
- Suggestions as a listbox named by the source's `label`, with `aria-expanded`, `aria-controls`, `aria-autocomplete` and `aria-activedescendant` on the document while it is open, so screen readers announce the highlighted option; `aria-busy` and a status while it loads, finds nothing or fails.
- A status that announces upload progress and failures and rejected links.
- The link dialog with labelled fields, which returns focus to the document when it closes.
- In RichText, links through `LinkProvider`, task items as disabled checkboxes named by their text, and references as links or buttons.
- Raw HTML kept as text and unsafe URLs refused, in the editor and in RichText.

### You provide

- A visible `label`, or an `aria-label`, that names the document.
- A `label` for each reference source, which names its suggestion list.
- Labels for image attachments that work as alternative text.
- The lookups, uploads, permissions, navigation and saving behind references, attachments and links.
- Wording for other languages where you need it: the toolbar's names, the link dialog and the editor's messages are in English, and no props change them yet.

## Examples

### Show saved content

RichText shows saved Markdown read-only. The application opens references and links through `onReferenceClick` and `onLinkClick`.

```tsx example=SavedContent

```

### Mention people and topics

Each reference source has a trigger, a name for its list and a lookup. Here a timer stands in for a search on a server, which the signal cancels when the query changes.

```tsx example=References

```

### Slash commands

`slashCommands` adds a menu of blocks on /, and the application's own commands after them.

```tsx example=SlashCommands

```

### Attachments and links

`onUpload` makes Attach files upload through the application, and `onRequestLink` replaces the link dialog with the application's own picker.

```tsx example=UploadsAndLinks

```

### Commands from outside

`ref.editor` is the Tiptap editor, so the application can change the document with its commands.

```tsx example=EditorCommands

```

### In a form

With `name`, the form submits the Markdown. `error` says what to fix.

```tsx example=ReleaseNotesForm

```

## Changelog

- **1.0.0**: A task item's checkbox sits beside its text in the editor, as in RichText.
- **0.5.0**: Text in the document takes the control font size, 1 rem on touch screens, so focusing it doesn't zoom the page.
- **0.2.0**: Tiptap and marked are optional peer dependencies, installed by applications that import the rich-text entry.
- **0.1.0**: RichTextEditor, RichText and `createRichTextExtensions` in `@envsemble/envui/rich-text`, built on Tiptap, with Markdown values, references and slash commands.
