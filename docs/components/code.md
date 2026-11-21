---
title: Code
summary: Code in text and in blocks, and the changes between two versions of a file.
status: stable
since: 1.0.0
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
  - Commands, output or source to read or copy (CodeBlock, HighlightedCodeBlock)
  - The changes between two versions of a file (CodeDiff)
avoidWhen:
  - text: Keys of a shortcut.
    use: Kbd
  - text: Formatted text written in Markdown, such as notes or a description.
    use: Markdown
components:
  - Code
  - CodeBlock
  - HighlightedCodeBlock
  - CodeDiff
  - countDiffLines
examples:
  HighlightedSource: overview
  InlineCode:
    role: overview
    caption: 'Code: a command, a value or a file name inside a sentence.'
  WrapLongLines: example
  PackageManagers: example
  CodeBlockAnatomy: anatomy
  PlainOutput: example
  SettingsDiff: example
  DiffColumns: example
---

# Code

## Variants

### Long lines

```tsx figure=WrapLongLines motion

```

### Actions in the heading

```tsx figure=PackageManagers

```

## Anatomy

```tsx figure=CodeBlockAnatomy

```

1. **Block** (`env-code-block`)
2. **Label** (`env-code-block-header > span`, `label`)
3. **Copy button** (`env-code-block-header > button`, `copyable`)
4. **Source** (`env-code-block > pre`, `children`)

## Behaviour

### Highlighting

```tsx figure=PlainOutput

```

### Diffs

```tsx figure=SettingsDiff

```

### Adapting to width

```tsx figure=DiffColumns widths="36 58" sweep fit

```
