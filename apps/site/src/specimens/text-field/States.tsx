import { TextField } from '@envsemble/envui';
import { Example, Specimen, SpecimenGrid } from '../../previews/Example';

/** Empty, filled, invalid, read-only and disabled fields, side by side. */
export default function States() {
  return (
    <Example size="collection">
      <SpecimenGrid size="compact">
        <Specimen title="Empty">
          <TextField label="Project name" placeholder="Enter a name" />
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
        <Specimen title="Read only">
          <TextField label="Project ID" defaultValue="PRJ-2041" readOnly />
        </Specimen>
        <Specimen title="Disabled">
          <TextField label="Project name" defaultValue="Northwind launch" disabled />
        </Specimen>
        <Specimen title="Floating, invalid">
          <TextField
            variant="floating"
            label="Project handle"
            defaultValue="Northwind Launch"
            error="Use lowercase letters and hyphens."
          />
        </Specimen>
      </SpecimenGrid>
    </Example>
  );
}
