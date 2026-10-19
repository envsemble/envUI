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

A composer is where people write a message and send it: a multiline field on a raised surface that grows with its text, with a round send button at its end. <kbd>Enter</kbd> sends and <kbd>Shift</kbd>+<kbd>Enter</kbd> starts a new line. While a reply runs, the send button becomes a stop button. The application sends the text with `onSubmit`, or the field's form sends it under its `name`.

```tsx example=AskAnything

```

## Anatomy

1. **Surface**: the popup fill with a hairline border in the popup border color and 1.75 rem corners, 0.5 rem padding around the field and the button.
2. **Field**: a native `textarea`, in body text, 1 rem on touch screens; it has no visible label, so `aria-label` or `aria-labelledby` names it.
3. **Start content** (optional, `start`): an action row below the field, such as an attach button or the name of a model, in small text.
4. **Send button**: a round primary icon button with an up arrow, named `sendLabel` (Send); a stop icon named `stopLabel` (Stop) while `running`.
5. **Footer** (optional, `footer`): short supporting text below the surface, which describes the field.

## Variants and sizes

| Layout       | Use for                                                                                                                          |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| Field alone  | A chat or a prompt: a single line sits centred beside the send button. The default.                                              |
| With `start` | Messages with attachments or a choice of model: the send button moves to the action row below the field, with the start content. |

- The field grows with its text from `minRows` (1) to `maxRows` (8) lines, then scrolls; it fills the composer's width, and long words wrap.
- A single line is as tall as the send button. Start content lines up with the field's text above it; a leading icon button lines up its icon, its round target reaching into the inset.
- Coarse pointers get the touch-sized send button and larger text.

## States and behaviour

- **Sending**: <kbd>Enter</kbd> or the send button calls `onSubmit` with the text as typed, and an uncontrolled composer clears. Blank text never sends, nor does a disabled, running or pending composer. A held <kbd>Enter</kbd> sends once, and <kbd>Enter</kbd> that confirms an input method's composition never sends. After a send from the button, focus returns to the field.
- **In forms**: without `onSubmit`, <kbd>Enter</kbd> and the send button submit the field's form, which sends the text under `name`; the text stays until the form resets, as it does after a form action succeeds. When another field of the form is invalid, the browser reports it and focus moves there. Without `onSubmit` or a form there is nothing to send: the button is unavailable and <kbd>Enter</kbd> starts a new line.
- **Pending**: while `pending`, or while the action of an enclosing form is pending, sending is unavailable and the field stays editable and keeps focus, so people can write their next message. Set `pending` for a form the field joins through its `form` attribute, or for a request the application makes itself.
- **Running**: while `running`, the button stops the reply through `onStop`, and <kbd>Enter</kbd> doesn't send; people can write their next message meanwhile.
- **Unavailable sending**: the send button is unavailable while the text is blank, pending or without anywhere to send, and reports `aria-disabled`; it stays focusable, so focus stays on it as it turns into the stop button and back.
- **Focus and hover**: focus in the field turns the outline to the active field color and thickens it; on hover the outline takes the accent hover color. A press on the surface around the field places the caret in it.
- **Disabled**: the field and sending are disabled, and the field and the start content take the shared disabled opacity; the stop button stays available while running.
- **Touch keyboards** label their <kbd>Enter</kbd> key Send wherever it sends.

## Content guidelines

- Name the field after what people write, with `aria-label`: "Message", "Reply to Priya Shah", "Comment".
- Use a placeholder for what to write, such as "Ask anything" or "Add a comment"; it isn't the field's name.
- Keep the footer to a short note, such as on attachments or who sees the message.
- Name the start content's controls like any other icon action, such as "Attach files".
- Translate `sendLabel` and `stopLabel` where the interface is not in English.

## Do and don't

### Do

- Place the composer below the conversation it adds to.
- Set `pending` while a send is in progress, rather than disabling the field.
- Let people write their next message while a reply runs.
- Show a message that could not be sent in the conversation, with its status.

### Don't

- Don't use a composer in a form where <kbd>Enter</kbd> should start a new line; use [Textarea](../components/text-field.md).
- Don't disable the composer during a run unless the conversation can't take another message.
- Don't put long instructions in the footer.

## Accessibility

### Keyboard

| Key                                                | Action                                                                                     |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd>    | Moves focus to the field, the start content's controls and the send button.                |
| <kbd>Enter</kbd> in the field                      | Sends the message, unless it is blank, pending or running, or there is nowhere to send it. |
| <kbd>Shift</kbd>+<kbd>Enter</kbd> in the field     | Starts a new line.                                                                         |
| <kbd>Enter</kbd> or <kbd>Space</kbd> on the button | Sends the message, or stops the reply while running.                                       |

### envUI provides

- A native `textarea`, which needs `aria-label` or `aria-labelledby` by its types, described by the footer.
- A native send button named Send or Stop, with `aria-disabled` while sending is unavailable, kept focusable so focus is never lost as it changes.
- Focus back in the field after a send from the button, and in place while a send is pending.
- Input method composition left alone by <kbd>Enter</kbd>, and Send on touch keyboards' <kbd>Enter</kbd> key.
- The shared focus styles, and a touch-sized button and larger text on coarse pointers.

### You provide

- `aria-label` or `aria-labelledby` that names the field.
- An announcement of the reply, or of a message that could not be sent, in the conversation.
- Names for the start content's controls, and `sendLabel` and `stopLabel` in the application's language.

## Examples

### Start content and a footer

Start content moves the send button to an action row below the field; the footer describes the field.

```tsx example=StartAndFooter

```

### Pending send

While the reply is sent, `pending` holds the next send; the field stays editable and keeps focus.

```tsx example=PendingSend

```

### Sent by its form

Without `onSubmit`, <kbd>Enter</kbd> and the send button submit the form, which sends the text under `name`.

```tsx example=FormSubmit

```

## Changelog

- **1.0.0**: The send and stop labels come from EnvUIProvider's `messages`, unless `sendLabel` and `stopLabel` set them.
- **0.5.0**: Composer, on the raised popup surface, with `onSubmit` or form submission, `pending`, `running` and `onStop`, `minRows` and `maxRows`, `start` and `footer`.
