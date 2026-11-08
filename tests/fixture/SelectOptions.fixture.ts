import type { SelectItem } from '@envsemble/envui';

export const planOptions: readonly SelectItem[] = [
  { value: 'starter', label: 'Starter' },
  { value: 'team', label: 'Team' },
  { value: 'enterprise', label: 'Enterprise', disabled: true },
];
export const dialogOptions: readonly SelectItem[] = [
  { value: 'aurora', label: 'Aurora' },
  { value: 'boreal', label: 'Boreal' },
];
