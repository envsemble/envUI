import { Button, IconButton, type ControlSize, Row } from '@envsemble/envui';
import { IconAdd } from '@envsemble/envui/icons/Add';
import { IconEdit } from '@envsemble/envui/icons/Edit';
import { Example, Specimen, SpecimenGrid } from '../../figures/Example';

const sizes: readonly { size: ControlSize; title: string; caption: string }[] = [
  { size: 'sm', title: 'Small', caption: 'A table row or a dense toolbar' },
  { size: 'md', title: 'Medium', caption: 'The default' },
  { size: 'lg', title: 'Large', caption: 'A step larger than medium' },
];

/** The three sizes of Button and IconButton, which every control of a size shares. */
export default function Sizes() {
  return (
    <Example size="collection">
      <SpecimenGrid size="compact">
        {sizes.map(({ size, title, caption }) => (
          <Specimen key={size} title={title} caption={caption}>
            <Row wrap align="center" gap={3}>
              <Button size={size} startIcon={<IconAdd />}>
                New
              </Button>
              <IconButton size={size} icon={<IconEdit />} aria-label="Edit" />
            </Row>
          </Specimen>
        ))}
      </SpecimenGrid>
    </Example>
  );
}
