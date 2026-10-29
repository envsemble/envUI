---
title: RichText
summary: Formatted text people edit as it looks, saved as Markdown with references, and shown again
  read-only.
status: experimental
since: 0.1.0
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
  - text: Showing Markdown from anywhere, with everything Markdown can hold, such as footnotes.
    use: Markdown
  - text: Plain text over several lines, without formatting.
    use: Textarea
  - text: A message in a conversation, sent with Enter.
    use: Composer
  - text: A single line of text, such as a title.
    use: TextField
components:
  - RichText
  - RichTextEditor
  - createRichTextExtensions
examples:
  EditAndPreview:
    role: overview
    motion: true
  RichTextAnatomy: anatomy
  SavedContent: example
  References: example
  SlashCommands: example
  UploadsAndLinks: example
  FewCommands:
    role: do
    caption: The commands the content needs, such as three for a comment.
  EveryCommand:
    role: dont
    caption: 'Every command for a comment: the toolbar outweighs the text.'
---

# RichText

## Variants

| Variant | Use for                                                                         |
| ------- | ------------------------------------------------------------------------------- |
| Outline | A form, a dialog, a pane or a document that is the page's content. The default. |
| Ghost   | Notes in a quiet panel: only the text at rest.                                  |

<!-- specimen: States -->

### Toolbar

The toolbar shows the commands the content needs, in order, or none.

- Commands of one kind share a group, with a line between groups: text styles, lists, blocks, and links and tables.
- Undo and Redo, and Attach files, follow in groups of their own.
- Formatting on at the caret, such as bold, shows as a pressed toggle.

<!-- specimen: ToolbarState -->

## Anatomy

```tsx figure=RichTextAnatomy

```

1. **Editor** (`env-rich-text-editor`)
2. **Toolbar** (`env-editor-toolbar`, `toolbar`)
3. **Document** (`env-rich-text-editor-content`)
4. **Reference** (`env-rich-text-reference`)
5. **Task** (`env-rich-text-task`)
6. **Description** (`env-field-description`, `description`)

Not shown: the suggestions and the status.

## Behaviour

### Show saved content

RichText shows saved text again as it was written, also on a server, and opens its references and links through the application.

```tsx figure=SavedContent

```

### References

Typing a source's trigger, such as @, opens its suggestions, and the reference stays linked to what it names.

```tsx figure=References motion

```

### Slash commands

Typing / offers blocks, such as headings and lists, then the application's own commands.

```tsx figure=SlashCommands motion

```

### Attachments and links

The application can let people attach files, and replace the link dialog with a picker of its own.

```tsx figure=UploadsAndLinks

```

### What it keeps

Headings, emphasis, strikethrough, code, lists and task lists, quotes, links, images, simple tables and references.

- Raw HTML shows as text.
- Other syntax, such as footnotes, needs an extension or [Markdown](markdown.md).

## Rules

Offer the commands the content needs, and describe every image.

```tsx figure=FewCommands

```

```tsx figure=EveryCommand

```

### Content

Give image attachments a label that describes the image: it becomes the alternative text.

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

## Compose

### Usage

```tsx
import { RichText, RichTextEditor } from '@envsemble/envui/rich-text';

<RichTextEditor label="Meeting notes" value={notes} onValueChange={setNotes} />
<RichText>{notes}</RichText>
```

RichTextEditor and RichText come from the optional `@envsemble/envui/rich-text` entry, which needs Tiptap and marked, installed by the application. The editor is a field with its `label`, `description` and `error`, and its value is Markdown: leave it uncontrolled, with `defaultValue`, or control it with `value` and `onValueChange`, which receives the Markdown after every edit, normalized by the editor's schema. `placeholder` shows in an empty document; `readOnly` shows it without editing, and `disabled` turns it off and leaves its value out of a form.

#### Show saved content

RichText renders the Markdown in its `children`, also on a server. Pass it the editor's `extensions`. `onReferenceClick` and `onLinkClick` open references and links; `renderReference` renders a reference's content, such as an avatar beside the name, in both.

#### Toolbar and variants

`toolbar` takes the commands to show, in order, or `false` for none; Undo and Redo, and Attach files with `onUpload`, follow them. `variant` is `outline`, the default, or `ghost`.

#### References and slash commands

```tsx
// At module scope, so the sources stay the same between renders.
const references: RichTextReferenceSource[] = [
  { trigger: '@', label: 'People', search: searchPeople },
  { trigger: '#', label: 'Topics', search: searchTopics },
];

<RichTextEditor label="Comment" references={references} slashCommands />;
```

Each source has its `trigger`, a `label` and a `search` lookup, which receives the `query` and a `signal` that aborts when it changes. The Markdown keeps each reference's ID. `slashCommands` is `true` for heading, the lists, quote, code block and table, or an array that adds the application's commands after them. Keep `references`, `extensions` and `slashCommands` the same between renders: a new array starts a new session and loses undo.

#### Attachments and links

`onUpload` adds Attach files to the toolbar and uploads each chosen file, returning where it lives, `null` to skip it, or a promise of either; `accept` and `multiple` set what it offers. `onRequestLink` replaces the link dialog with the application's picker, returning the link or `null`.

#### Commands from outside

```tsx
const editorRef = useRef<RichTextEditorHandle>(null);

<RichTextEditor ref={editorRef} label="Reply" />
<Button
  onClick={() =>
    editorRef.current?.editor?.chain().focus('end').insertContent(' — Alex Morgan').run()
  }
>
  Add signature
</Button>
```

`ref.current.editor` is the Tiptap editor, so the application can change the document with its commands.

#### In a form

```tsx
<form onSubmit={publish} noValidate>
  <RichTextEditor name="notes" label="Release notes" error={error} />
  <Button type="submit">Publish</Button>
</form>
```

With `name`, a native form submits the Markdown through a hidden input, and `form` names a form the editor sits outside of. `error` says what to fix.

### Composition

`extensions` adds Tiptap extensions to the schema the editor and RichText share, such as a custom mark, which must parse and write Markdown; pass the same ones to both. `createRichTextExtensions` returns that shared set, with `options.extensions` after it, for another Tiptap integration that needs the same schema. The toolbar is the Toolbar MarkdownEditor shares; the suggestions are `env-rich-text-suggestions`, and the status `env-editor-status`.

### Customize

Its popup is frosted, as every popup is: `--env-popup-opacity`, `--env-popup-blur` and `--env-popup-shadow`, set on a theme, change it, as [Popover](popover.md#customize) describes.

## Changelog

- **1.0.0-prerelease.5**: Suggestions are frosted: the popup's color lets a little of what is behind through, blurred, with a soft shadow and no outline edge, and is solid with its edge at high contrast and with reduced transparency, with the rows of Select's list.
- **1.0.0-prerelease.3**: A task's row in RichText is as tall as in the editor. The suggestions keep the active option in view as the arrow keys move past the list's edge, and close as focus leaves the editor rather than on any press on the page.
- **1.0.0-prerelease.2**: The `underline` variant is gone; the `v1-props` codemod drops it for the default outline.
- **1.0.0**: A reference source's `char` is `trigger` and its `items` lookup is `search`, and a reference's `char` is `trigger`; `v1-props` renames them in an array written in `references`. The Markdown saved before keeps working.
- **1.0.0**: RichTextEditor takes the field vocabulary: `description` instead of `hint`, and the variants `outline`, `underline` and `ghost` instead of `outlined`, `plain` and `quiet`, which drew as outlined; the `v1-props` codemod writes them. The document sits in the field's box, with its border, its states and a disabled field whose label stays readable, and task items show envUI's checkboxes beside their text. The toolbar is the Toolbar MarkdownEditor shares, with tooltips, the link dialog is the shared one, and every word comes from EnvUIProvider's `messages`. Suggestions are rows of a listbox in the editor, above a Dialog it sits in, and close as focus leaves; a controlled editor raises no `flushSync` warning. The `./rich-text` entry is experimental.
- **1.0.0**: Tiptap, marked, Shiki and the Pierre themes are no longer peer dependencies; applications that import the rich-text entry install them, as [Setup](../setup.md#public-entry-points) lists.
- **0.5.0**: Text in the document takes the control font size, 1 rem on touch screens, so focusing it doesn't zoom the page.
- **0.2.0**: Tiptap and marked are optional peer dependencies, installed by applications that import the rich-text entry.
- **0.1.0**: RichTextEditor, RichText and `createRichTextExtensions` in `@envsemble/envui/rich-text`, built on Tiptap, with Markdown values, references and slash commands.
