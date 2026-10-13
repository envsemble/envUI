import { useState } from 'react';
import { Composer, IconButton, Surface, Theme, type ThemeValue } from '@envsemble/envui';
import { AttachFile } from '@envsemble/envui/icons/AttachFile';

export function ComposerFixture({ theme }: { theme: ThemeValue }) {
  const [draft, setDraft] = useState('');
  const [sent, setSent] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [stops, setStops] = useState(0);
  const [notes, setNotes] = useState<string[]>([]);
  return (
    <Theme theme={theme} data-testid={`composer-${theme}`} className="fixture-section">
      <div data-surface="canvas">
        <Composer
          aria-label={`Message ${theme}`}
          placeholder="Ask anything"
          value={draft}
          onValueChange={setDraft}
          onSubmit={(value) => {
            setSent((messages) => [...messages, value]);
            setDraft('');
            setRunning(true);
          }}
          running={running}
          onStop={() => {
            setRunning(false);
            setStops((count) => count + 1);
          }}
          maxLength={400}
        />
      </div>
      <output data-testid={`composer-sent-${theme}`}>{sent.join(' | ')}</output>
      <output data-testid={`composer-stops-${theme}`}>{stops}</output>
      <Surface tone="pane" padding={4} data-surface="pane">
        <Composer
          aria-label={`Note ${theme}`}
          defaultValue="Draft note"
          minRows={2}
          maxRows={4}
          start={<IconButton variant="text" icon={<AttachFile />} aria-label="Attach files" />}
          footer="Attachments up to 10 MB"
          onSubmit={(value) => setNotes((list) => [...list, value])}
        />
      </Surface>
      <output data-testid={`composer-notes-${theme}`}>{notes.join(' | ')}</output>
      <Composer aria-label={`Disabled ${theme}`} defaultValue="Locked" disabled />
      <Composer
        aria-label={`Reply ${theme}`}
        defaultValue="Thanks, that works."
        start={<span data-testid={`composer-reply-to-${theme}`}>Replying to Aurora</span>}
      />
    </Theme>
  );
}
