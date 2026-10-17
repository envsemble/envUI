import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { Badge, Button, Select, Stack, Surface, Text, TextField } from '@envsemble/envui';

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
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const changed =
    draft.name !== saved.name || draft.email !== saved.email || draft.timeZone !== saved.timeZone;

  const edit = (patch: Partial<Profile>) => {
    setDraft((current) => ({ ...current, ...patch }));
    setStatus('');
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.name.trim()) {
      const message = 'Enter your display name';
      setNameError(message);
      // Focus may already be in the field, where focusing it again reads nothing, so the status
      // says the error too.
      setStatus(message);
      nameField.current?.focus();
      return;
    }
    setStatus('');
    setSaving(true);
    // The profile is saved on a server; a timer stands in for it here.
    timer.current = window.setTimeout(() => {
      setSaving(false);
      setSaved(draft);
      setStatus('Profile saved.');
    }, 1000);
  };
  const cancel = () => {
    // Cancel during a save stops it, so the edits it was saving are discarded too.
    window.clearTimeout(timer.current);
    setSaving(false);
    setNameError(undefined);
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
      <Stack gap={5} style={{ maxInlineSize: '32rem' }}>
        <Stack direction="row" wrap align="center" gap={3}>
          <Text render={<h3 id={`${id}-heading`} />} variant="title">
            Profile
          </Text>
          {changed && <Badge tone="warning">Unsaved changes</Badge>}
        </Stack>
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
        <Stack direction="row" wrap gap={3}>
          <Button type="submit" pending={saving}>
            Save profile
          </Button>
          <Button variant="secondary" onClick={cancel}>
            Cancel
          </Button>
        </Stack>
        <Text role="status" emphasis="muted">
          {status}
        </Text>
      </Stack>
    </Surface>
  );
}

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
