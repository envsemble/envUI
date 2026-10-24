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
  - close button
  - dismiss button
  - remove button
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
components:
  - Button
  - IconButton
  - ConfirmButton
  - CopyButton
  - ButtonGroup
---

# Button

## Overview

```tsx example=CreateProject

```

```tsx example=Icons caption="IconButton: an icon alone, named by aria-label."

```

```tsx example=ConnectedButtons caption="ButtonGroup: related buttons joined in a row or a column."

```

### Close and remove

An IconButton with the Close cross closes, dismisses or removes what it sits in. Name it Close in the application's language, or say what it removes where several sit together.

```tsx example=DismissTip

```

```tsx example=RemovePeople caption="Beside others like it, each button names what it removes."

```

Under a coarse pointer, an icon button drawn smaller than the touch size, such as a close button in a chip or a tab, reaches the 2.75 rem touch size with its hit area when its container sets `--env-icon-button-hit-area: var(--env-control-height-touch)` on it or around it. Alert, Toast, Combobox chips, DocumentTabs and PanelDock's tabs set it on their own close buttons.

### States

Hover, press, keyboard focus and disabled, for each variant.

<!-- specimen: InteractionStates -->

### Colors of its own

One button can take colors of its own through its color properties, such as `--env-button-container` and `--env-button-content`. Its hover, focus and press follow them, as state layers of its label color.

```tsx example=CustomColors

```

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

```tsx variants=Variants

```

1. **Primary**
2. **Secondary**
3. **Outline**
4. **Ghost**
5. **Text**

| Variant     | Tones                   | Use for                                        |
| ----------- | ----------------------- | ---------------------------------------------- |
| `primary`   | neutral, accent, danger | The main action of a group. One per group.     |
| `secondary` | neutral                 | Other actions.                                 |
| `outline`   | neutral, danger         | Other actions on panes, dialogs and rows.      |
| `ghost`     | neutral, danger         | An application's chrome, such as a toolbar.    |
| `text`      | neutral, danger         | A link-like action; `underline` underlines it. |

`accent` is for a rare, consequential action; `danger` for one that deletes or ends something. Without a `variant`, a button takes its container's, such as ghost in a Toolbar.

Keyboard focus draws a ring 2 px outside a button, or on the edge of a ghost button's state layer. A text button's hit area and ring reach 0.25 rem past its label, which a negative margin takes back, so its label lines up with the text around it.

```tsx example=QuietToolbar caption="Ghost buttons in an application's chrome."

```

```tsx example=ButtonLinks caption="With href, a button is a native link."

```

### Sizes

`sm`, `md` and `lg`, the control heights of the [scale](../foundations/scale.md). Without a `size`, a button takes its container's, such as `sm` in a table cell.

<!-- specimen: Sizes -->

## When to use

```tsx do=OnePrimaryAction caption="One primary button per group, at the end of its actions."

```

```tsx dont=SeveralPrimaryActions caption="Several primary buttons: none of them stands out."

```

```tsx do=ExplainWhatIsMissing caption="Let people press it, then show what is missing."

```

```tsx dont=DisabledUntilValid caption="A disabled button that doesn’t say why."

```

- `href` for a destination, `onClick` for an action.

### Labels

Start with a verb and say what will happen.

When the outcome is known, put it in the label.

```tsx example=SayWhatWillHappen

```

## Anatomy

```tsx anatomy=ButtonAnatomy

```

1. **Container** (`env-button`)
2. **Start icon** (`env-button > env-icon:first-child`, `startIcon`)
3. **Label** (`env-button::text`)
4. **End icon** (`env-button > env-icon:last-child`, `endIcon`)

Not shown: the spinner, `env-button-spinner`, a ButtonGroup's `env-button-group`, and the end slot, `env-button-end`: quiet content after the label, such as a shortcut's keys in a Kbd, in the button's content color with outlined caps and at the far end of a wide button, as the [search trigger](../patterns/search-trigger.md) shows it.

### Colors

`--env-button-container`, `--env-button-content`, `--env-button-outline`, `--env-button-selected` and `--env-button-selected-content` set the colors of one Button or IconButton, through `style` or CSS. Its hover, focus and press then follow them, as state layers; with none set, it keeps its own colors.

## Adapting to width

Labels wrap, and icon-only buttons keep their size. On touch screens every button grows to at least 2.75 rem.

```tsx example=NarrowActions widths="16 30"

```

```tsx example=FillSidebar caption="With fullWidth, a button or a group fills its container."

```

## Accessibility

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

- **1.0.0**: `end`, a quiet slot at the far end for a shortcut's keys, in the button's content color, which the search trigger pattern uses. IconButton is the one icon-only button, and takes `href`: `Button iconOnly` is gone, and CloseButton is an IconButton with the Close cross, which the `v1-structure` codemod writes. `variant` is `primary`, `secondary`, `outline`, `ghost` or `text`, and `tone` is `neutral`, `accent` or `danger`: `important` is `variant="primary" tone="accent"`, `destructive` is `variant="primary" tone="danger"`, `outlined` is `outline` and `quiet` is `ghost`, which the `v1-props` codemod writes. Outline, ghost and text buttons take the danger tone. `fullWidth`. Buttons take the variant their container gives where they set none. The page is `button`, after the component, and Link has a page of its own. CopyButton takes `write`, a clipboard writer of the application's own. A Badge or DiffStat inside a button takes its colors through their custom properties, which the button sets.
- **0.6.0**: The `quiet` variant on Button, IconButton and ConfirmButton; CopyButton; ButtonGroup `fullWidth`.
- **0.5.0**: ConfirmButton `icon`, an icon-only form that grows when armed.
- **0.4.0**: `pending` on Button and IconButton; ConfirmButton.
- **0.1.0**: Button, IconButton and ButtonGroup.
