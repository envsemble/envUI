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
  - ConfirmDialog
  - ConfirmButton
  - List
  - Checkbox
  - TextField
  - ToastProvider
  - useToast
  - Column
  - Row
  - Text
examples:
  UndoInstead:
    role: overview
    motion: true
  TypeToConfirm: example
  BulkDelete: example
  RemoveFile:
    role: example
    caption: Where little is at stake, the button arms in place and a second press removes the file.
  DangerKeptForDelete:
    role: do
    caption: The danger tone only on what deletes or ends something.
  DangerEverywhere:
    role: dont
    caption: 'Every action in the danger tone: none of them stands out.'
---

# Destructive actions

## Variants

### Type to confirm

Where an action can't be undone and reaches many people or much work, the dialog asks for the name.

- Its confirm button stays enabled.
- A wrong name keeps the dialog open and says what to type.

```tsx figure=TypeToConfirm motion

```

### Bulk delete

The count is in the button, the question and the confirm button: "Delete 2 documents…".

```tsx figure=BulkDelete motion

```

## Behaviour

### Undo instead of asking

Archiving happens at once, and a [toast](../components/toast.md) offers Undo, which puts the item back where it was.

## Rules

Asking "Are you sure?" before everything trains people to confirm without reading.

### Which to use

Match the friction to what is at stake.

| Friction            | Use for                                                                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Undo in a toast     | An action that can be undone, and that people take often.                                                                            |
| Confirm in place    | An action that can't be undone, with little at stake, through a [ConfirmButton](../components/button.md).                            |
| Confirm in a dialog | Deleting something people made, or something that affects others, through a danger [ConfirmDialog](../components/confirm-dialog.md). |
| Type the name       | An action that can't be undone and reaches many people or much work.                                                                 |

```tsx figure=RemoveFile wide motion

```

```tsx figure=DangerKeptForDelete

```

```tsx figure=DangerEverywhere

```

### Content

Each label names the action and its object: never "Are you sure?", "Yes" or "OK".

- A confirmation's title asks the question with the object's name, "Delete Website refresh?".
- Its description says the consequence and whether it can be undone.
- The confirm button repeats the verb and the object, "Delete project", and the other stays Cancel.
- A button armed in place is short and has no question mark, "Remove file".
- One verb runs from the trigger to the button: Delete when it's gone, Remove when it leaves a place, Archive when it can come back.
- A trigger that opens a confirmation ends in an ellipsis.
- The undo toast names what happened, "Website refresh archived.".

## Accessibility

### Focus and keyboard

When the action removes its own control, move focus to the next row, or to the list.

### envUI provides

- ConfirmDialog as an `alertdialog`, named and described, with focus on Cancel for `tone="danger"`; its pending state and an `error` announced as an alert.
- ConfirmButton's armed state in its label, disarmed on <kbd>Esc</kbd>, on blur and after `armedDuration`.
- Toasts announced politely and kept while they have an action.

### You provide

- A name for every icon-only trigger, such as "Remove annual-review.pdf".
- `finalFocus`, and focus for when the action removes its own control.
- Dismissing the undo toast once Undo has run, with `dismiss(id)`.

## Compose

### Usage

Act at once and offer Undo: `useToast().show({ message, action: { label: 'Undo', onClick } })` returns the toast's id, and the action's `onClick` puts the item back and calls `toast.dismiss(id)`.

- A toast with an `action` stays until dismissed, so keep what was archived reachable elsewhere too.
- Move focus to the next row, or the list, with `tabIndex={-1}`, when the action removes its own control.

```tsx source=UndoInstead

```

#### Confirm in place or in a dialog

A ConfirmButton runs `onConfirm` on its second press and shows `confirmLabel`, such as "Remove file", while armed. A ConfirmDialog with `tone="danger"` takes a `title`, a `description` and a `confirmLabel`, and puts focus on Cancel.

- Opened from a Menu.Item, pass the menu's trigger as `finalFocus`, and put the item last, after a Menu.Separator, labelled with its consequence.
- Return the action's promise from `onConfirm`: the dialog waits, pending, and stays open with `error` set when it fails.

```tsx
<ConfirmDialog
  open={open}
  onOpenChange={setOpen}
  tone="danger"
  title="Delete Website refresh?"
  description="This deletes the project for everyone. You can’t undo this."
  confirmLabel="Delete project"
  onConfirm={() => deleteProject(project.id)}
/>
```

#### Type to confirm

Put a TextField for the name inside the ConfirmDialog, as the TypeToConfirm example does.

- In `onOpenChange`, ignore the close whose `details.reason` is `'imperative-action'` while the name doesn't match.
- In `onConfirm`, set the field's `error` and focus it through its `ref`; keep the confirm button enabled.
- Enter in the field confirms through `onConfirm`, as the confirm button does.

```tsx
<ConfirmDialog
  open={open}
  onOpenChange={(next, details) => {
    if (!next && details.reason === 'imperative-action' && !matches) return;
    setOpen(next);
  }}
  tone="danger"
  title="Delete Data migration?"
  confirmLabel="Delete project"
  onConfirm={confirmIfNameMatches}
>
  <TextField
    ref={field}
    label="Project name"
    value={typed}
    error={error}
    onValueChange={setTyped}
  />
</ConfirmDialog>
```

### Composition

Lay the items out as a List, each List.Item taking its trigger at its `end`: a Button, an IconButton named with `aria-label`, a ConfirmButton or a Menu. The danger tone, `tone="danger"`, goes only on what deletes or ends something.

Bulk delete selects rows with Checkboxes and names the count in an outline danger Button, the dialog's `title` and its `confirmLabel`, as the BulkDelete example does. Its `finalFocus` returns focus to the button, or to the list, with `tabIndex={-1}`, once the button has gone with the deleted selection.

## Changelog

- **1.0.0**: The page is on the figure template, with the confirmations of the content guidelines; confirming in place and from a menu are on Button and ConfirmDialog.
