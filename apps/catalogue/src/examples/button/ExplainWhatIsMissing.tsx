import { Button, Column, Row, TextField } from '@envsemble/envui';

export default function ExplainWhatIsMissing() {
  return (
    <Column gap={4}>
      <TextField label="Project name" error="Enter a name for the project." />
      <Row gap={4} justify="end">
        <Button>Create project</Button>
      </Row>
    </Column>
  );
}
