---
title: RichText
summary: Formatted text people edit as it looks, saved as Markdown.
status: alpha
since: 1.0.0
category: Forms & selection
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
  - Formatted text people see as it will look, such as meeting notes or a brief
  - Text that mentions people, topics or files the application knows
  - Formatted text saved earlier, shown again read-only (RichText)
avoidWhen:
  - text: People edit Markdown source directly, with a preview.
    use: MarkdownEditor
  - text: Showing Markdown with everything it can hold, such as footnotes.
    use: Markdown
  - text: Plain text over several lines, without formatting.
    use: Textarea
components:
  - RichText
  - RichTextEditor
  - createRichTextExtensions
examples:
  MeetingNotes:
    role: overview
    motion: true
  RichTextAnatomy: anatomy
  SavedContent: example
  References: example
  CommentBox: example
  SlashCommands: example
  UploadsAndLinks: example
---

# RichText

## Variants

<!-- specimen: States -->

### Toolbar

<!-- specimen: ToolbarState -->

## Anatomy

```tsx figure=RichTextAnatomy width="21"

```

1. **Editor** (`env-rich-text-editor`)
2. **Toolbar** (`env-editor-toolbar`, `toolbar`)
3. **Document** (`env-rich-text-editor-content`)
4. **Reference** (`env-rich-text-reference`)
5. **Task** (`env-rich-text-task`)
6. **Description** (`env-field-description`, `description`)

## Behaviour

### Show saved content

```tsx figure=SavedContent

```

### References

```tsx figure=References motion

```

### Suggestion rows, toolbar controls and a footer

```tsx figure=CommentBox

```

### Slash commands

```tsx figure=SlashCommands motion

```

### Attachments and links

```tsx figure=UploadsAndLinks

```

## Accessibility

### Keyboard

| Key                                                                       | Action                                |
| ------------------------------------------------------------------------- | ------------------------------------- |
| <kbd>←</kbd>, <kbd>→</kbd>                                                | Moves between toolbar buttons.        |
| <kbd>Ctrl</kbd>+<kbd>B</kbd>, <kbd>I</kbd>, <kbd>E</kbd>                  | Bold, italic, inline code.            |
| <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>S</kbd>                             | Strikethrough.                        |
| <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>1</kbd> to <kbd>6</kbd>               | A heading of that level.              |
| <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>7</kbd>, <kbd>8</kbd>, <kbd>9</kbd> | A numbered, bulleted or task list.    |
| <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>B</kbd>                             | A quote.                              |
| <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>C</kbd>                               | A code block.                         |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> in a list item            | Indents or outdents it.               |
| A trigger, such as <kbd>@</kbd> or <kbd>/</kbd>                           | Opens the suggestions.                |
| <kbd>↑</kbd>, <kbd>↓</kbd>, <kbd>Enter</kbd> in the suggestions           | Highlights an option, and inserts it. |
