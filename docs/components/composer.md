---
title: Composer
summary: The message field of a conversation, which grows with its text and sends with Enter, with a send button that stops a running reply.
status: stable
since: 0.5.0
category: Forms & selection
aliases:
  - ChatInput
  - PromptInput
  - chat input
  - chat box
  - prompt input
  - prompt box
  - message input
  - message box
  - reply field
  - comment box
useWhen:
  - People write a message in a conversation, such as a chat, a comment thread or a prompt, and send it with Enter.
  - A reply runs after a message is sent and people may stop it (`running`, `onStop`).
avoidWhen:
  - text: Text over several lines in a form, where Enter starts a new line.
    use: Textarea
  - text: One line of text in a form.
    use: TextField
  - text: Formatted text with headings, lists and links.
    use: MarkdownEditor
  - text: A query that searches or filters content.
    use: SearchField
related:
  - message
  - text-field
  - button
  - markdown
  - accessibility
components:
  - Composer
---

# Composer

## Overview

A composer is where people write a message and send it with <kbd>Enter</kbd>; <kbd>Shift</kbd>+<kbd>Enter</kbd> starts a new line. While a reply runs, the send button stops it.

```tsx example=AskAnything

```

### Pending send

While `pending`, the next send waits; the field stays editable and keeps focus.

```tsx example=PendingSend

```

### Sent by its form

Without `onSubmit`, <kbd>Enter</kbd> and the send button submit the form, which sends the text under `name`.

```tsx example=FormSubmit

```

## Variants

```tsx example=StartAndFooter

```

| Layout       | Use for                                                                |
| ------------ | ---------------------------------------------------------------------- |
| Field alone  | A chat or a prompt. The default.                                       |
| With `start` | Attachments or a choice of model, in a row with the send button below. |

## When to use

```tsx do=PendingStaysEditable caption="pending while a send is in progress, so people can keep writing."

```

```tsx dont=DisabledWhileSending caption="A disabled composer, which takes focus away from the draft."

```

```tsx do=ShortFooter caption="A footer of a few words."

```

```tsx dont=LongFooter caption="Instructions in the footer that nobody reads."

```

- Place the composer below the conversation it adds to.
- Show a message that couldn't be sent in the conversation, with its status.

## Anatomy

```tsx anatomy=ComposerAnatomy

```

1. **Composer** (`env-composer`)
2. **Surface** (`env-composer-surface`)
3. **Input** (`env-composer-input`)
4. **Start** (`env-composer-start`, `start`)
5. **Send** (`env-composer-action`)
6. **Footer** (`env-composer-footer`, `footer`)

## Adapting to width

A composer fills its container, and its field grows with its text from `minRows` to `maxRows` lines, then scrolls.

```tsx example=GrowingDraft widths="18 36"

```

## Accessibility

### Keyboard

| Key                                              | Action                                                      |
| ------------------------------------------------ | ----------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd>  | Moves to the field, the start controls and the send button. |
| <kbd>Enter</kbd> in the field                    | Sends the message, unless it is blank, pending or running.  |
| <kbd>Shift</kbd>+<kbd>Enter</kbd> in the field   | Starts a new line.                                          |
| <kbd>Enter</kbd>, <kbd>Space</kbd> on the button | Sends the message, or stops the reply.                      |

### envUI provides

- A native `textarea` described by the footer.
- A send button named Send or Stop, which stays focusable as it changes.
- Focus back in the field after a send.
- <kbd>Enter</kbd> that leaves input method composition alone.

### You provide

- An `aria-label` that names the field.
- An announcement of the reply, or of a message that couldn't be sent.
- `sendLabel` and `stopLabel` in the application's language.

## Changelog

- **1.0.0**: The send and stop labels come from EnvUIProvider's `messages`, unless `sendLabel` and `stopLabel` set them.
- **0.5.0**: Composer, on the raised popup surface, with `onSubmit` or form submission, `pending`, `running` and `onStop`, `minRows` and `maxRows`, `start` and `footer`.
