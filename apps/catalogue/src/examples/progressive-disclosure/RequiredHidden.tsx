import { Button, Checkbox, Column, Disclosure, TextField } from '@envsemble/envui';

export default function RequiredHidden() {
  return (
    // The file name every export needs waits behind a closed summary with the optional settings.
    <form noValidate onSubmit={(event) => event.preventDefault()}>
      <Column gap={4} style={{ inlineSize: 'min(100%, 20rem)' }}>
        <Disclosure title="Export settings">
          <Column gap={4}>
            <TextField label="File name" />
            <Checkbox label="Include archived projects" />
          </Column>
        </Disclosure>
        <Button variant="primary" type="submit">
          Export
        </Button>
      </Column>
    </form>
  );
}
