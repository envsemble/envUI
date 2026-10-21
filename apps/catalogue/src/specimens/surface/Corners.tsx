import { Surface, Text } from '@envsemble/envui';
import { Example, Specimen, SpecimenGrid } from '../../previews/Example';

const radii = [
  { radius: 'xl', caption: '1.75 rem' },
  { radius: 'sm', caption: '0.5 rem' },
  { radius: 'full', caption: 'Rounded ends' },
  { radius: 'none', caption: 'Square' },
] as const;

/** Every corner radius. */
export default function Corners() {
  return (
    <Example size="collection">
      <SpecimenGrid size="compact">
        {radii.map(({ radius, caption }) => (
          <Specimen key={radius} title={radius} caption={caption}>
            <Surface background="muted" radius={radius} padding={4}>
              <Text>Grouped content</Text>
            </Surface>
          </Specimen>
        ))}
      </SpecimenGrid>
    </Example>
  );
}
