---
title: Select
summary: One choice from a list that stays collapsed until opened.
status: stable
since: 1.0.0
category: Forms & selection
aliases:
  - dropdown
  - drop-down
  - dropdown list
  - select menu
  - select box
  - listbox
  - picker
  - option picker
  - pick list
  - choose from a list
useWhen:
  - One of several known options, such as a role, a sort order or a time zone
  - A setting in a form with its label above it, such as a digest's frequency
  - A choice in a toolbar, such as a zoom level
avoidWhen:
  - text: Options that each need a sentence, or that must all stay in view.
    use: RadioGroup
  - text: Finding one option in a long list by typing, or choosing several.
    use: Combobox
  - text: A list of actions, such as Rename or Delete, rather than a value.
    use: Menu
components:
  - Select
examples:
  ProjectVisibility:
    role: overview
    open: true
  SmallToolbar: example
  Assignee: example
  SelectAnatomy: anatomy
  SelectListAnatomy: anatomy
  SettingsForm: example
---

# Select

## Variants

### Sizes

```tsx figure=SmallToolbar

```

### Pictures and groups

```tsx figure=Assignee

```

## Anatomy

```tsx figure=SelectAnatomy

```

1. **Select** (`env-select`)
2. **Label** (`env-select-label`, `label`)
3. **Trigger** (`env-select-trigger`)
4. **Value** (`env-select-trigger > span::text`)
5. **Chevron** (`env-select-icon`)
6. **Description** (`env-field-description`, `description`)

```tsx figure=SelectListAnatomy open

```

1. **List** (`env-select-popup`)
2. **Option** (`env-select-item`, `items`)
3. **Check** (`env-select-item-indicator`)

## Behaviour

### States

<!-- specimen: States -->

### Typing in the open list

<!-- specimen: ProjectVisibility -->

### In a settings form

```tsx figure=SettingsForm

```
