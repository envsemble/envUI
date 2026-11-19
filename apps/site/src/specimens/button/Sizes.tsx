import { Button, IconButton, Row, type ControlSize } from '@envsemble/envui';
import { IconAdd } from '@envsemble/envui/icons/Add';
import { IconEdit } from '@envsemble/envui/icons/Edit';
import { SpecimenFrame, SpecimenGrid, SpecimenPart } from '../../figures/SpecimenFrame';

const sizes: readonly { size: ControlSize; title: string; caption?: string }[] = [
  { size: 'sm', title: 'Small' },
  { size: 'md', title: 'Medium', caption: 'The default' },
  { size: 'lg', title: 'Large' },
];

export default function Sizes() {
  return (
    <SpecimenFrame size="collection">
      <SpecimenGrid size="compact">
        {sizes.map(({ size, title, caption }) => (
          <SpecimenPart key={size} title={title} caption={caption}>
            <Row align="center" gap={3}>
              <Button size={size} start={<IconAdd />}>
                New
              </Button>
              <IconButton size={size} icon={<IconEdit />} aria-label="Edit" />
            </Row>
          </SpecimenPart>
        ))}
      </SpecimenGrid>
    </SpecimenFrame>
  );
}
