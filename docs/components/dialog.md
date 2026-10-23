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
components:
  - Dialog
  - DialogClose
---

# Dialog

## Overview

A dialog holds one task over the page: a decision, a short form, or details people read before they go on. Its actions end with the primary one, after a built-in close button.

```tsx example=ProjectDetails

```

### Pending work

While `pending`, nothing closes the dialog and its close button is disabled. Submit a form from its primary action, so <kbd>Enter</kbd> in a field submits it too.

```tsx example=RenameProject

```

### More actions that close

**DialogClose** closes the dialog after its own `onClick`, such as Don’t save.

```tsx example=UnsavedChanges

```

## Variants

| Option               | Use for                                                         |
| -------------------- | --------------------------------------------------------------- |
| `placement="center"` | Confirmations, short forms and details. The default.            |
| `placement="top"`    | Search-like tasks, whose results grow down from a fixed field.  |
| `width="md"`         | Most dialogs. The default.                                      |
| `width="lg"`         | Tables, comparisons and longer forms.                           |
| `modal={false}`      | A dialog beside a page that stays usable, such as an inspector. |

### Wide content

```tsx example=ReviewChanges

```

### Near the top

```tsx example=FindPlan

```

## When to use

```tsx do=CancelAsCloseLabel open caption="closeLabel=Cancel names the built-in button for a decision."

```

```tsx dont=ExtraCancelButton open caption="A Cancel of your own beside the built-in Close."

```

```tsx do=InviteMember open caption="A field's error on the field."

```

```tsx dont=ErrorInSecondDialog open caption="An error in a second dialog over the first."

```

- Keep one task per dialog, and don't open a dialog from another.

### Content

```tsx do=ConfirmDelete open caption="Ask the question, and repeat its verb in the action."

```

```tsx dont=AreYouSure open caption="Are you sure? with Yes and No: neither says what happens."

```

## Anatomy

```tsx anatomy=DialogAnatomy open

```

1. **Dialog** (`env-dialog-popup`)
2. **Title** (`env-dialog-title`, `title`)
3. **Description** (`env-dialog-description`, `description`)
4. **Content** (`env-text-field`, `children`)
5. **Close button** (`env-dialog-actions > env-button:first-child`, `closeLabel`)
6. **Action** (`env-dialog-actions > env-button:last-child`, `actions`)

Not shown: the scrim behind a modal dialog, `env-dialog-backdrop`.

## Accessibility

### Keyboard

| Key                                             | Action                                                       |
| ----------------------------------------------- | ------------------------------------------------------------ |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves through the dialog; a modal dialog keeps focus inside. |
| <kbd>Esc</kbd>                                  | Closes the dialog, or first what is open inside it.          |
| <kbd>Enter</kbd>, <kbd>Space</kbd>              | Presses the focused button; a close button returns focus.    |

### envUI provides

- `role="dialog"`, named by `title` and described by `description`.
- Focus moved in on open, kept inside a modal dialog and returned on close; a confirmation starts on its close button.
- The page behind a modal dialog hidden from assistive technology, closed to presses and locked from scrolling.
- A close button in every dialog, for touch screen readers that have no <kbd>Esc</kbd>.

### You provide

- A `title`, and a `description` where the consequence needs saying.
- `closeLabel` in the page's language, such as Cancel.
- `finalFocus` where the trigger is gone, or something other than `trigger` opened the dialog.

## Changelog

- **1.0.0**: `width` (`md` or `lg`) for `size`; the side panel, `placement="right"`, is [Sheet](../components/sheet.md); `onOpenChange` reports the reason; `initialFocus` and `finalFocus` take functions too; the surface's class is `env-dialog-popup`. The page is `dialog`, after the component.
- **0.5.0**: `size="wide"`, also for side panels, and `placement="top"`. Dialogs share Popover's raised surface with a hairline border; in the dark theme they keep the pane color through `--env-color-bg-raised`. The title and description sit together above the content. A side panel takes the whole width of a narrow window, with its content clear of the safe areas.
- **0.4.0**: Secondary buttons in dialogs and side panels, such as the close button, stay distinct on their surface.
- **0.3.0**: Dialogs rise into place and side panels slide in, over a backdrop that fades in.
- **0.2.0**: `pending`.
- **0.1.0**: Dialog and DialogClose.
