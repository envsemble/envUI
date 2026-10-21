import { Button, Column, Row, TextField } from '@envsemble/envui';

export default function FormActions() {
  return (
    // render lays the form out as the column, without a wrapper.
    <Column gap={5} render={<form onSubmit={(event) => event.preventDefault()} />}>
      <TextField label="Project name" defaultValue="Northwind launch" />
      <Row wrap align="center" gap={4} render={<footer />} justify="end">
        <Button variant="secondary">Cancel</Button>
        <Button type="submit">Save changes</Button>
      </Row>
    </Column>
  );
}
