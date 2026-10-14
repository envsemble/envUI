import type { SelectOption } from '@envsemble/envui';

export const planOptions: readonly SelectOption[] = [
  { value: 'starter', label: 'Starter' },
  { value: 'team', label: 'Team' },
  { value: 'enterprise', label: 'Enterprise', disabled: true },
];
export const dialogOptions: readonly SelectOption[] = [
  { value: 'aurora', label: 'Aurora' },
  { value: 'boreal', label: 'Boreal' },
];
