import { useId, useState } from 'react';
import type { FormEvent } from 'react';
import { Button, Dialog, TextField } from '@envsemble/envui';

export default function ErrorInSecondDialog() {
  const formId = useId();
  // Shown open in the docs after a send with a mistyped address; start empty and valid, with
  // useState('') and useState(false).
  const [email, setEmail] = useState('sam.lee@example');
  const [invalid, setInvalid] = useState(true);
  const invite = (event: FormEvent) => {
    event.preventDefault();
    // Wrong: the error opens a dialog over the dialog, away from the field it is about.
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) setInvalid(true);
  };
  return (
    <Dialog
      // Shown open in the docs; without defaultOpen, it opens from its trigger.
      defaultOpen
      trigger={<Button variant="secondary">Invite member</Button>}
      title="Invite member"
      closeLabel="Cancel"
      actions={
        <Button type="submit" form={formId}>
          Send invitation
        </Button>
      }
    >
      <form id={formId} onSubmit={invite} noValidate>
        <TextField
          label="Email address"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </form>
      <Dialog
        open={invalid}
        onOpenChange={setInvalid}
        // Near the top, so the dialog under it still shows.
        placement="top"
        title="Invalid input"
        description="Please check the form and try again."
        closeLabel="OK"
      />
    </Dialog>
  );
}
