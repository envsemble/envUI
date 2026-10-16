---
title: SegmentedControl
summary: One choice among a few options on a pill rail, such as views or filters of the same content.
status: beta
since: 0.5.0
category: Actions
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

A segmented control switches between a few views or filters of the same content, and the choice applies at once. Its options sit side by side on a pill rail, and the chosen one takes the primary colors. SegmentedControl is built on Base UI's radio group: it is a radio group with one tab stop, and the arrow keys move between the options and choose them.

```tsx example=WorkItems

```

## Anatomy

1. **Rail**: a pill in the translucent fill, like the tab rail, with 0.25 rem padding around the options.
2. **Segment**: one option, a pill button 0.25 rem from the next. The chosen segment takes the primary action colors; the others are text in the muted color.
3. **Icon** (optional, `icon`): decorative, at the control icon size of 1 rem, 0.5 rem before the label.
4. **Label** (`label`): the option's short name, in 0.875 rem text on one line.
5. **Count** (optional, `count`): a small number after the label, in figures of equal width at 80% opacity, such as the items in a view. It is read as part of the option's name.
6. **Tooltip** (`fullWidth`): shows a label that is cut short whole, on hover and keyboard focus.

## Variants and sizes

| Size | Use for                                                                                 |
| ---- | --------------------------------------------------------------------------------------- |
| `sm` | Toolbars and other dense surfaces, beside small fields and buttons: a 2 rem rail.       |
| `md` | A control on the page or above content, beside buttons: a 2.5 rem rail, as a button is. |
| `lg` | Beside large controls: a 3 rem rail.                                                    |

<!-- specimen: Sizes -->

- The rail is as tall as every control of its size in the app's [scale](../foundations/scale.md); without a size it takes its container's control height, `md` by default. Segments fill it inside a 0.25 rem padding, with 1 rem inline padding, 0.75 rem at `sm`. On touch screens the rail grows to 2.75 rem, as every control of its row does, and each segment, at least as wide, takes presses across the rail's whole height.
- Without `fullWidth` the rail is as wide as its options, up to the width of its container; options that don't fit scroll sideways inside the rail.
- With `fullWidth` the rail fills its container and splits it evenly between the options. A label too long for its share ends with an ellipsis and shows whole in a tooltip; on touch screens, where tooltips don't show, it wraps onto more lines instead and the rail grows to hold it. The option's accessible name stays whole either way.

## States and behaviour

- **Choosing**: pressing a segment, or moving to it with the arrow keys, chooses it and calls `onValueChange` with its `value`. The control is always controlled: `value` must change for the chosen segment to change.
- **Hover, pressed and focus**: an unchosen segment takes a state layer and the primary text color under the pointer and a stronger layer while pressed; the chosen one takes the primary action's hover and pressed shades, as [colors and themes](../foundations/colors.md) describes. Keyboard focus shows the shared focus ring around the segment. Without a reduced-motion preference a pressed segment settles slightly, and colors ease between states.
- **Disabled**: `disabled` on an option dims it with the shared disabled opacity, and the arrow keys skip it; `disabled` on the control dims every option, and it can't be focused or changed.
- **Full width**: the tooltip of a cut label opens after 400 ms of hover, at once on keyboard focus, and closes with <kbd>Esc</kbd>. A label with room shows no tooltip.
- **Themes**: the chosen segment takes the primary colors, blue in both themes, so it stays clear on the page, panes and rows.

## Content guidelines

- Name options with one or two words in sentence case that name the view or filter: "Open", "Blocked", "Done"; "List", "Board".
- Keep labels parallel and about the same length, so the segments balance.
- Use counts for what each view holds, such as the items in it, and keep them current.
- Name the control with `aria-label` after what it switches: "Work items", "Layout".
- Use icons in all options or in none.

## Do and don't

### Do

- Use two to five options that all fit on one line, and show the content of the chosen one right away.
- Put the most used option first, and start on it.
- Give the control the size of the buttons and fields beside it, such as `sm` in a toolbar.
- Use `fullWidth` in a narrow container, such as a sidebar, so the options share it evenly.

### Don't

- Don't use a segmented control for actions; use [Button](../components/button.md) or a ButtonGroup.
- Don't use it in a form for a choice that is saved later; use [Radio](../components/radio.md).
- Don't use it for content with a panel per option; use [Tabs](../components/tabs.md).
- Don't put more than five options on the rail, or labels long enough to scroll; use [Select](../components/select.md).

## Accessibility

### Keyboard

| Key                                             | Action                                                                                                          |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves focus into the control, to the chosen option, and on out of it; the control is one tab stop.              |
| <kbd>→</kbd> or <kbd>↓</kbd>                    | Moves to the next option and chooses it, skipping disabled options and wrapping from the last to the first.     |
| <kbd>←</kbd> or <kbd>↑</kbd>                    | Moves to the previous option and chooses it, skipping disabled options and wrapping from the first to the last. |
| <kbd>Space</kbd>                                | Chooses the focused option.                                                                                     |
| <kbd>Esc</kbd> on a cut label's option          | Closes its tooltip.                                                                                             |

### envUI provides

- The radio group pattern: a `radiogroup` named by `aria-label`, with each segment a `radio` that reports `aria-checked`, one tab stop and the arrow keys.
- Each option named by its label and count, such as "Open 12", with its icon hidden from assistive technology.
- The whole label as the option's name when `fullWidth` cuts it short, and in a tooltip on hover and keyboard focus.
- The shared focus ring, disabled options that the keyboard skips, and a 2.75 rem rail on coarse pointers.

### You provide

- An `aria-label` that names what the control switches.
- The content that follows the choice, and its update when `onValueChange` reports a new value.
- Counts that stay current, or none.

## Examples

### Small, in a toolbar

`size="sm"` makes the rail as tall as the small button beside it. Timeline is disabled, and the arrow keys skip it.

```tsx example=SmallToolbar

```

### Fill a sidebar

With `fullWidth` the control fills a sidebar and splits it between the options. Labels too long for their half end with an ellipsis and show whole in a tooltip on hover and keyboard focus.

```tsx example=FillSidebar

```

## Changelog

- **0.7.0**: The chosen segment takes the soft blue primary in the dark theme, as primary buttons do.
- **0.6.0**: `fullWidth`: the rail fills its container and splits it evenly; a label too long for its share ends with an ellipsis and shows whole in a tooltip, or wraps on touch screens.
- **0.5.0**: SegmentedControl, with counts, icons and the compact size.
