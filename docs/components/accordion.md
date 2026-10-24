---
title: Accordion
summary: A list of sections separated by full-width hairlines, each a heading with a plus or minus that shows and hides its panel.
status: beta
since: 1.0.0
category: Content & guidance
aliases:
  - accordion
  - collapsible sections
  - expandable list
  - frequently asked questions
  - FAQ
  - expansion panels
useWhen:
  - Questions or topics opened one or a few at a time, such as an FAQ
  - Long reference or settings content, scanned by its headings
avoidWhen:
  - text: One optional detail next to other content.
    use: Disclosure
  - text: Switching between views of the same content.
    use: Tabs
components:
  - Accordion
---

# Accordion

## Overview

One section is open at a time: opening another closes it.

```tsx example=FrequentQuestions

```

### Several open

An accordion can let people keep several sections open at once.

```tsx example=SeveralOpen

```

### Open from elsewhere

The application can open a section itself, such as from a help button elsewhere on the page.

```tsx example=OpenFromOutside

```

## When to use

### One level

Don't put an accordion inside another; show the next level inside the panel as a list.

### Nothing hidden that people need

Keep what people need to finish a task out of closed sections.

## Anatomy

```tsx anatomy=AccordionAnatomy

```

1. **Indicator** (`env-accordion-indicator`)
2. **Title** (`env-accordion-label`, `title`)
3. **Panel** (`env-accordion-content`, `children`)

Each item draws the line under it, and its heading is a button.

## Accessibility

### Keyboard

| Key                                             | Action                                              |
| ----------------------------------------------- | --------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves between the headings, and into an open panel. |
| <kbd>Enter</kbd>, <kbd>Space</kbd>              | Opens or closes the section of the focused heading. |

### envUI provides

- Each title is a button inside a heading, which reports whether its section is expanded and controls its panel.
- <kbd>Tab</kbd> reaches every heading. The arrow keys, <kbd>Home</kbd> and <kbd>End</kbd> don't move between them, as the current ARIA accordion pattern advises, so they stay with the page and the panels' content.
- A focus outline, and headings at least 2.75 rem tall on touch screens.

### You provide

- Titles that say what each section holds.
- `headingLevel` that fits the page's outline.

## In code

### Usage

Accordion.Root holds an Accordion.Item for each section, with its heading as `title` and its panel as `children`. One item is open at a time; `multiple` lets several stay open. `disabled` on the root or an item turns it off.

```tsx source=FrequentQuestions

```

#### Open items

`defaultValue` names the items open at first, by their `value`; or control them with `value` and `onValueChange`, which receives the values of the open items. An item's own `onOpenChange` reports whether it is open.

```tsx source=OpenFromOutside

```

#### Find in page

`hiddenUntilFound` keeps closed panels in the page, so the browser's find in page reaches their text and opens the item that holds it, where the browser supports it.

### Composition

The headings are `h3`; set `headingLevel` to fit the page's outline, and they look the same at every level. Show the next level inside a panel as a List rather than another accordion.

The parts are the accordion, `env-accordion`; each item, `env-accordion-item`, which draws the line under it; its heading's button, `env-accordion-trigger`, with the indicator, `env-accordion-indicator`, and the title, `env-accordion-label`; and the panel, `env-accordion-content`.

## Changelog

- **1.0.0**: Accordion.
