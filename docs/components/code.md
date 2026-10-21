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

Code shows source in the code theme of the app theme: the Pierre themes that Diffs uses, Pierre Light on its own light grey in the light app theme, so code stands out on the page, and Pierre Dark in the dark one. Every token color reaches 4.5:1 on code's background, and 7:1 under high contrast: where a Pierre color falls short, envUI uses the closest color of the same hue that reaches it, keeping as much of its chroma as the color space allows, so in the light theme the oranges, yellows, greens and cyans are darker and in the dark theme comments are lighter. Tokens that had different colors keep different colors. envUI computes these colors when code first loads, from the Pierre themes installed. envUI chooses the code theme; applications don't set it. The source is selectable text and never runs.

- **Code** is inline code inside a sentence, from `@envsemble/envui/content`.
- **CodeBlock** shows source of several lines, highlighted for its `language`, with an optional label and copy button, from `@envsemble/envui/content`.
- **CodeDiff** shows the changes between two versions of a file, rendered by [Diffs](https://diffs.com), and **countDiffLines** counts the lines they add and remove, from `@envsemble/envui/diff`.

```tsx example=InstallSteps

```

## Anatomy

1. **Inline code** (Code): the text in the code font at 0.9 of the text around it, on the code background with 0.5 rem corners. It wraps anywhere, and each line keeps its padding.
2. **Block** (CodeBlock): the code background with 0.5 rem corners and 1.5 rem padding, and the source in the code font, 0.8125 rem with a line height of 1.7.
3. **Heading** (with `label` or `copyable`): the `label`, or the language, or "Code", in the small body type, 0.75 rem above the source.
4. **Copy button** (`copyable`): a quiet icon button at the end of the heading, named "Copy code", which shows a check once it has copied.
5. **Source** (`children`): a focusable `pre`, named by `label` or the language, that scrolls or wraps long lines.
6. **Diff** (CodeDiff): Diffs' file header with the file's name and its change counts (`header`), and the changed lines, folding unchanged lines between changes unless `expandUnchanged`.

## Variants and sizes

| Layout    | Use for                                                                                                               |
| --------- | --------------------------------------------------------------------------------------------------------------------- |
| `wrap`    | CodeBlock source where reading the whole line matters more than its layout, such as prose in JSON: long lines wrap.   |
| (default) | CodeBlock source whose layout matters: long lines scroll sideways inside the block.                                   |
| `auto`    | CodeDiff: the old and new versions side by side once the diff is 56 rem wide, and one column below that. The default. |
| `unified` | CodeDiff: one column of changes at any width.                                                                         |

- CodeBlock highlights JavaScript and JSX, TypeScript and TSX, Java, JSON, HTML and XML, CSS, SQL, shell (sh, bash), YAML (yml), Markdown (md) and INI. Other languages, and no language, stay plain text.
- A CodeBlock fills its container's width; CodeDiff takes the width it is given and wraps long lines.

## States and behaviour

- **Highlighting**: a block renders its plain source first, also on a server, and colors it once the shared highlighter has loaded; the tokens carry both code themes, so switching the app theme recolors code without highlighting it again. In a diff, tokens also reach 4.5:1, or 7:1 under high contrast, on the lines tinted for additions and deletions, and so do the change counts on code's background. High contrast follows the nearest Theme's `contrast`, or `prefers-contrast: more` where it is `system`. Blocks above 50,000 characters, or with a line above 2,000 characters, stay plain text.
- **Copying**: the copy button writes the original source, with its line breaks, to the clipboard, turns into a check named "Code copied" and announces "Copied." for 3 seconds. Where the Clipboard API is unavailable it copies through a selection of a hidden field, and where that fails too it selects the source for people to copy, and announces how.
- **Focus**: the source takes keyboard focus, with a focus outline, so a block that scrolls can be scrolled from the keyboard.
- **Diff loading**: while Diffs' highlighter loads the file's language, CodeDiff shows skeleton lines and reports `aria-busy`; if it fails, an error state with Retry replaces them.
- **Diff contents**: `filename` names the file and chooses its language from its extension, unless `language` does. When `before` and `after` are the same, CodeDiff shows the whole file. `countDiffLines(before, after)` returns `{ additions, deletions }` for a DiffStat, and zero for both when nothing changed.

## Content guidelines

- Show source exactly as people should type or copy it, without prompts such as `$` that would be copied too.
- Give a block a `label` that says what it is, such as a file name or "Terminal", so its heading and its accessible name say it.
- Keep blocks short; link to the whole file rather than showing it.
- Use inline code for exact values only, and keep sentences around it in plain text.

## Do and don't

### Do

- Set `language` so a block is highlighted, and `copyable` on commands and snippets people copy.
- Use `wrap` where lines are prose, and leave source with meaningful layout unwrapped.
- Name a CodeDiff's file with its extension, such as `settings.json`, so it picks the language.

### Don't

- Don't style code yourself or pick its colors; envUI follows the app theme.
- Don't put code in Kbd, or keys in Code; use [Kbd](../components/kbd.md) for keys.
- Don't use a CodeBlock for text people edit; use [Textarea](../components/text-field.md).

## Accessibility

### Keyboard

| Key                                                    | Action                                                       |
| ------------------------------------------------------ | ------------------------------------------------------------ |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd>        | Moves focus to a block's copy button and then to its source. |
| <kbd>←</kbd>, <kbd>→</kbd>, <kbd>↑</kbd>, <kbd>↓</kbd> | Scroll the focused source of a block that doesn't fit.       |
| <kbd>Enter</kbd> or <kbd>Space</kbd> on Copy code      | Copies the source.                                           |

### envUI provides

- Native `code` and `pre` elements, so assistive technology reads the source as text.
- A focusable source named by `label` or the language, such as "tsx code", with a focus outline.
- A copy button named "Copy code", then "Code copied", and a status that announces the result.
- Code colors from the Pierre themes on their own background in both app themes, each token at 4.5:1 or more, and 7:1 or more under high contrast, also on a diff's tinted lines.
- A busy diff while it loads, and an error state with a Retry button if it fails.

### You provide

- A `label` that names each block where a page has several.
- Text around a diff that says what changed and where, since a diff is read line by line.
- The words in the page's language, through EnvUIProvider's `messages.codeBlock` (the heading without a label, the copy button's names and announcements, and the region's name) and `messages.codeDiff` (the loading name, the error and Retry).

## Examples

### Highlighted source

`language` highlights the source, and the label names the file. Copying writes the original string.

```tsx example=HighlightedSource

```

### Wrap long lines

With `wrap` long lines wrap inside the block; copying keeps their original line breaks.

```tsx example=WrapLongLines

```

### Plain text

Without a language, such as for a command's output, the source stays plain text.

```tsx example=PlainOutput

```

### Code diff

CodeDiff shows what a draft changes in a file, and countDiffLines counts its lines for a DiffStat beside the title.

```tsx example=SettingsDiff

```

## Changelog

- **1.0.0**: The `DiffCount` that `countDiffLines` feeds is `DiffStat`. Highlighted tokens reach 4.5:1 in both app themes, and 7:1 under high contrast, in code blocks and code diffs. CodeBlock's and CodeDiff's words come from EnvUIProvider's `messages`; the copy button copies through the selection fallback that CopyButton uses, and its status is `env-code-block-copy-status`.
- **0.7.0**: Code uses the Pierre code themes that Diffs uses, and follows the app theme; `Code`'s `appearance`, `Markdown`'s `inlineCode` and `CodeBlock`'s `theme` are removed. CodeDiff and countDiffLines, in `@envsemble/envui/diff`. The copy button is a quiet icon button.
- **0.1.0**: Code and CodeBlock.
