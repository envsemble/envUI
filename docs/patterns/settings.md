---
title: Settings
summary: Let people change how the application works for them, and see each change apply.
status: beta
since: 1.0.0
intent: Enter and change data
aliases:
  - preferences
  - options
  - account settings
  - notification settings
  - appearance
  - danger zone
useWhen:
  - A preference that applies at once, such as a notification or the theme
  - A few related values saved together, such as a profile
avoidWhen:
  - text: Several answers given once and submitted together, such as creating something.
    see: forms
  - text: A choice that filters or changes the view of the page people are on.
    use: SegmentedControl
  - text: Deleting an account or a workspace.
    see: destructive-actions
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
examples:
  ImmediateToggles:
    role: overview
    motion: true
  SaveSection: example
  AppearanceChoice: example
  DangerZone: example
  SettingsAnatomy: anatomy
  SwitchesApplyAtOnce:
    role: do
    caption: Switches that apply the moment they change, with no Save button.
  SwitchesWithSave:
    role: dont
    caption: "Switches that wait for Save: people can't tell which changes are kept."
---

# Settings

## Variants

### Save a section

Settings that only make sense together wait for a Save button.

- A [Badge](../components/badge.md) marks the section while it holds unsaved changes.
- Cancel puts back what was saved.

```tsx figure=SaveSection motion

```

### Appearance

The theme applies at once. The [scale](../foundations/spacing.md), comfortable or compact, is one for the whole application: it never changes for one page or one section.

```tsx figure=AppearanceChoice motion

```

### Danger zone

The last section, apart from the rest, holds what deletes or ends the account or the workspace, confirmed as [destructive actions](destructive-actions.md) are.

```tsx figure=DangerZone motion

```

## Anatomy

```tsx figure=SettingsAnatomy

```

1. **Section heading** (`env-text`)
2. **Setting** (`env-list-item`)
3. **Switch** (`env-switch`)
4. **Danger zone** (`env-button`)

## Behaviour

### What says it changed

A switch shows its own state, so most changes need no message. A [toast](../components/toast.md) says only what people can't see on the page, such as becoming visible in a directory.

## Rules

Each setting either applies the moment it changes, or waits with the settings it depends on for a Save button, and the two never share a section.

```tsx figure=SwitchesApplyAtOnce

```

```tsx figure=SwitchesWithSave

```

### Sections

Group settings by what people want to do, not by how the data is stored. A long page lists its sections in a [Drawer](../components/drawer.md) beside them, or gives each its own page.

### Content

Name a section after what people want to do, such as "Email notifications", not "User preferences". Label each setting as a [Switch](../components/switch.md)'s label is written, with its effect in the row's detail.

## Accessibility

### Focus and keyboard

<kbd>Space</kbd> turns a focused switch on or off, and focus stays, since nothing moves.

- Save keeps focus on its button and says the outcome in a status.
- A refused Save moves focus to the field to fix.
- The danger zone's dialog takes focus to Cancel and gives it back as it closes.

### envUI provides

- Switch as a native checkbox with the switch role, its label stable in both states.
- RadioGroup as a `fieldset` with a `legend`, moved through with the arrow keys.
- A ConfirmDialog with the alert dialog role, and toasts in a polite live region.

### You provide

- A heading for every section, and a name for every switch: its label, or `aria-labelledby` and `aria-describedby` to the row's title and detail.
- Storing each change, and a status when a section is saved.
- One Toast.Provider and one ThemePreferenceProvider at the root.

## Compose

### Usage

A section of settings that apply at once is a `section` named by its heading, holding a List whose items each take a Switch as their `action`.

- Each Switch's `onCheckedChange` stores the change at once; name it with `aria-labelledby` and `aria-describedby` pointing at the row's title and detail.
- Show a toast through `useToast` only for what the page can't show.
- When storing fails, set the Switch back and show a danger toast with a Try again action.

```tsx source=ImmediateToggles

```

#### Save a section

A section that saves together is a `form` with `noValidate` and an `onSubmit`, on a Surface through `render`.

- A warning Badge, "Unsaved changes", shows while the draft differs from what was saved.
- Save is a `type="submit"` Button with `pending` while it saves, and Cancel, a secondary Button, puts the saved values back.
- Say the outcome in a `role="status"` message, and on a refused Save set the field's `error` and focus it.

```tsx
<Surface render={<form noValidate aria-labelledby="profile-heading" onSubmit={submit} />}>
  {changed && <Badge tone="warning">Unsaved changes</Badge>}
  {fields}
  <Button type="submit" pending={saving}>
    Save
  </Button>
  <Button variant="secondary" onClick={cancel}>
    Cancel
  </Button>
</Surface>
```

#### Appearance

`useThemePreference()` returns the `preference`, `system`, `light` or `dark`, and `setPreference`, which applies it to the whole page at once through the root ThemePreferenceProvider. The scale, `comfortable` or `compact`, is stored by the application and passed to the root provider's `scale`, never to one page or section.

```tsx
<RadioGroup label="Theme" name="theme" value={preference} onValueChange={setPreference}>
  <Radio value="system" label="System" description="Follows your device’s setting." />
  <Radio value="light" label="Light" />
  <Radio value="dark" label="Dark" />
</RadioGroup>
```

#### Danger zone

The danger zone is the last section: a List item whose `action` is an outline Button with `tone="danger"`, opening a ConfirmDialog with `tone="danger"`. Where the action can't be undone and reaches everyone, the dialog holds a TextField for the name, and `onConfirm` sets its `error` and focuses it while the name doesn't match; `onOpenChange` keeps the dialog open meanwhile, as the DangerZone example does.

```tsx
<ConfirmDialog
  open={open}
  onOpenChange={change}
  tone="danger"
  title="Delete the Northwind workspace?"
  confirmLabel="Delete workspace"
  onConfirm={confirm}
>
  <TextField
    ref={field}
    label="Workspace name"
    value={typed}
    error={error}
    onValueChange={setTyped}
  />
</ConfirmDialog>
```

### Composition

Lay the page out as a Page with a PageHeader, its sections in a Column, each a `section` with a `h2` or `h3` Text heading and a List of settings. A long page lists its sections in a Drawer beside them. The anatomy's parts are the section heading, `env-text`, each setting, `env-list-item`, its Switch, `env-switch`, and the danger zone's button, `env-button`. Text fields, Selects and a RadioGroup sit in a section that saves together; a DescriptionList shows values that are only read.

## Changelog

- **1.0.0**: The page is on the figure template.
