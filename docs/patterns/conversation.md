---
title: Conversation
summary: Talk with an assistant or with other people, and follow each reply as it arrives.
status: beta
since: 1.0.0
intent: Keep people informed
aliases:
  - chat
  - AI chat
  - assistant chat
  - chatbot
  - chat window
  - chat panel
  - conversation view
  - streaming reply
  - stop generating
  - messaging
  - support chat
useWhen:
  - A chat with an assistant whose replies stream in
  - Messages between people, such as a support chat or a team thread
avoidWhen:
  - text: Comments on one item, read more often than written.
    use: Message
  - text: A short notice that comes and goes, such as Message sent.
    use: Toast
  - text: Several answers given together and submitted once.
    see: forms
composes:
  - MessageList
  - Message
  - Composer
  - Markdown
  - Button
  - CopyButton
  - IconButton
  - Spinner
  - Column
  - Grid
  - Row
  - Text
examples:
  AssistantChat: overview
  BetweenPeople: example
  ConversationAnatomy: anatomy
  FirstMessage: example
  StoppedReply: example
  FailedSend: example
  ReplyAsItArrives:
    role: do
    caption: The reply in the log as it arrives, so people read while it is written.
  WholeReplyAtOnce:
    role: dont
    caption: 'A spinner until the whole reply is ready: people wait with nothing to read.'
---

# Conversation

## Variants

### Between people

Each message from someone else names its author and time.

- Replies arrive whole, so there is nothing to stop.
- A message on its way says so until the server takes it.

```tsx figure=BetweenPeople

```

## Anatomy

```tsx figure=ConversationAnatomy

```

1. **Log** (`env-message-list`)
2. **Formatted reply** (`env-markdown`)
3. **Reply actions** (`env-message-actions`)
4. **Your message** (`env-message:last-child`)
5. **Composer** (`env-composer`)
6. **Send or stop** (`env-composer-action`)

The log of [messages](../components/message.md) takes the space and scrolls, and the [composer](../components/composer.md) stays at its foot, so the draft is always in reach.

- An assistant's answers are [formatted text](../components/markdown.md).
- Copy comes once an answer is complete.

## Behaviour

### The first message

Before anything is said, the log's place holds a short question and a few suggestions.

- Pressing one sends it as the first message.
- The composer is there from the start.

```tsx figure=FirstMessage motion

```

### A reply as it arrives

An assistant's reply shows in the log at once and grows as it is written.

- While it runs, the composer's send button is Stop.
- Copy waits until the reply is complete.

<!-- specimen: ReplyAsItArrives -->

### Stopping a reply

Stop keeps what has arrived, marked as stopped, with Try again beside it. People can also simply write their next message.

```tsx figure=StoppedReply motion

```

### When a send fails

The message stays in the log where it was written, marked as not sent, with Try again beside it.

- Nothing people wrote is lost.
- The composer is free for the next message.

```tsx figure=FailedSend motion

```

### Scrolling

While people are at the end of the log, each new line keeps the newest in view.

- Once they scroll up to read, the log stays where they are.
- A Latest button takes them back to the end.

<!-- specimen: ScrollingTheLog -->

## Rules

A conversation shows what happens to a reply in the log itself, where people are reading.

```tsx figure=ReplyAsItArrives motion

```

```tsx figure=WholeReplyAtOnce motion

```

### When a reply fails

Say so in the log, in the reply's place, keep any part that arrived, and offer Try again. A notice that comes and goes is easy to miss, and leaves a gap in the conversation.

### One column

Keep the conversation one column that reads easily, even in a wide window, with the composer as wide as the log above it.

### Content

Name the assistant plainly, and say in words what happens around a reply.

- Suggestions written as whole questions, "What is still open for the launch?"
- "Stopped" on a reply people stopped, with "Try again"
- "Copy answer" as the name of the copy action

## Accessibility

### Focus and keyboard

Focus stays in the composer after a send, while a reply runs and after Stop, so people keep writing without looking for the field.

- The log announces each new message once it is complete.
- <kbd>Tab</kbd> reaches the log and its actions before the composer.
- Where an action leaves as it is pressed, such as Try again, focus goes back to the composer.

### envUI provides

- MessageList as a polite log, with `aria-busy` while `busy`, so a streaming reply is announced once it is complete.
- A send button that becomes Stop while `running`, keeps its place and focus, and doesn't send on <kbd>Enter</kbd>.
- Focus back in the composer after each send, and the status of a message as text beside its icon.

### You provide

- A name for the log and for the composer, such as Conversation with the assistant and Message the assistant.
- `busy` on the log and `running` on the composer while a reply streams, and stopping the request in `onStop`.
- Keeping the newest message in view without moving focus, `tabIndex={0}` on a log that scrolls, and focus on the composer when an action leaves, such as Try again or a suggestion.

## Compose

### Usage

A conversation is a MessageList above a Composer, in a Column of a set height: the list takes the space and scrolls, and the composer sits at its foot.

- Each entry is a Message, `from="self"` for the person using the app and `from="other"` for an assistant or anyone else.
- An assistant's text renders through Markdown, from `@envsemble/envui/content`.
- CopyButton in `actions` copies a complete answer.

```tsx source=AssistantChat

```

#### Streaming and stopping

Add the reply to the log as soon as the request starts, and append each chunk to its text as it arrives. Set `busy` on MessageList and `running` on Composer until it ends: the log waits to announce the reply, and the send button becomes Stop, which calls `onStop`. Abort the request there, keep the text that arrived, and mark the reply, such as `meta="Stopped"`, with a Try again action.

```tsx
async function ask(question: string) {
  const controller = new AbortController();
  request.current = controller;
  const id = addReply(''); // The reply's entry, in the log from the start.
  setRunning(true);
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ question }),
      signal: controller.signal,
    });
    const reader = response.body!.pipeThrough(new TextDecoderStream()).getReader();
    for (let chunk = await reader.read(); !chunk.done; chunk = await reader.read())
      appendToReply(id, chunk.value);
  } catch {
    // Stop aborts the request; anything else failed. Both keep the text that arrived.
    markReply(id, controller.signal.aborted ? 'stopped' : 'failed');
  } finally {
    setRunning(false);
  }
}

<MessageList aria-label="Conversation with the assistant" busy={running}>…</MessageList>
<Composer
  aria-label="Message the assistant"
  onSend={send}
  running={running}
  onStop={() => request.current?.abort()}
/>
```

#### A failed send

Keep a message that couldn't be sent in the log, with `status="failed"` and a Try again Button in `actions`; set `status="sending"` while it goes again, and clear it once the server takes it. Try again leaves with the failure, so move focus to the composer through its `ref`, as the FailedSend example does.

```tsx
<Message
  from="self"
  status={entry.status}
  actions={
    entry.status === 'failed' && (
      <Button
        variant="text"
        onClick={() => {
          deliver(entry.id);
          composer.current?.focus();
        }}
      >
        Try again
      </Button>
    )
  }
>
  {entry.text}
</Message>
```

#### Scrolling

The list doesn't scroll by itself. Give it `overflowY: 'auto'` and `tabIndex={0}`, track whether people are at its end in `onScroll`, and while they are, scroll to the end in a layout effect each time the entries change, without moving focus. When they aren't, show a Latest button that scrolls to the end, smoothly unless people prefer reduced motion.

```tsx
const [atEnd, setAtEnd] = useState(true);
useLayoutEffect(() => {
  if (atEnd && log.current) log.current.scrollTop = log.current.scrollHeight;
}, [entries, atEnd]);

<MessageList
  ref={log}
  tabIndex={0}
  onScroll={({ currentTarget: node }) =>
    setAtEnd(node.scrollHeight - node.scrollTop - node.clientHeight < 24)
  }
  style={{ overflowY: 'auto' }}
>
  …
</MessageList>;
```

#### The first message

Render the MessageList from the start, empty, so the log exists before the first message and announces it.

- Put the welcome in the same Grid cell, a heading and suggestion Buttons in a Row.
- A suggestion sends its text and focuses the composer, since the suggestions leave with the first message.

```tsx
<Grid style={{ gridTemplateRows: 'minmax(0, 1fr)' }}>
  <MessageList aria-label="Conversation with the assistant" style={{ gridArea: '1 / 1' }}>
    {messages}
  </MessageList>
  {entries.length === 0 && (
    <Column align="center" justify="center" gap={4} style={{ gridArea: '1 / 1' }}>
      <Text variant="title" render={<h3 />}>
        What can I help with?
      </Text>
      <Row wrap gap={2} justify="center">
        {suggestionButtons}
      </Row>
    </Column>
  )}
</Grid>
```

### Composition

The Column holds a Grid of one cell, whose row is `minmax(0, 1fr)`, with the MessageList and the Latest button in it, the button aligned to the end and centred over the log; then the Composer. An assistant's message takes `author`, Markdown as its content and CopyButton in `actions` once complete; your own messages take neither author nor actions. Between people, every message from someone else has its `author` and its time in `meta`, your own carry `status` while they are sent, and the composer's `start` can hold an attach IconButton. A placeholder reply while the first words are awaited is the reply's own skeleton, `skeleton` on its Message, never a Spinner in its place.

## Changelog

- **1.0.0**: The pattern.
