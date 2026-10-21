import { type ControlSize, SegmentedControl } from '@envsemble/envui';
import { Example, Specimen, SpecimenGrid } from '../../previews/Example';

const sizes: readonly { size: ControlSize; caption: string }[] = [
  { size: 'sm', caption: '2 rem' },
  { size: 'md', caption: '2.5 rem' },
  { size: 'lg', caption: '3 rem' },
];
const ignore = () => undefined;

/** The three sizes, the control heights every control of a size shares. */
export default function Sizes() {
  return (
    <Example size="collection">
      <SpecimenGrid size="compact">
        {sizes.map(({ size, caption }) => (
          <Specimen key={size} title={size} caption={caption}>
            <SegmentedControl
              aria-label={`Layout, ${size}`}
              size={size}
              value="list"
              onValueChange={ignore}
              items={[
                { value: 'list', label: 'List' },
                { value: 'board', label: 'Board' },
              ]}
            />
          </Specimen>
        ))}
      </SpecimenGrid>
    </Example>
  );
}
