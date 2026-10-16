import { Select } from '@envsemble/envui';
import { Example, Specimen, SpecimenGrid } from '../../previews/Example';

const ownerOptions = [
  { value: 'alex', label: 'Alex Morgan' },
  { value: 'sam', label: 'Sam Lee' },
];

/** Empty, chosen, invalid and disabled selects in both trigger styles and densities, for review. */
export default function States() {
  return (
    <Example title="States" size="collection">
      <SpecimenGrid>
        <Specimen title="Nothing chosen">
          <Select label="Owner" placeholder="Choose an owner" options={ownerOptions} />
        </Specimen>
        <Specimen title="Chosen">
          <Select label="Owner" options={ownerOptions} defaultValue="alex" />
        </Specimen>
        <Specimen title="Invalid">
          <Select
            label="Owner"
            placeholder="Choose an owner"
            required
            error="Choose an owner to continue."
            options={ownerOptions}
          />
        </Specimen>
        <Specimen title="Outlined, invalid">
          <Select
            variant="outlined"
            label="Owner"
            placeholder="Choose an owner"
            required
            error="Choose an owner to continue."
            options={ownerOptions}
          />
        </Specimen>
        <Specimen title="Disabled">
          <Select label="Owner" options={ownerOptions} defaultValue="sam" disabled />
        </Specimen>
        <Specimen title="Compact">
          <Select size="sm" aria-label="Owner" options={ownerOptions} defaultValue="sam" />
        </Specimen>
        <Specimen title="Compact, outlined">
          <Select
            size="sm"
            variant="outlined"
            aria-label="Owner"
            options={ownerOptions}
            defaultValue="alex"
          />
        </Specimen>
      </SpecimenGrid>
    </Example>
  );
}
