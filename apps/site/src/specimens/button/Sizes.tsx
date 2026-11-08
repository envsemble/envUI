import { Button, IconButton, Row, type ControlSize } from '@envsemble/envui';
import { IconAdd } from '@envsemble/envui/icons/Add';
import { IconEdit } from '@envsemble/envui/icons/Edit';
import { Example, SpecimenGrid } from '../../figures/Example';
import { SpecimenPart } from '../../figures/Specimen';

const sizes: readonly { size: ControlSize; title: string; caption?: string }[] = [
  { size: 'sm', title: 'Small' },
  { size: 'md', title: 'Medium', caption: 'The default' },
  { size: 'lg', title: 'Large' },
];

/**
 * The three sizes of Button and IconButton, which every control of a size shares: on the stage
 * every specimen sits on, each size named over its pair.
 */
export default function Sizes() {
  return (
    <Example size="collection">
      <SpecimenGrid size="compact">
        {sizes.map(({ size, title, caption }) => (
          <SpecimenPart key={size} title={title} caption={caption}>
            <Row align="center" gap={3}>
              <Button size={size} startIcon={<IconAdd />}>
                New
              </Button>
              <IconButton size={size} icon={<IconEdit />} aria-label="Edit" />
            </Row>
          </SpecimenPart>
        ))}
      </SpecimenGrid>
    </Example>
  );
}
