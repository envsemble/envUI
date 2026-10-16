import { useState } from 'react';
import { Button, Popover, Stack, Text, TextField } from '@envsemble/envui';
import { Edit } from '@envsemble/envui/icons/Edit';

export default function RenameInPlace() {
  const [name, setName] = useState('Launch plan.md');
  return (
    <Stack gap={3} align="start">
      <Text>{name}</Text>
      <Popover
        aria-label="Rename document"
        width="wide"
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
            <Stack gap={4}>
              <TextField label="Name" name="name" defaultValue={name} required />
              <Stack direction="row" wrap align="center" gap={4} justify="end">
                <Button variant="secondary" onClick={close}>
                  Cancel
                </Button>
                <Button type="submit">Rename</Button>
              </Stack>
            </Stack>
          </form>
        )}
      </Popover>
    </Stack>
  );
}
