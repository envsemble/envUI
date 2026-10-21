---
title: Dialog
summary: A focused task over the page, as a centered modal or a modal near the top of the window, with shared focus and dismissal.
status: stable
since: 0.1.0
category: Feedback & overlays
aliases:
  - modal
  - modal dialog
  - popup
useWhen:
  - People decide on a consequence before it happens, such as deleting a project, or type a name to confirm it.
  - A short task needs people's attention before they go on, such as inviting a member or renaming a project.
  - Content needs more room than a popup, such as a table, a comparison or a longer form (`width="lg"`).
  - A search-like task shows results that grow below its field (`placement="top"`).
avoidWhen:
  - text: Confirming one action in place that cannot be undone, such as removing a member from a list.
    use: ConfirmButton
  - text: A question before one action, with Cancel and a button that names the consequence.
    use: ConfirmDialog
  - text: Details or a few fields beside the control that opens them.
    use: Popover
  - text: Feedback after an action, such as Saved or Invitation sent.
    use: Toast
  - text: A message about the page or a section that stays in place, such as a warning.
    use: Alert
  - text: Quick open of a document or a command by name.
    use: CommandPalette
  - text: An item's details, settings or filters in a full-height panel at the edge of the window.
    use: Sheet
  - text: Items people keep open and work on beside the page, such as drafts.
    use: PanelDock
related:
  - button
  - sheet
  - popover
  - toast
  - command-palette
  - text-field
  - row
  - accessibility
components:
  - Dialog
  - DialogClose
---

# Dialog

## Overview

A dialog holds one task over the page: a decision, a short form, or details people look at before they go on. It has a title, an optional description, its content and a row of actions that starts with a close button. Dialog is built on Base UI's dialog, which moves focus into it, keeps focus inside a modal dialog, returns focus when it closes and closes it on <kbd>Esc</kbd> and outside presses.

One component opens in two places:

- **Centered** (the default): a modal in the middle of the window, for confirmations and short forms.
- **Near the top** (`placement="top"`): a modal whose content grows downward without moving its field, for search-like tasks.

A panel at an edge of the window is a [Sheet](../components/sheet.md), which shares the dialog's surface, heading and actions.

**DialogClose** is a button inside a dialog or a drawer that closes it, for actions other than the built-in close button, such as Don't save or Done.

```tsx example=ProjectDetails

```

## Anatomy

1. **Backdrop** (modal dialogs): a translucent overlay over the page. A press on it closes the dialog.
2. **Surface**: the dialog color with a hairline border, 1.75 rem corners and 1.5 rem padding, the raised surface Sheet, Popover and CommandPalette share. In the dark theme it keeps the pane color, so rows and fields inside keep their contrast. The ref and other `div` props, such as `id` and `className`, reach the surface.
3. **Title** (`title`): an `h2` in the page heading type, 1.125 rem, which names the dialog.
4. **Description** (optional, `description`): muted small text 0.5 rem under the title, which describes the dialog.
5. **Content** (`children`): 1.5 rem below the title and description, and 1.5 rem above the actions.
6. **Actions**: a row aligned to the end. It starts with the built-in close button, a secondary button labelled `closeLabel` (Close), and `actions` follow it, with the primary action last.

A dialog taller than the window scrolls inside its surface, with its title and actions, and doesn't scroll the page behind it.

## Variants and sizes

| Placement | Use for                                                                  |
| --------- | ------------------------------------------------------------------------ |
| `center`  | Confirmations, short forms and content people read before they go on.    |
| `top`     | Search-like tasks, whose results grow downward without moving the field. |

| Width          | Size   | Use for                                 |
| -------------- | ------ | --------------------------------------- |
| `md` (default) | 28 rem | Confirmations, short forms and details. |
| `lg`           | 44 rem | Tables, comparisons and longer forms.   |

| `modal`          | Use for                                                            |
| ---------------- | ------------------------------------------------------------------ |
| `true` (default) | A task people finish or cancel before they go back to the page.    |
| `false`          | A dialog beside a page that stays usable while people refer to it. |

- A modal dialog opens over a backdrop. Focus stays inside it, and the page behind it takes no presses, doesn't scroll and is hidden from assistive technology. A non-modal dialog has no backdrop, and focus moves freely between it and the page; an inspector usually adds `disablePointerDismissal`.
- Dialogs narrow to fit the window, keeping a gutter of 0.75 to 1 rem and clear of the safe areas, such as a phone's notch. A top dialog starts 12% of the window's height from its top, at most 6 rem.

## States and behaviour

- **Opening**: `trigger` opens the dialog and reports it with `aria-haspopup`, `aria-expanded` and `aria-controls`; `defaultOpen` opens it on the first render. To control it, pass `open` and `onOpenChange`, which receives the requested state each time the dialog asks to open or close, and in its second argument the `reason`, such as `escape-key` or `close-press`. A controlled dialog needs no trigger, such as one opened from a row or a menu.
- **Closing**: <kbd>Esc</kbd>, a press outside, the built-in close button and a DialogClose close the dialog. `actions` don't close it by themselves: set `open` to false in their handler, or use DialogClose. <kbd>Esc</kbd> and outside presses close only the topmost dialog, and <kbd>Esc</kbd> first closes or clears what is open inside it, such as a Select's list or a SearchField's text.
- **Outside presses**: a press on a modal dialog's backdrop closes it. A non-modal dialog closes on a press outside it and when focus moves outside it. `disablePointerDismissal` keeps either open, so only <kbd>Esc</kbd> and the close buttons close it, as an inspector needs while people use the page beside it.
- **Pending**: while `pending` is true, <kbd>Esc</kbd>, outside presses, the close buttons and a DialogClose can't close the dialog. The built-in close button is disabled, and the dialog reports `aria-busy`. A DialogClose stays enabled and still runs its `onClick`, so disable it too. Set `pending` on the action that started the work as well, and when the work ends, close the dialog or show what went wrong.
- **Focus on open**: focus moves to `initialFocus`, a ref or a function of how the dialog was opened, or else to the first focusable element inside: the first field of a form, the built-in close button of a confirmation, so <kbd>Enter</kbd> doesn't confirm by accident. Opened by touch, the dialog itself takes focus, so no on-screen keyboard opens.
- **Focus on close**: focus returns to `finalFocus`, or else to the trigger, or to the element that had focus when the dialog opened.
- **Theme**: the dialog renders in a portal at the end of the document, in the theme of the place it opens from, also inside a nested `Theme`.
- **Motion**: centered dialogs rise into place and top dialogs settle down into place, over a backdrop that fades in. With a reduced-motion preference they only fade.
- The application owns validation, saving and other work, and decides whether finishing an action closes the dialog.

## Content guidelines

- Name the task or ask the question the dialog decides, in sentence case: "Invite member", "Delete project?". Don't use "Are you sure?" or "Warning".
- Say in the description what will happen and to what: "This deletes Northwind launch and its files for everyone in the workspace." Say so when it can't be undone.
- Name the primary action after what it does, with the title's verb: "Delete project" for "Delete project?", "Send invitation", "Save role". Avoid "OK", "Yes" and "Submit".
- Set `closeLabel` to "Cancel" where the dialog asks for a decision or collects input, so it's clear that closing changes nothing. Keep "Close" for a dialog that only shows content.
- For a typed confirmation, say what to type in the field's hint: "Type Northwind to confirm."

## Do and don't

### Do

- Keep one task in a dialog, with one primary action at the end of its actions.
- Give every dialog a title, and a description where the consequence needs saying.
- Set `pending` on the dialog and on the action that started its work, so people can't close it halfway through.
- Compose forms in a dialog from envUI's fields, as on a page: TextField with its floating label and its error, Select with its label above, and RadioGroup rows for a choice.
- Submit a form in a dialog from its primary action with `type="submit"` and the form's `form` id, so <kbd>Enter</kbd> in a field submits it too.
- Use a [Sheet](../components/sheet.md) for details, settings, filters and inspectors beside the page.

### Don't

- Don't open a dialog for a message people needn't act on; use [Toast](../components/toast.md) or [Alert](../components/alert.md).
- Don't confirm everyday or reversible actions; let them happen and offer an undo, or confirm one irreversible action in place with ConfirmButton.
- Don't add a Cancel button to `actions`; `closeLabel` names the built-in one.
- Don't open a dialog from another dialog; make the second step part of the first, or replace it.
- Don't use a top dialog for quick open; use [CommandPalette](../components/command-palette.md).

## Accessibility

### Keyboard

| Key                                                                   | Action                                                                                                                                                                       |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <kbd>Enter</kbd> or <kbd>Space</kbd> on the trigger                   | Opens the dialog and moves focus into it.                                                                                                                                    |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd>                       | Moves focus to the next or previous element in the dialog. A modal dialog keeps focus inside, from its last element to its first; a non-modal one lets it go on to the page. |
| <kbd>Esc</kbd>                                                        | Closes the dialog, or first closes or clears what is open inside it, such as a Select's list. Does nothing while `pending`.                                                  |
| <kbd>Enter</kbd> or <kbd>Space</kbd> on a close button or DialogClose | Closes the dialog; focus returns to the trigger or `finalFocus`.                                                                                                             |

### envUI provides

- `role="dialog"`, named by the title with `aria-labelledby` and described by the description with `aria-describedby`.
- `aria-haspopup="dialog"`, `aria-expanded` and `aria-controls` on the trigger.
- Focus moved into the dialog on open, kept inside a modal dialog and returned on close.
- In a modal dialog, the rest of the page hidden from assistive technology with `aria-hidden`, closed to presses and locked from scrolling.
- A close button in every dialog, also for touch screen reader users, who can't press <kbd>Esc</kbd>, named by `closeLabel` in the provider's language.
- `aria-busy` and disabled close buttons while `pending`.
- The originating theme in the portal.

### You provide

- A `title` that names the dialog, and a `description` where the consequence needs saying.
- A `closeLabel` in the page's language, such as Cancel.
- Labels for the fields in the dialog, and their errors through `error`.
- Validation, saving and errors, `pending` while work runs, and closing the dialog when an action finishes.
- `finalFocus` when the trigger is gone after the action, or when something other than `trigger` opened the dialog, such as a row.
- An accessible name on an icon-only trigger.

## Examples

### Confirm a destructive action

The built-in close button reads Cancel, and the destructive action repeats the title's verb. Focus starts on Cancel.

```tsx example=ConfirmDelete

```

### Pending work

While the name saves, the dialog stays open: Cancel is disabled, and <kbd>Esc</kbd> and outside presses wait. The action submits the form, so <kbd>Enter</kbd> in the field saves too.

```tsx example=RenameProject

```

### A form with validation

Fields keep their floating labels and errors inside the dialog. An invalid address shows its error on the field and takes focus back to it; the invitation sends while the dialog is pending.

```tsx example=InviteMember

```

### A choice

RadioGroup rows hold a choice, which takes effect when people save it.

```tsx example=ChangeRole

```

### Typed confirmation

For a consequence that is hard to recover from, people type the name of what they remove before the action becomes available.

```tsx example=RemoveWorkspace

```

### More actions that close

DialogClose closes the dialog after its own `onClick`, without the dialog's open state in the application.

```tsx example=UnsavedChanges

```

### Wide content

`width="lg"` gives a table or a comparison 44 rem.

```tsx example=ReviewChanges

```

### Near the top

`placement="top"` opens the dialog near the top of the window, so its results grow downward while the field stays in place. Choosing a result closes it.

```tsx example=FindPlan

```

## Changelog

- **1.0.0**: `width` (`md` or `lg`) for `size`; the side panel, `placement="right"`, is [Sheet](../components/sheet.md); `onOpenChange` reports the reason; `initialFocus` and `finalFocus` take functions too; the surface's class is `env-dialog-popup`. The page is `dialog`, after the component.
- **0.5.0**: `size="wide"`, also for side panels, and `placement="top"`. Dialogs share Popover's raised surface with a hairline border; in the dark theme they keep the pane color through `--env-color-bg-raised`. The title and description sit together above the content. A side panel takes the whole width of a narrow window, with its content clear of the safe areas.
- **0.4.0**: Secondary buttons in dialogs and side panels, such as the close button, stay distinct on their surface.
- **0.3.0**: Dialogs rise into place and side panels slide in, over a backdrop that fades in.
- **0.2.0**: `pending`.
- **0.1.0**: Dialog and DialogClose.
