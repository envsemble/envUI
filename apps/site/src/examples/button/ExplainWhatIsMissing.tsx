import { useState } from 'react';
import { Button, Column, Row, TextField } from '@envsemble/envui';

export default function ExplainWhatIsMissing() {
  const [name, setName] = useState('');
  const [tried, setTried] = useState(false);
  const create = () => {
    // Pressed without a name, the field says what is missing; with one, the project is created.
    if (!name.trim()) {
      setTried(true);
      return;
    }
    setName('');
    setTried(false);
  };
  return (
    <Column gap={4}>
      <TextField
        label="Project name"
        value={name}
        onValueChange={setName}
        error={tried && !name.trim() ? 'Enter a name for the project.' : undefined}
      />
      <Row gap={4} justify="end">
        <Button onClick={create}>Create project</Button>
      </Row>
    </Column>
  );
}
