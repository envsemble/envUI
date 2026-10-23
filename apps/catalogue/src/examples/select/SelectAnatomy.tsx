import { Select } from '@envsemble/envui';

const visibilityOptions = [
  { value: 'team', label: 'Team' },
  { value: 'private', label: 'Private' },
];

export default function SelectAnatomy() {
  return (
    <Select
      label="Visibility"
      description="Who can open Northwind launch."
      items={visibilityOptions}
      defaultValue="team"
    />
  );
}
