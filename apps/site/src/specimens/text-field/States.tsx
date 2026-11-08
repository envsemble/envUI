import { TextField } from '@envsemble/envui';
import { Example, SpecimenGrid } from '../../figures/Example';
import { SpecimenPart } from '../../figures/Specimen';

/**
 * An outline field in each state, side by side: empty, under the pointer and focused as the
 * catalogue forces them (InteractionStates.css), filled, invalid, read-only and disabled.
 */
export default function States() {
  return (
    <Example size="collection" still>
      <SpecimenGrid size="compact">
        <SpecimenPart title="Empty">
          <TextField label="Project name" placeholder="Enter a name" />
        </SpecimenPart>
        <SpecimenPart title="Hover">
          <TextField
            label="Project name"
            placeholder="Enter a name"
            className="catalogue-force-hover"
            inert
          />
        </SpecimenPart>
        <SpecimenPart title="Focus">
          <TextField
            label="Project name"
            defaultValue="Northwind"
            className="catalogue-force-focus"
            inert
          />
        </SpecimenPart>
        <SpecimenPart title="Filled">
          <TextField label="Project name" defaultValue="Northwind launch" />
        </SpecimenPart>
        <SpecimenPart title="Invalid">
          <TextField
            label="Project handle"
            defaultValue="Northwind Launch"
            error="Use lowercase letters and hyphens."
          />
        </SpecimenPart>
        <SpecimenPart title="Read-only">
          <TextField label="Project ID" defaultValue="PRJ-2041" readOnly />
        </SpecimenPart>
        <SpecimenPart title="Disabled">
          <TextField label="Project name" defaultValue="Northwind launch" disabled />
        </SpecimenPart>
      </SpecimenGrid>
    </Example>
  );
}
