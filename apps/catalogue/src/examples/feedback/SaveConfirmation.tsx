import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Button, Select, Stack, Text, TextField, Toast, useToast } from '@envsemble/envui';
import { Send } from '@envsemble/envui/icons/Send';

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

function InviteForm() {
  const toast = useToast();
  const [email, setEmail] = useState('jordan.kim@example.com');
  const [error, setError] = useState<string>();
  // Says a refused submit's error where focus can't: the outcome itself goes in the toast.
  const [status, setStatus] = useState('');
  const [sending, setSending] = useState(false);
  const field = useRef<HTMLInputElement>(null);
  const timer = useRef<number>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isEmail(email)) {
      // A problem with a field shows on the field, never in a toast.
      const message = 'Enter an email address like name@example.com';
      setError(message);
      // After Enter in the field, focus is already there and focusing it again reads nothing, so
      // the status says the error too.
      setStatus(message);
      field.current?.focus();
      return;
    }
    setStatus('');
    setSending(true);
    // The invitation goes to a server; a timer stands in for it here.
    timer.current = window.setTimeout(() => {
      setSending(false);
      // People started this, so a short success notification is enough; it closes by itself.
      toast.show({ tone: 'success', message: `Invitation sent to ${email.trim()}.` });
      setEmail('');
    }, 1000);
  };

  return (
    <form noValidate onSubmit={submit}>
      {/* envUI has no form column yet: one column, kept to a width that reads easily. */}
      <Stack gap={5} style={{ maxInlineSize: '32rem' }}>
        <TextField
          ref={field}
          label="Email address"
          type="email"
          name="email"
          autoComplete="off"
          spellCheck={false}
          value={email}
          error={error}
          onValueChange={(value) => {
            setEmail(value);
            if (isEmail(value)) {
              setError(undefined);
              setStatus('');
            }
          }}
        />
        <Select label="Role" name="role" defaultValue="editor" items={roles} />
        <Stack direction="row" wrap gap={3}>
          {/* The button shows the work while it runs; the toast says how it ended. */}
          <Button type="submit" startIcon={<Send />} pending={sending}>
            Send invitation
          </Button>
        </Stack>
        <Text role="status" emphasis="muted">
          {status}
        </Text>
      </Stack>
    </form>
  );
}

export default function SaveConfirmation() {
  // An application has one Toast.Provider at its root; the example brings its own.
  return (
    <Toast.Provider>
      <InviteForm />
    </Toast.Provider>
  );
}

const roles = [
  { value: 'viewer', label: 'Viewer' },
  { value: 'editor', label: 'Editor' },
  { value: 'owner', label: 'Owner' },
];
