import { Button, Column, Grid, SearchField, TextField } from '@envsemble/envui';
import { Mail } from '@envsemble/envui/icons/Mail';

export default function FieldsBesideButtons() {
  return (
    <Column gap={4} style={{ inlineSize: 'min(100%, 28rem)' }}>
      <Grid columns="minmax(0, 1fr) auto" align="center" gap={3}>
        <TextField
          showLabel={false}
          label="Invite by e-mail"
          type="email"
          placeholder="name@example.com"
          startIcon={<Mail />}
        />
        <Button>Invite</Button>
      </Grid>
      <Grid columns="minmax(0, 1fr) auto" align="center" gap={3}>
        <SearchField
          variant="ghost"
          size="sm"
          label="Filter projects"
          placeholder="Filter projects"
        />
        <Button size="sm" variant="secondary">
          New project
        </Button>
      </Grid>
    </Column>
  );
}
