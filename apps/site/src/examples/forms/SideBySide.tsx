import { Button, Column, Grid, TextField } from '@envsemble/envui';

export default function SideBySide() {
  return (
    // Two columns: the eye zigzags, and the field beside its path is easy to miss.
    <form noValidate onSubmit={(event) => event.preventDefault()}>
      <Column gap={4} style={{ inlineSize: 'min(100%, 22rem)' }}>
        <Grid columns={2} gap={4}>
          <TextField label="Full name" autoComplete="name" />
          <TextField label="Email address" type="email" autoComplete="email" />
          <TextField label="Phone number (optional)" type="tel" autoComplete="tel" />
        </Grid>
        <Button variant="primary" type="submit">
          Save details
        </Button>
      </Column>
    </form>
  );
}
