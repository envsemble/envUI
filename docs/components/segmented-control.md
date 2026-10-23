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
  - People switch between two to five views or filters of the same content, such as Open, Blocked and Done items, and the choice applies at once.
  - A toolbar switches how content is laid out, such as List and Board (`size="sm"`).
  - A narrow container, such as a sidebar, holds a choice between two scopes (`fullWidth`).
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
related:
  - tabs
  - radio
  - select
  - button
  - switch
  - accessibility
components:
  - SegmentedControl
---

# SegmentedControl

## Overview

A segmented control switches between a few views or filters of the same content, and the choice applies at once. After Material's segmented buttons, it is connected segments in one outline, the chosen one in the selected fill with a check before its label; it picks a value, where [Tabs](tabs.md), text tabs with an indicator, switch panels.

```tsx example=WorkItems

```

### States

Each option can show an icon and a count. `disabled` dims one option, which the arrow keys skip, or the whole control.

<!-- specimen: States -->

## Variants

### Sizes

`sm`, `md` and `lg`, the control heights of the [scale](../foundations/scale.md). Without a `size`, the control takes its container's.

<!-- specimen: Sizes -->

```tsx example=SmallToolbar caption="sm in a toolbar, beside a small button."

```

## When to use

```tsx do=MatchingSize caption="The size of the controls beside it."

```

```tsx dont=MismatchedSize caption="A larger control than its neighbours, so the row doesn't line up."

```

```tsx do=IconsOnAll caption="Icons on every option, or on none."

```

```tsx dont=IconsOnSome caption="An icon on one option, which then looks more important."

```

- Put the most used option first, and start on it.

### Labels

Name options with a word or two that name the view, and name the control with `aria-label`.

```tsx do=ParallelLabels caption="Short labels of about the same length."

```

```tsx dont=UnevenLabels caption="One long label that unbalances the control."

```

## Anatomy

```tsx anatomy=SegmentedControlAnatomy

```

1. **Outline** (`env-segmented-control`)
2. **Segment** (`env-segmented-control-item`)
3. **Check** (`env-segmented-control-item-check`), on the chosen segment, in place of its icon
4. **Icon** (`env-segmented-control-item > env-icon`, `icon`)
5. **Label** (`env-segmented-control-item-label`, `label`)
6. **Count** (`env-segmented-control-item-count`, `count`)

### Colors

`--env-segmented-control-container`, `--env-segmented-control-content`, `--env-segmented-control-outline`, `--env-segmented-control-selected` and `--env-segmented-control-selected-content` set the colors of one SegmentedControl, through `style` or CSS. Its hover, focus and press then follow them, as state layers; with none set, it keeps its own colors. [Customize colors](../customizing-colors.md) describes the roles.

## Adapting to width

The control is as wide as its options. With `fullWidth` it fills its container and splits it evenly; a label too long for its share ends with an ellipsis and shows whole in a tooltip.

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

## Changelog

- **1.0.0-prerelease.2**: SegmentedControl looks like Material's segmented buttons: connected segments in one outline, the chosen one in the selected fill, `--env-color-bg-selected`, with a check, `env-segmented-control-item-check`, in place of its icon, so it reads differently from Tabs. `--env-segmented-control-outline` sets the outline. The API stays.
- **1.0.0**: `options` is `items`, and `SegmentedControlOption` is `SegmentedControlItem`. The segments' classes are `env-segmented-control-item`, `-item-label` and `-item-count`. An unchosen segment's count keeps 4.5:1 contrast. SegmentedControl takes `ref`, `style`, `id` and other attributes of its rail, and its page is under Forms & selection.
- **0.7.0**: The chosen segment takes the soft blue primary in the dark theme, as primary buttons do.
- **0.6.0**: `fullWidth`: the rail fills its container and splits it evenly; a label too long for its share ends with an ellipsis and shows whole in a tooltip, or wraps on touch screens.
- **0.5.0**: SegmentedControl, with counts, icons and the compact size.
