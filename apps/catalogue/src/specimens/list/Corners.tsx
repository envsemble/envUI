import { Button, List } from '@envsemble/envui';
import { Example, Specimen, SpecimenGrid } from '../../previews/Example';

/** A single row and connected rows, with their outer and inner corners, in both fills. */
export default function Corners() {
  return (
    <Example title="Corners and fills" size="collection">
      <SpecimenGrid size="card">
        <Specimen title="Single row" caption="The large corners on every side.">
          <List.Root>
            <List.Item title="Notifications" detail="E-mail and in-app alerts" />
          </List.Root>
        </Specimen>
        <Specimen title="Connected rows" caption="Large outer corners, small inner ones.">
          <List.Root>
            <List.Item title="Notifications" detail="E-mail and in-app alerts" />
            <List.Item title="Members" detail="12 people" />
            <List.Item title="Plan" detail="Team" />
          </List.Root>
        </Specimen>
        <Specimen title="Contrast" caption="The alternate fill on a muted pane of their own.">
          <List.Root contrast>
            <List.Item title="Calendar" detail="alex.morgan@example.com" />
            <List.Item title="Storage" detail="Northwind shared drive" />
          </List.Root>
        </Specimen>
        <Specimen title="Long content" caption="Titles and details wrap, also within an address.">
          <List.Root>
            <List.Item
              title="A long title that names a document from a shared workspace in full"
              detail="https://example.com/workspaces/northwind/documents/quarterly-planning-review"
              action={<Button variant="outlined">Open</Button>}
            />
          </List.Root>
        </Specimen>
      </SpecimenGrid>
    </Example>
  );
}
