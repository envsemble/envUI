import { AvatarGroup } from '@envsemble/envui';

const people = [
  { name: 'Northwind Labs', fallback: 'initials' as const },
  { name: 'Sam Lee' },
  { name: 'Priya Shah' },
  { name: 'Jordan Ellis' },
];

export default function AvatarAnatomy() {
  return <AvatarGroup people={people} max={2} size="xl" />;
}
