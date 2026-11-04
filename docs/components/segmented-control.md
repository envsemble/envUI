---
title: SegmentedControl
summary: One choice among a few views or filters of the same content.
status: stable
since: 1.0.0
category: Forms & selection
aliases:
  - segmented button
  - segmented buttons
  - button toggle
  - toggle group
  - toggle button group
  - content switcher
  - view switcher
  - filter switcher
  - pill tabs
useWhen:
  - Two to five views or filters of the same content, such as Open and Done
  - How a toolbar lays out content, such as List and Board
  - A choice between two scopes in a narrow container, such as a sidebar
avoidWhen:
  - text: Each option has a panel of its own, such as the sections of a settings page.
    use: Tabs
  - text: A choice in a form that is saved with it, or options that need explaining.
    use: RadioGroup
  - text: More than five options, or options with long names.
    use: Select
  - text: A setting that turns on or off.
    use: Switch
  - text: Actions, such as Save and Share, rather than a choice that stays selected.
    use: ButtonGroup
components:
  - SegmentedControl
examples:
  WorkItems: overview
  SmallToolbar:
    role: example
    caption: Small, in a toolbar beside a small button.
  SegmentedControlAnatomy: anatomy
  FullWidthScope: example
---

# SegmentedControl

## Variants

### Sizes

Small, medium and large, the control heights of the [scale](../foundations/spacing.md). Without a size of its own it takes its container's.

<!-- specimen: Sizes -->

```tsx figure=SmallToolbar

```

## Anatomy

```tsx figure=SegmentedControlAnatomy

```

1. **Track** (`env-segmented-control`)
2. **Thumb** (`env-segmented-control-item[data-checked]`)
3. **Segment** (`env-segmented-control-item[data-unchecked]`)
4. **Icon** (`env-segmented-control-item[data-unchecked] > env-icon`, `icon`)
5. **Label** (`env-segmented-control-item-label`, `label`)
6. **Count** (`env-segmented-control-item-count`, `count`)

## Behaviour

### States

Each option can show an icon and a count.

- One option can be disabled, which the arrow keys skip, or the whole control.
- The chosen option rises out of the track on a raised thumb.

<!-- specimen: States -->

### Adapting to width

The control is as wide as its options, or fills its container and splits it evenly.

- A label too long for its share ends with an ellipsis and shows whole in a tooltip.
- In a container too narrow for its options, a control as wide as its options scrolls.

```tsx figure=FullWidthScope widths="26 14" motion

```

## Rules

The option used most comes first, and each is named in a word or two.

### Order

Put the most used option first, and start on it.

### Labels

Name each option with a word or two for its view.

- Name the whole control after what it switches, for assistive technology.

## Accessibility

### Keyboard

| Key                                             | Action                                                      |
| ----------------------------------------------- | ----------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves into the control, to the chosen option, and out.      |
| Arrow keys                                      | Choose the next or previous option, skipping disabled ones. |
| <kbd>Esc</kbd> on a cut label                   | Closes its tooltip.                                         |

### envUI provides

- A `radiogroup` with each segment a `radio`, one tab stop and the arrow keys.
- Each option named by its label and count, such as Open 12.
- The whole label as the name when `fullWidth` cuts it short.

### You provide

- An `aria-label` that names what the control switches.
- The content that follows the choice.

## Compose

### Usage

```tsx
<SegmentedControl
  aria-label="Work items"
  value={status}
  onValueChange={setStatus}
  items={[
    { value: 'open', label: 'Open', count: 12 },
    { value: 'done', label: 'Done', count: 4 },
  ]}
/>
```

Leave it uncontrolled, starting at `defaultValue`, the first item by default, or control it with `value` and `onValueChange`. `items` are two to five `SegmentedControlItem`s in the order they show, each with its `value`, a short `label`, and optionally a `count`, read as part of its name, a decorative `icon` and `disabled`. `aria-label` names the control, which has no visible label; `disabled` turns off the whole control.

#### Size and width

`size` is `sm`, `md` or `lg`; without it the control takes its container's, `md` unless the container sets another. Without `fullWidth` it is as wide as its items and scrolls in a container too narrow for them; with `fullWidth` it fills the width, split evenly, and a label too long for its share shows whole in a tooltip, or wraps on touch screens.

### Composition

The track, `env-segmented-control`, carries `data-size` and `data-full-width`; each segment, `env-segmented-control-item`, `data-checked` while chosen, when it is the thumb, and `data-disabled`.

## Changelog

- **1.0.0-prerelease.6**: SegmentedControl is segments in a recessed track, the chosen one raised on a thumb with a soft shadow, rather than Material's connected outlined segments: no outline, no lines between the segments and no check, and a chosen segment shows its icon. Tabs keep their indicator under the selected tab, so the two still read differently. The check, `env-segmented-control-item-indicator`, is gone. `--env-segmented-control-container` sets the track, the neutral fill by default, `--env-segmented-control-outline` an outline around it, none by default, and `--env-segmented-control-selected` the thumb.
- **1.0.0-prerelease.5**: It can be uncontrolled, with `defaultValue`.
- **1.0.0-prerelease.2**: SegmentedControl looks like Material's segmented buttons: connected segments in one outline, the chosen one in the selected fill, `--env-color-bg-selected`, with a check, `env-segmented-control-item-check`, in place of its icon, so it reads differently from Tabs. `--env-segmented-control-outline` sets the outline. The API stays.
- **1.0.0**: `options` is `items`, and `SegmentedControlOption` is `SegmentedControlItem`. The segments' classes are `env-segmented-control-item`, `-item-label` and `-item-count`. An unchosen segment's count keeps 4.5:1 contrast. SegmentedControl takes `ref`, `style`, `id` and other attributes of its rail, and its page is under Forms & selection.
