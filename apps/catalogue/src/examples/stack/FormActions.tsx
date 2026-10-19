import { Button, Stack, TextField } from '@envsemble/envui';

export default function FormActions() {
  return (
    // render lays the form out as the stack, without a wrapper.
    <Stack gap={5} render={<form onSubmit={(event) => event.preventDefault()} />}>
      <TextField label="Project name" defaultValue="Northwind launch" />
      <Stack direction="row" wrap align="center" gap={4} render={<footer />} justify="end">
        <Button variant="secondary">Cancel</Button>
        <Button type="submit">Save changes</Button>
      </Stack>
    </Stack>
  );
}
