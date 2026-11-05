import { Avatar, Combobox, type ComboboxItem } from '@envsemble/envui';
import { Example, Specimen, SpecimenGrid } from '../../figures/Example';

const people: ComboboxItem[] = ['Alex Morgan', 'Sam Lee', 'Priya Shah', 'Jordan Ellis'].map(
  (name) => {
    const handle = name.toLowerCase().replace(' ', '.');
    return { value: handle, label: name, start: <Avatar name={name} /> };
  },
);

/** A field with nothing chosen, and an invalid, a read-only and a disabled one. */
export default function States() {
  return (
    <Example size="collection">
      <SpecimenGrid>
        <Specimen title="Nothing chosen">
          <Combobox label="Owner" placeholder="Type a name" items={people} />
        </Specimen>
        <Specimen title="Invalid">
          <Combobox label="Approver" items={people} required error="Choose an approver." />
        </Specimen>
        <Specimen title="Read only">
          <Combobox
            multiple
            label="Reviewers"
            items={people}
            defaultValue={['sam.lee', 'priya.shah']}
            readOnly
          />
        </Specimen>
        <Specimen title="Disabled">
          <Combobox label="Owner" items={people} defaultValue="jordan.ellis" disabled />
        </Specimen>
      </SpecimenGrid>
    </Example>
  );
}
