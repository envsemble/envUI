---
title: Progressive disclosure
summary: Show what most people need first, and keep the rest one step away, in the place and at the depth that fits it.
status: beta
since: 1.0.0
intent: Find and navigate
aliases:
  - progressive disclosure
  - advanced options
  - show more
  - more actions
  - overflow menu
  - details panel
  - accordion
  - help text
useWhen:
  - A page has options, details or actions that most people don't need most of the time.
  - A term or a value needs an explanation that would clutter the page if always shown.
avoidWhen:
  - text: Switching between views of the same content.
    use: Tabs
  - text: Moving between the places of the application.
    see: navigation
  - text: Information people need to complete a task, such as a required field or an error.
    see: forms
composes:
  - Disclosure
  - Tabs
  - Popover
  - HoverCard
  - Tooltip
  - Sheet
  - Dialog
  - Menu
  - Button
  - IconButton
  - Link
  - List
  - Badge
  - DescriptionList
  - Select
  - Checkbox
  - TextField
  - Column
  - Row
  - Text
---

# Progressive disclosure

## Overview

Progressive disclosure keeps a page about its main task while the rest stays one step away: advanced options behind a [Disclosure](../components/disclosure.md), the long tail of a list behind Show all, details in a sheet, rare actions in a menu. What a task needs is never hidden.

```tsx example=AdvancedOptions

```

### A field with an error

Open the Disclosure that holds an invalid field, so the field and its message show, and move focus to it.

## Variants

| Depth   | Component                                                   | Holds                                                |
| ------- | ----------------------------------------------------------- | ---------------------------------------------------- |
| Inline  | Disclosure                                                  | Optional settings or guidance below a summary        |
| Inline  | A Button that shows more of a [List](../components/list.md) | The rest of a long list                              |
| Inline  | [Tabs](../components/tabs.md)                               | Views of one thing, one at a time                    |
| Overlay | [Tooltip](../components/tooltip.md)                         | The name of an icon-only control                     |
| Overlay | [HoverCard](../components/hover-card.md)                    | A preview of what a link leads to, for reading only  |
| Overlay | [Popover](../components/popover.md)                         | An explanation or a small form, opened on press      |
| Overlay | [Menu](../components/menu.md)                               | Actions used less often                              |
| Overlay | [Sheet](../components/sheet.md)                             | The details of an item, beside the list it came from |
| Overlay | [Dialog](../components/dialog.md)                           | A focused task that blocks the page until it ends    |
| Page    | A page of its own, through a [Link](../components/link.md)  | Everything about one thing                           |

### Show all

The button stays after the list and says what a press does, "Show all 12", then "Show fewer"; `aria-expanded` says the same.

```tsx example=ShowMore

```

### Details in a sheet

The list stays in place under the Sheet, so people continue from the row they opened.

```tsx example=DetailsInSheet

```

### Overflow actions

Share and Edit stay visible; the rest wait in a More actions menu, a destructive item last.

```tsx example=OverflowActions

```

### Explain a term

A help button opens a Popover with a short definition and a link; a Tooltip only repeats an icon-only control's name.

```tsx example=ExplainATerm

```

## When to use

```tsx do=OneLevel caption="One level: every optional setting behind one summary."

```

```tsx dont=NestedDisclosures caption="A disclosure in a disclosure: the last setting is two presses away, and easy to miss."

```

- One step away at most: don't put a menu in a popover in a sheet either.
- Nothing to act on in a Tooltip or a HoverCard; what a HoverCard shows must be reachable without hover, as it never opens on touch.
- Several Disclosures with a shared `name` stand in for an accordion; put a heading above the stack, as their summaries aren't headings.

### Content

- Label a Disclosure with what it holds, "Advanced options".
- Say how much more there is: "Show all 12", not "Show more".
- Name an overflow menu "More actions", or "More actions for Launch brief" in a row.

## Anatomy

```tsx anatomy=DisclosureLayers

```

1. **Visible layer** (`env-text-field`)
2. **Disclosure** (`env-disclosure summary`, `title`)
3. **Disclosed layer** (`env-disclosure-panel`)
4. **More actions** (`env-button ~ env-button`)

## Accessibility

A Disclosure's summary is a button; <kbd>Enter</kbd> or <kbd>Space</kbd> opens it, and focus stays. Show all keeps focus as the list grows. A Sheet, Menu or Popover moves focus in as it opens and back to its trigger as it closes; a Tooltip and a HoverCard never take focus.

### envUI provides

- Disclosure on native `details` and `summary`, whose closed content is hidden from assistive technology.
- Focus moved in, trapped while modal and returned by Sheet and Dialog; the menu button pattern for Menu.
- Tooltips and HoverCards that open on keyboard focus as on hover.

### You provide

- A name for every icon-only trigger, and `aria-expanded` and `aria-controls` on a Show all button.
- Opening a Disclosure that holds an invalid field.
- The details of a HoverCard somewhere people reach without hover.

## Changelog

- **1.0.0**: The page is on the figure template.
