import { useState } from 'react';
import { Button, Select, Column, Surface, Text, TextField } from '@envsemble/envui';

const roleOptions = [
  { value: 'viewer', label: 'Viewer' },
  { value: 'editor', label: 'Editor' },
  { value: 'admin', label: 'Admin' },
];

export default function InviteMember() {
  const [invited, setInvited] = useState('');
  return (
    // As wide as a form column.
    <Surface padding={5} style={{ inlineSize: 'min(100%, 28rem)' }}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const role = roleOptions.find((option) => option.value === data.get('role'));
          setInvited(`Invited ${String(data.get('email'))} as ${role?.label ?? 'a member'}.`);
        }}
      >
        <Column gap={5}>
          <TextField label="E-mail address" name="email" type="email" required />
          <Select
            variant="outline"
            label="Role"
            name="role"
            description="Admins also manage members and billing."
            items={roleOptions}
            defaultValue="editor"
          />
          <Column gap={3} align="start">
            <Button type="submit">Send invitation</Button>
            <Text role="status">{invited}</Text>
          </Column>
        </Column>
      </form>
    </Surface>
  );
}
