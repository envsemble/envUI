---
title: Message
summary: 'Chat messages: yours as bubbles, others at full width.'
status: stable
since: 1.0.0
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
  - text: The field where people write and send the next message.
    use: Composer
  - text: Items people scan, open and act on, such as a list of conversations.
    use: List
  - text: A short notification that comes and goes, such as Message sent.
    use: ToastProvider
components:
  - Message
  - MessageList
examples:
  Conversation: overview
  FormattedAnswer: variants
  MessageAnatomy: anatomy
  DeliveryStatus: example
  CommentThread: example
  BubbleWidth: example
---

# Message

## Variants

```tsx figure=FormattedAnswer

```

1. **Yours**
2. **Someone else's**

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

```tsx figure=DeliveryStatus motion

```

### Avatars and rich authors

```tsx figure=CommentThread

```

### Adapting to width

```tsx figure=BubbleWidth widths="20 40" sweep

```
