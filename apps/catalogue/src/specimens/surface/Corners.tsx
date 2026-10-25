import { Surface, Text } from '@envsemble/envui';
import { Example, Specimen, SpecimenGrid } from '../../previews/Example';

const radii = [
  { radius: 'xl', title: 'Large', caption: '1.75 rem' },
  { radius: 'sm', title: 'Small', caption: '0.5 rem' },
  { radius: 'full', title: 'Rounded ends', caption: 'Half the height' },
  { radius: 'none', title: 'Square', caption: 'No rounding' },
] as const;

/** Every corner radius. */
export default function Corners() {
  return (
    <Example size="collection">
      <SpecimenGrid size="compact">
        {radii.map(({ radius, title, caption }) => (
          <Specimen key={radius} title={title} caption={caption}>
            <Surface background="muted" radius={radius} padding={4}>
              <Text>Grouped content</Text>
            </Surface>
          </Specimen>
        ))}
      </SpecimenGrid>
    </Example>
  );
}
