---
title: Message
summary: 'Conversation entries in a log: compact bubbles for your own messages, full-width content
  from others.'
status: stable
since: 0.5.0
category: Text & content
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
  - text: A whole conversation, with the log, the composer, a streaming reply and a failed send.
    see: conversation
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
examples:
  Conversation: overview
  FormattedAnswer: variants
  MessageAnatomy: anatomy
  DeliveryStatus: example
  BubbleWidth: example
  CommentThread:
    role: do
    caption: Comments by others, each with its author, at full width.
  SelfForOthers:
    role: dont
    caption: "Someone else's message in your bubble, to put them on a side: the bubble means you."
---

# Message

## Variants

```tsx figure=FormattedAnswer

```

1. **Yours**
2. **Someone else's**

| From           | Use for                                                                                |
| -------------- | -------------------------------------------------------------------------------------- |
| Yours          | The person using the app: a compact bubble at the end.                                 |
| Someone else's | Anyone else, such as an assistant: full width, no bubble, room for a formatted answer. |

## Anatomy

```tsx figure=MessageAnatomy

```

1. **List** (`env-message-list`)
2. **Message** (`env-message`, `from`)
3. **Author** (`env-message-author`, `author`)
4. **Meta** (`env-message-meta`, `meta`)
5. **Content** (`env-message-content`, `children`)
6. **Actions** (`env-message-actions`, `actions`)
7. **Status** (`env-message-status`, `status`)

## Behaviour

### Delivery status

A message can show that it is on its way, or that it wasn't sent.

- Offer Try again beside one that failed.

```tsx figure=DeliveryStatus

```

### Adapting to width

Your own bubble grows to three quarters of the list, and keeps a readable width in a narrow list.

```tsx figure=BubbleWidth widths="20 40"

```

## Rules

The bubble means you; everyone else's messages run at full width, in the order they were sent.

```tsx figure=CommentThread

```

```tsx figure=SelfForOthers

```

### Order and focus

Keep messages oldest first, in one list.

- Leave focus where it is as new ones arrive: the list announces them.

### Content

Name icon actions after what they do, such as Copy answer.

## Accessibility

### envUI provides

- MessageList as a polite log, and `aria-busy` while `busy`.
- Each message as an `<article>`, with its author and meta in a header.
- The status as text beside its icon.

### You provide

- A name for the list, such as Conversation with Sam Lee.
- `busy` while a reply streams in.
- Names for icon-only actions, and Try again for a failed message.
- Scrolling, without moving focus.

## Compose

### Usage

A MessageList holds the conversation, oldest first, and each Message in it takes `from`:

- `self` for the person using the app, a compact bubble at the inline end; your own bubble grows to three quarters of the list, and to at least 16 rem in a narrow list.
- `other` for anyone else, such as an assistant or another participant, full-width content with no bubble.
- Never set `from="self"` on someone else's message to put it on a side.

`author` names who wrote it, `meta` holds supporting facts beside the author, such as a RelativeTime, and `children` the message: plain text keeps its line breaks, and formatted content, such as Markdown, fills the width of a message from someone else.

```tsx source=Conversation

```

#### Actions and status

`actions` holds small actions below the message, such as Copy or Try again: buttons without a variant or size of their own are small ghost buttons. `status` is `sending`, with a spinner and Sending, or `failed`, with an error icon and Not sent; `statusLabel` replaces the words, which otherwise come from EnvUIProvider's `messages.message`.

```tsx
<Message
  from="self"
  meta="09:41"
  status={status}
  actions={
    status === 'failed' && (
      <Button variant="text" onClick={retry}>
        Try again
      </Button>
    )
  }
>
  {'Northwind Hall
12 Harbour Street'}
</Message>
```

#### Streaming

`busy` on MessageList reports `aria-busy` while a reply streams in or earlier messages load, until it is cleared. The list doesn't scroll by itself: keep the newest message in view yourself, without moving focus.

```tsx
<MessageList aria-label="Conversation with Sam Lee" busy={streaming}>
  …
</MessageList>
```

### Composition

`skeleton` shows a message as its own skeleton while it loads. Message and MessageList can render in React Server Components.

### Customize

The list is `env-message-list`, and each message `env-message`, with its author, `env-message-author`, and meta, `env-message-meta`, in its header, then its content, `env-message-content`, its actions, `env-message-actions`, and its status, `env-message-status`.

## Changelog

- **1.0.0**: Buttons in `actions` are small ghost buttons unless they set their own variant or size, and the statuses come from `messages.message`. The page is `message`, after the component, instead of `messages`. Message and MessageList can render in React Server Components.
- **0.5.0**: Message and MessageList, with `from`, `author`, `meta`, `actions`, `status` and `statusLabel`, and `busy` on the list.
