import { useState } from 'react';
import { Column, List, SearchField } from '@envsemble/envui';
import { IconFolder } from '@envsemble/envui/icons/Folder';
import { useHeldView, usePointer, type PointerStep } from '../../motion/Motion';

const projects = ['Website refresh', 'Pricing page'];

const input = '.env-text-field-input';

/**
 * A query typed, which narrows the two projects to one; cleared with the field's clear button, which
 * brings them all back, as it began.
 */
const script: PointerStep[] = [
  { wait: 300 },
  { to: input, x: 0.4 },
  { wait: 250 },
  { click: true },
  { wait: 250 },
  { type: 'pri', into: input, every: 220 },
  { wait: 1300 },
  { to: '.env-text-field [aria-label="Clear search"]', duration: 450 },
  { wait: 250 },
  { click: true },
  { wait: 400 },
  { leave: true },
  { blur: true },
  { wait: 800 },
];

/**
 * A search field over the projects it filters, controlled, as an application keeps its query:
 * each letter typed narrows the list, and the clear button empties the query. It rests with every
 * project shown, its largest state, framed on it, so nothing moves as the list narrows.
 */
export default function SearchFieldTile() {
  const [query, setQuery] = useState('');
  useHeldView();
  usePointer(script);
  const shown = projects.filter((name) => name.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <Column gap={1} style={{ inlineSize: '11rem' }}>
      <SearchField
        label="Find a project"
        placeholder="Find a project"
        value={query}
        onValueChange={setQuery}
      />
      <List.Root aria-label="Projects" density="xs">
        {shown.map((name) => (
          <List.Item key={name} label={name} start={<IconFolder />} />
        ))}
      </List.Root>
    </Column>
  );
}
