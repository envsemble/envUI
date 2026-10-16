import { Card, Surface, Text } from '@envsemble/envui';
import { Example, Specimen, SpecimenGrid } from '../../previews/Example';

const tones = ['row', 'pane', 'canvas'] as const;

/** Content and link cards in each tone, on a pane, and a disabled link card. */
export default function Tones() {
  return (
    <Example title="Tones" size="collection">
      <Surface tone="pane">
        <SpecimenGrid size="card">
          {tones.map((tone) => (
            <Specimen key={tone} title={tone}>
              <Card tone={tone}>
                <Text as="h4" variant="section-heading">
                  Northwind launch
                </Text>
                <Text tone="muted">Plans and milestones for the spring launch.</Text>
              </Card>
              <Card tone={tone} href="#northwind">
                <Text as="span" variant="section-heading">
                  Open Northwind launch
                </Text>
              </Card>
            </Specimen>
          ))}
          <Specimen title="Disabled link">
            <Card href="#archive" disabled>
              <Text as="span" variant="section-heading">
                Archived projects
              </Text>
            </Card>
          </Specimen>
        </SpecimenGrid>
      </Surface>
    </Example>
  );
}
