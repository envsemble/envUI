import { useState } from 'react';
import { Button, Popover, Column, Row, Text, TextField } from '@envsemble/envui';
import { Edit } from '@envsemble/envui/icons/Edit';

export default function RenameInPlace() {
  const [name, setName] = useState('Launch plan.md');
  return (
    <Column gap={3} align="start">
      <Text>{name}</Text>
      <Popover
        aria-label="Rename document"
        width="lg"
        trigger={
          <Button variant="secondary" startIcon={<Edit />}>
            Rename
          </Button>
        }
      >
        {(close) => (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setName(String(new FormData(event.currentTarget).get('name')));
              close();
            }}
          >
            <Column gap={4}>
              <TextField variant="floating" label="Name" name="name" defaultValue={name} required />
              <Row wrap align="center" gap={4} justify="end">
                <Button variant="secondary" onClick={close}>
                  Cancel
                </Button>
                <Button type="submit">Rename</Button>
              </Row>
            </Column>
          </form>
        )}
      </Popover>
    </Column>
  );
}
