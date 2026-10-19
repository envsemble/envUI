import { TextField, Textarea } from '@envsemble/envui';
import { Example, Specimen, SpecimenGrid } from '../../previews/Example';

/** Empty, filled, invalid, read-only and disabled fields of each kind, for review. */
export default function States() {
  return (
    <>
      <Example
        title="Text field states"
        size="collection"
        caption="Focus the empty field to move its label onto the outline."
      >
        <SpecimenGrid>
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
              error="Use only lowercase letters, numbers and hyphens."
            />
          </Specimen>
          <Specimen title="Plain, invalid">
            <TextField
              variant="underline"
              label="Project handle"
              defaultValue="Northwind Launch"
              error="Use only lowercase letters, numbers and hyphens."
            />
          </Specimen>
          <Specimen title="Read only" caption="Can still be focused and copied.">
            <TextField label="Project ID" defaultValue="PRJ-2041" readOnly />
          </Specimen>
          <Specimen title="Disabled" caption="Unavailable and left out of form submission.">
            <TextField label="Project name" defaultValue="Northwind launch" disabled />
          </Specimen>
        </SpecimenGrid>
      </Example>
      <Example title="Textarea states" size="collection">
        <SpecimenGrid>
          <Specimen title="Empty">
            <Textarea label="Description" rows={2} />
          </Specimen>
          <Specimen title="Invalid">
            <Textarea label="Summary" rows={3} error="Add at least 20 characters." />
          </Specimen>
          <Specimen title="Read only">
            <Textarea label="Description" rows={2} readOnly defaultValue="Provided by the team." />
          </Specimen>
          <Specimen title="Disabled">
            <Textarea label="Description" rows={2} disabled defaultValue="Unavailable" />
          </Specimen>
        </SpecimenGrid>
      </Example>
    </>
  );
}
