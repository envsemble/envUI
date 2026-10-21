import { Select } from '@envsemble/envui';
import { Example, Specimen, SpecimenGrid } from '../../previews/Example';

const ownerOptions = [
  { value: 'alex', label: 'Alex Morgan' },
  { value: 'sam', label: 'Sam Lee' },
];

/** Nothing chosen, chosen, invalid and disabled selects, side by side. */
export default function States() {
  return (
    <Example size="collection">
      <SpecimenGrid>
        <Specimen title="Nothing chosen">
          <Select label="Owner" placeholder="Choose an owner" items={ownerOptions} />
        </Specimen>
        <Specimen title="Chosen">
          <Select label="Owner" items={ownerOptions} defaultValue="alex" />
        </Specimen>
        <Specimen title="Invalid">
          <Select
            label="Owner"
            placeholder="Choose an owner"
            required
            error="Choose an owner."
            items={ownerOptions}
          />
        </Specimen>
        <Specimen title="Disabled">
          <Select label="Owner" items={ownerOptions} defaultValue="sam" disabled />
        </Specimen>
      </SpecimenGrid>
    </Example>
  );
}
