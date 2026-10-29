import { useState } from 'react';
import { Composer, IconButton, Surface, Theme, type ThemeValue } from '@envsemble/envui';
import { AttachFile } from '@envsemble/envui/icons/AttachFile';

export function ComposerFixture({ theme }: { theme: ThemeValue }) {
  const [draft, setDraft] = useState('');
  const [sent, setSent] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [stops, setStops] = useState(0);
  const [notes, setNotes] = useState<string[]>([]);
  const [posts, setPosts] = useState<string[]>([]);
  const [announcements, setAnnouncements] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string[]>([]);
  const [detached, setDetached] = useState({ posts: [] as string[], pending: false });
  return (
    <Theme theme={theme} data-testid={`composer-${theme}`} className="fixture-section">
      <div data-surface="canvas">
        <Composer
          aria-label={`Message ${theme}`}
          placeholder="Ask anything"
          value={draft}
          onValueChange={setDraft}
          onSend={(value) => {
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
      <Surface background="default" padding={4} data-surface="pane">
        <Composer
          aria-label={`Note ${theme}`}
          defaultValue="Draft note"
          minRows={2}
          maxRows={4}
          start={<IconButton variant="text" icon={<AttachFile />} aria-label="Attach files" />}
          description="Attachments up to 10 MB"
          onSend={(value) => setNotes((list) => [...list, value])}
        />
      </Surface>
      <output data-testid={`composer-notes-${theme}`}>{notes.join(' | ')}</output>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const message = new FormData(event.currentTarget).get('message');
          setPosts((list) => [...list, String(message)]);
        }}
      >
        <Composer aria-label={`Comment ${theme}`} name="message" />
        <button type="reset">Reset form {theme}</button>
      </form>
      <output data-testid={`composer-posts-${theme}`}>{posts.join(' | ')}</output>
      <form
        action={async (data) => {
          setAnnouncements((list) => [...list, String(data.get('announcement'))]);
          await new Promise((resolve) => setTimeout(resolve, 600));
        }}
      >
        <Composer aria-label={`Announcement ${theme}`} name="announcement" />
      </form>
      <output data-testid={`composer-announcements-${theme}`}>{announcements.join(' | ')}</output>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          setFeedback((list) => [...list, `${data.get('topic')}: ${data.get('feedback')}`]);
        }}
      >
        <input name="topic" required aria-label={`Topic ${theme}`} />
        <Composer aria-label={`Feedback ${theme}`} name="feedback" />
      </form>
      <output data-testid={`composer-feedback-${theme}`}>{feedback.join(' | ')}</output>
      <form
        id={`detached-form-${theme}`}
        onSubmit={(event) => {
          event.preventDefault();
          const note = String(new FormData(event.currentTarget).get('detached'));
          setDetached((current) => ({ posts: [...current.posts, note], pending: true }));
        }}
      />
      <Composer
        aria-label={`Detached ${theme}`}
        name="detached"
        form={`detached-form-${theme}`}
        pending={detached.pending}
      />
      <output data-testid={`composer-detached-${theme}`}>{detached.posts.join(' | ')}</output>
      <button
        type="button"
        onClick={() => setDetached((current) => ({ ...current, pending: false }))}
      >
        Finish request {theme}
      </button>
      <Composer aria-label={`Disabled ${theme}`} defaultValue="Locked" disabled />
      <Composer
        aria-label={`Reply ${theme}`}
        defaultValue="Thanks, that works."
        start={<span data-testid={`composer-reply-to-${theme}`}>Replying to Aurora</span>}
      />
    </Theme>
  );
}
