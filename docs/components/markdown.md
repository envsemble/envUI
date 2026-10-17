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
related:
  - code
  - rich-text
  - text-field
  - composer
  - kbd
  - typography
  - accessibility
components:
  - Markdown
  - MarkdownEditor
---

# Markdown

## Overview

Markdown renders a Markdown string from the application in envUI's typography: headings, paragraphs, lists, quotes, tables, task lists, links and code, with code blocks drawn by CodeBlock. It supports CommonMark with tables, strikethrough, task lists, automatic links and footnotes. Raw HTML is ignored, except keys written as `<kbd>Ctrl</kbd>`, which render as Kbd; Markdown is content, never executable components.

**MarkdownEditor** writes such a string: a native textarea with a formatting toolbar, undo and redo, and a Preview tab that renders with Markdown. Both come from `@envsemble/envui/content`.

```tsx example=ProjectNote

```

## Anatomy

1. **Document** (Markdown): the rendered elements with envUI's spacing between them; headings take `headingOffset` levels below the page's.
2. **Code block**: a CodeBlock for each fenced block, highlighted for its language, with a copy button when `codeCopyable`.
3. **Table**: a focusable region that scrolls sideways when the table is wider than the document, named after its caption or the heading before it. Words and inline code in a cell break only where they would overflow it.
4. **Task item**: a read-only, disabled Checkbox for each `- [ ]` or `- [x]` item.
5. **Tabs** (MarkdownEditor with `preview`): Write and Preview.
6. **Toolbar** (MarkdownEditor's `toolbar`): a Toolbar of connected buttons, heading, bold, italic, bulleted and numbered lists, quote, inline code, code block and link, then Undo and Redo, each named in a tooltip. RichTextEditor shares it.
7. **Source** (MarkdownEditor): the shared Textarea, with its label, description, error, variant and sizing, where the Markdown syntax stays visible.

## Variants and sizes

| Editor sizing      | Use for                                                                                                                |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `sizing="fixed"`   | A long document in a form: the source keeps its height, scrolls and resizes from its bottom edge. The default, 8 rows. |
| `sizing="content"` | A short description: the source grows and shrinks with its text.                                                       |

- MarkdownEditor's source takes Textarea's `variant`, `outline`, `underline` or `ghost`, and its states.
- Markdown takes the width of its container: tables and code scroll within their own regions, and images keep their aspect ratio within the width.
- `toolbar` chooses the formatting actions, in a fixed order; `false` hides the toolbar with its Undo and Redo.

## States and behaviour

- **Headings**: `headingOffset` adds to every heading's level, capped at h6, so a document can sit under the page's own headings without changing its look.
- **Links**: links render as envUI Links through the `LinkProvider`, with the renderer's safe handling of protocols; `renderLink` renders them instead, such as to open some routes in a panel while keeping real destinations. A link without a destination shows as text.
- **Extending**: `components` overrides elements, merged over envUI's own, and the application's win; overriding a heading replaces envUI's offset for that level, and overriding `pre` or `code` replaces CodeBlock. `remarkPlugins` run after envUI's Markdown extensions and `rehypePlugins` on the HTML tree, such as to add heading ids; attributes they add reach envUI's headings, links, tables and images. Raw HTML stays ignored.
- **Images**: images load lazily from their URL; one without a URL shows its alternative text.
- **Formatting**: the toolbar and <kbd>Ctrl</kbd> or <kbd>Cmd</kbd> with <kbd>B</kbd>, <kbd>I</kbd> or <kbd>K</kbd> wrap the selection in bold, italic or a link, when the toolbar offers that action. Toolbar actions keep the selection in the source, and formatting waits for an input method's composition to end.
- **History**: typing and formatting share a bounded undo history: <kbd>Ctrl</kbd>+<kbd>Z</kbd> undoes, and <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Z</kbd> or <kbd>Ctrl</kbd>+<kbd>Y</kbd> redoes, also with <kbd>Cmd</kbd>. Replacing a controlled `value` clears the history.
- **Links in the editor**: without `onRequestLink`, Insert link opens the dialog RichTextEditor shares, for the text and the address; with it, the application's picker returns `{ label, href }`, or null to cancel, also as a promise. Labels and addresses are escaped as they are inserted, and a link is refused when the source changed while the picker was open.
- **Preview**: the Preview tab renders the source with Markdown and `previewProps` when it is first opened, and stays mounted afterwards; edits are rendered when it is shown again.
- **In forms**: the source submits under `name` even while Preview shows; an invalid source switches back to Write before the browser focuses it. A form reset restores an uncontrolled editor's `defaultValue`; a controlled one keeps its `value`. `maxLength` limits typing and formatting, and a change beyond it is refused with a message.
- **Read only and disabled**: `readOnly` and `disabled` prevent edits and turn the toolbar off.

## Content guidelines

- Store and pass Markdown as an ordinary string; Markdown and MarkdownEditor need nothing else.
- Choose `headingOffset` so the document's first heading sits one level below the page's.
- Write link text that names the destination, and keep destinations as stable URLs; resolving them, permissions and missing pages belong to the application.
- Give images alternative text in the Markdown source.

## Do and don't

### Do

- Use `renderLink` to route links inside the application, keeping their real `href` and the browser's modified clicks.
- Extend rendering with `components` and plugins rather than changing the output afterwards.
- Use MarkdownEditor's `previewProps` to preview with the same options as the page that shows the content.

### Don't

- Don't render untrusted Markdown with a plugin that brings raw HTML back.
- Don't use MarkdownEditor for plain text; use [Textarea](../components/text-field.md).
- Don't hide the toolbar where people don't know Markdown syntax.

## Accessibility

### Keyboard

| Key                                                                                                | Action                                                                                                                                                                           |
| -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd>                                                    | Moves focus through a document's links, tables and copy buttons; in the editor, to the selected tab, its panel, the toolbar, the source and, with fixed sizing, its resize edge. |
| <kbd>←</kbd>, <kbd>→</kbd> on the tabs                                                             | Moves between Write and Preview.                                                                                                                                                 |
| <kbd>←</kbd>, <kbd>→</kbd> in the toolbar                                                          | Moves between its actions; the toolbar is one tab stop.                                                                                                                          |
| <kbd>Ctrl</kbd> or <kbd>Cmd</kbd> with <kbd>B</kbd>, <kbd>I</kbd>, <kbd>K</kbd> in the source      | Makes the selection bold or italic, or inserts a link.                                                                                                                           |
| <kbd>Ctrl</kbd> or <kbd>Cmd</kbd> with <kbd>Z</kbd> in the source                                  | Undoes the last change.                                                                                                                                                          |
| <kbd>Ctrl</kbd> or <kbd>Cmd</kbd> with <kbd>Shift</kbd>+<kbd>Z</kbd> or <kbd>Y</kbd> in the source | Redoes it.                                                                                                                                                                       |

### envUI provides

- Native headings, lists, quotes, tables and links, and headings at the level `headingOffset` sets.
- Tables in focusable, scrolling regions named after their caption or heading, such as "Prices table", code blocks with CodeBlock's named source and copy button, and task items as read-only checkboxes named "Completed task" or "Incomplete task".
- MarkdownEditor's source as a native textarea tied to its label, description and error, a toolbar named "Markdown formatting" whose buttons are named, with tooltips, and keep the selection, and tabs named "Markdown editor views".
- Status messages for refused links and changes beyond `maxLength`.

### You provide

- A `label` for MarkdownEditor, or `aria-label` or `aria-labelledby`.
- Alternative text for images, and link text that names its destination.
- The link picker behind `onRequestLink`, and saving, validation and drafts.
- The words in the page's language, through EnvUIProvider's `messages`: `markdown` for the table and task names, `markdownEditor` for the toolbar's and tabs' names, the empty preview and the status messages, `editor` for the formatting commands and `linkDialog` for the link dialog.

## Examples

### Write and preview

MarkdownEditor with a label and a description grows with its text; the Preview tab renders it two heading levels down, as the page that shows it will.

```tsx example=EditDescription

```

### Open links in a panel

`renderLink` opens document links in a panel with a plain click, and leaves modified clicks and other links to the browser.

```tsx example=OpenInPanel

```

### Render an element your way

`components` replaces how an element renders: here a quote becomes an Alert.

```tsx example=CustomElements

```

### An application's link picker

`onRequestLink` lets the application choose the link, here after a pause that stands in for its picker, with a shorter toolbar.

```tsx example=LinkPicker

```

## Changelog

- **1.0.0**: MarkdownEditor takes Textarea's `description` instead of `hint`, and its variants `outline`, `underline` and `ghost`, which the `v1-props` codemod writes. `className` and `style` style the root, `env-markdown-editor`, rather than the textarea; `ref` and the other native props still reach the textarea. Its toolbar is a Toolbar, with tooltips instead of native titles, and its words come from EnvUIProvider's `messages`, as do Markdown's table and task names. Markdown's root carries `env-prose` beside `env-markdown`. Markdown is stable; MarkdownEditor stays beta.
- **0.7.0**: Code in Markdown takes the code theme of the app theme; `inlineCode` is removed.
- **0.5.0**: `components`, `remarkPlugins` and `rehypePlugins`; raw HTML is dropped before any rehype plugin runs, except keys written as `<kbd>`, which render as Kbd.
- **0.1.0**: Markdown and MarkdownEditor.
