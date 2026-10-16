import { Select, type SelectItem } from '@envsemble/envui';

const roles: readonly SelectItem[] = [{ value: 'editor', label: 'Editor' }];

export function Role() {
  return <Select label="Role" items={roles} />;
}
