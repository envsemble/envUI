---
title: RichText
summary: Formatted text people edit as it looks, saved as Markdown with references, and shown again
  read-only.
status: experimental
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

RichTextEditor is a field for formatted text that people edit as it looks; its value is Markdown. RichText shows saved Markdown the same way. Both come from the optional `@envsemble/envui/rich-text` entry, which needs Tiptap and marked, as [setup](../setup.md) describes.

```tsx example=EditAndPreview

```

### Show saved content

RichText shows saved Markdown read-only, also on a server. `onReferenceClick` and `onLinkClick` open references and links.

```tsx example=SavedContent

```

### References

Typing a source's trigger, such as @, opens its suggestions. The Markdown keeps each reference's ID; resolving it is the application's.

```tsx example=References

```

### Slash commands

`slashCommands` offers blocks on /, then the application's own commands.

```tsx example=SlashCommands

```

### Attachments and links

`onUpload` adds Attach files, and `onRequestLink` replaces the link dialog with the application's picker.

```tsx example=UploadsAndLinks

```

### Commands from outside

`ref.editor` is the Tiptap editor, so the application can change the document with its commands.

```tsx example=EditorCommands

```

### In a form

With `name`, a form submits the Markdown; `error` says what to fix.

```tsx example=ReleaseNotesForm

```

### Markdown it keeps

Headings, emphasis, strikethrough, code, lists and task lists, quotes, links, images, simple tables and references. Raw HTML shows as text; other syntax, such as footnotes, needs an extension or [Markdown](../components/markdown.md).

## Variants

| Variant   | Use for                                                                         |
| --------- | ------------------------------------------------------------------------------- |
| `outline` | A form, a dialog, a pane or a document that is the page's content. The default. |
| `ghost`   | Notes in a quiet panel: only the text at rest.                                  |

`toolbar` takes the commands to show, in order, or `false` for none. Commands of one kind next to each other share a group of the toolbar, with a line between groups: text styles, lists, blocks, and links and tables; Undo and Redo, and Attach files, follow in groups of their own. Formatting on at the caret, such as Bold, shows as a pressed toggle.

<!-- specimen: States -->

## When to use

```tsx do=FewCommands caption="The commands the content needs, such as three for a comment."

```

```tsx dont=EveryCommand caption="Every command for a comment: the toolbar outweighs the text."

```

- Keep `references`, `extensions` and `slashCommands` the same between renders, such as at module scope: a new array starts a new session and loses undo.
- Show saved Markdown with RichText and the same `extensions`.

### Content

```tsx do=PlaceholderSaysHow caption="A label that names the document, and a placeholder that says how to start."

```

```tsx dont=VaguePlaceholder caption="Text and Enter text here: neither says what to write."

```

- Give image attachments a label that describes the image: it becomes the alternative text.

## Anatomy

```tsx anatomy=RichTextAnatomy

```

1. **Editor** (`env-rich-text-editor`)
2. **Toolbar** (`env-editor-toolbar`, `toolbar`)
3. **Document** (`env-rich-text-editor-content`)
4. **Reference** (`env-rich-text-reference`)
5. **Task** (`env-rich-text-task`)
6. **Description** (`env-field-description`, `description`)

Not shown: the suggestions, `env-rich-text-suggestions`, and the status, `env-editor-status`.

## Accessibility

### Keyboard

On Apple keyboards, <kbd>⌘</kbd> replaces <kbd>Ctrl</kbd> and <kbd>⌥</kbd> replaces <kbd>Alt</kbd>.

| Key                                                                         | Action                                                 |
| --------------------------------------------------------------------------- | ------------------------------------------------------ |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd>                             | Moves to the toolbar, one tab stop, then the document. |
| <kbd>←</kbd>, <kbd>→</kbd>                                                  | Moves between toolbar buttons.                         |
| <kbd>Ctrl</kbd>+<kbd>B</kbd>, <kbd>I</kbd>, <kbd>E</kbd>                    | Bold, italic, inline code.                             |
| <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>S</kbd>                               | Strikethrough.                                         |
| <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>1</kbd> to <kbd>6</kbd>                 | A heading of that level.                               |
| <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>7</kbd>, <kbd>8</kbd>, <kbd>9</kbd>   | A numbered, bulleted or task list.                     |
| <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>B</kbd>                               | A quote.                                               |
| <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>C</kbd>                                 | A code block.                                          |
| <kbd>Ctrl</kbd>+<kbd>Z</kbd>                                                | Undoes.                                                |
| <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Z</kbd>, <kbd>Ctrl</kbd>+<kbd>Y</kbd> | Redoes.                                                |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> in a list item              | Indents or outdents it.                                |
| A trigger, such as <kbd>@</kbd> or <kbd>/</kbd>                             | Opens the suggestions.                                 |
| <kbd>↑</kbd>, <kbd>↓</kbd>, <kbd>Enter</kbd> in the suggestions             | Highlights an option, and inserts it.                  |
| <kbd>Esc</kbd>                                                              | Closes the suggestions or the link dialog.             |

### envUI provides

- The document as a multiline `textbox`, named by the label and described by the description and the error.
- A named toolbar with one tab stop, a tooltip on each button and `aria-pressed` for formatting at the caret.
- Suggestions as a listbox named by the source's `label`, with the highlighted option announced.
- A status for uploads, failures and refused links.
- Raw HTML kept as text, and unsafe URLs refused.

### You provide

- A `label` that names the document, and one for each reference source.
- Labels for image attachments.
- Lookups, uploads, navigation and saving.
- Translated words through EnvUIProvider's `messages`.

## Changelog

- **1.0.0-prerelease.2**: The `underline` variant is gone; the `v1-props` codemod drops it for the default outline.
- **1.0.0**: RichTextEditor takes the field vocabulary: `description` instead of `hint`, and the variants `outline`, `underline` and `ghost` instead of `outlined`, `plain` and `quiet`, which drew as outlined; the `v1-props` codemod writes them. The document sits in the field's box, with its border, its states and a disabled field whose label stays readable, and task items show envUI's checkboxes beside their text. The toolbar is the Toolbar MarkdownEditor shares, with tooltips, the link dialog is the shared one, and every word comes from EnvUIProvider's `messages`. Suggestions are rows of a listbox in the editor, above a Dialog it sits in, and close as focus leaves; a controlled editor raises no `flushSync` warning. The `./rich-text` entry is experimental.
- **1.0.0**: Tiptap, marked, Shiki and the Pierre themes are no longer peer dependencies; applications that import the rich-text entry install them, as [Setup](../setup.md#public-entry-points) lists.
- **0.5.0**: Text in the document takes the control font size, 1 rem on touch screens, so focusing it doesn't zoom the page.
- **0.2.0**: Tiptap and marked are optional peer dependencies, installed by applications that import the rich-text entry.
- **0.1.0**: RichTextEditor, RichText and `createRichTextExtensions` in `@envsemble/envui/rich-text`, built on Tiptap, with Markdown values, references and slash commands.
