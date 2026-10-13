import { useEffect, useState } from 'react';
import { Composer, IconButton, Kbd, Text } from '@envsemble/envui';
import { AttachFile } from '@envsemble/envui/icons/AttachFile';
import { Example } from './Example';
import { Preview } from './Preview';

/** A reply that ends on its own after a few seconds, unless it is stopped first. */
function useSimulatedReply() {
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    const timer = setTimeout(() => setRunning(false), 4000);
    return () => clearTimeout(timer);
  }, [running]);
  return [running, setRunning] as const;
}

export function ComposerPreview() {
  const [draft, setDraft] = useState('');
  const [sent, setSent] = useState('');
  const [running, setRunning] = useSimulatedReply();
  const [comments, setComments] = useState(0);
  return (
    <Preview>
      <Example
        title="Message field"
        caption={
          <>
            <Kbd>Enter</Kbd> sends and <Kbd>Shift</Kbd>+<Kbd>Enter</Kbd> starts a new line. While
            the reply runs, the button stops it.
          </>
        }
      >
        <Composer
          aria-label="Message"
          placeholder="Ask anything"
          value={draft}
          onValueChange={setDraft}
          onSubmit={(text) => {
            setSent(text);
            setDraft('');
            setRunning(true);
          }}
          running={running}
          onStop={() => setRunning(false)}
        />
        <Text variant="caption" role="status">
          {running ? 'Replying…' : sent ? `Sent: ${sent}` : 'Nothing sent yet.'}
        </Text>
      </Example>
      <Example
        title="Start content and a footer"
        caption="Start content moves the button to an action row. The footer describes the field."
      >
        <Composer
          aria-label="Comment"
          placeholder="Add a comment"
          minRows={2}
          maxRows={6}
          start={
            <>
              <IconButton variant="text" icon={<AttachFile />} aria-label="Attach files" />
              <span>Design review</span>
            </>
          }
          footer={
            comments === 0
              ? 'Files up to 10 MB.'
              : `${comments} ${comments === 1 ? 'comment' : 'comments'} added.`
          }
          onSubmit={() => setComments((count) => count + 1)}
        />
      </Example>
    </Preview>
  );
}
