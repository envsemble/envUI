---
title: ConfirmDialog
summary: An alert dialog that asks people to confirm an action whose consequence needs a sentence, and waits for the action to finish.
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

The dialog waits for its action, showing that it is working, and stays open with the error when the action fails, so people can try again.

```tsx example=AsyncWithError

```

### From a menu

A menu item can open the dialog, and focus returns to the menu's button when it closes.

```tsx example=FromMenu

```

## Variants

| Tone    | Use for                                                             |
| ------- | ------------------------------------------------------------------- |
| Neutral | An action people can get back from, such as archiving. The default. |
| Danger  | An action that deletes or ends something.                           |

```tsx example=ArchiveProject caption="The neutral tone, for archiving."

```

## When to use

```tsx do=DangerForDelete open caption="The danger tone for an action that deletes."

```

```tsx dont=NeutralForDelete open caption="A neutral deletion: focus starts on Delete, so a hurried Enter deletes."

```

### Content

Ask the question in the title, and name the consequence on the confirm button.

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

Not shown: the error of a failed action, above the buttons.

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

## In code

### Usage

A ConfirmDialog opens from its `trigger`, such as a Button. Its `title` asks the question, such as “Delete Northwind launch?”, its `description` says what confirming does and whether it can be undone, and `confirmLabel` names the consequence, such as Delete project. `cancelLabel` is Cancel by default, from EnvUIProvider's `messages.confirmDialog.cancel`. `children` holds more content between the heading and the actions, such as the one field a confirmation holds, where <kbd>Enter</kbd> confirms. A press outside doesn't close it.

```tsx source=DeleteProject

```

#### Tone

`tone` is `neutral`, the default, where focus starts on the confirm button, or `danger`, for an action that deletes or ends something: the confirm button is a danger one and focus starts on Cancel, so a hurried <kbd>Enter</kbd> doesn't confirm.

```tsx
<ConfirmDialog
  tone="danger"
  trigger={<Button tone="danger">Delete project</Button>}
  title="Delete Northwind launch?"
  description="This deletes the project and its files for everyone. It can’t be undone."
  confirmLabel="Delete project"
  onConfirm={deleteProject}
/>
```

#### An action that can fail

`onConfirm` runs the action, once per opening: further presses, such as a double-click's second, are ignored until it fails. The dialog closes when it returns; when it returns a promise, the confirm button is pending, with `aria-busy`, nothing dismisses the dialog, and it closes once the promise resolves. A rejected promise or a thrown error keeps it open and goes to `reportError`; show what went wrong with `error`, a danger Alert above the actions that is announced. The dialog is a form, so hold no form of your own in it; use Dialog for one.

```tsx source=AsyncWithError

```

#### From a menu

Without a `trigger`, open it with `open` and `onOpenChange`, which receives the requested state and why: from the trigger, <kbd>Esc</kbd>, Cancel or after `onConfirm` finishes. `defaultOpen` opens an uncontrolled one on the first render. `finalFocus` sets where focus goes on closing, such as the menu's button, since the menu item is gone; by default it returns to the trigger.

```tsx source=FromMenu

```

### Composition

A ConfirmDialog is an alert dialog with Dialog's parts: the surface, `env-dialog-popup`, the question, `env-dialog-title`, the description, `env-dialog-description`, and the actions, `env-dialog-actions`, with Cancel first and the confirm button last. The error is an Alert, `env-alert`, above the actions.

## Changelog

- **1.0.0**: ConfirmDialog, an alert dialog with a neutral or danger tone that waits for its action and stays open when it fails.
