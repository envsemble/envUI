import { useState } from 'react';
import {
  Button,
  Composer,
  IconButton,
  Message,
  MessageList,
  Surface,
  Theme,
  type ColorScheme,
} from '@envsemble/envui';
import { IconContentCopy } from '@envsemble/envui/icons/ContentCopy';

export function MessagesFixture({ theme }: { theme: ColorScheme }) {
  const [copied, setCopied] = useState(0);
  const [retried, setRetried] = useState(0);
  const [sent, setSent] = useState<string[]>([]);
  const [reply, setReply] = useState('');
  const [replying, setReplying] = useState(false);
  return (
    <Theme theme={theme} data-testid={`messages-${theme}`} className="fixture-section">
      <div data-surface="canvas">
        <MessageList aria-label={`Conversation ${theme}`}>
          <Message from="self" meta="09:41">
            {'Summarize the quarterly report\nand list the open risks.'}
          </Message>
          <Message
            from="other"
            author="Aurora"
            meta="09:41"
            actions={
              <IconButton
                variant="text"
                icon={<IconContentCopy />}
                aria-label="Copy answer"
                onClick={() => setCopied((count) => count + 1)}
              />
            }
          >
            <p>Revenue grew in every region this quarter. Two risks stay open:</p>
            <ul>
              <li>The design-system/tokens migration is behind schedule.</li>
              <li>Support hiring trails the plan by two people.</li>
            </ul>
          </Message>
          <Message from="self" status="sending">
            Draft the summary for the team
          </Message>
          <Message
            from="self"
            status="failed"
            actions={
              <Button variant="text" onClick={() => setRetried((count) => count + 1)}>
                Retry
              </Button>
            }
          >
            {'A'.repeat(90)}
          </Message>
          <Message from="self" status="failed" statusLabel="Could not deliver">
            Ping the reviewers
          </Message>
          {sent.map((text, index) => (
            <Message key={index} from="self">
              {text}
            </Message>
          ))}
        </MessageList>
        <Composer
          aria-label={`Reply ${theme}`}
          onSend={(text) => setSent((messages) => [...messages, text])}
        />
      </div>
      <output data-testid={`messages-copied-${theme}`}>{copied}</output>
      <output data-testid={`messages-retried-${theme}`}>{retried}</output>
      <Surface background="default" padding={4} data-surface="pane">
        <MessageList aria-label={`Pane conversation ${theme}`} busy={replying} busyAuthor="Aurora">
          <Message from="self">On a pane</Message>
          <Message from="other" author="Aurora">
            Answers read as plain content.
          </Message>
          {reply !== '' && (
            <Message from="other" author="Aurora">
              {reply}
            </Message>
          )}
        </MessageList>
      </Surface>
      <Button
        onClick={() => {
          setReplying(true);
          setReply('The summary');
        }}
      >
        Start reply {theme}
      </Button>
      <Button
        onClick={() => {
          setReply('The summary is ready.');
          setReplying(false);
        }}
      >
        Finish reply {theme}
      </Button>
      {/* Actions without a variant or size of their own take the message's defaults. */}
      <div data-surface="canvas">
        <MessageList aria-label={`Defaults ${theme}`}>
          <Message
            from="other"
            author="Sam Lee"
            actions={
              <>
                <IconButton icon={<IconContentCopy />} aria-label={`Copy note ${theme}`} />
                <Button>Reply</Button>
              </>
            }
          >
            A note with default actions.
          </Message>
        </MessageList>
      </div>
    </Theme>
  );
}
