import { useId, useState } from 'react';
import type { FormEvent } from 'react';
import { Button, Dialog, TextField } from '@envsemble/envui';

export default function ErrorInSecondDialog() {
  const formId = useId();
  const [email, setEmail] = useState('');
  const [invalid, setInvalid] = useState(false);
  const invite = (event: FormEvent) => {
    event.preventDefault();
    // Wrong: the error opens a dialog over the dialog, away from the field it is about.
    if (!email.includes('@')) setInvalid(true);
  };
  return (
    <Dialog
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
        title="Invalid input"
        description="Please check the form and try again."
        closeLabel="OK"
      />
    </Dialog>
  );
}
