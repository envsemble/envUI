---
title: Select
summary: One choice from a list that stays collapsed until opened, on a Button-style trigger with a label, hint and error.
status: beta
since: 0.1.0
category: Forms & selection
aliases:
  - dropdown
  - drop-down
  - dropdown list
  - select menu
  - select box
  - listbox
  - picker
  - option picker
  - pick list
  - choose from a list
useWhen:
  - People choose one of several known options, such as a role, a sort order or a time zone, and the choice can stay collapsed.
  - A setting in a row or a toolbar takes one of a few values, such as an e-mail digest's frequency or a zoom level.
avoidWhen:
  - text: Two to five options that read better side by side, or that each need explaining.
    use: RadioGroup
  - text: Finding one option in a long list by typing, or choosing several.
    use: Combobox
  - text: Switching between views or filters that apply at once, such as List and Board.
    use: SegmentedControl
  - text: A list of actions, such as Rename or Delete, rather than a value.
    use: Menu
  - text: A date, or a date and time.
    use: DatePicker
related:
  - combobox
  - radio
  - segmented-control
  - menu
  - text-field
  - list
  - accessibility
components:
  - Select
---

# Select

## Overview

A select chooses one value from a list that stays collapsed until people open it. Its trigger is a pill in a Button style that shows the chosen option, with the label above it and a hint and an error below, as on other fields. Select is built on Base UI's select: the list opens below the trigger, takes keyboard focus, chooses with a press or a key and returns focus to the trigger, and a hidden input takes part in native forms.

```tsx example=ProjectVisibility

```

## Anatomy

1. **Label** (`label`): above the trigger, 0.75 rem from it, in 0.875 rem text. It names the select, and pressing it focuses the trigger.
2. **Trigger**: a secondary or outlined Button pill as wide as its content, with the chosen option's label or the `placeholder`.
3. **Chevron**: points down, and up while the list is open.
4. **Hint** (optional, `hint`) and **error** (optional, `error`): under the trigger, 0.75 rem below it, as on a [TextField](../components/text-field.md); the error leads with an error icon.
5. **Popup**: the raised popup surface with a hairline border, 0.5 rem below the trigger, at least as wide as the trigger and at most 24 rem.
6. **Option**: a rounded row with a check-mark slot and the option's label; a check mark and a medium-weight label show the chosen option.

## Variants and sizes

| Variant     | Use for                                                                                                       |
| ----------- | ------------------------------------------------------------------------------------------------------------- |
| `secondary` | A select on the page, as a filled pill. The default.                                                          |
| `outlined`  | A select on a pane, a dialog, a row or a toolbar, where a fill would blend with the surface: a bordered pill. |

<!-- specimen: States -->

- The trigger takes the control height of its `size`, as every control does: `sm`, `md` and `lg` are 2, 2.5 and 3 rem in the comfortable scale and 1.625, 2 and 2.375 rem in the compact one; without a size it takes its container's control height. It has 0.875 rem text and a 1.125 rem chevron, 1 rem at `sm` and in the compact scale.
- The popup is the menus' raised popup: 0.75 rem corners, 0.25 rem padding and a 22 rem maximum width. Options are rows of the scale's row height, 2.25 rem or 1.75 rem compact, that fill only while highlighted, and the chosen option shows a check mark and a medium-weight label. See [scale and density](../foundations/scale.md).
- On touch screens, options are at least 2.75 rem tall, and so is the trigger, as every control is.
- A long option label wraps in the list. The popup scrolls when its options are taller than the room in the window.

## States and behaviour

- **Opening**: pressing the trigger opens the list below it, aligned with its start; near the edge of the window it flips above the trigger and stays inside the window. Opened from the keyboard, the chosen option is highlighted, or the first option (the last with <kbd>↑</kbd>) while nothing is chosen. The list fades in and, without a reduced-motion preference, grows from the trigger, and the chevron turns.
- **Choosing**: pressing an option, or <kbd>Enter</kbd> or <kbd>Space</kbd> on the highlighted one, chooses it, closes the list and returns focus to the trigger. Typing on the closed trigger chooses the next option whose label starts with what was typed, without opening the list.
- **Closing without a choice**: <kbd>Esc</kbd>, <kbd>Tab</kbd> and a press outside close the list and keep the chosen option. While the list is open, the page doesn't scroll and a press outside only closes it, without reaching what is beneath. Inside a [Dialog](../components/dialog.md), <kbd>Esc</kbd> closes the list first and the dialog only on a second press.
- **Hover, pressed and focus**: the trigger takes its Button style's hover and pressed shades, and the open trigger keeps the hover shade. Options take the popup's hover and pressed fills, from the color tokens [colors and themes](../foundations/colors.md) describes; the keyboard also shows the focus ring on the highlighted option, which pointer use doesn't.
- **Disabled**: with `disabled` the trigger takes the shared disabled opacity, can't be focused or opened, and forms leave the select out. A disabled option is dimmed too and can't be chosen, though the keyboard still highlights it.
- **Invalid**: while `error` is set, the trigger reports `aria-invalid` and turns its border red, with red hover and pressed shades, and keeps its fill; the error shows under the trigger and joins its description.
- **Controlled or not**: `value` with `onValueChange` controls the choice; otherwise it starts from `defaultValue`. While nothing is chosen, `null`, the trigger shows `placeholder`. People can't clear a choice, only make another.
- **Native forms**: with `name`, a hidden input submits the chosen value; `form` ties it to a form it sits outside of, and `autoComplete` lets browsers fill it. `required` refuses the form while nothing is chosen and moves focus to the trigger. A form reset returns an uncontrolled select to `defaultValue` and leaves a controlled one as `value` says; a reset the form prevents changes nothing.
- **Theme**: the list renders in a portal at the end of the document, in the theme of the place it opens from, also inside a nested `Theme` or a dark dialog.

## Content guidelines

- Name the select with a short noun phrase in sentence case, without a colon: "Role", "Sort by", "E-mail digest".
- Give options short labels that start with the word that sets them apart, so typing finds them: "Daily", "Weekly", "Never".
- Order options in their natural order, such as by size or frequency, or alphabetically where there is none.
- Use a placeholder that says what to do, such as "Choose an owner", only where nothing is chosen yet; it is not the label.
- Say in a disabled option's label, or in the hint, why it is unavailable: "Public (turned off by your administrator)".
- Write an error that says what to do: "Choose an owner to continue."

## Do and don't

### Do

- Use the secondary trigger on the page and the outlined one on panes, dialogs, rows and toolbars.
- Choose a sensible default where one option suits most people, and use a placeholder only where people must decide.
- Give a select the size of the buttons and fields beside it, such as `sm` in a toolbar.
- Name a select without a visible label with `aria-label`, such as after the row it sits in.

### Don't

- Don't use a select for two or three options people should compare; use [Radio](../components/radio.md) or [SegmentedControl](../components/segmented-control.md).
- Don't use a select for a long list people search, or to choose several options; use [Combobox](../components/combobox.md).
- Don't put actions in a select's options; use [Menu](../components/menu.md).
- Don't use a select's change to navigate away or to run a destructive action at once.

## Accessibility

### Keyboard

| Key                                                                             | Action                                                                                                                        |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd>                                 | Moves focus to and from the trigger. In the open list, closes it without choosing and moves focus on, or back to the trigger. |
| <kbd>Enter</kbd>, <kbd>Space</kbd>, <kbd>↓</kbd> or <kbd>↑</kbd> on the trigger | Opens the list with the chosen option highlighted, or the first option (the last with <kbd>↑</kbd>) while nothing is chosen.  |
| A letter or digit on the trigger                                                | Chooses the next option whose label starts with the characters typed, without opening the list.                               |
| <kbd>↓</kbd>, <kbd>↑</kbd>                                                      | Highlights the next or previous option, stopping at the ends.                                                                 |
| <kbd>Home</kbd>, <kbd>End</kbd>                                                 | Highlights the first or last option.                                                                                          |
| A letter or digit                                                               | Highlights the next option whose label starts with the characters typed.                                                      |
| <kbd>Enter</kbd> or <kbd>Space</kbd>                                            | Chooses the highlighted option, closes the list and returns focus to the trigger; a disabled option can't be chosen.          |
| <kbd>Esc</kbd>                                                                  | Closes the list without choosing and returns focus to the trigger.                                                            |

### envUI provides

- A trigger with the `combobox` role that reports `aria-expanded` and controls a `listbox` of `option`s with `aria-selected`, following the select-only combobox pattern.
- The label tied to the trigger, and the hint and the error linked to it as its description, with `aria-invalid` while `error` is set.
- Focus that moves into the list as it opens, highlights options as the keyboard and pointer move, and returns to the trigger as it closes.
- `aria-disabled` on disabled options, and the shared focus ring on the trigger and on the option the keyboard highlights.
- A hidden input for native form submission, required validation and reset.
- The originating theme in the portal, and triggers and options at least 2.75 rem tall on coarse pointers.

### You provide

- A `label`, or `aria-label` or `aria-labelledby` where the name shows elsewhere, such as a row's title.
- A `name` for a select in a form.
- Validation: when to check, and the `error` message.
- Option labels in the application's language, and a reason for each disabled option.

## Examples

### Trigger styles

The secondary trigger fills on the page; the outlined one keeps a border on a pane, where a fill would blend in.

```tsx example=TriggerStyles

```

### In a form

The label sits above a trigger that fits its content, beside a full-width text field. The hint says what the roles mean, and `name` submits the chosen role with the form.

```tsx example=InviteMember

```

### In list rows

A row's title names its select with `aria-label`; outlined triggers stay distinct on the row fill.

```tsx example=SettingRows

```

### Small, in a toolbar

A small, outlined select fits a toolbar beside small text icon buttons. Its list has a check mark on the chosen zoom level.

```tsx example=SmallToolbar

```

## Changelog

- **1.0.0**: The open list takes the level-2 elevation, with its shadow and border.
- **0.5.0**: `density="compact"`. The outlined trigger is the outlined Button style, and the open list takes the popup surface corners, with rounded options inset by its padding.
- **0.4.0**: `variant`, secondary or outlined. The open list is a raised popup in its own color with a hairline border; options show only hover, press and selection, with stronger hover and pressed shades; the trigger settles like a button while pressed.
- **0.3.0**: The open list grows from its trigger.
- **0.1.0**: Select.
