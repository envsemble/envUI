import { Select, type SelectOption } from '@envsemble/envui';

const roles: readonly SelectOption[] = [{ value: 'editor', label: 'Editor' }];

export function Role() {
  return <Select label="Role" items={roles} />;
}
