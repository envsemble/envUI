import { useState } from 'react';
import { Select } from '@envsemble/envui';

const visibilityOptions = [
  { value: 'team', label: 'Team' },
  { value: 'private', label: 'Private' },
  { value: 'public', label: 'Public (turned off by your administrator)', disabled: true },
];

export default function ProjectVisibility() {
  const [visibility, setVisibility] = useState<string | null>('team');
  return (
    <Select
      label="Visibility"
      description="Who can open Northwind launch."
      name="visibility"
      items={visibilityOptions}
      value={visibility}
      onValueChange={setVisibility}
    />
  );
}
