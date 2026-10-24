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
  - Deleting, removing, archiving or ending something
  - An action that affects others or can't be undone
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

Asking "Are you sure?" before everything trains people to confirm without reading. Archiving here happens at once, and a [toast](../components/toast.md) offers Undo.

```tsx example=UndoInstead

```

### Undo

The toast stays until dismissed, since it has an action, and Undo puts the item back where it was. Keep what was archived reachable elsewhere too, as a toast can be dismissed.

## Variants

| The action                                           | Use                                                                   |
| ---------------------------------------------------- | --------------------------------------------------------------------- |
| Can be undone, and people take it often              | Act at once, with Undo in a toast                                     |
| Can't be undone, but little is at stake              | A [ConfirmButton](../components/button.md#confirm-in-place), in place |
| Deletes something people made, or affects others     | A danger [ConfirmDialog](../components/confirm-dialog.md)             |
| Can't be undone and reaches many people or much work | The dialog with a typed name                                          |

### Confirm in place

The first press names the consequence in the button, "Remove file"; the second removes. It disarms after four seconds, when focus leaves it and with <kbd>Esc</kbd>.

```tsx example=ConfirmInPlace

```

### Confirm from a menu

The dialog opens with focus on Cancel, so a hurried <kbd>Enter</kbd> doesn't delete, and gives focus back to the menu's button as it closes.

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

### When it fails

The dialog waits while the action runs, and stays open with an error when it fails, so people can try again or cancel.

### In a menu

envUI has no danger tone for a menu item yet: label it with the consequence, and put it last, after a separator.

### Content

The title is a question that names the object, the description says whether it can be undone, and the confirm button repeats the verb, never "Yes" or "OK". Use one verb from trigger to button: Delete when it's gone, Remove when it leaves a place, Archive when it can come back.

- "Delete Launch brief?" as the title, "Delete document" as the button
- An armed label with no question mark, "Remove file"
- An ellipsis on a trigger that opens a confirmation
- "Website refresh archived.", with Undo

## Accessibility

A confirmation dialog keeps focus inside and gives it back to the control that opened it, or the one the application names. When the action removes its own control, move focus to the next row, or the list. The undo toast doesn't take focus; <kbd>F6</kbd> reaches it.

### envUI provides

- ConfirmDialog as an `alertdialog`, named and described, with focus on Cancel for `tone="danger"`; its pending state and an `error` announced as an alert.
- ConfirmButton's armed state in its label, disarmed on <kbd>Esc</kbd>, on blur and after `armedDuration`.
- Toasts announced politely and kept while they have an action.

### You provide

- A name for every icon-only trigger, such as "Remove annual-review.pdf".
- `finalFocus`, and focus for when the action removes its own control.
- Dismissing the undo toast once Undo has run, with `dismiss(id)`.

## In code

### Usage

Act at once and offer Undo: `useToast().show({ message, action: { label: 'Undo', onClick } })` returns the toast's id, and the action's `onClick` puts the item back and calls `toast.dismiss(id)`. A toast with an `action` stays until dismissed. Move focus to the next row, or the list, with `tabIndex={-1}`, when the action removes its own control.

```tsx source=UndoInstead

```

#### Confirm in place

A ConfirmButton runs `onConfirm` on its second press and shows `confirmLabel`, such as "Remove file", while armed. It disarms after `armedDuration`, 4000 ms by default, on blur and on <kbd>Esc</kbd>.

```tsx source=ConfirmInPlace

```

#### Confirm in a dialog

A ConfirmDialog with `tone="danger"` takes a `title`, a `description` and a `confirmLabel`, and puts focus on Cancel. Opened from a Menu.Item, pass the menu's trigger as `finalFocus`, so focus goes back to it. Return the action's promise from `onConfirm`: the dialog waits, pending, and stays open with `error` set when it fails. Label a destructive Menu.Item with its consequence, last after a Menu.Separator, since Menu.Item has no danger tone yet.

```tsx source=ConfirmDelete

```

#### Type to confirm

Put a TextField for the name inside the ConfirmDialog. In `onOpenChange`, ignore the close whose `details.reason` is `'imperative-action'` while the name doesn't match, and in `onConfirm` set the field's `error` and focus it through its `ref`; keep the confirm button enabled.

```tsx source=TypeToConfirm

```

### Composition

Lay the items out as a List, each List.Item taking its trigger as its `action`: a Button, an IconButton named with `aria-label`, a ConfirmButton or a Menu. Bulk delete selects rows with Checkboxes and names the count in an outline danger Button, the dialog's `title` and its `confirmLabel`. The danger tone, `tone="danger"`, goes only on what deletes or ends something.

```tsx source=BulkDelete

```

## Changelog

- **1.0.0**: The page is on the figure template.
