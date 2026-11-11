import { AvatarGroup } from '@envsemble/envui';

// The person picture under initials, so both fallbacks show at rest.
const people = [
  { name: 'Sam Lee', fallback: 'person' as const },
  { name: 'Northwind Labs' },
  { name: 'Priya Shah' },
  { name: 'Jordan Ellis' },
];

export default function AvatarAnatomy() {
  return <AvatarGroup people={people} max={2} size="xl" />;
}
