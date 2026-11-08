import { Select } from '@envsemble/envui';
import { Example, SpecimenGrid } from '../../figures/Example';
import { SpecimenPart } from '../../figures/Specimen';

const ownerOptions = [
  { value: 'alex', label: 'Alex Morgan' },
  { value: 'sam', label: 'Sam Lee' },
];

/** Nothing chosen, chosen, invalid and disabled selects, side by side. */
export default function States() {
  return (
    <Example size="collection">
      <SpecimenGrid>
        <SpecimenPart title="Nothing chosen">
          <Select label="Owner" placeholder="Choose an owner" items={ownerOptions} />
        </SpecimenPart>
        <SpecimenPart title="Chosen">
          <Select label="Owner" items={ownerOptions} defaultValue="alex" />
        </SpecimenPart>
        <SpecimenPart title="Invalid">
          <Select
            label="Owner"
            placeholder="Choose an owner"
            required
            error="Choose an owner."
            items={ownerOptions}
          />
        </SpecimenPart>
        <SpecimenPart title="Disabled">
          <Select label="Owner" items={ownerOptions} defaultValue="sam" disabled />
        </SpecimenPart>
      </SpecimenGrid>
    </Example>
  );
}
