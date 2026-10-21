import { useState } from 'react';
import { Button, Checkbox, List, Column } from '@envsemble/envui';

const files = [
  { name: 'Roadmap.md', size: '12 KB' },
  { name: 'Pricing research.md', size: '48 KB' },
  { name: 'Interview notes.md', size: '7 KB' },
];

export default function CheckedRows() {
  const [checked, setChecked] = useState<string[]>(['Pricing research.md']);
  return (
    <Column gap={3} align="start">
      <List.Root aria-label="Files">
        {files.map(({ name, size }) => (
          <List.Item
            key={name}
            start={
              <Checkbox
                aria-label={`Choose ${name}`}
                checked={checked.includes(name)}
                onCheckedChange={(on) =>
                  setChecked((list) =>
                    on ? [...list, name] : list.filter((each) => each !== name),
                  )
                }
              />
            }
            label={name}
            description={size}
          />
        ))}
      </List.Root>
      <Button variant="secondary" disabled={checked.length === 0}>
        Download {checked.length} {checked.length === 1 ? 'file' : 'files'}
      </Button>
    </Column>
  );
}
