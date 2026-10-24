---
title: Message
summary: 'Conversation entries in a log: compact bubbles for your own messages, full-width content
  from others.'
status: stable
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
  - text: Formatted text on its own, outside a conversation.
    use: Markdown
components:
  - Message
  - MessageList
---

# Message

## Overview

A message is one entry of a conversation, such as a chat message or a comment, in a MessageList that announces new messages politely. A [Composer](../components/composer.md) below writes the next one.

```tsx example=Conversation

```

### Delivery status

`status` shows Sending, or Not sent; offer Retry beside a message that failed.

```tsx example=DeliveryStatus

```

### Streaming

`busy` on MessageList reports a reply that streams in, or earlier messages that load, until it is cleared. The list doesn't scroll by itself: keeping the newest message in view is the application's.

## Variants

| From    | Use for                                                   |
| ------- | --------------------------------------------------------- |
| `self`  | The person using the app: a compact bubble at the end.    |
| `other` | Anyone else, such as an assistant: full width, no bubble. |

```tsx example=FormattedAnswer caption="Someone else's message keeps the full width, for a formatted answer."

```

## When to use

```tsx do=CommentThread caption="Comments by others, each with its author, at full width."

```

```tsx dont=SelfForOthers caption="self for someone else, to put them on a side: self means you."

```

- Don't move focus to new messages: the list announces them.
- Keep messages oldest first, in a MessageList.

### Content

- Name icon actions after what they do, such as Copy answer.

## Anatomy

```tsx anatomy=MessageAnatomy

```

1. **List** (`env-message-list`)
2. **Message** (`env-message`, `from`)
3. **Author** (`env-message-author`, `author`)
4. **Meta** (`env-message-meta`, `meta`)
5. **Content** (`env-message-content`, `children`)
6. **Actions** (`env-message-actions`, `actions`)
7. **Status** (`env-message-status`, `status`)

## Adapting to width

Your own bubble grows to three quarters of the list, and to at least 16 rem in a narrow list.

```tsx example=BubbleWidth widths="20 40"

```

## Accessibility

### envUI provides

- MessageList as a polite log, and `aria-busy` while `busy`.
- Each message as an `<article>`, with its author and meta in a header.
- The status as text beside its icon.

### You provide

- A name for the list, such as Conversation with Sam Lee.
- `busy` while a reply streams in.
- Names for icon-only actions, and Retry for a failed message.
- Scrolling, without moving focus.

## Changelog

- **1.0.0**: Buttons in `actions` are small ghost buttons unless they set their own variant or size, and the statuses come from `messages.message`. The page is `message`, after the component, instead of `messages`. Message and MessageList can render in React Server Components.
- **0.5.0**: Message and MessageList, with `from`, `author`, `meta`, `actions`, `status` and `statusLabel`, and `busy` on the list.
