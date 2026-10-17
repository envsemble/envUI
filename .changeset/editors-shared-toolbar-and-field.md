---
'@envsemble/envui': major
---

MarkdownEditor and RichTextEditor share their toolbar, their link dialog and their status, and take their words from EnvUIProvider's `messages` (`markdownEditor`, `richText`, `editor` for the formatting commands and `linkDialog`):

- The toolbar is a Toolbar of buttons, each named in a tooltip instead of a native `title`; it keeps the selection in the editor and scrolls sideways where it doesn't fit. Its class is `env-editor-toolbar`, where it was `env-markdown-toolbar`, and the status line's is `env-editor-status`, where it was `env-markdown-editor-status`.
- The link dialog says "Enter a valid URL." for an empty destination and "Enter a valid URL or relative path." for one the editor can't link to, before it inserts anything.
- MarkdownEditor takes `ref` as a prop.

RichTextEditor takes the field vocabulary and the field's look, in the experimental `./rich-text` entry:

- `hint` is `description`, and `variant` is `outline` (the default), `underline` or `ghost`, as on a text area: `outlined` is `outline`, `plain` is `underline`, and `quiet`, which drew as outlined, is `ghost`. The `v1-props` codemod writes both.
- The document sits in the field's control box, with the field border, its invalid and disabled states and the variants; a disabled editor dims the box and keeps its label at the text color. RichTextEditor takes `ref` as a prop.
- Task items in the editor are envUI checkboxes beside their text, named by it.
- Suggestions are the rows of a listbox in the editor, so they show above a Dialog the editor sits in, and they close as focus leaves the document, also with Tab.
- A controlled editor applies a new `value` after React's commit, so replacing a document with references or tasks raises no `flushSync` warning.
- References with a destination are links through `LinkProvider`.

MarkdownEditor stays beta, and the `./rich-text` entry, RichText, RichTextEditor and `createRichTextExtensions`, is experimental.

Migration guide: [Shell, dock, editors and code](../../docs/migration.md#shell-dock-editors-and-code).
