import type { SelectOption } from '@envsemble/envui';

export const planOptions: readonly SelectOption[] = [
  { value: 'starter', label: 'Starter' },
  { value: 'team', label: 'Team' },
  { value: 'enterprise', label: 'Enterprise', disabled: true },
];
export const dialogOptions: readonly SelectOption[] = [
  { value: 'atlas', label: 'Atlas' },
  { value: 'boreal', label: 'Boreal' },
];
