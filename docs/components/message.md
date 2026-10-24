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
  - A conversation with a person or an assistant
  - A thread of comments, each with its author and time
  - A reply that streams in while people read
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

Each Message sits in a MessageList, which holds the conversation.

```tsx example=Conversation

```

### Delivery status

A message can show that it is on its way, or that it wasn't sent; offer Retry beside one that failed.

```tsx example=DeliveryStatus

```

### Streaming

While a reply streams in, or earlier messages load, the list tells assistive technology to wait until the change is done. The list doesn't scroll by itself: keeping the newest message in view is the application's.

## Variants

```tsx variants=FormattedAnswer

```

1. **Yours**
2. **Someone else's**

| From           | Use for                                                                                |
| -------------- | -------------------------------------------------------------------------------------- |
| Yours          | The person using the app: a compact bubble at the end.                                 |
| Someone else's | Anyone else, such as an assistant: full width, no bubble, room for a formatted answer. |

## When to use

```tsx do=CommentThread caption="Comments by others, each with its author, at full width."

```

```tsx dont=SelfForOthers caption="Someone else's message in your bubble, to put them on a side: the bubble means you."

```

### Order and focus

Keep messages oldest first, in one list, and leave focus where it is as new ones arrive: the list announces them.

### Content

Name icon actions after what they do, such as Copy answer.

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

## In code

### Usage

A MessageList holds the conversation, oldest first, and each Message in it takes `from`: `self` for the person using the app, a compact bubble at the inline end, or `other` for anyone else, such as an assistant or another participant, full-width content with no bubble. `author` names who wrote it, `meta` holds supporting facts beside the author, such as a RelativeTime, and `children` the message: plain text keeps its line breaks, and formatted content, such as Markdown, fills the width of a message from someone else. Never set `from="self"` on someone else's message to put it on a side.

```tsx source=Conversation

```

#### Actions and status

`actions` holds small actions below the message, such as Copy or Retry: buttons without a variant or size of their own are small ghost buttons. `status` is `sending`, with a spinner and Sending, or `failed`, with an error icon and Not sent; `statusLabel` replaces the words, which otherwise come from EnvUIProvider's `messages.message`.

```tsx source=DeliveryStatus

```

#### Streaming

`busy` on MessageList reports `aria-busy` while a reply streams in or earlier messages load, until it is cleared. The list doesn't scroll by itself: keep the newest message in view yourself, without moving focus.

```tsx
<MessageList aria-label="Conversation with Sam Lee" busy={streaming}>
  …
</MessageList>
```

### Composition

The list is `env-message-list`, and each message `env-message`, with its author, `env-message-author`, and meta, `env-message-meta`, in its header, then its content, `env-message-content`, its actions, `env-message-actions`, and its status, `env-message-status`. `skeleton` shows a message as its own skeleton while it loads. Message and MessageList can render in React Server Components.

## Changelog

- **1.0.0**: Buttons in `actions` are small ghost buttons unless they set their own variant or size, and the statuses come from `messages.message`. The page is `message`, after the component, instead of `messages`. Message and MessageList can render in React Server Components.
- **0.5.0**: Message and MessageList, with `from`, `author`, `meta`, `actions`, `status` and `statusLabel`, and `busy` on the list.
