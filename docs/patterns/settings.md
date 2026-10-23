---
title: Settings
summary: Let people change how the application works for them, and see each change apply.
status: beta
since: 1.0.0
intent: Collect and change information
aliases:
  - preferences
  - options
  - account settings
  - notification settings
  - appearance
  - danger zone
useWhen:
  - Someone changes a preference that applies at once, such as a notification or the theme.
  - Someone edits a few related values that only make sense saved together, such as a profile.
avoidWhen:
  - text: Several answers given once and submitted together, such as creating something.
    see: forms
  - text: A choice that filters or changes the view of the page people are on.
    use: SegmentedControl
composes:
  - Page
  - PageHeader
  - Drawer
  - Surface
  - Column
  - Row
  - Text
  - List
  - DescriptionList
  - Switch
  - Select
  - RadioGroup
  - Radio
  - TextField
  - Badge
  - Button
  - ConfirmDialog
  - Toast
  - useToast
  - useThemePreference
related:
  - forms
  - destructive-actions
  - feedback
  - switch
  - radio
  - description-list
---

# Settings

## Overview

Settings let people change how the application works for them. Each setting either applies the moment it changes, or waits with the settings it depends on for a Save button, and the two never share a section.

```tsx example=ImmediateToggles

```

### What says it changed

A Switch shows its own state, so most changes need no message. A toast through [useToast](../components/toast.md) says only what people can't see on the page, such as becoming visible in a directory. When storing a change fails, put the control back and say so in a toast with Try again.

## Variants

### Save a section

Fields that only make sense together wait in a `form` for Save, marked by a [Badge](../components/badge.md) while they hold unsaved changes; Cancel puts back what was saved.

```tsx example=SaveSection

```

### Appearance

The theme applies at once through `useThemePreference`. The scale is one for the whole app: store it and pass it to the root provider's `scale`, never to one page.

```tsx example=AppearanceChoice

```

### Danger zone

The last section, apart from the rest: an outline danger Button opens a [ConfirmDialog](../components/confirm-dialog.md), which asks for the name when the action can't be undone and reaches everyone, as in [destructive actions](destructive-actions.md).

```tsx example=DangerZone

```

## When to use

```tsx do=SwitchesApplyAtOnce caption="Switches that apply the moment they change, with no Save button."

```

```tsx dont=SwitchesWithSave caption="Switches that wait for Save: people can't tell which changes are kept."

```

- Group settings by what people want to do, not by how the data is stored.
- A long page lists its sections in a [Drawer](../components/drawer.md) beside them, or gives each its own page.

### Content

- Name a section after what people want to do, "Email notifications", not "User preferences".
- Label a switch with the setting, positive and the same in both states, "Show me in the directory", and its effect in the row's detail.
- Name buttons with a verb and an object: "Save profile", "Delete workspace…".

## Anatomy

```tsx anatomy=SettingsAnatomy

```

1. **Section heading** (`env-text`)
2. **Setting** (`env-list-item`)
3. **Switch** (`env-switch`)
4. **Danger zone** (`env-button`)

## Accessibility

Space turns a focused Switch on or off, and focus stays, since nothing moves. Save keeps focus on its button and says the outcome in a status; a refused Save moves focus to the field to fix. The danger zone's dialog takes focus to Cancel and gives it back as it closes.

### envUI provides

- Switch as a native checkbox with the switch role, its label stable in both states.
- RadioGroup as a `fieldset` with a `legend`, moved through with the arrow keys.
- A ConfirmDialog with the alert dialog role, and toasts in a polite live region.

### You provide

- A heading for every section, and a name for every switch: its label, or `aria-labelledby` and `aria-describedby` to the row's title and detail.
- Storing each change, and a status when a section is saved.
- One Toast.Provider and one ThemePreferenceProvider at the root.

## Changelog

- **1.0.0**: The page is on the figure template.
