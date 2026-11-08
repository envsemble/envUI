import { Column, Surface, Text } from '@envsemble/envui';
import { Example, SpecimenGrid } from '../../figures/Example';
import { SpecimenPart } from '../../figures/Specimen';

/**
 * Every corner radius, each on a block of the size it is for: a pane's for Large and Square, a
 * small block's for Small, a row of controls' for Rounded ends.
 */
const radii = [
  { radius: 'xl', title: 'Large', caption: 'Well rounded', height: '7rem' },
  { radius: 'sm', title: 'Small', caption: 'Slightly rounded', height: undefined },
  { radius: 'full', title: 'Rounded ends', caption: 'Half the height', height: undefined },
  { radius: 'none', title: 'Square', caption: 'No rounding', height: '7rem' },
] as const;

/** Every corner radius. */
export default function Corners() {
  return (
    <Example size="collection">
      <SpecimenGrid size="compact">
        {radii.map(({ radius, title, caption, height }) => (
          <SpecimenPart key={radius} title={title} caption={caption}>
            <Surface
              background="muted"
              radius={radius}
              padding={4}
              style={{ minBlockSize: height, inlineSize: '12rem' }}
              render={<Column align="center" justify="center" />}
            >
              <Text>Grouped content</Text>
            </Surface>
          </SpecimenPart>
        ))}
      </SpecimenGrid>
    </Example>
  );
}
