import { useState } from 'react';
import { Column, List, SearchField } from '@envsemble/envui';
import { IconFolder } from '@envsemble/envui/icons/Folder';
import { useHeldView } from '../../motion/Playback';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';

const projects = ['Website refresh', 'Pricing page'];

const input = '.env-text-field-input';

const script: PointerStep[] = [
  { wait: 180 },
  { to: input, x: 0.4 },
  { wait: 150 },
  { click: true },
  { wait: 150 },
  { type: 'pri', into: input, every: 220 },
  { wait: 780 },
  { to: '.env-text-field [aria-label="Clear search"]', duration: 450 },
  { wait: 150 },
  { click: true },
  { wait: 240 },
  { leave: true },
  { blur: true },
  { wait: 480 },
];

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
