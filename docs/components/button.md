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

A button starts an action, such as saving, creating or sending. With `href` it renders a native link that looks like a button, for a destination that should read as the next step. Every button is a native `<button>` or `<a>`, so focus, activation, form submission and the disabled state behave as the platform's.

```tsx example=CreateProject

```

Four relatives share Button's variants and states:

```tsx example=Icons caption="IconButton shows only an icon, named by aria-label; it is Button with iconOnly, secondary by default."

```

```tsx example=ConfirmInPlace caption="ConfirmButton names the consequence on the first press and acts on the second, for an action that cannot be undone."

```

```tsx example=CopyValue caption="CopyButton copies a value and reports the result: its icon turns into a check, and Copied shows and is announced."

```

```tsx example=ConnectedButtons caption="ButtonGroup connects related buttons into one row or column."

```

> What happens when I press it, or while its work runs?

Hover and pressed take each variant's hover and pressed color tokens, as [colors and themes](../foundations/colors.md) describes; keyboard focus shows the shared focus ring, and disabled buttons use the shared disabled opacity. With `href` the button is a native link, rendered through the `LinkProvider`'s link component so routing stays with the application; a disabled link has no destination, cannot be focused or followed, and reports `aria-disabled`.

<!-- specimen: InteractionStates -->

### Pending work

While `pending` is true a spinner replaces the content at the same size; the button reports `aria-busy` and `aria-disabled`, and ignores activation, including form submission and navigation.

```tsx example=PendingAction

```

### Confirm in place

The first press arms a ConfirmButton. It turns into a primary button in the danger tone, shows `confirmLabel` and announces it with "Press again to confirm." A second press runs `onConfirm`; a double click only arms it, since a second press within 400 ms is ignored. <kbd>Esc</kbd>, leaving the button, disabling it, starting its work and `armedDuration` (4 seconds) disarm it. An icon-only ConfirmButton is round at rest and grows when armed to show its icon with the confirm label, keeping focus.

### Copy to the clipboard

A CopyButton writes the text with the asynchronous Clipboard API, or with `write`, the application's own clipboard writer, such as a desktop shell's bridge; without clipboard access, such as on an insecure connection, it copies a selection of a hidden field instead, also inside a dialog. A `write` that rejects reports "Couldn’t copy". A function `value` runs at the press, and a promise keeps the button pending until it resolves. "Copied" (or "Couldn’t copy") shows in the tooltip and is announced for about two seconds, again for each press; <kbd>Esc</kbd> hides it. An icon-only CopyButton shows its name in a tooltip on hover and focus, also while disabled.

```tsx example=CustomClipboard caption="With write, CopyButton copies through the application's own clipboard, here a stand-in that takes a moment."

```

## Variants

> Which variants are there, and when do I use each?

`variant` sets the emphasis and `tone` the meaning, in the designed pairs below; `tone` is `neutral` unless set. Use one primary button per group; the others step down in emphasis.

```tsx example=Variants

```

| Variant     | Tones                   | Use for                                                                          |
| ----------- | ----------------------- | -------------------------------------------------------------------------------- |
| `primary`   | neutral, accent, danger | The main action of a view or group. Use one per group.                           |
| `secondary` | neutral                 | Other actions, on the neutral fill without a border.                             |
| `outline`   | neutral, danger         | Other actions on panes, dialogs and rows, with a border.                         |
| `ghost`     | neutral, danger         | Actions in an application's chrome, such as a sidebar toggle or a toolbar.       |
| `text`      | neutral, danger         | A link-like action without fill, border or inset; `underline` adds an underline. |

| Tone      | Use for                                                                                                                                    |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `neutral` | Most actions. The default.                                                                                                                 |
| `accent`  | On a primary button, a rare, consequential action that must stand out, with 0.5 rem corners.                                               |
| `danger`  | An action that deletes or ends something: the strong danger fill on a primary button, the danger color on outline, ghost and text buttons. |

<!-- specimen: VariantMatrix -->

```tsx example=QuietToolbar caption="Ghost buttons suit an application's chrome: the icon color, with a state layer on hover and press."

```

```tsx example=ButtonLinks caption="With href a button is a native link. Text buttons read as links; underline adds an underline."

```

- A button without a `variant` takes the one its container gives, where that variant has the button's tone: buttons the application puts in a [Toolbar](../components/toolbar.md) are ghost, a `tone="danger"` one too, but a `tone="accent"` Button stays primary, since ghost has no accent. Otherwise a Button is primary, an IconButton and a CopyButton secondary, and a ConfirmButton outline at rest, or secondary when icon-only.
- Only the designed pairs type-check: an IconButton, CopyButton or icon-only ConfirmButton without a `variant` is neutral, so a tone needs a variant that takes it. A pair outside them, which only code past the types can ask for, renders neutral, and a development build reports it in the console.
- Primary buttons are blue in both themes: the control blue with white labels in the light theme, and the link's soft blue with dark labels in the dark theme. Secondary buttons use the neutral fill, a translucent layer of the text color, so they stay visible on rows, panes and dialogs; outlined buttons keep their border and link color.
- Ghost buttons take the quiet icon color, darken to the text color over a state layer on hover and press, and show the focus ring, with no fill or border. In the danger tone, outline, ghost and text buttons take the danger color, with the danger state layer on hover and press.
- An icon-only text button takes the link color and a state layer on hover and press. A container whose chrome is quiet, such as a field's end, sets `--env-button-text-icon-color` and `--env-button-text-icon-color-active` on its own element, never on the button: the icons of the text buttons inside take the first at rest and the second on hover and press. New code uses a ghost button there, which looks the same with no custom property.

> Which sizes are there?

`size` sets the height, the same for every control of that size in the app's [scale](../foundations/scale.md): `sm`, `md` and `lg` are 2, 2.5 and 3 rem in the comfortable scale, and 1.625, 2 and 2.375 rem in the compact one.

<!-- specimen: Sizes -->

- `sm` for a small action where space is short, such as in a toolbar beside small fields or in a table cell; `md` for most actions; `lg` for the one prominent call to action of a page. IconButton and CopyButton take the same sizes, and so do accent buttons.
- A button without a size takes the control height of its container: buttons in a table cell are `sm`, as are those in a title bar, a panel header or a message's actions. A button beside a field takes the field's size.
- Labels are 0.875 rem, 0.8125 rem in the compact scale, with 0.25 rem vertical and 0.75 rem horizontal padding.

## When to use

> When should I use a button, and when something else?

```tsx do=OnePrimaryAction caption="Use one primary button per group, and put it where the eye ends: at the end of a dialog's or a form's actions."

```

```tsx dont=SeveralPrimaryActions caption="Don't line up several primary buttons: none of them stands out, and people can't tell which one moves them on."

```

```tsx do=LinkInText caption="Use a Link for a destination inside a sentence."

```

```tsx dont=ButtonInText caption="Don't put a button in running text: it breaks the line and reads as an action."

```

- Use `href` for destinations and `onClick` for actions.
- Show `pending` on the button that started the work, instead of disabling the whole form.
- Don't disable a button to explain a missing requirement; let people press it and show what is missing.
- Don't confirm everyday actions: use ConfirmButton only where the action cannot be undone, and reserve the accent tone for rare, consequential actions.

> How do I write its label?

Start with a verb and say what will happen. When the outcome is known, put it in the label: "Show 128 homes", "Assign to Morgan". AnimatedNumber keeps a count current while people choose.

```tsx example=SayWhatWillHappen

```

```tsx do=SpecificLabel caption="Name the action and what it affects, such as Remove Sam Lee."

```

```tsx dont=VagueLabel caption="Don't use a vague label such as OK or Submit when a specific verb fits."

```

- Use sentence case and keep labels short; don't end them with punctuation.
- Name an icon-only button after its action, not its icon: "Delete draft", not "Trash".
- A ConfirmButton's `confirmLabel` names the consequence as a question, with what is affected: "Remove Morgan?", "Cancel plan · 3 lose access".
- Name a CopyButton after what it copies: "Copy link", "Copy ID".

## Anatomy

> What is a button made of?

```tsx anatomy=ButtonAnatomy

```

1. **Container** (`env-button`): the fill, border and corners of the variant. Labelled buttons are pills; icon-only buttons are circles, except primary ones in the accent tone, which are rounded squares.
2. **Start icon** (`env-button > env-icon:first-child`, from `startIcon`): decorative, at the control icon size of 1 rem.
3. **Label** (`env-button::text`): the button's text and its accessible name. It wraps when space runs out.
4. **End icon** (`env-button > env-icon:last-child`, from `endIcon`): decorative, such as a chevron for a next step.

- **Spinner** (`env-button-spinner`, while `pending`): replaces the content, kept in `env-button-content`, without changing the button's size.
- **Focus ring**: the shared ring, shown for keyboard focus.
- **Group** (`env-button-group`): a ButtonGroup joins its buttons with a 0.125 rem gap; inner corners take the shared 0.5 rem radius and each end keeps its variant's outer corners.

## Adapting to width

> How does a button behave when space runs out?

Buttons fit their content. A labelled button can shrink and wrap its label, while an icon-only button keeps its square size, also in a squeezed row. In a row that wraps, buttons move to the next line before their labels wrap.

```tsx example=NarrowActions widths="16 30"

```

- `fullWidth` makes a labelled button as wide as its container, such as the actions of a narrow form stacked in a column. With `fullWidth` a ButtonGroup fills its container: labelled buttons share the room the icon-only ones leave.
- Horizontal buttons in a ButtonGroup share a height and vertical buttons fill the group's width. Labels wrap, and a group scrolls locally if its controls cannot fit. Hidden buttons don't count for the end corners.
- On touch screens a button grows to 2.75 rem, tall and wide, in either [scale](../foundations/scale.md), as every control of its row does; its own box is its hit area, so a press on it never reaches a button beside it. The buttons of a ButtonGroup grow with their group, which keeps its round ends.

```tsx example=FillSidebar caption="With fullWidth a group fills its container: the labelled button takes the room the menu's chevron leaves."

```

## Accessibility

> How do I keep buttons accessible?

Every button is a native element, so focus, activation and the disabled state come from the platform. Name each one by what it does, and give icon-only buttons an `aria-label`.

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
- The shared focus ring, and buttons at least 2.75 rem tall and wide on coarse pointers.
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
- Focus for after a confirmed action removes the button, as a row's Remove does: move it to the neighbouring row's button, or to what replaces the button, so it doesn't fall back to the page.

## Changelog

- **1.0.0**: `variant` is `primary`, `secondary`, `outline`, `ghost` or `text`, and `tone` is `neutral`, `accent` or `danger`: `important` is `variant="primary" tone="accent"`, `destructive` is `variant="primary" tone="danger"`, `outlined` is `outline` and `quiet` is `ghost`, which the `v1-props` codemod writes. Outline, ghost and text buttons take the danger tone. `fullWidth`. Buttons take the variant their container gives where they set none. The page is `button`, after the component, and Link has a page of its own. CopyButton takes `write`, a clipboard writer of the application's own. A Badge, CounterBadge or DiffStat inside a button takes its colors through their custom properties, which the button sets.
- **0.6.0**: The `quiet` variant on Button, IconButton and ConfirmButton; CopyButton; ButtonGroup `fullWidth`.
- **0.5.0**: ConfirmButton `icon`, an icon-only form that grows when armed.
- **0.4.0**: `pending` on Button and IconButton; ConfirmButton.
- **0.1.0**: Button, IconButton and ButtonGroup.
