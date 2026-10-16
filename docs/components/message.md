---
title: Message
summary: 'Conversation entries in a log: compact bubbles for your own messages, full-width content
  from others.'
status: beta
since: 0.5.0
category: Content & guidance
aliases:
  - Messages
  - MessageList
  - chat message
  - chat bubble
  - chat
  - conversation
  - transcript
  - message list
  - comment thread
  - log
useWhen:
  - A conversation between the person using the app and others, such as a chat with a person or an assistant.
  - A thread of comments in the order they were written, each with its author and time.
  - A reply that streams in or messages that load while people read, which assistive technology should announce politely.
avoidWhen:
  - text: The field where people write and send the next message.
    use: Composer
  - text: Items people scan, open and act on, such as a list of conversations.
    use: List
  - text: A short notification that comes and goes, such as Message sent.
    use: Toast
  - text: A message about a page or a section, such as a warning before a form.
    use: Alert
  - text: Formatted text on its own, outside a conversation.
    use: Markdown
related:
  - composer
  - markdown
  - relative-time
  - list
  - loading
  - accessibility
components:
  - Message
  - MessageList
---

# Message

## Overview

A message is one entry of a conversation, such as a chat message or a comment, in a MessageList that keeps them in the order they were written. Messages from the person using the app are compact bubbles at the inline end; messages from others, such as an assistant or another participant, are content without a bubble, so long formatted answers with lists, tables and code keep their full width.

MessageList is a log, so assistive technology politely announces messages as they arrive. A [Composer](../components/composer.md) below the list writes the next message.

```tsx example=Conversation

```

## Anatomy

1. **List** (MessageList): the conversation, with 1.5 rem between messages, named with `aria-label` or `aria-labelledby`.
2. **Header** (optional): the **author** at weight 500 and the **meta**, such as the time, in the muted color, 0.875 rem text on one line that wraps.
3. **Content** (`children`): for your own messages, a bubble on the neutral fill with 1 rem corners and 0.5 rem by 1 rem padding, at most three quarters of the list's width, or 16 rem in a narrow list; for others, the full width without a fill.
4. **Status** (optional, `status`): a spinner with Sending, or an error icon with Not sent, in 0.875 rem text below the content.
5. **Actions** (optional, `actions`): small buttons below the message, 0.25 rem apart, at the start for others' messages and at the end for your own.

The parts of a message are 0.5 rem apart.

## Variants and sizes

| From    | Use for                                                                                               |
| ------- | ----------------------------------------------------------------------------------------------------- |
| `self`  | Messages the person using the app wrote: a compact bubble at the inline end.                          |
| `other` | Messages from anyone else, such as an assistant or another participant: full-width, without a bubble. |

<!-- specimen: Statuses -->

- Message text takes the 0.9375 rem body type. Plain text keeps the line breaks it was written with, and long words wrap anywhere, so a message never widens the list.
- A bubble grows with its text up to three quarters of the list's width, or to 16 rem where that is more, never wider than the list.
- Actions take the 2 rem compact control height, and the 2.75 rem touch height on touch screens. A text IconButton at the edge lines its icon up with the message's text, not its round hit area.

## States and behaviour

- **Sending**: `status="sending"` shows a spinner and Sending under the message, in the muted color.
- **Failed**: `status="failed"` shows an error icon and Not sent in the danger tone, and a red outline around your own message's bubble. Offer a Retry action beside it.
- **Busy**: `busy` on MessageList reports `aria-busy` while messages are still changing, such as while a reply streams in or earlier messages load, so assistive technology can wait for the finished change. Clear it when they are complete.
- **Announcements**: the list is a polite log, so assistive technology announces messages added anywhere in it, including earlier messages loaded at its start, and text that changes, such as each step of a streaming reply.
- **Right-to-left text**: your own messages sit at the left and their actions follow them.
- **Scrolling**: the list grows with its messages and doesn't scroll by itself. Scrolling, keeping the newest message in view and loading earlier messages belong to the application.

## Content guidelines

- Show an `author` where it helps tell people apart, such as in a group or a comment thread; leave it out on your own messages in a conversation with one other.
- Put the time in `meta`, such as "09:41", or a [RelativeTime](../components/relative-time.md) in a thread people come back to.
- Keep actions to the few that matter for a message, such as Copy and Retry, and name icon actions after what they do: "Copy answer".
- Write a status that says what happened and in the page's language with `statusLabel`, such as "Could not deliver".
- Render formatted answers with [Markdown](../components/markdown.md) inside a message from someone else, where they take the full width.

## Do and don't

### Do

- Name the conversation with `aria-label` or `aria-labelledby` on MessageList, such as "Conversation with Sam Lee".
- Set `busy` while a reply streams in, and clear it when the reply is complete.
- Pair a failed message with a Retry action, and keep its text so people can see what didn't send.
- Keep messages in the order they were written, the oldest first.

### Don't

- Don't move focus to new messages; the log announces them, and people stay in the Composer.
- Don't use `from="self"` for messages others wrote, to put them on one side; `self` means the person using the app.
- Don't tell a failed message apart by its red outline alone; the status text says it.
- Don't put a Message outside a MessageList; the list is what announces it.

## Accessibility

### Keyboard

| Key                                             | Action                                                                                                                         |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves through the actions and links in the messages, in order. The list and the messages are not focusable and handle no keys. |

### envUI provides

- `role="log"` with `aria-live="polite"` on MessageList, so new and changed messages are announced without interrupting, and `aria-busy` while `busy`.
- Each message as an `<article>`, with its author and meta in a header, so screen readers can move from message to message.
- The status as text beside its icon, so it never depends on color; the spinner and the error icon are hidden from assistive technology.
- Text, meta and status at least 4.5:1, and a bubble that stands apart from the page and from panes, in both themes.
- Actions at the touch size on touch screens.

### You provide

- A name for the list, with `aria-label` or `aria-labelledby`.
- `busy` while a reply streams in or earlier messages load.
- Names for icon-only actions, such as "Copy answer", and a Retry action for failed messages.
- Scrolling and loading earlier messages, without moving focus.
- A [Composer](../components/composer.md), or another labelled field, for the next message.

## Examples

### Delivery status

A message that couldn't be sent says so and offers Retry; while it is sent again it shows Sending.

```tsx example=DeliveryStatus

```

### A formatted answer

Markdown inside a message from someone else keeps the full width. A CopyButton in `actions` copies the answer.

```tsx example=FormattedAnswer

```

### A comment thread

Comments by several people read best at full width: each is `from="other"`, with its author and a RelativeTime in the header.

```tsx example=CommentThread

```

## Changelog

- **1.0.0**: The page is `message`, after the component, instead of `messages`. Message and MessageList can render in React Server Components.
- **0.5.0**: Message and MessageList, with `from`, `author`, `meta`, `actions`, `status` and `statusLabel`, and `busy` on the list.
