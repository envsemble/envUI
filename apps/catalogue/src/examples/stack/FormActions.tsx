import { ActionGroup, Button, Stack, TextField } from '@envsemble/envui';

export default function FormActions() {
  return (
    // render lays the form out as the stack, without a wrapper.
    <Stack gap={5} render={<form onSubmit={(event) => event.preventDefault()} />}>
      <TextField label="Project name" defaultValue="Northwind launch" />
      <ActionGroup as="footer" align="end">
        <Button variant="secondary">Cancel</Button>
        <Button type="submit">Save changes</Button>
      </ActionGroup>
    </Stack>
  );
}
