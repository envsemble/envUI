import { AvatarGroup } from '@envsemble/envui';

// The organization comes second, on top of the pile, so its initials show at rest.
const people = [
  { name: 'Sam Lee' },
  { name: 'Northwind Labs', fallback: 'initials' as const },
  { name: 'Priya Shah' },
  { name: 'Jordan Ellis' },
];

export default function AvatarAnatomy() {
  return <AvatarGroup people={people} max={2} size="xl" />;
}
