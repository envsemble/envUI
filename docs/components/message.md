# Message

## React usage

```tsx
import { Button, Composer, IconButton, Message, MessageList } from '@envsemble/envui';
import { Markdown } from '@envsemble/envui/content';
import { ContentCopy } from '@envsemble/envui/icons/ContentCopy';

<MessageList aria-label="Conversation with Aurora">
  {messages.map((message) =>
    message.mine ? (
      <Message
        key={message.id}
        from="self"
        meta={message.time}
        status={message.status}
        actions={
          message.status === 'failed' && (
            <Button variant="text" onClick={() => resend(message)}>
              Retry
            </Button>
          )
        }
      >
        {message.text}
      </Message>
    ) : (
      <Message
        key={message.id}
        from="other"
        author="Aurora"
        meta={message.time}
        actions={
          <IconButton
            variant="text"
            icon={<ContentCopy />}
            aria-label="Copy answer"
            onClick={() => copy(message.text)}
          />
        }
      >
        <Markdown>{message.text}</Markdown>
      </Message>
    ),
  )}
</MessageList>

<Composer
  aria-label="Message Aurora"
  placeholder="Ask anything"
  onSubmit={send}
  running={replying}
  onStop={stopReply}
/>
```

### Props & contracts

| Name                   | Contract                                                                                                             |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------- |
| MessageList            | A log of messages in order; assistive technology politely announces messages added anywhere in it and changed text   |
| MessageList busy       | Messages are still changing, such as a reply streaming in or earlier messages loading; the log reports aria-busy     |
| MessageList aria-label | Name of the conversation, or aria-labelledby                                                                         |
| Message from           | self: written by the person using the app, a bubble at the inline end; other: full-width content without a bubble    |
| Message children       | The message; plain text keeps its line breaks, and formatted content such as Markdown fills an other message's width |
| Message author / meta  | Who wrote it and supporting facts such as the time, above the message                                                |
| Message actions        | Small actions below the message, such as copy or retry, at the compact control size, or the touch size on touch      |
| Message status         | sending shows a spinner and failed an error icon, each with its text                                                 |
| Message statusLabel    | Text of the status; Sending or Not sent by default                                                                   |
| Native element props   | MessageList takes div attributes and Message article attributes, including className and ref                         |

## Guidelines

- Use MessageList and Message for a chat or comment thread, with a Composer below for the next message. Each message is an article, in the order it was written.
- Messages from the person using the app are compact bubbles at the inline end, in the row tone. Messages from others, such as an assistant or another participant, are content without a bubble, so long formatted answers with lists, tables and code keep their full width.
- Show author and meta where they help, such as the time or the name of each participant in a group. Keep actions to the few that matter for a message, such as copy and retry, and give icon actions accessible names.
- Mark a message that is still on its way with status sending, and one that could not be sent with failed and a retry action. The status shows an icon and text, so it never depends on color.
- The list is a log: assistive technology politely announces messages added anywhere in it, including earlier messages loaded at its start, and text that changes, such as each step of a streaming reply. Set busy while a reply streams in or earlier messages load, and clear it when they are complete; the log reports aria-busy, so assistive technology can wait for the finished change instead of announcing every step.
- The list keeps messages readable at narrow widths: bubbles grow to most of a narrow column and long words wrap. Scrolling and loading earlier messages belong to the application.

TypeScript declarations provide the complete public API.

## Related topics

- [Composer](../components/composer.md)
- [Markdown](../components/markdown.md)
- [Loading](../patterns/loading.md)
- [Accessibility](../foundations/accessibility.md)
