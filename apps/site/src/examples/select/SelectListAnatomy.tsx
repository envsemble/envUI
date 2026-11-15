import { Select } from '@envsemble/envui';

const visibilityOptions = [
  { value: 'team', label: 'Team' },
  { value: 'private', label: 'Private' },
  { value: 'public', label: 'Anyone with the link' },
];

export default function SelectListAnatomy() {
  return <Select label="Visibility" items={visibilityOptions} defaultValue="team" defaultOpen />;
}
