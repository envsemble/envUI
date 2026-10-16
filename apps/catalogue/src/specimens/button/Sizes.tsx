import { ActionGroup, Button, IconButton, type ControlSize } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import { Edit } from '@envsemble/envui/icons/Edit';
import { Example, Specimen, SpecimenGrid } from '../../previews/Example';

const sizes: readonly { size: ControlSize; caption: string }[] = [
  { size: 'sm', caption: '2 rem, 1.625 rem compact' },
  { size: 'md', caption: '2.5 rem, 2 rem compact' },
  { size: 'lg', caption: '3 rem, 2.375 rem compact' },
];

/** The three sizes of Button and IconButton, which every control of a size shares. */
export default function Sizes() {
  return (
    <Example title="Sizes" size="collection">
      <SpecimenGrid size="compact">
        {sizes.map(({ size, caption }) => (
          <Specimen key={size} title={size} caption={caption}>
            <ActionGroup>
              <Button size={size} startIcon={<Add />}>
                New
              </Button>
              <Button size={size} variant="secondary">
                Cancel
              </Button>
              <IconButton size={size} icon={<Edit />} aria-label="Edit" />
            </ActionGroup>
          </Specimen>
        ))}
      </SpecimenGrid>
    </Example>
  );
}
