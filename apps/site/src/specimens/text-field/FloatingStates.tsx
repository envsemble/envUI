import { TextField } from '@envsemble/envui';
import { Example, Specimen, SpecimenGrid } from '../../figures/Example';

/**
 * Empty, filled, read-only and disabled floating fields, side by side: taller than outline fields,
 * so they have a figure of their own. Show an error shows one invalid.
 */
export default function FloatingStates() {
  return (
    <Example size="collection">
      <SpecimenGrid size="compact">
        <Specimen title="Empty">
          <TextField variant="floating" label="Project name" />
        </Specimen>
        <Specimen title="Filled">
          <TextField variant="floating" label="Project name" defaultValue="Northwind launch" />
        </Specimen>
        <Specimen title="Read only">
          <TextField variant="floating" label="Project ID" defaultValue="PRJ-2041" readOnly />
        </Specimen>
        <Specimen title="Disabled">
          <TextField
            variant="floating"
            label="Project name"
            defaultValue="Northwind launch"
            disabled
          />
        </Specimen>
      </SpecimenGrid>
    </Example>
  );
}
