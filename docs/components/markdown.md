---
title: Markdown
summary: Renders a Markdown string in envUI's typography and code, and MarkdownEditor writes one with a toolbar and a preview.
status: stable
statuses:
  MarkdownEditor: beta
since: 0.1.0
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
  - text: Source code to read or copy on its own.
    use: CodeBlock
components:
  - Markdown
  - MarkdownEditor
examples:
  WriteNote: overview
  EditDescription:
    role: overview
    caption: 'MarkdownEditor: a toolbar, and a preview of the text.'
    motion: true
    wide: true
  LinkPicker: example
  MarkdownEditorAnatomy: anatomy
  OpenInPanel: example
  CustomElements: example
  ProjectNote: example
---

# Markdown

## Variants

### Editor sizing

An editor keeps its height for a long document, or grows with its text for a short one.

| Editor sizing       | Use for                                                    |
| ------------------- | ---------------------------------------------------------- |
| Fixed height        | A long document: the source keeps its height. The default. |
| Grows with its text | A short description.                                       |

<!-- specimen: EditorSizing -->

### Toolbar

The toolbar holds the actions the text needs, as [RichText](rich-text.md#toolbar)'s does, and can offer a link picker of the application's own.

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

A rendered document is a single part, in which each table scrolls in a region of its own.

## Behaviour

### What it renders

Common Markdown with tables, strikethrough, task lists, automatic links and footnotes.

- Raw HTML is ignored, except keys, which render as Kbd.

```tsx figure=ProjectNote

```

### Links

Links can open the application's own way, such as in a panel, while clicks with a modifier key stay the browser's.

```tsx figure=OpenInPanel motion

```

### Your own elements

The application can change how an element renders, here a quote as an Alert, and extend what the Markdown can hold.

```tsx figure=CustomElements

```

## Rules

Write the source so that every reader gets the whole document.

### Content

Give images alternative text in the source.

## Accessibility

### Keyboard

On Apple keyboards, <kbd>Cmd</kbd> replaces <kbd>Ctrl</kbd>.

| Key                                                                         | Action                                                 |
| --------------------------------------------------------------------------- | ------------------------------------------------------ |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd>                             | Moves through links, tables, tabs, toolbar and source. |
| <kbd>←</kbd>, <kbd>→</kbd>                                                  | Moves between tabs, or between toolbar actions.        |
| <kbd>Ctrl</kbd>+<kbd>B</kbd>, <kbd>I</kbd>, <kbd>K</kbd>                    | Bold, italic or a link, in the source.                 |
| <kbd>Ctrl</kbd>+<kbd>Z</kbd>                                                | Undoes.                                                |
| <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Z</kbd>, <kbd>Ctrl</kbd>+<kbd>Y</kbd> | Redoes.                                                |

### envUI provides

- Native headings, lists, quotes, tables and links.
- Tables in focusable, scrolling regions named after their caption or heading.
- Task items as read-only checkboxes.
- A native textarea tied to its label, a named toolbar and named tabs.

### You provide

- A `label` for MarkdownEditor.
- Link text that names its destination.
- Translated words through EnvUIProvider's `messages`.

## Compose

### Usage

Markdown and MarkdownEditor come from `@envsemble/envui/content`. Markdown renders the string in `children`: CommonMark with tables, strikethrough, task lists, automatic links and footnotes.

- Raw HTML is ignored, except keys written as `<kbd>`, which render as Kbd.
- `headingOffset` adds to the document's heading levels, capped at h6: set it so the first heading sits one level below the page's.
- `codeCopyable` gives each code block a copy button.

```tsx source=ProjectNote

```

#### Links

`renderLink` renders each link from its safe `href` and native anchor props, such as to open some in a panel; keep a real anchor with its destination, so modified clicks stay the browser's.

```tsx
<Markdown
  renderLink={({ href, children, ...props }) => (
    <Link {...props} href={href} onClick={openDocumentLinksInPanel}>
      {children}
    </Link>
  )}
>
  {text}
</Markdown>
```

#### Your own elements

`components` replaces how an element renders, merged over envUI's own, with the application's winning; native props such as `id` and `className` reach the element.

- `remarkPlugins` run after envUI's own Markdown extensions, and `rehypePlugins` after raw HTML is dropped; envUI adds no rehype plugins of its own.
- Don't render untrusted Markdown with a plugin that brings raw HTML back.

```tsx
<Markdown
  components={{
    blockquote: ({ node: _node, children }) => <Alert title="Rule">{children}</Alert>,
  }}
>
  {text}
</Markdown>
```

#### The editor

MarkdownEditor is a Textarea with a toolbar and Write and Preview tabs.

- Leave it uncontrolled with `defaultValue`, which a form reset restores, or control it with `value` and `onValueChange`, which receives the whole source after typing, formatting, undo or redo; replacing `value` clears the undo history.
- It takes Textarea's `label`, `description`, `error` and `rows`, and `variant` is `outline`, the default, or `ghost`.
- `sizing` is `fixed`, the default, which keeps the height and scrolls, or `content`, which grows with the text.
- `preview={false}` hides the tabs, and `previewProps` passes `headingOffset`, `renderLink` and `codeCopyable` to the Markdown of the preview.

```tsx
<MarkdownEditor
  label="Description"
  sizing="content"
  rows={4}
  value={description}
  onValueChange={setDescription}
  previewProps={{ headingOffset: 2 }}
/>
```

#### Toolbar and link picker

`toolbar` lists the actions, of `heading`, `bold`, `italic`, `inline-code`, `bullet-list`, `numbered-list`, `quote`, `code-block` and `link`, shown in that order, grouped by kind; undo and redo come with a visible toolbar, and `toolbar={false}` hides it. `pickLink` opens the application's own link picker: it receives the `selectedText` and returns a MarkdownLink, `{ label, href }`, or `null` to cancel, also as a promise.

```tsx
<MarkdownEditor
  label="Notes"
  toolbar={['bold', 'italic', 'link']}
  pickLink={({ selectedText }) => pickDocument(selectedText)}
/>
```

### Customize

The editor's root is `env-markdown-editor`, with the tabs, `env-tabs-list`, the toolbar, a Toolbar in `env-editor-toolbar`, the source, `env-markdown-editor-input`, and the description, `env-field-description`.

- `className` and `style` reach the root, and `ref` and the other native props the textarea.
- A rendered document is `env-markdown`, with `env-prose`, and a table in it scrolls in `env-markdown-table`.
- Lists in it take envUI's list markers: a small spark, four points with curved sides, in the text color, or the item's number in the muted text color, with a smaller muted spark or a letter one level in.

## Changelog

- **1.0.0-prerelease.5**: `onRequestLink` is `pickLink`: it supplies the link rather than reporting an event.
- **1.0.0-prerelease.2**: MarkdownEditor's `underline` variant, which `plain` became in the earlier prereleases, is gone; the `v1-props` codemod drops `underline` and `plain` for the default outline.
- **1.0.0**: Code in Markdown takes the new code themes, as Code and CodeBlock do. MarkdownEditor takes Textarea's `description` instead of `hint`, and its variants `outline` and `ghost`: `outlined` is `outline` and `quiet` is `ghost`, which the `v1-props` codemod writes, and it drops `plain` for the default outline. `className` and `style` style the root, `env-markdown-editor`, rather than the textarea; `ref` and the other native props still reach the textarea. Its toolbar is a Toolbar, with tooltips instead of native titles, and its words come from EnvUIProvider's `messages`, as do Markdown's table and task names. Markdown's root carries `env-prose` beside `env-markdown`. Markdown is stable; MarkdownEditor stays beta. The editor's source text area, `env-markdown-source`, is `env-markdown-editor-input`, a MarkdownEditor part as `env-text-field-input` is a TextField's.
- **0.7.0**: Code in Markdown takes the code theme of the app theme; `inlineCode` is removed.
- **0.5.0**: `components`, `remarkPlugins` and `rehypePlugins`; raw HTML is dropped before any rehype plugin runs, except keys written as `<kbd>`, which render as Kbd.
- **0.1.0**: Markdown and MarkdownEditor.
