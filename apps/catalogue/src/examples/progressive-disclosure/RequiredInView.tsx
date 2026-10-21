import { Button, Checkbox, Column, Disclosure, TextField } from '@envsemble/envui';

export default function RequiredInView() {
  return (
    // What every export needs stays in view; only the optional settings wait behind the summary.
    <form noValidate onSubmit={(event) => event.preventDefault()}>
      <Column gap={4} style={{ inlineSize: 'min(100%, 20rem)' }}>
        <TextField label="File name" defaultValue="quarterly-report" />
        <Disclosure title="Advanced options">
          <Checkbox label="Include archived projects" />
        </Disclosure>
        <Button variant="primary" type="submit">
          Export
        </Button>
      </Column>
    </form>
  );
}
