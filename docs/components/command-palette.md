---
title: CommandPalette
summary: A quick-open dialog that finds a document, a page, a person or a command by name.
status: stable
since: 1.0.0
category: Actions
aliases:
  - quick open
  - command menu
  - command bar
  - command launcher
  - cmdk
  - Ctrl+K
  - ⌘K
  - spotlight
  - go to anything
  - jump to
  - omnibox
  - SearchTrigger
  - SearchButton
  - search trigger
  - search button
  - quick open button
  - command palette button
  - search shortcut
  - empty state
  - no results
  - suggestions
  - recent items
useWhen:
  - Jumping to a document, a page or a person by name, from anywhere
  - Running a command by name, such as one without a visible control
  - A search button in the navigation or the top bar, with its shortcut
avoidWhen:
  - text: Choosing a value for a form field from a long list.
    use: Combobox
  - text: A short list of actions behind one control.
    use: Menu
  - text: Searching or filtering the content on the page.
    use: SearchField
components:
  - CommandPalette
examples:
  GoToDocument:
    role: overview
    open: true
  RunCommand: example
  SearchButton: example
  IconOnly: example
  CommandPaletteAnatomy: anatomy
  TypeToSearch: example
  NarrowSidebar: example
---

# CommandPalette

## Variants

### Run a command

```tsx figure=RunCommand motion

```

### Opening it: the button and the shortcut

```tsx figure=SearchButton motion

```

### In a narrow header

```tsx figure=IconOnly motion

```

## Anatomy

```tsx figure=CommandPaletteAnatomy open

```

1. **Palette** (`env-command-palette`)
2. **Search field** (`env-command-palette-input`, `placeholder`)
3. **Group heading** (`env-command-palette-group-label`)
4. **Item** (`env-command-palette-item`, `items`)
5. **Key hints** (`env-command-palette-footer`, `hints`)

## Behaviour

### Suggestions and no matches

```tsx figure=TypeToSearch open motion

```

### Adapting to width

```tsx figure=NarrowSidebar widths="18 11" sweep

```

## Accessibility

### Keyboard

| Key                                                                       | Action                                                               |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| <kbd>⌘</kbd>+<kbd>K</kbd>, or <kbd>Ctrl</kbd>+<kbd>K</kbd>                | Opens the palette from anywhere in the window.                       |
| <kbd>Home</kbd>, <kbd>End</kbd>, <kbd>Page Up</kbd>, <kbd>Page Down</kbd> | Moves to the first or last option, or by a page.                     |
| <kbd>Ctrl</kbd>+<kbd>Enter</kbd> or <kbd>Cmd</kbd>+<kbd>Enter</kbd>       | Chooses it another way the application sets, such as to open beside. |
