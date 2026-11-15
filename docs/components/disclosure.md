---
title: Disclosure
summary: A one-line summary that shows and hides optional details below it.
status: stable
since: 1.0.0
category: Text & content
aliases:
  - DisclosureNote
  - collapsible
  - collapse
  - details
  - summary
  - expander
  - expandable section
  - show more
  - toggle details
useWhen:
  - Optional guidance most people don't need, such as how a setting works
  - Settings most people leave alone, such as advanced options
avoidWhen:
  - text: A list of questions or sections whose answers people open one at a time.
    use: Accordion
  - text: Switching between views of the same content.
    use: Tabs
  - text: Details beside a control that close when people move on.
    use: Popover
components:
  - Disclosure
examples:
  VisibilityHelp: overview
  DisclosureAnatomy: anatomy
  FrequentQuestions: example
  OpenOnError: example
---

# Disclosure

## Anatomy

```tsx figure=DisclosureAnatomy

```

1. **Summary** (`env-disclosure > summary`, `title`), after its chevron (`env-disclosure-indicator`)
2. **Panel** (`env-disclosure-panel`, `children`)

## Behaviour

### One at a time

```tsx figure=FrequentQuestions motion

```

### Open on an error

```tsx figure=OpenOnError motion

```
