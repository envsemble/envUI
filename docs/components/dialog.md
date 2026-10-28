---
title: Dialog
summary: A focused task over the page, as a centered modal or a modal near the top of the window, with shared focus and dismissal.
status: stable
since: 0.1.0
category: Overlays
aliases:
  - modal
  - modal dialog
  - popup
useWhen:
  - A decision before a consequence, such as deleting a project
  - A short task that needs attention first, such as inviting a member
  - Content that needs more room than a popup, such as a comparison
  - A search-like task whose results grow below its field
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
examples:
  ProjectDetails:
    role: overview
    motion: true
  FindPlan: example
  ReviewChanges: example
  DialogAnatomy: anatomy
  RenameProject: example
  UnsavedChanges: example
  CancelAsCloseLabel:
    role: do
    caption: The built-in button named Cancel, for a decision.
  ExtraCancelButton:
    role: dont
    caption: A Cancel of your own beside the built-in Close.
  InviteMember:
    role: do
    caption: A field's error on the field.
  ErrorInSecondDialog:
    role: dont
    caption: An error in a second dialog over the first.
---

# Dialog

## Variants

### Placement

| Placement    | Use for                                                        |
| ------------ | -------------------------------------------------------------- |
| Centered     | Confirmations, short forms and details. The default.           |
| Near the top | Search-like tasks, whose results grow down from a fixed field. |

```tsx figure=FindPlan motion

```

### Widths

Both narrow to fit the window.

| Width  | Use for                               |
| ------ | ------------------------------------- |
| Medium | Most dialogs. The default.            |
| Large  | Tables, comparisons and longer forms. |

```tsx figure=ReviewChanges motion

```

## Anatomy

```tsx figure=DialogAnatomy open

```

1. **Dialog** (`env-dialog-popup`)
2. **Title** (`env-dialog-title`, `title`)
3. **Description** (`env-dialog-description`, `description`)
4. **Content** (`env-text-field`, `children`)
5. **Close button** (`env-dialog-actions > env-button:first-child`, `closeLabel`)
6. **Action** (`env-dialog-actions > env-button:last-child`, `actions`)

## Behaviour

### Actions

A dialog's actions end with the primary one, after a built-in close button.

### Pending work

While its work runs, nothing closes the dialog and its close button is disabled.

- Submit a form from its primary action, so <kbd>Enter</kbd> in a field submits it too.

```tsx figure=RenameProject motion

```

### More actions that close

Other buttons can close the dialog after doing their own work, such as Don’t save.

```tsx figure=UnsavedChanges motion

```

## Rules

One task per dialog, closed by its built-in button.

```tsx figure=CancelAsCloseLabel open

```

```tsx figure=ExtraCancelButton open

```

```tsx figure=InviteMember open

```

```tsx figure=ErrorInSecondDialog open

```

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

## Compose

### Usage

A Dialog opens from its `trigger`, such as a Button, and holds its `title`, which names it, a `description`, its content as `children`, and its own `actions`, after the built-in close button, with the primary action last.

- `closeLabel` names the close button, Close by default from EnvUIProvider's `messages.dialog.close`, or Cancel for a decision.
- Leave it uncontrolled, or control it with `open` and `onOpenChange`, which receives the requested state and why: the trigger, <kbd>Esc</kbd>, an outside press, the close button or a DialogClose.
- `defaultOpen` opens it on the first render.

```tsx source=ProjectDetails

```

#### Pending work

`pending` keeps <kbd>Esc</kbd>, outside presses and the close buttons from dismissing the dialog until it returns to `false`, and disables the built-in close button. Put a `<form>` in `children` and make the primary action its submit button, through the `form` attribute, so <kbd>Enter</kbd> in a field submits it too.

```tsx
<Dialog
  title="Rename project"
  closeLabel="Cancel"
  pending={saving}
  actions={
    <Button type="submit" form={formId} pending={saving}>
      Save name
    </Button>
  }
>
  <form id={formId} onSubmit={save}>
    <TextField label="Project name" readOnly={saving} />
  </form>
</Dialog>
```

#### More actions that close

An action closes the dialog only where it is a DialogClose, a Button that closes it after its own `onClick`, or where it sets `open` to `false`. DialogClose takes Button's props and is `secondary` by default.

```tsx
<Dialog
  title="Save changes to Launch plan?"
  closeLabel="Cancel"
  actions={
    <>
      <DialogClose onClick={discard}>Don’t save</DialogClose>
      <DialogClose variant="primary" onClick={save}>
        Save
      </DialogClose>
    </>
  }
/>
```

#### Placement, width and modal

`placement` is `center`, the default, or `top`, near the top of the window, so results grow down without moving the field. `width` is `md`, 28 rem and the default, or `lg`, 44 rem; both narrow to fit the window. `modal={false}` leaves the page usable beside the dialog, such as an inspector; by default it traps focus over a backdrop, hides the page from assistive technology, blocks presses on it and locks its scroll. `disablePointerDismissal` keeps it open on presses outside it, and a non-modal one also when focus moves outside.

```tsx
<Dialog width="lg" title="Review changes" trigger={<Button>Review</Button>}>
  …
</Dialog>
```

#### Focus

`initialFocus` sets where focus goes on opening, as a ref or a function of how it was opened; by default the first focusable element inside, and a confirmation's close button. `finalFocus` sets where it goes on closing, such as the row that opened it, where the trigger is gone or something other than `trigger` opened the dialog.

### Composition

Keep one task per dialog: show a field's error on the field rather than in a second dialog over the first.

### Customize

The parts are the surface, `env-dialog-popup`, its heading, `env-dialog-heading`, with the title, `env-dialog-title`, the description, `env-dialog-description`, and the actions, `env-dialog-actions`, which start with the close button. The scrim behind a modal dialog is `env-dialog-backdrop`.

The surface takes the popups' color and their shadow, `--env-popup-shadow`, as [Popover](popover.md#customize) describes, with no edge. It stays solid over the scrim, so `--env-popup-opacity` and `--env-popup-blur` don't reach it. At high contrast, with reduced transparency and under forced colors it has no shadow and its level-3 elevation edge returns.

## Changelog

- **1.0.0-prerelease.5**: Dialogs take the popups' color and soft shadow, with no outline edge, and stay solid over the scrim; at high contrast and with reduced transparency the shadow goes and the edge returns.
- **1.0.0**: `width` (`md` or `lg`) for `size`; the side panel, `placement="right"`, is [Sheet](../components/sheet.md); `onOpenChange` reports the reason; `initialFocus` and `finalFocus` take functions too; the surface's class is `env-dialog-popup`. The page is `dialog`, after the component.
- **0.5.0**: `size="wide"`, also for side panels, and `placement="top"`. Dialogs share Popover's raised surface with a hairline border; in the dark theme they keep the pane color through `--env-color-bg-raised`. The title and description sit together above the content. A side panel takes the whole width of a narrow window, with its content clear of the safe areas.
- **0.4.0**: Secondary buttons in dialogs and side panels, such as the close button, stay distinct on their surface.
- **0.3.0**: Dialogs rise into place and side panels slide in, over a backdrop that fades in.
- **0.2.0**: `pending`.
- **0.1.0**: Dialog and DialogClose.
