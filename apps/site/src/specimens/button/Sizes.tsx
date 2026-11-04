import { Button, Column, IconButton, Row, Text, type ControlSize } from '@envsemble/envui';
import { IconAdd } from '@envsemble/envui/icons/Add';
import { IconEdit } from '@envsemble/envui/icons/Edit';
import { Example } from '../../figures/Example';

const sizes: readonly { size: ControlSize; name: string }[] = [
  { size: 'sm', name: 'Small' },
  { size: 'md', name: 'Medium, the default' },
  { size: 'lg', name: 'Large' },
];

/**
 * The three sizes of Button and IconButton, which every control of a size shares: in one row, on
 * one line, each size's name under it.
 */
export default function Sizes() {
  return (
    <Example>
      <Row wrap align="end" justify="center" gap={8}>
        {sizes.map(({ size, name }) => (
          <Column key={size} align="center" gap={3}>
            <Row align="center" gap={3}>
              <Button size={size} startIcon={<IconAdd />}>
                New
              </Button>
              <IconButton size={size} icon={<IconEdit />} aria-label="Edit" />
            </Row>
            <Text variant="body-sm" emphasis="muted">
              {name}
            </Text>
          </Column>
        ))}
      </Row>
    </Example>
  );
}
