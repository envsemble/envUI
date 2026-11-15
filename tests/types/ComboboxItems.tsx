import { Combobox, type ComboboxGroup, type ComboboxItem } from '@envsemble/envui';

interface Person extends ComboboxItem {
  email: string;
}

const people: Person[] = [{ value: 'ada', label: 'Ada', email: 'ada@example.com' }];
const teams: ComboboxGroup<Person>[] = [{ label: 'Team', items: people }];

export const flat = <Combobox label="Owner" items={people} />;
export const grouped = <Combobox label="Owner" items={teams} />;

// @ts-expect-error
export const optionHasNoItems: ComboboxItem = { value: 'all', label: 'All', items: [] };
