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
related:
  - dialog
  - menu
  - alert
  - button
components:
  - ConfirmDialog
---

# ConfirmDialog

## Overview

ConfirmDialog asks one question before an action runs: a title that asks it, a description that says what confirming does, Cancel and a confirm button that names the consequence. It is an alert dialog, built on Base UI's alert dialog with [Dialog](../components/dialog.md)'s surface, heading and actions, so it interrupts: it traps focus and a press outside doesn't close it. `onConfirm` runs the action; when it returns a promise, the dialog waits for it, pending, and closes once it resolves.

```tsx example=DeleteProject

```

## Anatomy

1. **Backdrop**: a translucent overlay over the page; a press on it does nothing.
2. **Surface**: Dialog's surface, 28 rem wide, which narrows to fit the window. `className`, `style`, `ref` and data attributes go to it.
3. **Title** (`title`): the question, which names the dialog.
4. **Description** (optional, `description`): what confirming does and whether it can be undone, which describes the dialog.
5. **Content** (optional, `children`): more about what the action affects, such as a list of what goes with it.
6. **Error** (optional, `error`): a danger [Alert](../components/alert.md) above the actions, announced as it appears.
7. **Actions**: Cancel (`cancelLabel`), then the confirm button (`confirmLabel`), at the end of the row.

## Variants and sizes

| Tone                | Use for                                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------------------------ |
| `neutral` (default) | An action that changes something people can get back, such as archiving. Focus starts on the confirm button. |
| `danger`            | An action that deletes or ends something. The confirm button is a danger one and focus starts on Cancel.     |

## States and behaviour

- **Opening**: `trigger` opens the dialog; without one, the application opens it with `open` and `onOpenChange`, such as from a menu item. `onOpenChange` receives the new state and the `reason`: `trigger-press`, `escape-key`, `close-press` for Cancel, or `imperative-action` once the action has finished.
- **Confirming**: the confirm button runs `onConfirm`, and so does <kbd>Enter</kbd> in a field in the content, such as a typed name: the dialog is a form, and the confirm button its submit button. Both go through the same pending state, guard and error. Don't put a `<form>` of your own in the content: it would nest in the dialog's form, which HTML doesn't allow, and envUI says so in the console while developing. Use [Dialog](../components/dialog.md) for a real form. The dialog closes when it returns, or, when it returns a promise, once the promise resolves.
- **Pending**: while the promise runs, the confirm button shows a spinner and reports busy, Cancel is disabled, the dialog reports `aria-busy`, and nothing dismisses it, <kbd>Esc</kbd> included.
- **Failure**: a rejected promise, or an error thrown, keeps the dialog open and ends pending, and goes to `reportError`, as an uncaught error would. Show what went wrong with `error`; it is announced. Clear it when the dialog closes or the action is tried again.
- **Once per opening**: the action runs once each time the dialog opens; another press, such as the second click of a double-click, does nothing, unless the action failed.
- **Dismissing**: <kbd>Esc</kbd> and Cancel close it; a press outside doesn't.
- **Focus**: on opening, focus moves to the confirm button, or to Cancel for `tone="danger"`, so a hurried <kbd>Enter</kbd> doesn't delete. On closing, it returns to `finalFocus`, else the trigger, else the element that had focus when the dialog opened.
- **Theme**: the dialog renders in a portal in the theme of the place it opens from.

## Content guidelines

- Ask the question in the title, with the item's name: "Delete Northwind launch?".
- Say in the description what confirming does, what else it affects and whether it can be undone, in a sentence or two.
- Name the confirm button with the consequence, a verb and its object, such as "Delete project", never "Yes" or "OK".
- Keep "Cancel" unless the consequence reads better as a choice, such as "Keep member" beside "Remove member".
- Write an error that says what happened and what to do: "The project could not be deleted. Try again."

## Do and don't

### Do

- Use `tone="danger"` for an action that deletes or ends something.
- Return the promise of the action from `onConfirm`, so the dialog waits for it and stays open when it fails.
- Pass `finalFocus` when a menu item opens the dialog, so focus returns to the menu's button.

### Don't

- Don't confirm an action people do often and can undo; act at once and offer undo in a [Toast](../components/toast.md).
- Don't put a form, fields or several actions in a confirmation; use [Dialog](../components/dialog.md) for real forms. The exception is one field for typing the object's name before an irreversible action; see [Confirmation and destructive actions](../patterns/destructive-actions.md).
- Don't confirm in a dialog what [ConfirmButton](../components/button.md#confirm-in-place) can confirm in place.

## Accessibility

### Keyboard

| Key                                                 | Action                                                                                        |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| <kbd>Enter</kbd> or <kbd>Space</kbd> on the trigger | Opens the dialog and focuses the confirm button, or Cancel for a danger confirmation.         |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd>     | Moves between Cancel, the confirm button and any controls in the content; focus stays inside. |
| <kbd>Enter</kbd> or <kbd>Space</kbd> on a button    | Cancels, or confirms and runs the action.                                                     |
| <kbd>Enter</kbd> in a text field in the content     | Confirms and runs the action, as the confirm button does.                                     |
| <kbd>Esc</kbd>                                      | Closes the dialog, unless the action is running.                                              |

### envUI provides

- `role="alertdialog"`, named by the title and described by the description.
- Focus moved in on opening, trapped inside and returned on closing; the page hidden from assistive technology and closed to presses meanwhile.
- `aria-busy` on the dialog and the confirm button while the action runs.
- The error announced as an alert.
- Cancel named in the provider's language.

### You provide

- A `title` that asks the question and a `confirmLabel` that names the consequence.
- `finalFocus` where the trigger is gone or something other than `trigger` opened the dialog.
- The `error` to show when the action fails.

## Examples

### An action that can fail

The action takes a moment, and the dialog stays pending until it ends. The first attempt fails, and the dialog stays open with the error; the second succeeds and closes it.

```tsx example=AsyncWithError

```

## Changelog

- **1.0.0**: ConfirmDialog, an alert dialog with a neutral or danger tone that waits for its action and stays open when it fails.
