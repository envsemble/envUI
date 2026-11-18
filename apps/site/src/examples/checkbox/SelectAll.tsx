import { useState } from 'react';
import { Checkbox, Column } from '@envsemble/envui';

const projects = ['Northwind launch', 'Pricing research', 'Support handbook'];

const alignedWithParentLabel = { paddingInlineStart: '1.875rem' };

export default function SelectAll() {
  const [selected, setSelected] = useState([true, false, false]);
  const all = selected.every(Boolean) ? true : selected.some(Boolean) ? 'mixed' : false;
  return (
    <Column gap={3} role="group" aria-label="Projects to export">
      <Checkbox
        label="All projects"
        checked={all}
        onCheckedChange={(checked) => setSelected((current) => current.map(() => checked))}
      />
      <Column gap={3} style={alignedWithParentLabel}>
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
      </Column>
    </Column>
  );
}
