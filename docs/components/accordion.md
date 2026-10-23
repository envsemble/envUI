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
  - A list of questions or topics that people open one or a few at a time, such as frequently asked questions.
  - Long reference or settings content split into sections that people scan by their headings.
avoidWhen:
  - text: One optional detail next to other content.
    use: Disclosure
  - text: Switching between views of the same content.
    use: Tabs
  - text: A hierarchy people expand level by level, such as folders.
    use: Tree
components:
  - Accordion
---

# Accordion

## Overview

An accordion is a list of sections, each a heading that shows and hides the panel below it. One section is open at a time.

```tsx example=FrequentQuestions

```

### Several open

`multiple` lets people keep several sections open at once.

```tsx example=SeveralOpen

```

### Open from elsewhere

`value` and `onValueChange` control which sections are open.

```tsx example=OpenFromOutside

```

## When to use

```tsx do=SayWhatItHolds caption="Titles that say what each section holds, such as the question it answers."

```

```tsx dont=VagueTitles caption="More information or Details: people open each one to find out."

```

- Don't nest accordions; show the next level inside the panel as a list.
- Keep what people need to finish a task out of closed sections.

## Anatomy

```tsx anatomy=AccordionAnatomy

```

1. **Indicator** (`env-accordion-indicator`)
2. **Title** (`env-accordion-label`, `title`)
3. **Panel** (`env-accordion-content`, `children`)

Each item, `env-accordion-item`, draws the line under it; its heading's button is `env-accordion-trigger`.

## Accessibility

### Keyboard

| Key                                             | Action                                              |
| ----------------------------------------------- | --------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves between the headings, and into an open panel. |
| <kbd>Enter</kbd>, <kbd>Space</kbd>              | Opens or closes the section of the focused heading. |

### envUI provides

- Each title is a button inside a heading, which reports whether its section is expanded and controls its panel.
- Tab reaches every heading. The arrow keys, Home and End don't move between them, as the current ARIA accordion pattern advises, so they stay with the page and the panels' content.
- A focus outline, and headings at least 2.75 rem tall on touch screens.

### You provide

- Titles that say what each section holds.
- `headingLevel` that fits the page's outline.

## Changelog

- **1.0.0**: Accordion.
