---
title: SegmentedControl
summary: One choice among a few items, as connected outlined segments, such as views or filters of the same content.
status: stable
since: 0.5.0
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
---

# SegmentedControl

## Overview

```tsx example=WorkItems

```

### States

Each option can show an icon and a count. One option can be disabled, which the arrow keys skip, or the whole control.

<!-- specimen: States -->

## Variants

### Sizes

Small, medium and large, the control heights of the [scale](../foundations/scale.md). Without a size of its own, the control takes its container's.

<!-- specimen: Sizes -->

```tsx example=SmallToolbar caption="Small, in a toolbar beside a small button."

```

## When to use

### Order

Put the most used option first, and start on it.

### Labels

Name each option with a word or two for its view, and name the whole control after what it switches, for assistive technology.

## Anatomy

```tsx anatomy=SegmentedControlAnatomy

```

1. **Outline** (`env-segmented-control`)
2. **Segment** (`env-segmented-control-item`)
3. **Check** (`env-segmented-control-item-check`)
4. **Icon** (`env-segmented-control-item > env-icon`, `icon`)
5. **Label** (`env-segmented-control-item-label`, `label`)
6. **Count** (`env-segmented-control-item-count`, `count`)

### Colors

One control can take colors of its own: the fill behind its options, its outline, its labels, and the chosen option's fill and label. Its hover, focus and press then follow them; with none set, it keeps its own colors.

## Adapting to width

The control is as wide as its options, or fills its container and splits it evenly; a label too long for its share ends with an ellipsis and shows whole in a tooltip.

```tsx example=FullWidthScope widths="14 26"

```

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

## In code

### Usage

SegmentedControl takes `items`, two to five `SegmentedControlItem`s in the order they show, each with its `value` and a short `label`, a `count`, read as part of its name, such as Open 12, a decorative `icon`, and `disabled`, which the arrow keys skip. It is always controlled: set `value` and update it from `onValueChange`. `aria-label` names it, since it has no visible label, and `disabled` turns off the whole control.

```tsx source=WorkItems

```

#### Size and width

`size` is `sm`, `md` or `lg`, the control heights; without it the control takes its container's, `md` unless the container sets another. Without `fullWidth` it is as wide as its items and scrolls in a container too narrow for them; with `fullWidth` it fills the width, split evenly, and a label too long for its share shows whole in a tooltip, or wraps on touch screens.

```tsx source=SmallToolbar

```

### Composition

The parts are the outline, `env-segmented-control`, with `data-size` and `data-full-width`; each segment, `env-segmented-control-item`, with `data-checked` while chosen and `data-disabled`; the check on the chosen segment, in place of its icon, `env-segmented-control-item-check`; and a segment's label, `env-segmented-control-item-label`, and count, `env-segmented-control-item-count`.

### Customize

`--env-segmented-control-container`, `--env-segmented-control-content`, `--env-segmented-control-outline`, `--env-segmented-control-selected` and `--env-segmented-control-selected-content` set the colors of one SegmentedControl, through `style` or CSS. Its hover, focus and press then follow them, as state layers; with none set, it keeps its own colors.

## Changelog

- **1.0.0-prerelease.2**: SegmentedControl looks like Material's segmented buttons: connected segments in one outline, the chosen one in the selected fill, `--env-color-bg-selected`, with a check, `env-segmented-control-item-check`, in place of its icon, so it reads differently from Tabs. `--env-segmented-control-outline` sets the outline. The API stays.
- **1.0.0**: `options` is `items`, and `SegmentedControlOption` is `SegmentedControlItem`. The segments' classes are `env-segmented-control-item`, `-item-label` and `-item-count`. An unchosen segment's count keeps 4.5:1 contrast. SegmentedControl takes `ref`, `style`, `id` and other attributes of its rail, and its page is under Forms & selection.
- **0.7.0**: The chosen segment takes the soft blue primary in the dark theme, as primary buttons do.
- **0.6.0**: `fullWidth`: the rail fills its container and splits it evenly; a label too long for its share ends with an ellipsis and shows whole in a tooltip, or wraps on touch screens.
- **0.5.0**: SegmentedControl, with counts, icons and the compact size.
