---
title: Markdown
summary: Renders a Markdown string in envUI's typography and code, and MarkdownEditor writes one with a toolbar and a preview.
status: stable
statuses:
  MarkdownEditor: beta
since: 0.1.0
category: Content & guidance
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
  - Content written in Markdown is shown, such as a saved description, a note or a document.
  - People write formatted prose as Markdown, with a toolbar and a preview of the result (MarkdownEditor).
avoidWhen:
  - text: Plain text over several lines, without formatting.
    use: Textarea
  - text: Formatted text edited as it looks, without visible Markdown syntax.
    use: RichTextEditor
  - text: A message in a conversation, sent with Enter.
    use: Composer
  - text: Source code to read or copy on its own.
    use: CodeBlock
components:
  - Markdown
  - MarkdownEditor
---

# Markdown

## Overview

Markdown and MarkdownEditor come from `@envsemble/envui/content`.

```tsx example=ProjectNote

```

### Write and preview

MarkdownEditor is a textarea with a formatting toolbar, undo and redo, and a Preview tab that renders with `previewProps`.

```tsx example=EditDescription

```

### Links

`renderLink` renders links, such as to open some in a panel; modified clicks stay the browser's.

```tsx example=OpenInPanel

```

### Your own elements

`components` replaces how an element renders, here a quote as an Alert; `remarkPlugins` and `rehypePlugins` extend the rest.

```tsx example=CustomElements

```

### What it renders

CommonMark with tables, strikethrough, task lists, automatic links and footnotes. Raw HTML is ignored, except keys written as `<kbd>`, which render as Kbd.

## Variants

| Editor sizing | Use for                                                    |
| ------------- | ---------------------------------------------------------- |
| `fixed`       | A long document: the source keeps its height. The default. |
| `content`     | A short description: the source grows with its text.       |

`toolbar` chooses the actions, in a fixed order, grouped by kind with a line between groups, and `onRequestLink` opens the application's own link picker.

```tsx example=LinkPicker

```

## When to use

- Set `headingOffset` so the document's first heading sits one level below the page's.
- Don't render untrusted Markdown with a plugin that brings raw HTML back.

### Content

- Give images alternative text in the source.

## Anatomy

```tsx anatomy=MarkdownEditorAnatomy

```

1. **Editor** (`env-markdown-editor`)
2. **Tabs** (`env-tabs-list`, `preview`)
3. **Toolbar** (`env-editor-toolbar`, `toolbar`)
4. **Source** (`env-markdown-source`)
5. **Description** (`env-field-description`, `description`)

A rendered document is `env-markdown`, and a table in it scrolls in `env-markdown-table`.

## Accessibility

### Keyboard

| Key                                                                         | Action                                                 |
| --------------------------------------------------------------------------- | ------------------------------------------------------ |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd>                             | Moves through links, tables, tabs, toolbar and source. |
| <kbd>←</kbd>, <kbd>→</kbd>                                                  | Moves between tabs, or between toolbar actions.        |
| <kbd>Ctrl</kbd>+<kbd>B</kbd>, <kbd>I</kbd>, <kbd>K</kbd>                    | Bold, italic or a link, in the source.                 |
| <kbd>Ctrl</kbd>+<kbd>Z</kbd>                                                | Undoes.                                                |
| <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Z</kbd>, <kbd>Ctrl</kbd>+<kbd>Y</kbd> | Redoes.                                                |

On Apple keyboards, <kbd>Cmd</kbd> replaces <kbd>Ctrl</kbd>.

### envUI provides

- Native headings, lists, quotes, tables and links.
- Tables in focusable, scrolling regions named after their caption or heading.
- Task items as read-only checkboxes.
- A native textarea tied to its label, a named toolbar and named tabs.

### You provide

- A `label` for MarkdownEditor.
- Alternative text for images, and link text that names its destination.
- Translated words through EnvUIProvider's `messages`.

## Changelog

- **1.0.0-prerelease.2**: MarkdownEditor's `underline` variant is gone; the `v1-props` codemod drops it for the default outline.
- **1.0.0**: Code in Markdown takes the new code themes, as Code and CodeBlock do. MarkdownEditor takes Textarea's `description` instead of `hint`, and its variants `outline`, `underline` and `ghost`, which the `v1-props` codemod writes. `className` and `style` style the root, `env-markdown-editor`, rather than the textarea; `ref` and the other native props still reach the textarea. Its toolbar is a Toolbar, with tooltips instead of native titles, and its words come from EnvUIProvider's `messages`, as do Markdown's table and task names. Markdown's root carries `env-prose` beside `env-markdown`. Markdown is stable; MarkdownEditor stays beta.
- **0.7.0**: Code in Markdown takes the code theme of the app theme; `inlineCode` is removed.
- **0.5.0**: `components`, `remarkPlugins` and `rehypePlugins`; raw HTML is dropped before any rehype plugin runs, except keys written as `<kbd>`, which render as Kbd.
- **0.1.0**: Markdown and MarkdownEditor.
