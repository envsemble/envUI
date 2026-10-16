import { Surface, Text } from '@envsemble/envui';
import { Example, Specimen, SpecimenGrid } from '../../previews/Example';

const tones = [
  { tone: 'pane', caption: 'Default background' },
  { tone: 'row', caption: 'Muted background' },
  { tone: 'canvas', caption: 'Page background' },
  { tone: 'alternate', caption: 'Raised background' },
] as const;
const corners = [
  { corners: 'surface', caption: '1.75 rem' },
  { corners: 'standard', caption: '0.5 rem' },
  { corners: 'pill', caption: 'Fully rounded ends' },
  { corners: 'none', caption: 'Square' },
] as const;

/** Every background, on the page and on a pane, and every corner radius. */
export default function TonesAndCorners() {
  return (
    <>
      <Example title="Backgrounds" size="collection">
        <SpecimenGrid size="compact">
          {tones.map(({ tone, caption }) => (
            <Specimen key={tone} title={tone} caption={caption}>
              <Surface tone={tone} padding={4}>
                <Text>On the page</Text>
              </Surface>
              <Surface padding={2} corners="standard">
                <Surface tone={tone} padding={4} corners="standard">
                  <Text>On a pane</Text>
                </Surface>
              </Surface>
            </Specimen>
          ))}
        </SpecimenGrid>
      </Example>
      <Example title="Corners" size="collection">
        <SpecimenGrid size="compact">
          {corners.map(({ corners, caption }) => (
            <Specimen key={corners} title={corners} caption={caption}>
              <Surface corners={corners} padding={4}>
                <Text>Grouped content</Text>
              </Surface>
            </Specimen>
          ))}
        </SpecimenGrid>
      </Example>
    </>
  );
}
