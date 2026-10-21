---
title: Code
summary: Inline code in text, highlighted code blocks with a copy button, and the changes between two versions of a file.
status: stable
since: 0.1.0
category: Content & guidance
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
  - Text names a command, a value, a file or an identifier, such as `npm run build` (Code).
  - Source, commands or output of several lines are shown to read or copy, such as an install step (CodeBlock).
  - People review the changes between two versions of a file, such as a draft against its saved version (CodeDiff).
avoidWhen:
  - text: Keys of a shortcut.
    use: Kbd
  - text: Formatted text written in Markdown, such as notes or a description.
    use: Markdown
  - text: Text people edit, such as a configuration in a form.
    use: Textarea
  - text: The size of a change without its lines.
    use: DiffStat
related:
  - markdown
  - kbd
  - badge
  - typography
  - accessibility
components:
  - Code
  - CodeBlock
  - CodeDiff
  - countDiffLines
---

# Code

## Overview

Code shows source as selectable text that never runs: inline in a sentence, as a block, or as a diff. Code and CodeBlock come from `@envsemble/envui/content`, CodeDiff from `@envsemble/envui/diff`.

```tsx example=HighlightedSource

```

### Inline code

Code sits inside a sentence, for a command, a value or a file name.

```tsx example=InlineCode

```

### Highlighting

envUI picks the code theme from the app theme: Shiki's `github-light-default` in the light theme and `github-dark-dimmed`, a grey dark theme, in the dark one, and `github-light-high-contrast` and `github-dark-high-contrast` under high contrast, with every token at 4.5:1 contrast, or 7:1 under high contrast. Inline code sits on the theme's own color for code in text, and blocks and diffs on a muted grey a step from the page. A block shows its plain source first and colors it once the highlighter loads.

```tsx example=PlainOutput caption="Without a language, the source stays plain text."

```

### Diffs

CodeDiff shows what changed between two versions of a file; `countDiffLines` counts the lines for a DiffStat.

```tsx example=SettingsDiff

```

## Variants

| Layout    | Use for                                                       |
| --------- | ------------------------------------------------------------- |
| (default) | A CodeBlock whose layout matters: long lines scroll sideways. |
| `wrap`    | A CodeBlock of prose, such as text in JSON: long lines wrap.  |
| `auto`    | CodeDiff side by side where it is wide enough. The default.   |
| `unified` | CodeDiff in one column at any width.                          |

```tsx example=WrapLongLines

```

## When to use

```tsx do=CommandToCopy caption="Commands exactly as people type them, with copyable."

```

```tsx dont=CommandWithPrompt caption="A prompt such as $: it is copied with the command."

```

- Don't style code or pick its colors: envUI follows the app theme.
- Keep blocks short, and link to the whole file.

### Content

```tsx do=ExactValue caption="Exact values in Code, the sentence around them in plain text."

```

```tsx dont=SentenceAsCode caption="A whole sentence in Code: it reads as a value to type."

```

## Anatomy

```tsx anatomy=CodeBlockAnatomy

```

1. **Block** (`env-code-block`)
2. **Heading** (`env-code-block-heading > span`, `label`)
3. **Copy button** (`env-code-block-heading > button`, `copyable`)
4. **Source** (`env-code-block > pre`, `children`)

Inline code is one part, `env-code`.

## Adapting to width

A CodeDiff shows the two versions side by side from 56 rem, and one column below.

```tsx example=DiffColumns widths="36 60"

```

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
- A busy diff while it loads, and an error with Retry if it fails.

### You provide

- A `label` on each block where a page has several.
- Text around a diff that says what changed.
- Translated words through EnvUIProvider's `messages.codeBlock` and `messages.codeDiff`.

## Changelog

- **1.0.0**: Code, CodeBlock, CodeDiff and Markdown's code use Shiki's `github-light-default` and `github-dark-dimmed` code themes instead of the Pierre themes, and `github-light-high-contrast` and `github-dark-high-contrast` under high contrast; `@pierre/theme` is no longer a peer. The `DiffCount` that `countDiffLines` feeds is `DiffStat`. Highlighted tokens reach 4.5:1 in both app themes, and 7:1 under high contrast, in code blocks and code diffs. CodeBlock's and CodeDiff's words come from EnvUIProvider's `messages`; the copy button copies through the selection fallback that CopyButton uses, and its status is `env-code-block-copy-status`.
- **0.7.0**: Code uses the Pierre code themes that Diffs uses, and follows the app theme; `Code`'s `appearance`, `Markdown`'s `inlineCode` and `CodeBlock`'s `theme` are removed. CodeDiff and countDiffLines, in `@envsemble/envui/diff`. The copy button is a quiet icon button.
- **0.1.0**: Code and CodeBlock.
