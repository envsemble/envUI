import { Button, List, Surface } from '@envsemble/envui';
import { Example, Specimen, SpecimenGrid } from '../../previews/Example';

/** A single row and connected rows, with their outer and inner corners, in both fills. */
export default function Corners() {
  return (
    <Example title="Corners and fills" size="collection">
      <SpecimenGrid size="card">
        <Specimen title="Single row" caption="The large corners on every side.">
          <List.Root>
            <List.Item label="Notifications" description="E-mail and in-app alerts" />
          </List.Root>
        </Specimen>
        <Specimen title="Connected rows" caption="Large outer corners, small inner ones.">
          <List.Root>
            <List.Item label="Notifications" description="E-mail and in-app alerts" />
            <List.Item label="Members" description="12 people" />
            <List.Item label="Plan" description="Team" />
          </List.Root>
        </Specimen>
        <Specimen title="Contrast" caption="The alternate fill on a muted pane of their own.">
          <Surface background="muted" padding={3}>
            <List.Root>
              <List.Item label="Calendar" description="alex.morgan@example.com" />
              <List.Item label="Storage" description="Northwind shared drive" />
            </List.Root>
          </Surface>
        </Specimen>
        <Specimen title="Long content" caption="Titles and details wrap, also within an address.">
          <List.Root>
            <List.Item
              label="A long title that names a document from a shared workspace in full"
              description="https://example.com/workspaces/northwind/documents/quarterly-planning-review"
              action={<Button variant="outline">Open</Button>}
            />
          </List.Root>
        </Specimen>
      </SpecimenGrid>
    </Example>
  );
}
