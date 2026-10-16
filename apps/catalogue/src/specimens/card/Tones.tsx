import { Card, Surface, Text } from '@envsemble/envui';
import { Example, Specimen, SpecimenGrid } from '../../previews/Example';

const tones = ['row', 'pane', 'canvas'] as const;

/** Content and link cards in each tone, on a pane, and a disabled link card. */
export default function Tones() {
  return (
    <Example title="Tones" size="collection">
      <Surface background="default">
        <SpecimenGrid size="card">
          {tones.map((tone) => (
            <Specimen key={tone} title={tone}>
              <Card tone={tone}>
                <Text render={<h4 />} variant="title">
                  Northwind launch
                </Text>
                <Text emphasis="muted">Plans and milestones for the spring launch.</Text>
              </Card>
              <Card tone={tone} href="#northwind">
                <Text render={<span />} variant="title">
                  Open Northwind launch
                </Text>
              </Card>
            </Specimen>
          ))}
          <Specimen title="Disabled link">
            <Card href="#archive" disabled>
              <Text render={<span />} variant="title">
                Archived projects
              </Text>
            </Card>
          </Specimen>
        </SpecimenGrid>
      </Surface>
    </Example>
  );
}
