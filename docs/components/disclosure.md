---
title: Disclosure
summary: A one-line summary that shows and hides optional details below it, on the native details element.
status: stable
since: 0.1.0
category: Content & guidance
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
  - Optional guidance or details that most people don't need, such as how a setting works.
  - Settings that most people leave alone, such as advanced options in a form.
avoidWhen:
  - text: A list of questions or sections whose answers people open one at a time.
    use: Accordion
  - text: Instructions or errors people need to complete a task, which must stay visible.
    use: TextField
  - text: Switching between views of the same content.
    use: Tabs
  - text: Details beside a control that close when people move on.
    use: Popover
components:
  - Disclosure
---

# Disclosure

## Overview

Finding text in a closed disclosure's panel opens it, where the browser supports it.

```tsx example=VisibilityHelp

```

### One at a time

Disclosures that share a `name` open one at a time, where the browser supports it.

```tsx example=FrequentQuestions

```

### Open on an error

`open` and `onOpenChange` control it, such as to open it when a field inside has an error.

```tsx example=OpenOnError

```

## When to use

```tsx do=OptionalHelp caption="Optional guidance in a disclosure, and what the task needs in sight."

```

```tsx dont=HiddenRules caption="Rules people need, hidden: they find them only after an error."

```

- Don't nest disclosures.

## Anatomy

```tsx anatomy=DisclosureAnatomy

```

1. **Summary** (`env-disclosure > summary`, `title`)
2. **Panel** (`env-disclosure-panel`, `children`)

## Accessibility

### Keyboard

| Key                                             | Action                                         |
| ----------------------------------------------- | ---------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves to the summary, then into an open panel. |
| <kbd>Enter</kbd>, <kbd>Space</kbd>              | Opens or closes the panel.                     |

### envUI provides

- Native `<details>` and `<summary>`: the summary reports whether it is expanded, and a closed panel is hidden.
- A focus outline, and a 2.75 rem summary on touch screens.

### You provide

- A summary that says what the details hold.
- `open` where something inside needs attention.

## Changelog

- **1.0.0**: Disclosure takes `open`, `defaultOpen` and `onOpenChange(open)`; a native `onToggle` still passes through. `DisclosureNote` is `Disclosure`, and its content `env-disclosure-panel`; the page is `disclosure`.
- **0.1.0**: DisclosureNote.
