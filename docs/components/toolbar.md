---
title: Toolbar
summary: A bar of icon buttons for one subject, such as an editor's formatting, in a row or a column.
status: beta
since: 1.0.0
category: Actions
aliases:
  - toolbar
  - formatting bar
  - action bar
  - button bar
  - tool palette
useWhen:
  - Controls for one subject, such as an editor's formatting
  - Many icon-only actions that would each take a tab stop
  - A palette whose chosen tool stays chosen, such as drawing tools
avoidWhen:
  - text: A form's or a dialog's actions, which keep a tab stop each.
    use: Row
  - text: Buttons joined into one connected control, such as a main action and its menu.
    use: ButtonGroup
  - text: An application's menus of commands, such as File and Edit.
    use: Menubar
components:
  - Toolbar
examples:
  FormattingToolbar:
    role: overview
    motion: true
  DrawingTools: example
  ViewControls: example
  LabelledControls: example
  ToolbarAnatomy: anatomy
---

# Toolbar

## Variants

### Orientation

```tsx figure=DrawingTools

```

### Over content

```tsx figure=ViewControls motion

```

### Labelled buttons and menus

```tsx figure=LabelledControls

```

## Anatomy

```tsx figure=ToolbarAnatomy

```

1. **Group** (`env-toolbar-group`)
2. **Button** (`env-toolbar-button`, `icon`)
3. **Separator** (`env-toolbar-separator`)
