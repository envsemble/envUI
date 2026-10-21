import { Button, Column, TextField } from '@envsemble/envui';

export default function OneColumn() {
  return (
    // One column: people read each field in turn and reach the button after the last.
    <form noValidate onSubmit={(event) => event.preventDefault()}>
      <Column gap={4} style={{ inlineSize: 'min(100%, 18rem)' }}>
        <TextField label="Full name" autoComplete="name" />
        <TextField label="Email address" type="email" autoComplete="email" />
        <TextField label="Phone number (optional)" type="tel" autoComplete="tel" />
        <Button variant="primary" type="submit">
          Save details
        </Button>
      </Column>
    </form>
  );
}
