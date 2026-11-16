---
title: Markdown
summary: Shows a Markdown string in envUI's typography, and MarkdownEditor writes one.
status: stable
statuses:
  MarkdownEditor: beta
since: 1.0.0
category: Text & content
aliases:
  - MD
  - markdown renderer
  - markdown viewer
  - prose
  - rich content
  - formatted text
  - markdown editor
  - markdown input
  - text editor
  - write and preview
useWhen:
  - Content written in Markdown, such as a saved note or a document
  - Writing formatted prose, with a toolbar and a preview (MarkdownEditor)
avoidWhen:
  - text: Plain text over several lines, without formatting.
    use: Textarea
  - text: Formatted text edited as it looks, without visible Markdown syntax.
    use: RichTextEditor
  - text: A message in a conversation, sent with Enter.
    use: Composer
components:
  - Markdown
  - MarkdownEditor
examples:
  WriteNote: overview
  LinkPicker: example
  MarkdownEditorAnatomy: anatomy
  OpenInPanel: example
  CustomElements: example
  ProjectNote: example
---

# Markdown

## Variants

### Editor sizing

<!-- specimen: EditorSizing -->

### Toolbar

```tsx figure=LinkPicker motion

```

## Anatomy

```tsx figure=MarkdownEditorAnatomy

```

1. **Editor** (`env-markdown-editor`)
2. **Tabs** (`env-tabs-list`, `preview`)
3. **Toolbar** (`env-editor-toolbar`, `toolbar`)
4. **Source** (`env-markdown-editor-input`)
5. **Description** (`env-field-description`, `description`)

## Behaviour

### What it renders

```tsx figure=ProjectNote

```

### Links

```tsx figure=OpenInPanel motion

```

### Your own elements

```tsx figure=CustomElements

```

## Accessibility

### Keyboard

| Key                                                      | Action                                          |
| -------------------------------------------------------- | ----------------------------------------------- |
| <kbd>←</kbd>, <kbd>→</kbd>                               | Moves between tabs, or between toolbar actions. |
| <kbd>Ctrl</kbd>+<kbd>B</kbd>, <kbd>I</kbd>, <kbd>K</kbd> | Bold, italic or a link, in the source.          |
