---
title: Button
summary: Starts an action, or goes to a destination as a link.
status: stable
since: 1.0.0
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
  Icons: example
  ConnectedButtons: example
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
  PrimaryTones: example
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
6. **Primary, accent**

| Variant         | Tones                        | Use for                                                                   |
| --------------- | ---------------------------- | ------------------------------------------------------------------------- |
| Primary         | Neutral (brand blue), danger | The main action of a group. One per group.                                |
| Secondary       | Neutral                      | Other actions.                                                            |
| Outline         | Neutral, danger              | Other actions on panes, dialogs and rows.                                 |
| Ghost           | Neutral, danger              | An application's chrome, such as a toolbar.                               |
| Text            | Neutral (link blue), danger  | A link-like action, underlined where needed.                              |
| Primary, accent | Accent                       | The main action, where it must stand apart from the brand blue around it. |

### Tones

Only the main action and links are blue.

- The neutral tone keeps the variant's own color: a brand blue fill on a primary, link blue on a text button, and the text color on the others.
- The danger tone colors the label, or a primary's fill. On the quiet variants it tints hover and press too.

### Primary tones

A danger or accent primary is never louder than the main one beside it.

- Every primary takes the same grade of its tone.
- In light, that is a saturated fill with white text; in dark, a soft fill with dark text.

```tsx figure=PrimaryTones

```

### In a toolbar

A button without a variant of its own takes its container's, such as ghost in a toolbar.

```tsx figure=QuietToolbar

```

### Links

A button can go to a page instead of acting. [Link](link.md) says when a destination takes a button's shape.

```tsx figure=ButtonLinks

```

### Icons

A button takes an icon at its start or its end. An IconButton shows an icon alone, with a name for assistive technology.

```tsx figure=Icons

```

### Groups

A ButtonGroup joins related buttons in a row or a column.

- It joins buttons of one variant, or filled primary and secondary buttons, such as a split button.
- A split button's menu half takes the main half's variant and tone, and shows a chevron. The hairline between the halves then reads as one action with its options, not two actions.
- A group that mixes an outline, ghost or text button with another variant keeps them apart as whole pills, such as an outline Back beside a primary Next.

```tsx figure=ConnectedButtons

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

## Behaviour

### States

Hover, press, keyboard focus and disabled, for each variant.

- Keyboard focus draws a ring just outside the button. On an outline button the ring lies on its edge, which takes the ring's color; in dark, a primary button's ring takes the text color, apart from its soft blue fill.
- A text button's ring reaches a little past its label, which stays in line with the text around it.

<!-- specimen: InteractionStates -->

### Pending work

While its work runs, a spinner turns over the button and presses do nothing.

- The label and icons stay in place but transparent, so the button keeps its width and its name.

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

A label stays on one line and its button keeps its width, so let a row of buttons wrap: whole buttons move to the next line. Icon-only buttons keep their size.

- A button that fills its container and the buttons of a ButtonGroup can't move, so their labels wrap instead.
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

Start with a verb that says what will happen. When the outcome is known, put it in the label.

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
<Button startIcon={<IconAdd />}>Create project</Button>
<Button pending={saving} onClick={save}>Save changes</Button>
```

A button without a `variant` or a `size` takes its container's, such as `ghost` in a Toolbar and `sm` in a table cell. With `href` it renders the router link from `LinkProvider`.

#### Icon only

```tsx
import { IconButton } from '@envsemble/envui';

<IconButton icon={<IconSettings />} aria-label="Project settings" />;
```

An IconButton takes its container's variant too, and is otherwise `secondary`.

#### Confirm and copy

```tsx
import { ConfirmButton, CopyButton } from '@envsemble/envui';

<ConfirmButton confirmLabel="Remove Sam" onConfirm={() => remove('sam')}>
  Remove
</ConfirmButton>
<CopyButton value={shareLink} aria-label="Copy link" />
```

ConfirmButton with `icon` and an `aria-label` is icon-only until armed. When the confirmed action removes the button, move focus to what takes its place, as the ConfirmInPlace example does. CopyButton's `write` copies through a clipboard of the application's own.

### Composition

```tsx
import { ButtonGroup } from '@envsemble/envui';

<ButtonGroup aria-label="Project actions">
  <Button>Open</Button>
  <Button>Edit</Button>
</ButtonGroup>;
```

`orientation="vertical"` stacks a group, every button as wide as it; `fullWidth` makes a button or a group fill its container. `end` holds quiet content after the label, at the far end of a wide button, such as the Kbd of a shortcut, as the [button that opens a CommandPalette](command-palette.md#opening-it-the-button-and-the-shortcut) does.

The label's parts are flex items the button's gap spaces apart, such as its words and a Badge. Words with an AnimatedNumber or an inline element, such as `<strong>`, in their line stay one run of text, `env-button-text`, spaced by their own word spaces.

### Customize

Parts the anatomy doesn't show: the spinner, `env-button-spinner`, the end slot, `env-button-end`, and the group, `env-button-group`. A container that sets `--env-icon-button-hit-area: var(--env-control-height-touch)` gives its smaller icon buttons the touch size under a coarse pointer, as Alert and Toast do for their close buttons.

A wrapper of your own that passes a variant and a tone on types them as Button does: `ButtonEmphasisProps`, the designed pairs of `variant` and `tone`, `IconButtonEmphasisProps`, IconButton's, and `ButtonAppearanceProps`, the pairs with `size`, `fullWidth` and `underline`.

## Changelog

- **1.0.0**: `end`, a quiet slot at the far end for a shortcut's keys, in the button's content color, which the search trigger pattern uses. IconButton is the one icon-only button, and takes `href`: `Button iconOnly` is gone, and CloseButton is an IconButton with the Close cross. `variant` is `primary`, `secondary`, `outline`, `ghost` or `text`, and `tone` is `neutral`, `accent` or `danger`: `important` is `variant="primary" tone="accent"`, `destructive` is `variant="primary" tone="danger"`, `outlined` is `outline` and `quiet` is `ghost`. Outline, ghost and text buttons take the danger tone. `fullWidth`. Buttons take the variant their container gives where they set none. The page is `button`, after the component, and Link has a page of its own. CopyButton takes `write`, a clipboard writer of the application's own. A Badge or DiffStat inside a button takes its colors through their custom properties, which the button sets.
- **1.0.0-prerelease.6**: A text button's press reads apart from its hover: a danger one darkens a step under the pointer and another while pressed, as the link blue does, and a pressed link blue is a step deeper in light.
- **1.0.0-prerelease.6**: In dark, primary, accent and danger primary buttons share one soft lightness and strength, the accent a soft lilac and danger a soft coral red; each lightens a step on hover and, pressed, deepens a small step below rest rather than turning nearly white.
- **1.0.0-prerelease.6**: An outline button's focus ring lies on its edge, which takes the ring's color, rather than around a gray or red edge; in dark, a primary button's ring takes the text color.
- **1.0.0-prerelease.6**: A label keeps to one line and its button to its width, so a row short of room wraps whole buttons, not their words; a `fullWidth` button and a ButtonGroup's still wrap their labels. A vertical group of outline buttons shares straight edges, round only at the column's outer corners.
- **1.0.0-prerelease.6**: An outline button's label and icon take the text color, `--env-color-fg-default`, rather than the brand blue, so beside a primary button it reads as the other choice; a text button keeps the link blue. Ghost, outline and text icon buttons in the danger tone lay a faint tint of the danger color on hover and press, from `--env-color-bg-danger-subtle-hover`, rather than the neutral grey.
- **1.0.0-prerelease.6**: Every pending button, an icon button's included, shows a spinner of an icon's size centred over its transparent label, in the label's color, and keeps its width and name.
- **1.0.0-prerelease.6**: In light, a danger primary darkens on hover and press as the default and accent primaries do; in dark, the soft primaries deepen by a clearer, even step.
- **1.0.0-prerelease.6**: A disabled button no longer fades as a whole: its label and icon take `--env-color-fg-disabled`, a filled one half the secondary's neutral fill and an outline one the muted edge, so it stays readable, also in dark.
- **1.0.0-prerelease.6**: An accent primary is a pill like every other button, rather than having square corners.
- **1.0.0-prerelease.6**: A ButtonGroup's buttons meet with a hairline between them and small inner corners, so the group reads as one control with pill ends; outline buttons in a group share their edge. A group that mixes an outline, ghost or text button with another variant keeps its buttons apart as whole pills.
- **1.0.0-prerelease.5**: An outline button is an edge with no fill at rest, the same on the page, a pane, a card or a popup; hover and press lay a state layer over the surface beneath it.
