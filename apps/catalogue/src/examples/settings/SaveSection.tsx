import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { Badge, Button, Select, Column, Row, Surface, Text, TextField } from '@envsemble/envui';

interface Profile {
  name: string;
  email: string;
  timeZone: string | null;
}

export default function SaveSection() {
  const id = useId();
  // What is saved, and the edits people make to it until they save or cancel them.
  const [saved, setSaved] = useState<Profile>(initialProfile);
  const [draft, setDraft] = useState<Profile>(initialProfile);
  const [nameError, setNameError] = useState<string>();
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const nameField = useRef<HTMLInputElement>(null);
  const timer = useRef<number>(undefined);
  // Whether the section waits for the save it sent; Cancel stops waiting.
  const waiting = useRef(false);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const changed = !same(draft, saved);

  const edit = (patch: Partial<Profile>) => {
    setDraft((current) => ({ ...current, ...patch }));
    setStatus('');
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.name.trim()) {
      const message = 'Enter your display name';
      setNameError(message);
      // Focusing the field reads its error. After Enter in the field, focus is already there and
      // focusing it again reads nothing, so only then does the status say the error.
      if (document.activeElement === nameField.current) setStatus(message);
      else {
        setStatus('');
        nameField.current?.focus();
      }
      return;
    }
    setStatus('');
    setSaving(true);
    waiting.current = true;
    const before = saved;
    const sent = draft;
    // The profile is saved on a server; a timer stands in for it here.
    timer.current = window.setTimeout(() => {
      // The server saved what was sent, whether or not the section still waits for it.
      setSaved(sent);
      if (waiting.current) {
        waiting.current = false;
        setSaving(false);
        setStatus('Profile saved.');
        return;
      }
      // Cancel stopped waiting and put the old values back: show what the server saved instead,
      // unless people have edited since.
      setDraft((current) => (same(current, before) ? sent : current));
    }, 1000);
  };
  const cancel = () => {
    setNameError(undefined);
    if (saving) {
      // A save already sent can't be called back: Cancel stops waiting for it, and the section
      // shows what the server reports once it answers.
      waiting.current = false;
      setSaving(false);
      setDraft(saved);
      setStatus('Stopped waiting for the save.');
      return;
    }
    // With nothing to put back, Cancel has nothing to say.
    if (!changed) {
      setStatus('');
      return;
    }
    setDraft(saved);
    setStatus('Changes discarded.');
  };

  return (
    // The section's fields depend on each other, so they wait for Save; the rest of the settings
    // page keeps its own changes apart.
    <Surface
      background="default"
      render={<form noValidate aria-labelledby={`${id}-heading`} onSubmit={submit} />}
    >
      {/* envUI has no form column yet: one column, kept to a width that reads easily. */}
      <Column gap={5} style={{ maxInlineSize: '32rem' }}>
        <Row wrap align="center" gap={3}>
          <Text render={<h3 id={`${id}-heading`} />} variant="title">
            Profile
          </Text>
          {changed && <Badge tone="warning">Unsaved changes</Badge>}
        </Row>
        <TextField
          ref={nameField}
          label="Display name"
          name="name"
          autoComplete="name"
          value={draft.name}
          error={nameError}
          onValueChange={(name) => {
            edit({ name });
            if (name.trim()) setNameError(undefined);
          }}
        />
        <TextField
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
          description="Where Northwind sends your notifications."
          value={draft.email}
          onValueChange={(email) => edit({ email })}
        />
        <Select
          label="Time zone"
          // On a pane, the outline look keeps the trigger apart from the fill.
          variant="outline"
          name="timeZone"
          items={timeZones}
          value={draft.timeZone}
          onValueChange={(timeZone) => edit({ timeZone })}
        />
        <Row wrap gap={3}>
          <Button type="submit" pending={saving}>
            Save profile
          </Button>
          <Button variant="secondary" onClick={cancel}>
            Cancel
          </Button>
        </Row>
        <Text role="status" emphasis="muted">
          {status}
        </Text>
      </Column>
    </Surface>
  );
}

const same = (a: Profile, b: Profile) =>
  a.name === b.name && a.email === b.email && a.timeZone === b.timeZone;

const initialProfile: Profile = {
  name: 'Priya Shah',
  email: 'priya.shah@example.com',
  timeZone: 'Europe/London',
};

const timeZones = [
  { value: 'America/New_York', label: 'Eastern Time (New York)' },
  { value: 'Europe/London', label: 'Greenwich Mean Time (London)' },
  { value: 'Europe/Berlin', label: 'Central European Time (Berlin)' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (Tokyo)' },
];
