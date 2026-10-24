---
title: Destructive actions
summary: Let people delete, remove or archive with as little friction as is safe, and undo or confirm by what is at stake.
status: beta
since: 1.0.0
intent: Enter and change data
aliases:
  - destructive action
  - delete confirmation
  - confirm delete
  - undo delete
  - are you sure
  - type to confirm
  - bulk delete
useWhen:
  - People delete, remove, archive or end something.
  - An action affects other people or can't be undone.
avoidWhen:
  - text: A decision that needs fields or several choices, beyond a confirmation.
    use: Dialog
  - text: Reporting the outcome of an action that people can't change.
    see: feedback
composes:
  - Button
  - IconButton
  - ConfirmButton
  - ConfirmDialog
  - Menu
  - List
  - Checkbox
  - TextField
  - Toast
  - useToast
  - Column
  - Row
  - Text
---

# Destructive actions

## Overview

Asking "Are you sure?" before everything trains people to confirm without reading. Archiving here happens at once, and a toast from [useToast](../components/toast.md) offers Undo.

```tsx example=UndoInstead

```

### Undo

The toast stays until dismissed, since it has an action, and Undo puts the item back where it was. Keep what was archived reachable elsewhere too, as a toast can be dismissed.

## Variants

| The action                                           | Use                                                                   |
| ---------------------------------------------------- | --------------------------------------------------------------------- |
| Can be undone, and people take it often              | Act at once, with Undo in a toast                                     |
| Can't be undone, but little is at stake              | A [ConfirmButton](../components/button.md#confirm-in-place), in place |
| Deletes something people made, or affects others     | A [ConfirmDialog](../components/confirm-dialog.md) `tone="danger"`    |
| Can't be undone and reaches many people or much work | The dialog with a typed name                                          |

### Confirm in place

The first press names the consequence in the button, "Remove file?"; the second removes. It disarms after four seconds, on blur and with <kbd>Esc</kbd>.

```tsx example=ConfirmInPlace

```

### Confirm from a menu

The dialog opens with focus on Cancel, so a hurried <kbd>Enter</kbd> doesn't delete. Pass the menu button as `finalFocus`.

```tsx example=ConfirmDelete

```

### Type to confirm

The confirm button stays enabled: a wrong name keeps the dialog open, shows the field's error and moves focus to it.

```tsx example=TypeToConfirm

```

### Bulk delete

The count is in the button, the question and the confirm button: "Delete 2 documents…".

```tsx example=BulkDelete

```

## When to use

```tsx do=DangerKeptForDelete caption="The danger tone only on what deletes or ends something."

```

```tsx dont=DangerEverywhere caption="Every action in the danger tone: none of them stands out."

```

- Return the action's promise from `onConfirm`, so the dialog waits, pending, and stays open with `error` when it fails.
- envUI has no danger tone for a menu item yet: label it with the consequence, last after a separator.

### Content

- The title is a question that names the object, "Delete Launch brief?"; the description says whether it can be undone; the confirm button repeats the verb, "Delete document"; never "Yes" or "OK".
- One verb from trigger to button: Delete when it's gone, Remove when it leaves a place, Archive when it can come back. A trigger that opens a confirmation ends with an ellipsis.
- The undo toast: "Website refresh archived.", with Undo.

## Accessibility

A confirmation dialog keeps focus inside and returns it to `finalFocus`, else the trigger. When the action removes its own control, move focus to the next row, or the list. The undo toast doesn't take focus; <kbd>F6</kbd> reaches it.

### envUI provides

- ConfirmDialog as an `alertdialog`, named and described, with focus on Cancel for `tone="danger"`; its pending state and an `error` announced as an alert.
- ConfirmButton's armed state in its label, disarmed on <kbd>Esc</kbd>, on blur and after `armedDuration`.
- Toasts announced politely and kept while they have an action.

### You provide

- A name for every icon-only trigger, such as "Remove annual-review.pdf".
- `finalFocus`, and focus for when the action removes its own control.
- Dismissing the undo toast once Undo has run, with `dismiss(id)`.

## Changelog

- **1.0.0**: The page is on the figure template.
