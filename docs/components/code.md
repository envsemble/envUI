---
title: Code
summary: Inline code in text, highlighted code blocks with a copy button, and the changes between two versions of a file.
status: stable
since: 0.1.0
category: Text & content
aliases:
  - inline code
  - code block
  - code snippet
  - snippet
  - source code
  - syntax highlighting
  - pre
  - monospace
  - copy code
  - diff
  - code diff
  - diff viewer
  - file diff
useWhen:
  - A command, a value or a file name in a sentence (Code)
  - Source, commands or output to read or copy (CodeBlock)
  - The changes between two versions of a file (CodeDiff)
avoidWhen:
  - text: Keys of a shortcut.
    use: Kbd
  - text: Formatted text written in Markdown, such as notes or a description.
    use: Markdown
  - text: Text people edit, such as a configuration in a form.
    use: Textarea
  - text: The size of a change without its lines.
    use: DiffStat
components:
  - Code
  - CodeBlock
  - CodeDiff
  - countDiffLines
examples:
  HighlightedSource: overview
  InlineCode:
    role: overview
    caption: 'Code: a command, a value or a file name inside a sentence.'
  WrapLongLines:
    role: example
    caption: "Wrapped lines: copying keeps the source's own line breaks."
  CodeBlockAnatomy: anatomy
  PlainOutput:
    role: example
    caption: Without a language, the source stays plain text.
  SettingsDiff: example
  DiffColumns: example
  CommandToCopy:
    role: do
    caption: Commands exactly as people type them, with a copy button.
  CommandWithPrompt:
    role: dont
    caption: 'A prompt such as $: it is copied with the command.'
---

# Code

## Variants

### Long lines

A block keeps the source's layout and scrolls long lines sideways, or wraps them where it holds prose.

```tsx figure=WrapLongLines

```

| Long lines | Use for                                           |
| ---------- | ------------------------------------------------- |
| Scroll     | A block whose layout matters. The default.        |
| Wrap       | A block of prose, such as text in a JSON setting. |

## Anatomy

```tsx figure=CodeBlockAnatomy

```

1. **Block** (`env-code-block`)
2. **Heading** (`env-code-block-heading > span`, `label`)
3. **Copy button** (`env-code-block-heading > button`, `copyable`)
4. **Source** (`env-code-block > pre`, `children`)

## Behaviour

### Highlighting

Code takes its colors from the app theme, light or dark, and stronger ones under high contrast, so every colored word stays readable.

- Inline code sits in a sentence on a faint fill of its own, so a command or a file name stands apart from the words around it.
- Blocks and diffs sit on a faint layer of their own that stands apart from the page, a pane, a card or a popup alike.
- A block shows its plain source first and colors it once the highlighter loads.

```tsx figure=PlainOutput

```

### Diffs

CodeDiff shows what changed between two versions of a file, with the same colors as a block.

- Its added and removed lines are faintly tinted.
- The counts of added and removed lines can feed a DiffStat.

```tsx figure=SettingsDiff

```

### Adapting to width

A diff shows the two versions side by side where it is wide, and in one column in a narrow pane.

| Diff layout  | Use for                                             |
| ------------ | --------------------------------------------------- |
| Side by side | Most diffs, in one column when narrow. The default. |
| One column   | A diff read top to bottom at any width.             |

```tsx figure=DiffColumns widths="36 58" sweep fit

```

## Rules

Show code exactly as people use it, and keep blocks short.

```tsx figure=CommandToCopy

```

```tsx figure=CommandWithPrompt

```

### Length

Keep blocks short, and link to the whole file.

## Accessibility

### Keyboard

| Key                                                    | Action                                           |
| ------------------------------------------------------ | ------------------------------------------------ |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd>        | Moves to a block's copy button, then its source. |
| <kbd>←</kbd>, <kbd>→</kbd>, <kbd>↑</kbd>, <kbd>↓</kbd> | Scroll the focused source.                       |
| <kbd>Enter</kbd>, <kbd>Space</kbd>                     | Copies the source, on Copy code.                 |

### envUI provides

- Native `code` and `pre`, read as text.
- A focusable source named by `label` or its language.
- A copy button named Copy code, then Code copied, with the result announced.
- A busy diff while it loads, and an error with Try again if it fails.

### You provide

- A `label` on each block where a page has several.
- Text around a diff that says what changed.
- Translated words through EnvUIProvider's `messages.codeBlock` and `messages.codeDiff`.

## Compose

### Usage

Code and CodeBlock come from `@envsemble/envui/content`, and CodeDiff and `countDiffLines` from `@envsemble/envui/diff`. Code wraps a command, a value or a file name inside text.

```tsx
<Text>
  Run <Code>npm run build</Code> before you deploy.
</Text>
```

#### Code blocks

CodeBlock takes the source as one string in `children`, shown, highlighted and copied as it is.

- `language` picks the highlighting, such as `tsx`, `json` or `sh`; without one, or with one it doesn't know, the source stays plain text.
- `label` names the block in its heading and for assistive technology, such as a file name, and `copyable` adds the copy button.
- Long lines scroll sideways; `wrap` wraps them instead, and copying keeps the original line breaks.

```tsx source=HighlightedSource

```

#### Diffs

CodeDiff takes `before` and `after`, and a `filename`, which names the file in its header and chooses the language; `language` overrides it.

- `header={false}` leaves out the header with its name and change counts.
- `expandUnchanged` shows the unchanged lines between changes instead of folding them.
- `layout` is `auto`, the default, side by side from 56 rem of width, or `unified`, one column at any width.
- `countDiffLines(before, after, filename)` returns the `additions` and `deletions` for a DiffStat.

```tsx
const { additions, deletions } = countDiffLines(saved, draft, 'settings.json');

<DiffStat additions={additions} deletions={deletions} />
<CodeDiff filename="settings.json" before={saved} after={draft} />
```

#### Highlighting

envUI picks the code theme from the app theme: Shiki's `github-light-default` in the light theme and `github-dark-dimmed`, a grey dark theme, in the dark one, and `github-light-high-contrast` and `github-dark-high-contrast` under high contrast, with every token at 4.5:1 contrast, or 7:1 under high contrast.

- Inline code sits on the neutral muted fill, and blocks and diffs on a translucent layer of the text color, so they stand a step apart from any surface.
- A diff takes the same code theme and token colors as a block, and tints its added and removed lines with their change color over that layer, faintly enough that every token keeps its contrast.
- Code has no theme or color props of its own.

### Customize

Inline code is one part, `env-code`. A block is `env-code-block`: its heading, `env-code-block-heading`, holds the label and the copy button, and the source is its `pre`; the copy result is announced from `env-code-block-copy-status`.

## Changelog

- **1.0.0**: Code, CodeBlock, CodeDiff and Markdown's code use Shiki's `github-light-default` and `github-dark-dimmed` code themes instead of the Pierre themes, and `github-light-high-contrast` and `github-dark-high-contrast` under high contrast; envUI no longer needs `@pierre/theme`. The `DiffCount` that `countDiffLines` feeds is `DiffStat`. Highlighted tokens reach 4.5:1 in both app themes, and 7:1 under high contrast, in code blocks and code diffs. CodeDiff takes CodeBlock's code theme, token colors and translucent layer, instead of a theme and an opaque grey of its own. CodeBlock's and CodeDiff's words come from EnvUIProvider's `messages`; the copy button copies through the selection fallback that CopyButton uses, and its status is `env-code-block-copy-status`.
- **0.7.0**: Code uses the Pierre code themes that Diffs uses, and follows the app theme; `Code`'s `appearance`, `Markdown`'s `inlineCode` and `CodeBlock`'s `theme` are removed. CodeDiff and countDiffLines, in `@envsemble/envui/diff`. The copy button is a quiet icon button.
- **0.1.0**: Code and CodeBlock.
