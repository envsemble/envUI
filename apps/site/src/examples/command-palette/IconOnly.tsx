import { useState } from 'react';
import {
  AvatarButton,
  IconButton,
  Kbd,
  Column,
  Row,
  Text,
  Tooltip,
  useModifierKey,
} from '@envsemble/envui';
import { IconSearch } from '@envsemble/envui/icons/Search';

export default function IconOnly() {
  const modifier = useModifierKey();
  const [searches, setSearches] = useState(0);
  return (
    <Column gap={3}>
      {/* A narrow header: the product's name at the start, its controls at the end. */}
      <Row align="center" justify="between" gap={2}>
        <Text variant="title" render={<span />}>
          Northwind
        </Text>
        <Row align="center" gap={1}>
          <Tooltip
            side="bottom"
            content={
              <Row render={<span />} align="center" gap={2}>
                Search <Kbd keys={[modifier.label, 'K']} />
              </Row>
            }
          >
            <IconButton
              variant="ghost"
              icon={<IconSearch />}
              aria-label="Search"
              aria-keyshortcuts={`${modifier.key}+K`}
              onClick={() => setSearches((count) => count + 1)}
            />
          </Tooltip>
          <AvatarButton name="Alex Morgan" size="sm" />
        </Row>
      </Row>
      <Text variant="caption" emphasis="muted" role="status">
        {searches > 0 ? `Search opened ${searches} ${searches === 1 ? 'time' : 'times'}` : ''}
      </Text>
    </Column>
  );
}
