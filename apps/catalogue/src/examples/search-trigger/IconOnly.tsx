import { useState } from 'react';
import { AvatarButton, IconButton, Kbd, Column, Row, Text, Tooltip } from '@envsemble/envui';
import { Search } from '@envsemble/envui/icons/Search';

/** ⌘ on Apple platforms, Ctrl elsewhere. */
const apple = typeof navigator !== 'undefined' && /mac|iphone|ipad/i.test(navigator.platform);

export default function IconOnly() {
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
            content={
              <Row render={<span />} align="center" gap={2}>
                Search <Kbd keys={[apple ? '⌘' : 'Ctrl', 'K']} />
              </Row>
            }
          >
            <IconButton
              variant="ghost"
              icon={<Search />}
              aria-label="Search"
              aria-keyshortcuts={apple ? 'Meta+K' : 'Control+K'}
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
