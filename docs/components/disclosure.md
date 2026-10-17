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
  - accordion
  - show more
  - toggle details
useWhen:
  - Optional guidance or details that most people don't need, such as how a setting works.
  - Settings that most people leave alone, such as advanced options in a form.
  - A list of questions whose answers people open one at a time.
avoidWhen:
  - text: Instructions or errors people need to complete a task, which must stay visible.
    use: TextField
  - text: Switching between views of the same content.
    use: Tabs
  - text: A hierarchy people expand level by level, such as folders.
    use: Tree
  - text: Details beside a control that close when people move on.
    use: Popover
related:
  - tree
  - tabs
  - popover
  - text-field
  - typography
components:
  - Disclosure
---

# Disclosure

## Overview

A disclosure is a one-line summary that shows and hides the details below it. It is the native `<details>` element with its `<summary>`, so opening, closing, the keyboard and what assistive technology hears are the platform's. It suits guidance and settings that most people don't need; what they need to complete a task stays visible.

```tsx example=VisibilityHelp

```

## Anatomy

1. **Summary** (`title`): the line that opens and closes the details, in muted small text, after a chevron that turns down while open.
2. **Panel** (`children`): the details, indented 1 rem under the summary and 0.5 rem below it, with 0.5 rem between its children. Plain paragraphs and lists take the disclosure's color and type, and lists keep their markers; envUI components inside keep their own styles.

## Variants and sizes

- The summary and plain text in the panel use the small body type, 0.875 rem, in the muted text color.
- The summary is as wide as its text and wraps onto more lines when the room runs out; long words break.
- On touch screens the summary is at least 2.75 rem tall.

## States and behaviour

- **Open and closed**: pressing the summary opens or closes the panel; while closed, the panel is hidden from everyone, assistive technology included. `open` with `onOpenChange` controls it, such as to open it when a field inside has an error, and `defaultOpen` sets how it starts. `onOpenChange` receives whether it is open each time it opens or closes, also when find in page opens it.
- **Hover, pressed and focus**: the summary darkens to the quiet label's hover and pressed colors, and keyboard focus shows a focus outline around it.
- **One at a time**: disclosures that share a `name` open one at a time, where the browser supports it; elsewhere each opens on its own.
- **Find in page**: where the browser supports it, finding text in a closed panel opens it.

## Content guidelines

- Write the summary as a question or a short noun phrase that says what the details hold: "How visibility works", "Advanced settings".
- Keep the summary to one line, and the details short.
- Put nothing in the details that people need to complete the task, such as required fields, instructions or errors.

## Do and don't

### Do

- Use a disclosure for optional guidance beside a task, and for settings most people leave alone.
- Open a disclosure when a field inside it has an error, so the field and its message show.
- Give related questions a shared `name` when one answer at a time is enough.

### Don't

- Don't hide required fields, instructions or errors in a disclosure.
- Don't nest disclosures inside each other.
- Don't use a disclosure for navigation or to switch views; use [Tabs](../components/tabs.md).

## Accessibility

### Keyboard

| Key                                             | Action                                               |
| ----------------------------------------------- | ---------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves focus to the summary, then into an open panel. |
| <kbd>Enter</kbd> or <kbd>Space</kbd>            | Opens or closes the panel.                           |

### envUI provides

- The native `<details>` and `<summary>` elements, so the summary is a focusable control that reports whether it is expanded, and a closed panel is hidden from assistive technology.
- A focus outline around the summary, and a 2.75 rem summary on touch screens.
- A decorative chevron that shows the state, beside the summary's text.

### You provide

- A summary that says what the details hold.
- `open` for a disclosure whose content needs attention, such as a field with an error.

## Examples

### Questions, one open at a time

Disclosures with the same `name` act as one group: opening an answer closes the one that was open.

```tsx example=FrequentQuestions

```

### Open on an error

Advanced settings stay closed until a field in them has an error; `open` and `onOpenChange` then open the disclosure so the error shows.

```tsx example=OpenOnError

```

## Changelog

- **1.0.0**: Disclosure takes `open`, `defaultOpen` and `onOpenChange(open)`; a native `onToggle` still passes through. `DisclosureNote` is `Disclosure`, and its content `env-disclosure-panel`; the page is `disclosure`.
- **0.1.0**: DisclosureNote.
