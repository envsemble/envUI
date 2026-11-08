import { type ControlSize, SegmentedControl } from '@envsemble/envui';
import { Example, SpecimenGrid } from '../../figures/Example';
import { SpecimenPart } from '../../figures/Specimen';

const sizes: readonly { size: ControlSize; title: string; caption: string }[] = [
  { size: 'sm', title: 'Small', caption: 'A table row or a dense toolbar' },
  { size: 'md', title: 'Medium', caption: 'The default' },
  { size: 'lg', title: 'Large', caption: 'A step larger than medium' },
];
const ignore = () => undefined;

/** The three sizes, the control heights every control of a size shares. */
export default function Sizes() {
  return (
    <Example size="collection">
      <SpecimenGrid size="compact">
        {sizes.map(({ size, title, caption }) => (
          <SpecimenPart key={size} title={title} caption={caption}>
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
          </SpecimenPart>
        ))}
      </SpecimenGrid>
    </Example>
  );
}
