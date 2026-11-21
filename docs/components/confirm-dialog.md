---
title: ConfirmDialog
summary: A dialog that asks people to confirm an action before it runs.
status: beta
since: 1.0.0
category: Overlays
aliases:
  - ConfirmationDialog
  - confirm dialog
  - confirm delete
  - alert dialog
  - are you sure
  - delete confirmation
useWhen:
  - Deleting or ending something, once people read what it affects
  - Confirming an action from a menu item, which can't confirm in place
  - An action that takes a moment and can fail
avoidWhen:
  - text: A low-stakes action confirmed in place with a second press.
    use: ConfirmButton
  - text: A task with fields, a choice between several actions or content to review.
    use: Dialog
  - text: Undoing an action after it ran, such as an archived item.
    use: ToastProvider
components:
  - ConfirmDialog
examples:
  DeleteProject:
    role: overview
    open: true
  ConfirmDialogAnatomy: anatomy
  AsyncWithError: example
  FromMenu: example
---

# ConfirmDialog

## Anatomy

```tsx figure=ConfirmDialogAnatomy open

```

1. **Dialog** (`env-dialog`)
2. **Question** (`env-dialog-title`, `title`)
3. **Description** (`env-dialog-description`, `description`)
4. **Cancel** (`env-dialog-actions > env-button:first-child`, `cancelLabel`)
5. **Confirm** (`env-dialog-actions > env-button:last-child`, `confirmLabel`)

## Behaviour

### Closing

<!-- specimen: PressOutside -->

### An action that can fail

```tsx figure=AsyncWithError motion

```

### From a menu

```tsx figure=FromMenu motion

```
