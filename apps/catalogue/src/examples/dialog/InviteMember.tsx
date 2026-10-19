import { useId, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Button, Dialog, Select, Stack, Text, TextField } from '@envsemble/envui';

const roles = [
  { value: 'member', label: 'Member' },
  { value: 'admin', label: 'Admin' },
];

export default function InviteMember() {
  const formId = useId();
  const emailField = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState('');
  const openChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      setEmail('');
      setError(undefined);
    }
  };
  const invite = (event: FormEvent) => {
    event.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('Enter an email address such as sam.lee@example.com.');
      emailField.current?.focus();
      return;
    }
    setSending(true);
    // Sending takes a moment; a timer stands in for it here.
    window.setTimeout(() => {
      setSending(false);
      setOpen(false);
      setResult(`Invitation sent to ${email}`);
    }, 1500);
  };
  return (
    <Stack align="start">
      <Dialog
        open={open}
        onOpenChange={openChange}
        trigger={<Button variant="secondary">Invite member</Button>}
        title="Invite member"
        description="They get an email with a link to join Northwind."
        closeLabel="Cancel"
        pending={sending}
        actions={
          <Button type="submit" form={formId} pending={sending}>
            Send invitation
          </Button>
        }
      >
        <form id={formId} onSubmit={invite} noValidate>
          <Stack gap={4}>
            <TextField
              ref={emailField}
              label="Email address"
              type="email"
              name="email"
              autoComplete="off"
              value={email}
              error={error}
              onChange={(event) => {
                setEmail(event.target.value);
                setError(undefined);
              }}
            />
            <Select
              variant="outline"
              label="Role"
              name="role"
              description="Admins also manage members and billing."
              items={roles}
              defaultValue="member"
            />
          </Stack>
        </form>
      </Dialog>
      <Text role="status">{result}</Text>
    </Stack>
  );
}
