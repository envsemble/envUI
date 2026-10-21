---
title: Button
summary: Starts an action, or goes to a destination with href, alone, icon-only, confirmed in place, copying a value or connected in a group.
status: stable
since: 0.1.0
category: Actions
aliases:
  - action
  - call to action
  - CTA
  - icon button
  - confirm button
  - copy button
  - button group
  - split button
  - toolbar button
useWhen:
  - Someone starts an action, such as saving, creating or sending.
  - A prominent destination, such as the next step of a flow, should look like an action.
  - An icon alone names a familiar action in a dense place, such as a toolbar (IconButton).
  - An action takes effect at once and cannot be undone, such as removing someone's access (ConfirmButton).
  - People copy a value to paste elsewhere, such as a link, an ID or a command (CopyButton).
  - Related actions belong together, such as the main action and a menu of alternatives (ButtonGroup).
avoidWhen:
  - text: A destination inside running text.
    use: Link
  - text: Choosing one of a few views or filters that stays selected.
    use: SegmentedControl
  - text: A setting that turns on or off.
    use: Switch
  - text: A list of actions that would crowd a toolbar.
    use: Menu
  - text: A consequence that needs a choice or typed confirmation before it happens.
    use: Dialog
related:
  - link
  - menu
  - segmented-control
  - dialog
  - animated-number
  - icons
  - accessibility
components:
  - Button
  - IconButton
  - ConfirmButton
  - CopyButton
  - ButtonGroup
---

# Button

## Overview

> What is a button, and what does it look like?

A button starts an action. With `href` it is a native link that looks like a button.

```tsx example=CreateProject

```

```tsx example=Icons caption="IconButton: an icon alone, named by aria-label."

```

```tsx example=ConnectedButtons caption="ButtonGroup: related buttons joined in a row or a column."

```

> What does it do on its own?

<!-- specimen: InteractionStates -->

### Pending work

While `pending`, a spinner replaces the content at the same size, and presses do nothing.

```tsx example=PendingAction

```

### Confirm in place

ConfirmButton arms on the first press and acts on the second. <kbd>Esc</kbd>, leaving it or 4 seconds disarm it.

```tsx example=ConfirmInPlace

```

### Copy to the clipboard

CopyButton copies its `value` and shows Copied, or Couldn’t copy, for about two seconds.

```tsx example=CopyValue

```

## Variants

> Which variants are there, and when do I use each?

```tsx example=Variants

```

| Variant     | Tones                   | Use for                                        |
| ----------- | ----------------------- | ---------------------------------------------- |
| `primary`   | neutral, accent, danger | The main action of a group. One per group.     |
| `secondary` | neutral                 | Other actions.                                 |
| `outline`   | neutral, danger         | Other actions on panes, dialogs and rows.      |
| `ghost`     | neutral, danger         | An application's chrome, such as a toolbar.    |
| `text`      | neutral, danger         | A link-like action; `underline` underlines it. |

`accent` is for a rare, consequential action; `danger` for one that deletes or ends something. Without a `variant`, a button takes its container's, such as ghost in a Toolbar.

```tsx example=QuietToolbar caption="Ghost buttons in an application's chrome."

```

```tsx example=ButtonLinks caption="With href, a button is a native link."

```

> Which sizes are there?

<!-- specimen: Sizes -->

`sm`, `md` and `lg`, the control heights of the [scale](../foundations/scale.md). Without a `size`, a button takes its container's, such as `sm` in a table cell.

## When to use

> When should I use a button, and when something else?

```tsx do=OnePrimaryAction caption="One primary button per group, at the end of its actions."

```

```tsx dont=SeveralPrimaryActions caption="Several primary buttons: none of them stands out."

```

```tsx do=ExplainWhatIsMissing caption="Let people press it, then show what is missing."

```

```tsx dont=DisabledUntilValid caption="A disabled button that doesn’t say why."

```

- `href` for a destination, `onClick` for an action.

> How do I write its label?

Start with a verb and say what will happen.

```tsx do=SpecificLabel caption="Name the action and what it affects."

```

```tsx dont=VagueLabel caption="OK or Submit, when a specific verb fits."

```

When the outcome is known, put it in the label.

```tsx example=SayWhatWillHappen

```

## Anatomy

> What is a button made of?

```tsx anatomy=ButtonAnatomy

```

1. **Container** (`env-button`)
2. **Start icon** (`env-button > env-icon:first-child`, `startIcon`)
3. **Label** (`env-button::text`)
4. **End icon** (`env-button > env-icon:last-child`, `endIcon`)

Not shown: the spinner, `env-button-spinner`, and a ButtonGroup's `env-button-group`.

## Adapting to width

> How does a button behave when space runs out?

Labels wrap, and icon-only buttons keep their size. On touch screens every button grows to at least 2.75 rem.

```tsx example=NarrowActions widths="16 30"

```

```tsx example=FillSidebar caption="With fullWidth, a button or a group fills its container."

```

## Accessibility

> How do I keep buttons accessible?

### Keyboard

| Key                                             | Action                                        |
| ----------------------------------------------- | --------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves to the next or previous button.         |
| <kbd>Enter</kbd>                                | Activates a button or follows a link.         |
| <kbd>Space</kbd>                                | Activates a button.                           |
| <kbd>Esc</kbd>                                  | Disarms a ConfirmButton; hides a copy result. |

### envUI provides

- Native `<button>` and `<a>`, with `type="button"`.
- `aria-busy` and `aria-disabled` while pending.
- Announcements of ConfirmButton’s armed state and CopyButton’s result.
- `role="group"` on ButtonGroup.

### You provide

- An `aria-label` on every icon-only button and ButtonGroup.
- `type="submit"` on the button that submits a form.
- Routing behind `href`, through `LinkProvider`.
- Focus for after a confirmed action removes the button.

## Changelog

- **1.0.0**: `variant` is `primary`, `secondary`, `outline`, `ghost` or `text`, and `tone` is `neutral`, `accent` or `danger`: `important` is `variant="primary" tone="accent"`, `destructive` is `variant="primary" tone="danger"`, `outlined` is `outline` and `quiet` is `ghost`, which the `v1-props` codemod writes. Outline, ghost and text buttons take the danger tone. `fullWidth`. Buttons take the variant their container gives where they set none. The page is `button`, after the component, and Link has a page of its own. CopyButton takes `write`, a clipboard writer of the application's own. A Badge, CounterBadge or DiffStat inside a button takes its colors through their custom properties, which the button sets.
- **0.6.0**: The `quiet` variant on Button, IconButton and ConfirmButton; CopyButton; ButtonGroup `fullWidth`.
- **0.5.0**: ConfirmButton `icon`, an icon-only form that grows when armed.
- **0.4.0**: `pending` on Button and IconButton; ConfirmButton.
- **0.1.0**: Button, IconButton and ButtonGroup.
