import { Button, Column, Row, TextField } from '@envsemble/envui';

export default function DisabledUntilValid() {
  return (
    <Column gap={4} style={{ inlineSize: 'min(100%, 14rem)' }}>
      <TextField label="Project name" variant="floating" />
      <Row gap={4} justify="end">
        <Button disabled>Create project</Button>
      </Row>
    </Column>
  );
}
