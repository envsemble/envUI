import { Select } from '@envsemble/envui';

const visibilityOptions = [
  { value: 'team', label: 'Team' },
  { value: 'private', label: 'Private' },
  { value: 'public', label: 'Anyone with the link' },
];

export default function SelectListAnatomy() {
  // Shown open in the docs; without defaultOpen, the list opens from the field.
  return <Select label="Visibility" items={visibilityOptions} defaultValue="team" defaultOpen />;
}
