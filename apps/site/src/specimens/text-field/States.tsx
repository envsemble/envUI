import { TextField } from '@envsemble/envui';
import { Example, Specimen, SpecimenGrid } from '../../figures/Example';

/**
 * An outline field in each state, side by side: empty, under the pointer and focused as the
 * catalogue forces them (InteractionStates.css), filled, invalid, read-only and disabled.
 */
export default function States() {
  return (
    <Example size="collection">
      <SpecimenGrid size="compact">
        <Specimen title="Empty">
          <TextField label="Project name" placeholder="Enter a name" />
        </Specimen>
        <Specimen title="Hover">
          <TextField
            label="Project name"
            placeholder="Enter a name"
            className="catalogue-force-hover"
            inert
          />
        </Specimen>
        <Specimen title="Focus">
          <TextField
            label="Project name"
            defaultValue="Northwind"
            className="catalogue-force-focus"
            inert
          />
        </Specimen>
        <Specimen title="Filled">
          <TextField label="Project name" defaultValue="Northwind launch" />
        </Specimen>
        <Specimen title="Invalid">
          <TextField
            label="Project handle"
            defaultValue="Northwind Launch"
            error="Use lowercase letters and hyphens."
          />
        </Specimen>
        <Specimen title="Read-only">
          <TextField label="Project ID" defaultValue="PRJ-2041" readOnly />
        </Specimen>
        <Specimen title="Disabled">
          <TextField label="Project name" defaultValue="Northwind launch" disabled />
        </Specimen>
      </SpecimenGrid>
    </Example>
  );
}
