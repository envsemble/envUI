import { type ControlSize, SegmentedControl } from '@envsemble/envui';
import { Example, Specimen, SpecimenGrid } from '../../figures/Example';

const sizes: readonly { size: ControlSize; title: string; caption: string }[] = [
  { size: 'sm', title: 'Small', caption: '2 rem' },
  { size: 'md', title: 'Medium', caption: '2.5 rem' },
  { size: 'lg', title: 'Large', caption: '3 rem' },
];
const ignore = () => undefined;

/** The three sizes, the control heights every control of a size shares. */
export default function Sizes() {
  return (
    <Example size="collection">
      <SpecimenGrid size="compact">
        {sizes.map(({ size, title, caption }) => (
          <Specimen key={size} title={title} caption={caption}>
            <SegmentedControl
              aria-label={`Layout, ${title.toLowerCase()}`}
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
