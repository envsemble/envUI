import { Button, SearchField, Column, TextField } from '@envsemble/envui';
import { Mail } from '@envsemble/envui/icons/Mail';

/** A toolbar row: the field takes the room the button leaves. */
const toolbar = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  alignItems: 'center',
  gap: '0.75rem',
} as const;

export default function FieldsBesideButtons() {
  return (
    <Column gap={4} style={{ inlineSize: 'min(100%, 28rem)' }}>
      <div style={toolbar}>
        <TextField
          showLabel={false}
          label="Invite by e-mail"
          type="email"
          placeholder="name@example.com"
          startIcon={<Mail />}
        />
        <Button>Invite</Button>
      </div>
      <div style={toolbar}>
        <SearchField label="Filter projects" showLabel />
        <Button variant="secondary">New project</Button>
      </div>
    </Column>
  );
}
