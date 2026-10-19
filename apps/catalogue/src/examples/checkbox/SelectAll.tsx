import { useState } from 'react';
import { Checkbox, Stack } from '@envsemble/envui';

const projects = ['Northwind launch', 'Pricing research', 'Support handbook'];

/** The children line up with the label of the parent: a box and its gap in. */
const children = { paddingInlineStart: '1.875rem' };

export default function SelectAll() {
  const [selected, setSelected] = useState([true, false, false]);
  // The parent's state follows its children: all, none, or mixed.
  const all = selected.every(Boolean) ? true : selected.some(Boolean) ? 'mixed' : false;
  return (
    <Stack gap={3} role="group" aria-label="Projects to export">
      <Checkbox
        label="All projects"
        checked={all}
        onCheckedChange={(checked) => setSelected((current) => current.map(() => checked))}
      />
      <Stack gap={3} style={children}>
        {projects.map((name, index) => (
          <Checkbox
            key={name}
            label={name}
            checked={selected[index]}
            onCheckedChange={(checked) =>
              setSelected((current) => current.map((value, i) => (i === index ? checked : value)))
            }
          />
        ))}
      </Stack>
    </Stack>
  );
}
