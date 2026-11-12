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
  - text: Instructions or errors people need to complete a task, which must stay visible.
    use: TextField
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
  OptionalHelp:
    role: do
    caption: Optional guidance in a disclosure, and what the task needs in sight.
  HiddenRules:
    role: dont
    caption: 'Rules people need, hidden: they find them only after an error.'
---

# Disclosure

## Anatomy

```tsx figure=DisclosureAnatomy

```

1. **Summary** (`env-disclosure > summary`, `title`), after its chevron (`env-disclosure-indicator`)
2. **Panel** (`env-disclosure-panel`, `children`)

## Behaviour

### Find in page

Finding text in a closed disclosure's details opens it, where the browser supports it.

### One at a time

Disclosures in a set can open one at a time, where the browser supports it.

```tsx figure=FrequentQuestions motion

```

### Open on an error

The application can open a disclosure itself, such as when a field inside has an error.

```tsx figure=OpenOnError motion

```

## Rules

A disclosure hides only what most people don't need, one level deep.

```tsx figure=OptionalHelp

```

```tsx figure=HiddenRules

```

### One level

Don't put a disclosure inside another.

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

## Compose

### Usage

A Disclosure is a native `<details>`: `title` is its one-line summary, and `children` the details shown below it while it is open. It keeps its own state, closed unless `defaultOpen` is set; finding text in a closed panel opens it where the browser supports it.

```tsx source=VisibilityHelp

```

#### One at a time

Disclosures that share a `name` open one at a time, where the browser supports it.

```tsx
<Disclosure name="plan-questions" title="Who can see a shared plan?" defaultOpen>
  <Text>Everyone in the workspace can read it.</Text>
</Disclosure>
<Disclosure name="plan-questions" title="Can I move a plan to another workspace?">
  …
</Disclosure>
```

#### Open on an error

`open` and `onOpenChange(open)` control it, such as to open it when a field inside has an error. A native `onToggle` still passes through.

```tsx
<Disclosure title="Advanced settings" open={advanced} onOpenChange={setAdvanced}>
  <TextField label="Custom domain" error={error} />
</Disclosure>
```

### Composition

Never nest a disclosure in another.

### Customize

The summary is `env-disclosure > summary`, and the details are in `env-disclosure-panel`.

## Changelog

- **1.0.0**: Disclosure takes `open`, `defaultOpen` and `onOpenChange(open)`; a native `onToggle` still passes through. `DisclosureNote` is `Disclosure`, and its content `env-disclosure-panel`; the page is `disclosure`.
- **1.0.0-prerelease.6**: The details grow to their height as they open and shrink as they close, fading in and out, as an accordion's panel does, where the browser can size them to their content.
- **1.0.0-prerelease.6**: The summary's chevron is the icon set's, `env-disclosure-indicator`, at the small icon size in the middle of its first line, as a tree's is, rather than a text character, and turns to point down while open; the panel lines up with the summary's words.
- **1.0.0-prerelease.6**: The summary lays the shared state layer on hover and press, in a small rounded rectangle a little past its words, and its focus ring takes the same rounded corners rather than square ones.
