---
title: Confirmation and destructive actions
summary: Let people delete, remove or archive with as little friction as is safe, and undo or confirm by what is at stake.
status: beta
since: 1.0.0
intent: Collect and change information
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
related:
  - feedback
  - settings
  - confirm-dialog
  - toast
  - button
  - menu
---

# Confirmation and destructive actions

## Overview

Use this pattern to choose how much friction a destructive action needs. Asking "Are you sure?" before everything trains people to confirm without reading. Act at once when the action can be undone, ask in place when little is at stake, and keep a dialog, and a typed name, for what can't be undone or reaches other people.

```tsx example=UndoInstead

```

## Anatomy

Climb the ladder only as far as the action needs, by whether it can be undone and how much it reaches:

1. **Undo:** the action happens at once, and a toast from [useToast](../components/toast.md) offers "Undo" as its `action`. For actions people take often and can reverse, such as archiving or removing from a list.
2. **Confirm in place:** a [ConfirmButton](../components/button.md#confirm-in-place), whose first press names the consequence in the button and whose second runs it. For a small removal that can't be undone, such as an attachment.
3. **Confirmation dialog:** a [ConfirmDialog](../components/confirm-dialog.md) `tone="danger"` that asks the question with the object's name, states the consequence and repeats the verb on its button. For deleting something people made, or anything that affects others. From a [Menu](../components/menu.md) item, pass `finalFocus`.
4. **Typed confirmation:** the dialog holds one [TextField](../components/text-field.md) for the object's name, and refuses to confirm until it matches. For what can't be undone and reaches many people or much work, such as a project with all its documents.
5. **The trigger:** a [Button](../components/button.md) with `tone="danger"` where the action is the point of the place, such as a danger zone; elsewhere a neutral button or menu item whose label names the consequence. A trigger that opens a confirmation ends with an ellipsis.

## States and behaviour

- **Undo.** The item leaves the list at once and a toast says what happened. A toast with an action stays until it is dismissed, so people have time to reach it; Undo puts the item back where it was and dismisses the toast. Keep the archived item reachable elsewhere too, such as an Archived view, since a toast can be dismissed.
- **In place.** The first press arms the ConfirmButton: its label changes to the confirm label, such as "Remove file?". A second press runs the action. It disarms after four seconds by default, when focus leaves it and with <kbd>Esc</kbd>.
- **Dialog.** The dialog opens with focus on Cancel, so a hurried <kbd>Enter</kbd> doesn't delete. <kbd>Esc</kbd> and Cancel close it; a press outside doesn't. When `onConfirm` returns a promise, the confirm button is pending and nothing dismisses the dialog until it settles; a failure keeps it open, and `error` says what went wrong.
- **Typed confirmation.** The confirm button stays enabled. A press with the wrong name keeps the dialog open, as a controlled dialog can by not closing when `onOpenChange` reports `imperative-action`, shows the field's error and moves focus to the field. The dialog opens with focus on Cancel, as every danger confirmation does, and ConfirmDialog has no way to start it on the field: people Tab to the field. <kbd>Enter</kbd> in the field confirms through `onConfirm`, as the confirm button does: with the wrong name it shows the error, and with the right one the action runs, pending, once, and a failure keeps the dialog open.
- **Many items.** Put the count in every label: the button "Delete 2 documents…", the question "Delete 2 documents?" and the confirm button "Delete 2 documents". Keep the count the dialog asked about while it closes.
- **Focus after the item has gone.** A deleted row takes its buttons with it. Move focus to the neighbouring row's control, or to the list when it is empty, rather than letting it fall back to the page.
- **Menus.** envUI has no danger tone for a menu item yet: label the item with the consequence, "Delete document…", put it last after a separator, and confirm it with a ConfirmDialog.

## Content guidelines

- Follow [Confirmations](../foundations/content.md#confirmations): the title is a question that names the object, "Delete Launch brief?"; the description states the consequence and says whether it can be undone; the confirm button repeats the verb with its object, "Delete document"; Cancel stays "Cancel".
- Keep one verb from the trigger to the title to the confirm button, as [Buttons and actions](../foundations/content.md#buttons-and-actions) describes. Choose it by meaning: Delete when the thing is gone, Remove when it only leaves a place, Archive when it can come back.
- Write the undo toast in the past tense with the object's name, "Website refresh archived.", and label its action "Undo".
- Don't ask "Are you sure?" and don't label buttons "Yes" or "OK".

## Do and don't

### Do

- Prefer undo for reversible actions people take often.
- Name the object in the question, and the consequence in the description.
- Put the count in every label of an action on several items.
- Return the action's promise from `onConfirm`, so the dialog waits for it and stays open when it fails.

### Don't

- Don't confirm an action that undo can reverse.
- Don't disable the confirm button until a typed name matches; say what to enter instead.
- Don't put a field in a confirmation, except a typed name; a decision that needs more is a [Dialog](../components/dialog.md).
- Don't use the danger tone for actions that only look serious; keep it for what deletes or ends something.

## Accessibility

### Focus and keyboard

A confirmation dialog takes focus to Cancel as it opens, keeps it inside while open, and returns it on closing to `finalFocus`, else to the trigger, else to the element that had focus when it opened. When a menu item opens the dialog, pass the menu button as `finalFocus`; when the confirmed action removes that button, point `finalFocus` at the neighbouring row's control or the list. A ConfirmButton keeps focus through both presses; after it removes its row, move focus to the next row. The undo toast doesn't take focus: <kbd>F6</kbd> reaches it, and its message is announced as it appears.

### envUI provides

- ConfirmDialog as an `alertdialog`, named by its title and described by its description, with focus on Cancel for `tone="danger"`, trapped while open and returned on closing.
- The pending state, and an `error` announced as an alert.
- ConfirmButton's armed state, which names the consequence in its label and disarms on <kbd>Esc</kbd>, on blur and after `armedDuration`.
- Toasts announced politely, kept while they have an action, and reached with <kbd>F6</kbd>.
- Menus whose focus returns to their trigger as they close.

### You provide

- A name for every icon-only trigger, such as "More actions for Launch brief" or "Remove annual-review.pdf".
- `finalFocus` when a menu item opens the dialog, and focus for when the action removes its own control.
- Dismissing the undo toast once Undo has run, with `dismiss(id)`.
- Another way to reach what was archived, since a toast can be dismissed.

## Examples

### Confirm in place

Removing an attachment is small and quick to redo, so the button asks in place: the first press says "Remove file?", the second removes it.

```tsx example=ConfirmInPlace

```

### Confirm from a menu

"Delete document…" in a row's menu opens a ConfirmDialog that names the document. Cancel returns focus to the menu button; after the delete, focus moves to the next row's menu button.

```tsx example=ConfirmDelete

```

### Type to confirm

Deleting a project with all its documents can't be undone, so the dialog asks for the project's name. The confirm button stays enabled, and a wrong name keeps the dialog open with an error. Focus opens on Cancel; Enter in the field confirms as the button does.

```tsx example=TypeToConfirm

```

### Bulk delete

The count of the selection is in the button, the question and the confirm button. After the delete, the button has gone with the selection, so focus moves into the list.

```tsx example=BulkDelete

```
