import { Button, Column, Row, TextField } from '@envsemble/envui';

export default function DisabledUntilValid() {
  return (
    <Column gap={4}>
      <TextField label="Project name" />
      <Row gap={4} justify="end">
        <Button disabled>Create project</Button>
      </Row>
    </Column>
  );
}
