---
title: Accordion
summary: Stacked sections that each show and hide their content under a heading.
status: beta
since: 1.0.0
category: Text & content
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
    use: SegmentedControl
components:
  - Accordion
examples:
  FrequentQuestions: overview
  AccordionAnatomy: anatomy
  SeveralOpen: example
  OpenFromOutside: example
  IntegrationSwitches: example
---

# Accordion

## Anatomy

```tsx figure=AccordionAnatomy

```

1. **Indicator** (`env-accordion-indicator`)
2. **Title** (`env-accordion-label`, `title`)
3. **Panel** (`env-accordion-content`, `children`)

## Behaviour

### One open at a time

<!-- specimen: OneAtATime -->

### Several open

```tsx figure=SeveralOpen

```

### Open from elsewhere

```tsx figure=OpenFromOutside motion

```

### Controls beside the heading

```tsx figure=IntegrationSwitches

```
