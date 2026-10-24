---
title: Composer
summary: The message field of a conversation, which grows with its text and sends with Enter, with a send button that stops a running reply.
status: stable
since: 0.5.0
category: Text & content
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
  - A message in a conversation, such as a chat, a comment or a prompt
  - A reply that runs after a send, which people may stop
avoidWhen:
  - text: A whole conversation, with the log above the composer and a reply that streams in.
    see: conversation
  - text: Text over several lines in a form, where Enter starts a new line.
    use: Textarea
  - text: One line of text in a form.
    use: TextField
  - text: Formatted text with headings, lists and links.
    use: MarkdownEditor
  - text: The messages of the conversation itself.
    use: Message
components:
  - Composer
---

# Composer

## Overview

```tsx example=AskAnything

```

### Pending send

While a send is in progress, the next one waits; the field stays editable and keeps focus.

```tsx example=PendingSend

```

## Variants

### Layouts

A composer is its field alone, or has a row below the field with controls at its start and the send button at its end, and a note under it.

```tsx example=StartAndFooter

```

| Layout           | Use for                                                         |
| ---------------- | --------------------------------------------------------------- |
| Field alone      | A chat or a prompt. The default.                                |
| With a start row | Attachments or a choice of model, beside the send button below. |

## When to use

```tsx do=PendingStaysEditable caption="Wait while a send is in progress, so people can keep writing."

```

```tsx dont=DisabledWhileSending caption="A disabled composer, which takes focus away from the draft."

```

### In a conversation

Place the composer below the conversation it adds to, and show a message that couldn't be sent in the conversation, with its status.

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

A composer fills its container, and its field grows with its text up to a set number of lines, then scrolls.

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

## In code

### Usage

A Composer is a native textarea with no visible label, so name it with `aria-label` or `aria-labelledby`. <kbd>Enter</kbd> or the send button passes the text to `onSubmit`; blank text never sends, and neither does a disabled, running or pending composer. Leave it uncontrolled, with `defaultValue`, and it clears after each send and when its form resets; or control it with `value` and `onValueChange`, and clear it yourself.

```tsx source=AskAnything

```

#### Pending and running

`pending` marks a send in progress: sending is unavailable while the field stays editable and keeps focus, so use it rather than `disabled`. `running` marks a reply on its way: the send button becomes a stop button, which calls `onStop` and stays available when the field is disabled, and <kbd>Enter</kbd> doesn't send.

```tsx source=PendingSend

```

#### Sent by its form

Without `onSubmit`, <kbd>Enter</kbd> and the send button submit the composer's form, which sends the text under its `name`.

```tsx
import { useState, type FormEvent } from 'react';
import { Composer, Column, Text } from '@envsemble/envui';

export default function FormSubmit() {
  const [sent, setSent] = useState('');
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Without onSubmit, Enter and the send button submit the form, which sends the field by name.
    setSent(String(new FormData(event.currentTarget).get('note')));
    event.currentTarget.reset();
  };
  return (
    <form onSubmit={submit} style={{ inlineSize: 'min(100%, 32rem)' }}>
      <Column gap={3}>
        <Composer name="note" aria-label="Note" placeholder="Add a note to the plan" />
        <Text variant="caption" emphasis="muted" role="status">
          {sent && `Added: ${sent}`}
        </Text>
      </Column>
    </form>
  );
}
```

#### Rows, start and footer

The field shows `minRows` lines while empty, 1 by default, and grows to `maxRows`, 8 by default, before it scrolls. `start` holds content at the start of the action row, such as an attach button or the name of a model, and `footer` supporting text below the composer, which describes the field. `sendLabel` and `stopLabel` name the button.

```tsx source=StartAndFooter

```

### Composition

The composer, `env-composer`, is on the raised popup surface, `env-composer-surface`, which holds the input, `env-composer-input`, the start content, `env-composer-start`, and the send button, `env-composer-action`; the footer, `env-composer-footer`, sits below it. Place it below the MessageList it adds to.

## Changelog

- **1.0.0**: The send and stop labels come from EnvUIProvider's `messages`, unless `sendLabel` and `stopLabel` set them.
- **0.5.0**: Composer, on the raised popup surface, with `onSubmit` or form submission, `pending`, `running` and `onStop`, `minRows` and `maxRows`, `start` and `footer`.
