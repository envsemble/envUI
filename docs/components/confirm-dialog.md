---
title: ConfirmDialog
summary: An alert dialog that asks people to confirm an action whose consequence needs a sentence, and waits for the action to finish.
status: beta
since: 1.0.0
category: Feedback & overlays
aliases:
  - ConfirmationDialog
  - confirm dialog
  - confirm delete
  - alert dialog
  - are you sure
  - delete confirmation
useWhen:
  - An action deletes or ends something and people should read what it affects first, such as deleting a project.
  - An action started from a menu item, which can't confirm in place, needs a confirmation.
  - The action takes a moment and can fail, and the confirmation should stay until it has finished.
avoidWhen:
  - text: Confirming a low-stakes action in place with a second press, such as removing a row.
    use: ConfirmButton
  - text: A task with fields, a choice between several actions or content to review.
    use: Dialog
  - text: Undoing an action after it ran, such as an archived item.
    use: Toast
  - text: A warning that needs no answer, shown in the page.
    use: Alert
components:
  - ConfirmDialog
---

# ConfirmDialog

## Overview

A press outside doesn't close a ConfirmDialog.

```tsx example=DeleteProject

```

### An action that can fail

When `onConfirm` returns a promise, the dialog waits for it, pending, and stays open with `error` when it fails.

```tsx example=AsyncWithError

```

### From a menu

Without a `trigger`, open it with `open` and `onOpenChange`; `finalFocus` returns focus to the menu's button.

```tsx example=FromMenu

```

## Variants

| Tone      | Use for                                                                                                 |
| --------- | ------------------------------------------------------------------------------------------------------- |
| `neutral` | An action people can get back from, such as archiving. Focus starts on the confirm button. The default. |
| `danger`  | An action that deletes or ends something. Focus starts on Cancel.                                       |

```tsx example=ArchiveProject caption="The neutral tone."

```

## When to use

```tsx do=DangerForDelete open caption="tone=danger for an action that deletes."

```

```tsx dont=NeutralForDelete open caption="A neutral deletion: focus starts on Delete, so a hurried Enter deletes."

```

### Content

```tsx do=NameTheConsequence open caption="Buttons that name what each choice does."

```

```tsx dont=YesNo open caption="Yes and No: people read the question again to choose."

```

## Anatomy

```tsx anatomy=ConfirmDialogAnatomy open

```

1. **Dialog** (`env-dialog-popup`)
2. **Question** (`env-dialog-title`, `title`)
3. **Description** (`env-dialog-description`, `description`)
4. **Cancel** (`env-dialog-actions > env-button:first-child`, `cancelLabel`)
5. **Confirm** (`env-dialog-actions > env-button:last-child`, `confirmLabel`)

Not shown: the error of a failed action, an `env-alert` above the buttons.

## Accessibility

### Keyboard

| Key                                             | Action                                                       |
| ----------------------------------------------- | ------------------------------------------------------------ |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves between Cancel and the confirm button; focus stays in. |
| <kbd>Enter</kbd> in a field of the content      | Confirms, as the confirm button does.                        |
| <kbd>Esc</kbd>                                  | Closes the dialog, unless the action is running.             |

### envUI provides

- `role="alertdialog"`, named by `title` and described by `description`.
- Focus trapped inside, and returned on close.
- `aria-busy` while the action runs, and the `error` announced as an alert.

### You provide

- A `title` that asks the question, and a `confirmLabel` that names the consequence.
- `finalFocus` where the trigger is gone or something other than `trigger` opened the dialog.

## Changelog

- **1.0.0**: ConfirmDialog, an alert dialog with a neutral or danger tone that waits for its action and stays open when it fails.
