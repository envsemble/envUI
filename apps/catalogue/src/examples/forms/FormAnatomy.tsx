import { Alert, Button, Column, Link, Row, TextField } from '@envsemble/envui';

export default function FormAnatomy() {
  return (
    // A form after a refused submit: the summary at the top, the field's own error, the actions.
    <form noValidate onSubmit={(event) => event.preventDefault()}>
      <Column gap={5} style={{ inlineSize: 'min(100%, 26rem)' }}>
        <Alert tone="danger" title="There is a problem">
          <Link href="#anatomy-email">Enter an email address like name@example.com</Link>
        </Alert>
        <TextField
          id="anatomy-email"
          label="Email address"
          description="We send the invitation here."
          type="email"
          defaultValue="sam.lee@"
          error="Enter an email address like name@example.com"
        />
        <Row gap={3} wrap>
          <Button variant="primary" type="submit">
            Send invitation
          </Button>
          <Button variant="secondary">Cancel</Button>
        </Row>
      </Column>
    </form>
  );
}
