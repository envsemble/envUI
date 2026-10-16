import { Avatar, Combobox, type ComboboxItem } from '@envsemble/envui';
import { Example, Specimen, SpecimenGrid } from '../../previews/Example';

const people: ComboboxItem[] = ['Alex Morgan', 'Sam Lee', 'Priya Shah', 'Jordan Ellis'].map(
  (name) => {
    const handle = name.toLowerCase().replace(' ', '.');
    return { value: handle, label: name, leading: <Avatar name={name} /> };
  },
);

/** An invalid, a read-only and a disabled field, and a compact field with chips. */
export default function States() {
  return (
    <Example title="Combobox states" size="collection">
      <SpecimenGrid>
        <Specimen title="Invalid">
          <Combobox
            label="Approver"
            items={people}
            required
            error="Choose someone to approve the release."
          />
        </Specimen>
        <Specimen title="Read only" caption="Can still be focused and browsed.">
          <Combobox
            multiple
            label="Reviewers"
            items={people}
            defaultValue={['sam.lee', 'priya.shah']}
            readOnly
          />
        </Specimen>
        <Specimen title="Disabled" caption="Unavailable and left out of form submission.">
          <Combobox label="Owner" items={people} defaultValue="jordan.ellis" disabled />
        </Specimen>
        <Specimen title="Compact with chips">
          <Combobox
            multiple
            size="sm"
            showLabel={false}
            aria-label="Reviewers"
            placeholder="Reviewers"
            items={people}
            defaultValue={['alex.morgan']}
            clearable
          />
        </Specimen>
      </SpecimenGrid>
    </Example>
  );
}
