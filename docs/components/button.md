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
examples:
  CreateProject: overview
  Icons:
    role: overview
    caption: 'IconButton: an icon alone, with a name for assistive technology.'
  ConnectedButtons:
    role: overview
    caption: 'ButtonGroup: related buttons joined in a row or a column.'
  OnePrimaryAction:
    role: do
    caption: One primary button per group, at the end of its actions.
  SeveralPrimaryActions:
    role: dont
    caption: 'Several primary buttons: none of them stands out.'
  ExplainWhatIsMissing:
    role: do
    caption: Let people press it, then show what is missing.
  DisabledUntilValid:
    role: dont
    caption: A disabled button that doesn’t say why.
  SayWhatWillHappen: example
  DismissTip: example
  RemovePeople:
    role: example
    caption: Beside others like it, each button names what it removes.
  ButtonAnatomy: anatomy
  Variants: variants
  QuietToolbar: example
  ButtonLinks: example
  PendingAction: example
  ConfirmInPlace: example
  CopyValue: example
  NarrowActions: example
  FillSidebar:
    role: example
    caption: A button or a group can fill its container.
---

# Button

## Variants

```tsx figure=Variants

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

```tsx figure=QuietToolbar

```

### Links

A button can go to a page instead of acting; [Link](link.md) says when a destination takes a button's shape.

```tsx figure=ButtonLinks

```

### Sizes

Small, medium and large, the control heights of the [scale](../foundations/spacing.md). A button without a size of its own takes its container's, such as small in a table cell.

<!-- specimen: Sizes -->

## Anatomy

```tsx figure=ButtonAnatomy

```

1. **Container** (`env-button`)
2. **Start icon** (`env-button > env-icon:first-child`, `startIcon`)
3. **Label** (`env-button::text`)
4. **End icon** (`env-button > env-icon:last-child`, `endIcon`)

Not shown: the end slot, as on the [button that opens a CommandPalette](command-palette.md#opening-it-the-button-and-the-shortcut).

## Behaviour

### States

Hover, press, keyboard focus and disabled, for each variant.

- Keyboard focus draws a ring just outside the button.
- A text button's ring reaches a little past its label, which stays in line with the text around it.

<!-- specimen: InteractionStates -->

### Pending work

While its work runs, a spinner replaces the content at the same size, and presses do nothing.

```tsx figure=PendingAction motion

```

### Confirm in place

ConfirmButton arms on the first press and acts on the second.

- <kbd>Esc</kbd>, leaving it or 4 seconds disarm it.
- Its armed label is short, with no question mark: the verb, or the verb and object, "Remove Sam".

```tsx figure=ConfirmInPlace motion

```

### Copy to the clipboard

CopyButton copies a value and shows Copied, or Couldn’t copy, for about two seconds.

```tsx figure=CopyValue motion

```

### Adapting to width

Labels wrap, and icon-only buttons keep their size.

- On touch screens every button grows to the size of a fingertip.
- An icon button drawn smaller, such as a close button in a chip or a tab, reaches that size with the area it answers to.

```tsx figure=NarrowActions widths="30 16" sweep

```

```tsx figure=FillSidebar

```

## Rules

A button says what will happen, and only the main action of a group stands out.

```tsx figure=OnePrimaryAction

```

```tsx figure=SeveralPrimaryActions

```

```tsx figure=ExplainWhatIsMissing motion

```

```tsx figure=DisabledUntilValid

```

### Labels

Start with a verb and say what will happen, and when the outcome is known, put it in the label.

```tsx figure=SayWhatWillHappen motion

```

### Close and remove

An IconButton with the Close cross closes, dismisses or removes what it sits in.

- Name it Close, in the application's language.
- Where several sit together, name what each removes.

```tsx figure=DismissTip

```

```tsx figure=RemovePeople

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

## Compose

### Usage

```tsx
<Button onClick={save}>Save</Button>
<Button variant="secondary">Cancel</Button>
<Button tone="danger">Delete project</Button>
<Button href="/projects">Open projects</Button>
<Button startIcon={<Add />}>Create project</Button>
<IconButton icon={<Settings />} aria-label="Project settings" />
<Button pending={saving} onClick={save}>Save changes</Button>
```

A button without a `variant` or a `size` takes its container's, such as `ghost` in a Toolbar and `sm` in a table cell; an IconButton is otherwise `secondary`. With `href` it renders the router link from `LinkProvider`.

#### Confirm and copy

```tsx
<ConfirmButton confirmLabel="Remove Sam" onConfirm={() => remove('sam')}>
  Remove
</ConfirmButton>
<CopyButton value={shareLink} aria-label="Copy link" />
```

ConfirmButton with `icon` and an `aria-label` is icon-only until armed. When the confirmed action removes the button, move focus to what takes its place, as the ConfirmInPlace example does. CopyButton's `write` copies through a clipboard of the application's own.

### Composition

```tsx
<ButtonGroup aria-label="Project actions">
  <Button>Open</Button>
  <Button>Edit</Button>
</ButtonGroup>
```

`orientation="vertical"` stacks a group, every button as wide as it; `fullWidth` makes a button or a group fill its container. `end` holds quiet content after the label, at the far end of a wide button, such as the Kbd of a shortcut, as the [button that opens a CommandPalette](command-palette.md#opening-it-the-button-and-the-shortcut) does.

The label's parts are flex items the button's gap spaces apart, such as its words and a Badge. Words with an AnimatedNumber or an inline element, such as `<strong>`, in their line stay one run of text, `env-button-text`, spaced by their own word spaces.

### Customize

`--env-button-container`, `--env-button-content`, `--env-button-outline`, `--env-button-selected` and `--env-button-selected-content` color one Button or IconButton, through `style` or CSS; hover, focus and press follow them.

```tsx
<Button
  style={{ '--env-button-container': '#0a5c42', '--env-button-content': '#fff' } as CSSProperties}
>
  Start trial
</Button>
```

Parts the anatomy doesn't show: the spinner, `env-button-spinner`, the end slot, `env-button-end`, and the group, `env-button-group`. A container that sets `--env-icon-button-hit-area: var(--env-control-height-touch)` gives its smaller icon buttons the touch size under a coarse pointer, as Alert and Toast do for their close buttons.

## Changelog

- **1.0.0-prerelease.5**: An outline button is an edge with no fill at rest, the same on the page, a pane, a card or a popup; hover and press lay a state layer over the surface beneath it.
- **1.0.0**: `end`, a quiet slot at the far end for a shortcut's keys, in the button's content color, which the search trigger pattern uses. IconButton is the one icon-only button, and takes `href`: `Button iconOnly` is gone, and CloseButton is an IconButton with the Close cross, which the `v1-structure` codemod writes. `variant` is `primary`, `secondary`, `outline`, `ghost` or `text`, and `tone` is `neutral`, `accent` or `danger`: `important` is `variant="primary" tone="accent"`, `destructive` is `variant="primary" tone="danger"`, `outlined` is `outline` and `quiet` is `ghost`, which the `v1-props` codemod writes. Outline, ghost and text buttons take the danger tone. `fullWidth`. Buttons take the variant their container gives where they set none. The page is `button`, after the component, and Link has a page of its own. CopyButton takes `write`, a clipboard writer of the application's own. A Badge or DiffStat inside a button takes its colors through their custom properties, which the button sets.
- **0.6.0**: The `quiet` variant on Button, IconButton and ConfirmButton; CopyButton; ButtonGroup `fullWidth`.
- **0.5.0**: ConfirmButton `icon`, an icon-only form that grows when armed.
- **0.4.0**: `pending` on Button and IconButton; ConfirmButton.
- **0.1.0**: Button, IconButton and ButtonGroup.
