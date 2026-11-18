---
'@envsemble/envui': minor
'@envsemble/eslint-plugin-envui': minor
'@envsemble/stylelint-config-envui': minor
---

What an application had to add on its own is now envUI's:

- **Focus after navigation.** In a Scaffold, when the page changes, focus moves to the title of the new page's PageHeader: as a level 1 PageHeader mounts after the Scaffold first showed, or as its title changes. People using a screen reader hear the new page, and the next Tab starts from it. The first load leaves focus alone, focus in a field or an open overlay stays where it is, and the title shows no focus ring. `focusOnNavigation={false}` on PageHeader leaves focus to the application.
- **The body's margin.** In a document whose root envUI themes, as ThemePreferenceProvider and the theme bootstrap script do, envUI's style sheet sets `margin: 0` on `body`, in its lowest layer, so a Scaffold no longer sits inside the browser's 8 px margin and scrolls by 16 px. Any body margin of the application's own still wins, and an application can drop its `body { margin: 0 }`; a host page that only holds envUI elements keeps its own.
- **VisuallyHidden**: content assistive technology reads and the screen doesn't show, such as words that complete a short label or a heading over a region whose purpose shows. `render` gives its element, a span by default.
- **Tabular figures on Text**: `tabularNumbers` gives every digit the same width, for a countdown, a code or numbers in a column.
- **RelativeTime says yesterday and tomorrow.** A moment a day or so away on the previous or the next calendar day reads "yesterday" or "tomorrow", in the locale's words, instead of "1 day ago" or "in 1 day". `formatRelativeTime` does the same.
- **A code block without the highlighter.** `CodeBlock` and `Code` are in the main entry point, `@envsemble/envui`. CodeBlock shows its source as plain text and loads no highlighter, so a command to copy costs no syntax highlighting and needs no shiki.
- **Toasts are statuses.** A notice is a status, and a danger notice an alert, inside the notifications region; neither is a dialog with a heading any more, so notices no longer add headings to the page's outline or dialogs to the accessibility tree.
- The README says envUI is open source under the MIT license.

Breaking changes:

- `Code`, `CodeBlock`, `CodeProps` and `CodeBlockProps` move from `@envsemble/envui/code` to `@envsemble/envui`: write `import { Code, CodeBlock } from '@envsemble/envui'`.
- `CodeBlock` takes no `language`: for highlighted source write `import { HighlightedCodeBlock } from '@envsemble/envui/code'` and `<HighlightedCodeBlock language="tsx">`, which takes CodeBlock's props and `language` (`HighlightedCodeBlockProps`). `@envsemble/envui/code` exports only HighlightedCodeBlock now, and only it needs shiki.
