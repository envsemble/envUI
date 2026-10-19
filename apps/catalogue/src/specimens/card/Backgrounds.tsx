import { Card, Surface, Text } from '@envsemble/envui';
import { Example, Specimen, SpecimenGrid } from '../../previews/Example';

const backgrounds = ['muted', 'default', 'page'] as const;

/** Content and link cards on each background, on a pane, and a disabled link card. */
export default function Backgrounds() {
  return (
    <Example title="Backgrounds" size="collection">
      <Surface background="default">
        <SpecimenGrid size="card">
          {backgrounds.map((background) => (
            <Specimen key={background} title={background}>
              <Card background={background}>
                <Text render={<h4 />} variant="title">
                  Northwind launch
                </Text>
                <Text emphasis="muted">Plans and milestones for the spring launch.</Text>
              </Card>
              <Card background={background} href="/projects/northwind">
                <Text render={<span />} variant="title">
                  Open Northwind launch
                </Text>
              </Card>
            </Specimen>
          ))}
          <Specimen title="Disabled link">
            <Card href="/projects/archive" disabled>
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
