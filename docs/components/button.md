---
title: Button
summary: Starts an action, or goes to a destination as a link, alone, icon-only, confirmed in place, copying a value or connected in a group.
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
  - Starting an action, such as saving or sending
  - A prominent destination, such as the next step of a flow
  - A familiar action as an icon alone, in a dense place (IconButton)
  - An action that takes effect at once and can't be undone (ConfirmButton)
  - Copying a value, such as a link or an ID (CopyButton)
  - Related actions that belong together (ButtonGroup)
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

```tsx example=Icons caption="IconButton: an icon alone, with a name for assistive technology."

```

```tsx example=ConnectedButtons caption="ButtonGroup: related buttons joined in a row or a column."

```

### Close and remove

An IconButton with the Close cross closes, dismisses or removes what it sits in. Name it Close in the application's language, or say what it removes where several sit together.

```tsx example=DismissTip

```

```tsx example=RemovePeople caption="Beside others like it, each button names what it removes."

```

### States

Hover, press, keyboard focus and disabled, for each variant. Keyboard focus draws a ring just outside the button; a text button's ring reaches a little past its label, which stays in line with the text around it.

<!-- specimen: InteractionStates -->

### Pending work

While its work runs, a spinner replaces the content at the same size, and presses do nothing.

```tsx example=PendingAction

```

### Confirm in place

ConfirmButton arms on the first press and acts on the second. <kbd>Esc</kbd>, leaving it or 4 seconds disarm it. Its armed label is short and has no question mark: the verb, or the verb and object, "Remove Sam".

```tsx example=ConfirmInPlace

```

### Copy to the clipboard

CopyButton copies a value and shows Copied, or Couldn’t copy, for about two seconds.

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

| Variant   | Tones                   | Use for                                      |
| --------- | ----------------------- | -------------------------------------------- |
| Primary   | Neutral, accent, danger | The main action of a group. One per group.   |
| Secondary | Neutral                 | Other actions.                               |
| Outline   | Neutral, danger         | Other actions on panes, dialogs and rows.    |
| Ghost     | Neutral, danger         | An application's chrome, such as a toolbar.  |
| Text      | Neutral, danger         | A link-like action, underlined where needed. |

### In a toolbar

A button without a variant of its own takes its container's, such as ghost in a toolbar.

```tsx example=QuietToolbar

```

### Links

A button can go to a page instead of acting; [Link](link.md) says when a destination takes a button's shape.

```tsx example=ButtonLinks

```

### Sizes

Small, medium and large, the control heights of the [scale](../foundations/scale.md). A button without a size of its own takes its container's, such as small in a table cell.

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

### Labels

Start with a verb and say what will happen, and when the outcome is known, put it in the label.

```tsx example=SayWhatWillHappen

```

## Anatomy

```tsx anatomy=ButtonAnatomy

```

1. **Container** (`env-button`)
2. **Start icon** (`env-button > env-icon:first-child`, `startIcon`)
3. **Label** (`env-button::text`)
4. **End icon** (`env-button > env-icon:last-child`, `endIcon`)

Not shown: the spinner, a group's frame, and the end slot, quiet content after the label, such as a shortcut's keys, at the far end of a wide button, as the [search trigger](../patterns/search-trigger.md) shows it.

## Adapting to width

Labels wrap, and icon-only buttons keep their size. On touch screens every button grows to the size of a fingertip, and an icon button drawn smaller, such as a close button in a chip or a tab, reaches that size with the area it answers to.

```tsx example=NarrowActions widths="16 30"

```

```tsx example=FillSidebar caption="A button or a group can fill its container."

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

## In code

### Usage

A Button runs `onClick`, or with `href` it is a native link, through the application's router link from `LinkProvider`. `startIcon` and `endIcon` take decorative icons. Set `type="submit"` on the button that submits a form; envUI's buttons are `type="button"` otherwise.

```tsx source=CreateProject

```

#### Variants, tones and sizes

`variant` is `primary`, `secondary`, `outline`, `ghost` or `text`, and `tone` is `neutral`, `accent` or `danger`: `accent` on a primary button only, and `danger` on any but secondary. `underline` underlines a text button. `size` is `sm`, `md` or `lg`. Without a `variant` or a `size`, a button takes its container's, such as `ghost` in a Toolbar and `sm` in a table cell.

```tsx
<Button>Save</Button>
<Button variant="secondary">Cancel</Button>
<Button tone="danger">Delete project</Button>
<Button variant="text" href="/guide" underline>
  Read the guide
</Button>
<Button size="sm" variant="outline">
  Edit
</Button>
```

#### Icon buttons

IconButton takes its `icon` and an `aria-label`, which names it for assistive technology. Without a `variant` it takes its container's, and else `secondary`. With the Close icon it closes, dismisses or removes what it sits in.

```tsx source=Icons

```

#### Pending work

`pending` replaces the content with a spinner at the same size, sets `aria-busy` and ignores presses, on Button and IconButton.

```tsx source=PendingAction

```

#### Confirm in place

ConfirmButton runs `onConfirm` on the second press, while armed, and shows `confirmLabel` then. It stays armed for `armedDuration`, 4000 ms by default. With `icon` and an `aria-label` it is a round icon-only button at rest that grows when armed. Move focus on yourself when the confirmed action removes the button.

```tsx
<ConfirmButton confirmLabel="Remove Sam" onConfirm={() => remove('sam')}>
  Remove
</ConfirmButton>
```

#### Copy to the clipboard

CopyButton copies its `value`, a string or a function that returns one, also as a promise, and runs `onCopy` with it. `write` writes through a clipboard of the application's own. Without children it is icon-only, named by `aria-label`; `copyLabel`, `copiedLabel` and `failedLabel` set its words.

```tsx source=CopyValue

```

### Composition

ButtonGroup joins related buttons in a row or, with `orientation="vertical"`, a column in which every button is as wide as the group; name it with `aria-label`. `fullWidth` makes a button or a group fill its container. `end` holds quiet content at the far end, after the label, such as the Kbd of a shortcut, as the [search trigger](../patterns/search-trigger.md) does.

```tsx source=ConnectedButtons

```

The parts are the container, `env-button`, its icons, `env-button > env-icon:first-child` and `env-button > env-icon:last-child`, the spinner, `env-button-spinner`, the end slot, `env-button-end`, and a ButtonGroup's `env-button-group`.

### Customize

`--env-button-container`, `--env-button-content`, `--env-button-outline`, `--env-button-selected` and `--env-button-selected-content` set the colors of one Button or IconButton, through `style` or CSS. Its hover, focus and press then follow them, as state layers of its label color; with none set, it keeps its own colors.

```tsx
import type { CSSProperties } from 'react';
import { Button, Row } from '@envsemble/envui';

/** One button's own colors: its container and its label, which its state layers take. */
const forest = {
  '--env-button-container': '#0a5c42',
  '--env-button-content': '#ffffff',
} as CSSProperties;

export default function CustomColors() {
  return (
    <Row gap={2} wrap>
      <Button variant="primary" style={forest}>
        Start trial
      </Button>
      <Button variant="secondary">Not now</Button>
    </Row>
  );
}
```

Under a coarse pointer, an icon button drawn smaller than the touch size reaches the 2.75 rem touch size with its hit area when its container sets `--env-icon-button-hit-area: var(--env-control-height-touch)` on it or around it. Alert, Toast, Combobox chips, DocumentTabs and PanelDock's tabs set it on their own close buttons.

## Changelog

- **1.0.0**: `end`, a quiet slot at the far end for a shortcut's keys, in the button's content color, which the search trigger pattern uses. IconButton is the one icon-only button, and takes `href`: `Button iconOnly` is gone, and CloseButton is an IconButton with the Close cross, which the `v1-structure` codemod writes. `variant` is `primary`, `secondary`, `outline`, `ghost` or `text`, and `tone` is `neutral`, `accent` or `danger`: `important` is `variant="primary" tone="accent"`, `destructive` is `variant="primary" tone="danger"`, `outlined` is `outline` and `quiet` is `ghost`, which the `v1-props` codemod writes. Outline, ghost and text buttons take the danger tone. `fullWidth`. Buttons take the variant their container gives where they set none. The page is `button`, after the component, and Link has a page of its own. CopyButton takes `write`, a clipboard writer of the application's own. A Badge or DiffStat inside a button takes its colors through their custom properties, which the button sets.
- **0.6.0**: The `quiet` variant on Button, IconButton and ConfirmButton; CopyButton; ButtonGroup `fullWidth`.
- **0.5.0**: ConfirmButton `icon`, an icon-only form that grows when armed.
- **0.4.0**: `pending` on Button and IconButton; ConfirmButton.
- **0.1.0**: Button, IconButton and ButtonGroup.
