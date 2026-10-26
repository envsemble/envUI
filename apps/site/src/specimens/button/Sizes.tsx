import { Button, IconButton, type ControlSize, Row } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import { Edit } from '@envsemble/envui/icons/Edit';
import { Example, Specimen, SpecimenGrid } from '../../previews/Example';

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
            <Row wrap align="center" gap={4}>
              <Button size={size} startIcon={<Add />}>
                New
              </Button>
              <Button size={size} variant="secondary">
                Cancel
              </Button>
              <IconButton size={size} icon={<Edit />} aria-label="Edit" />
            </Row>
          </Specimen>
        ))}
      </SpecimenGrid>
    </Example>
  );
}
