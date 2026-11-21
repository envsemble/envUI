---
title: Dialog
summary: A window over the page for one focused task.
status: stable
since: 1.0.0
category: Overlays
aliases:
  - modal
  - modal dialog
  - popup
useWhen:
  - A decision before a consequence, such as deleting a project
  - A short task that needs attention first, such as inviting a member
  - Content that needs more room than a popup, such as a comparison
avoidWhen:
  - text: A question before one action that names its consequence.
    use: ConfirmDialog
  - text: Details or a few fields beside the control that opens them.
    use: Popover
  - text: An item's details or filters in a panel at the edge of the window.
    use: Sheet
components:
  - Dialog
  - DialogClose
  - useDialogPending
examples:
  ProjectDetails:
    role: overview
    open: true
  FindPlan: example
  ReviewChanges: example
  DialogAnatomy: anatomy
  RenameProject: example
  UnsavedChanges: example
  EditMember: example
---

# Dialog

## Variants

### Placement

```tsx figure=FindPlan motion

```

### Widths

```tsx figure=ReviewChanges motion

```

## Anatomy

```tsx figure=DialogAnatomy open

```

1. **Dialog** (`env-dialog`)
2. **Title** (`env-dialog-title`, `title`)
3. **Description** (`env-dialog-description`, `description`)
4. **Content** (`env-text-field`, `children`)
5. **Close button** (`env-dialog-actions > env-button:first-child`, `closeLabel`)
6. **Action** (`env-dialog-actions > env-button:last-child`, `actions`)

## Behaviour

### Pending work

```tsx figure=RenameProject motion

```

### Closing actions

```tsx figure=UnsavedChanges motion

```

### Actions at the start

```tsx figure=EditMember

```
