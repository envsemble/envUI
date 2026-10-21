import { Surface, Text } from '@envsemble/envui';
import { Example, Specimen, SpecimenGrid } from '../../previews/Example';

const backgrounds = ['default', 'muted', 'page', 'raised'] as const;

/** Every background, on the page and on a pane. */
export default function Backgrounds() {
  return (
    <Example size="collection">
      <SpecimenGrid size="compact">
        {backgrounds.map((background) => (
          <Specimen key={background} title={background}>
            <Surface background={background} padding={4}>
              <Text>On the page</Text>
            </Surface>
            <Surface padding={2} radius="sm">
              <Surface background={background} padding={4} radius="sm">
                <Text>On a pane</Text>
              </Surface>
            </Surface>
          </Specimen>
        ))}
      </SpecimenGrid>
    </Example>
  );
}
