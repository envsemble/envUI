---
title: Button
summary: Starts an action, or goes to a destination with href, alone, icon-only, confirmed in place, copying a value or connected in a group.
status: beta
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

A button starts an action. With `href` it renders a native link that looks like a button, for a destination that should read as the next step. Every button is a native `<button>` or `<a>`, so focus, activation, form submission and the disabled state behave as the platform's.

The family shares Button's variants and states:

- **IconButton** shows only an icon, named by `aria-label`; it is Button with `iconOnly`, secondary by default.
- **ConfirmButton** names the consequence on the first press and acts on the second, for an action that cannot be undone.
- **CopyButton** copies a value and reports the result.
- **ButtonGroup** connects buttons into one row or column.

```tsx example=CreateProject

```

## Anatomy

1. **Container**: the fill, border and corners of the variant. Labelled buttons are pills; icon-only buttons are circles, except important ones, which are rounded squares.
2. **Start icon** (optional, `startIcon`): decorative, at the control icon size of 1 rem.
3. **Label**: the button's text and its accessible name. It wraps when space runs out.
4. **End icon** (optional, `endIcon`): decorative, such as a chevron for a next step.
5. **Spinner** (while `pending`): replaces the content without changing the button's size.
6. **Focus ring**: the shared ring, shown for keyboard focus.

A ButtonGroup joins its buttons with a 0.125 rem gap; inner corners take the shared 0.5 rem radius and each end keeps its variant's outer corners.

## Variants and sizes

| Variant       | Use for                                                                                |
| ------------- | -------------------------------------------------------------------------------------- |
| `primary`     | The main action of a view or group. Use one per group.                                 |
| `important`   | A rare, consequential action that must stand out; it is smaller, with 0.5 rem corners. |
| `secondary`   | Other actions, on the neutral fill without a border.                                   |
| `outlined`    | Other actions on panes, dialogs and rows, with a border in the link color.             |
| `destructive` | An action that deletes or ends something.                                              |
| `text`        | A link-like action without fill, border or inset; `underline` adds an underline.       |
| `quiet`       | Actions in an application's chrome, such as a sidebar toggle or a toolbar.             |

<!-- specimen: VariantMatrix -->

- Buttons are 2.5 rem tall, and important buttons 2 rem; on touch screens both grow to 2.75 rem. Inside a compact surface they take the 2 rem compact height, and CopyButton takes it anywhere with `size="compact"`.
- Labels are 0.875 rem with 0.25 rem vertical and 0.75 rem horizontal padding. Buttons fit their content; a labelled button can shrink and wrap its label, while an icon-only button keeps its square size, also in a squeezed row.
- Primary buttons are blue in both themes: the control blue with white labels in the light theme, and the link's soft blue with dark labels in the dark theme.
- Secondary buttons use the neutral fill and label color without a border; the fill is a translucent layer of the text color, so they stay visible on rows, panes and dialogs. Outlined buttons keep their border and link color.
- Quiet buttons take the quiet icon color, darken to the text color over a state layer on hover and press, and show the focus ring, with no fill or border. A quiet label reads at 4.5:1 on the canvas, panes and rows.

## States and behaviour

- **Hover, pressed, focus and disabled**: hover and pressed take each variant's hover and pressed color tokens, as [colors and themes](../foundations/colors.md) describes; disabled buttons use the shared disabled opacity.
- **Pending**: while `pending` is true a spinner replaces the content at the same size; the button reports `aria-busy` and `aria-disabled`, and ignores activation, including form submission and navigation.
- **Links**: with `href` the button is a native link, rendered through the `LinkProvider`'s link component so routing stays with the application. A disabled link has no destination, cannot be focused or followed, and reports `aria-disabled`.
- **ConfirmButton**: the first press arms it. It turns destructive, shows `confirmLabel` and announces it with "Press again to confirm." A second press runs `onConfirm`; a double click only arms it, since a second press within 400 ms is ignored. <kbd>Esc</kbd>, leaving the button, disabling it, starting its work and `armedDuration` (4 seconds) disarm it. An icon-only ConfirmButton is round at rest and grows when armed to show its icon with the confirm label, keeping focus.
- **CopyButton**: a press writes the text with the asynchronous Clipboard API; without clipboard access, such as on an insecure connection, it copies a selection of a hidden field instead, also inside a dialog. A function `value` runs at the press, and a promise keeps the button pending until it resolves. The icon turns into a check and "Copied" (or "Couldn’t copy") shows in the tooltip and is announced for about two seconds, again for each press; <kbd>Esc</kbd> hides it. An icon-only CopyButton shows its name in a tooltip on hover and focus, also while disabled.
- **ButtonGroup**: horizontal buttons share a height and vertical buttons fill the group's width. Labels wrap, and a group scrolls locally if its controls cannot fit. With `fullWidth` the group fills its container: labelled buttons share the room the icon-only ones leave. Hidden buttons don't count for the end corners.

<!-- specimen: InteractionStates -->

## Content guidelines

- Start with a verb and say what will happen, such as "Create project" or "Remove access". When the outcome is known, put it in the label: "Show 128 homes", "Assign to Morgan". AnimatedNumber keeps a count current while people choose.
- Use sentence case and keep labels short; don't end them with punctuation.
- Name an icon-only button after its action, not its icon: "Delete draft", not "Trash".
- A ConfirmButton's `confirmLabel` names the consequence as a question, with what is affected: "Remove Morgan?", "Cancel plan · 3 lose access".
- Name a CopyButton after what it copies: "Copy link", "Copy ID".
- Avoid vague labels such as "Click here", "OK" or "Submit" when a specific verb fits.

## Do and don't

### Do

- Use one primary button per group, and put it where the eye ends: at the end of a dialog's actions or a form.
- Use `href` for destinations and `onClick` for actions.
- Show `pending` on the button that started the work, instead of disabling the whole form.
- Give every ButtonGroup and every icon-only button an accessible name.

### Don't

- Don't use several primary or important buttons side by side; reserve important for rare, consequential actions.
- Don't disable a button to explain a missing requirement; let people press it and show what is missing.
- Don't use a Button for a destination inside a sentence; use [Link](../components/link.md).
- Don't confirm everyday actions; use ConfirmButton only where the action cannot be undone.

## Accessibility

### Keyboard

| Key                                                     | Action                                                                                         |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd>         | Moves focus to the next or previous button; a ButtonGroup keeps every button in the tab order. |
| <kbd>Enter</kbd>                                        | Activates a button or follows a link.                                                          |
| <kbd>Space</kbd>                                        | Activates a button.                                                                            |
| <kbd>Enter</kbd> or <kbd>Space</kbd> on a ConfirmButton | Arms it; pressed again after a moment, confirms.                                               |
| <kbd>Esc</kbd> on an armed ConfirmButton                | Disarms it.                                                                                    |
| <kbd>Esc</kbd> on a CopyButton                          | Hides the result of the last copy.                                                             |

### envUI provides

- Native `<button>` and `<a>` elements, with `type="button"` by default so a button inside a form doesn't submit it unless asked.
- The shared focus ring and a 2.75 rem touch target on coarse pointers.
- `aria-busy` and `aria-disabled` while pending, and `aria-disabled` on disabled links, which leave the tab order.
- Decorative icons hidden from assistive technology.
- ConfirmButton's announcement of the armed state, since a changed label on a focused button is not reliably read.
- CopyButton's announcement of each result in a visually hidden status, and its name in a tooltip when icon-only.
- `role="group"` on ButtonGroup.

### You provide

- A label that says what happens, or an `aria-label` on icon-only buttons, ButtonGroups and icon-only ConfirmButtons and CopyButtons.
- `type="submit"` on the button that submits a form.
- The routing behind `href`, through `LinkProvider`.
- A way to recover from a ConfirmButton action where possible, such as an undo.

## Examples

### Variants

One primary action per group; the others step down in emphasis.

```tsx example=Variants

```

### Icons

`startIcon` and `endIcon` add decorative icons beside the label. An icon-only button, IconButton or Button with `iconOnly`, needs an `aria-label`.

```tsx example=Icons

```

### Quiet actions in chrome

Quiet buttons suit an application's chrome, such as a sidebar toggle or a section's actions inside a surface: the icon color, with a state layer on hover and press.

```tsx example=QuietToolbar

```

### Destinations

With `href` a button is a native link. Text buttons read as links; `underline` adds an underline.

```tsx example=ButtonLinks

```

### Pending work

A pending button keeps its size, shows a spinner and ignores repeated presses until the work ends.

```tsx example=PendingAction

```

### Say what will happen

Put the outcome in the label when it is known. AnimatedNumber rolls a count that changes while choices are made.

```tsx example=SayWhatWillHappen

```

### Confirm in place

ConfirmButton names the consequence on the first press and acts on the second. It disarms after a few seconds, when focus leaves and on <kbd>Esc</kbd>.

```tsx example=ConfirmInPlace

```

### Copy to the clipboard

After a press the icon turns into a check, and Copied shows and is announced for about two seconds.

```tsx example=CopyValue

```

### Connected buttons

ButtonGroup connects related actions in a row or a column. Prefer the same variant within a group; mix variants when related actions need different emphasis.

```tsx example=ConnectedButtons

```

### Fill a sidebar

With `fullWidth` a group fills its container: the labelled button takes the room the menu's chevron leaves.

```tsx example=FillSidebar

```

## Changelog

- **1.0.0**: The page is `button`, after the component, and Link has a page of its own.
- **0.6.0**: The `quiet` variant on Button, IconButton and ConfirmButton; CopyButton; ButtonGroup `fullWidth`.
- **0.5.0**: ConfirmButton `icon`, an icon-only form that grows when armed.
- **0.4.0**: `pending` on Button and IconButton; ConfirmButton.
- **0.1.0**: Button, IconButton and ButtonGroup.
