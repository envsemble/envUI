import { Surface, Text } from '@envsemble/envui';
import { Example, Specimen, SpecimenGrid } from '../../previews/Example';

const backgrounds = [
  { background: 'default', caption: 'Default background' },
  { background: 'muted', caption: 'Muted background' },
  { background: 'page', caption: 'Page background' },
  { background: 'raised', caption: 'Raised background' },
] as const;
const radii = [
  { radius: 'xl', caption: '1.75 rem' },
  { radius: 'sm', caption: '0.5 rem' },
  { radius: 'full', caption: 'Fully rounded ends' },
  { radius: 'none', caption: 'Square' },
] as const;

/** Every background, on the page and on a pane, and every corner radius. */
export default function TonesAndCorners() {
  return (
    <>
      <Example title="Backgrounds" size="collection">
        <SpecimenGrid size="compact">
          {backgrounds.map(({ background, caption }) => (
            <Specimen key={background} title={background} caption={caption}>
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
      <Example title="Corners" size="collection">
        <SpecimenGrid size="compact">
          {radii.map(({ radius, caption }) => (
            <Specimen key={radius} title={radius} caption={caption}>
              <Surface radius={radius} padding={4}>
                <Text>Grouped content</Text>
              </Surface>
            </Specimen>
          ))}
        </SpecimenGrid>
      </Example>
    </>
  );
}
