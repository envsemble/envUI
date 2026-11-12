// Type tests: a Combobox's entries are options or groups, told apart by `items`, which only a group
// has. Each expected error below must occur; the other lines must type-check.
import { Combobox, type ComboboxGroup, type ComboboxItem } from '@envsemble/envui';

interface Person extends ComboboxItem {
  email: string;
}

const people: Person[] = [{ value: 'ada', label: 'Ada', email: 'ada@example.com' }];
const teams: ComboboxGroup<Person>[] = [{ label: 'Team', items: people }];

export const flat = <Combobox label="Owner" items={people} />;
export const grouped = <Combobox label="Owner" items={teams} />;

// @ts-expect-error An option has no `items` of its own: an entry with them is a group.
export const nested: ComboboxItem = { value: 'all', label: 'All', items: [] };
