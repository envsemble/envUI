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

export const headingWithContent = (
  <Combobox
    label="Owner"
    items={[
      {
        label: (
          <>
            Team <b>2</b>
          </>
        ),
        items: people,
      },
    ]}
  />
);
export const tagged: ComboboxItem = {
  value: 'ada',
  label: 'Ada',
  itemProps: { 'data-testid': 'ada', className: 'is-new', title: 'Ada' },
};
export const roleStaysTheOptions: ComboboxItem = {
  value: 'a',
  label: 'A',
  // @ts-expect-error
  itemProps: { role: 'x' },
};
