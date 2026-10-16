import { useState } from 'react';
import { Link, Stack, Text } from '@envsemble/envui';
import { Markdown } from '@envsemble/envui/content';

const text =
  'See the [launch plan](/documents/launch-plan) and the [pricing research](/documents/pricing), or the [public changelog](https://example.com/changelog).';

export default function OpenInPanel() {
  const [opened, setOpened] = useState('');
  return (
    <Stack gap={3}>
      <Markdown
        renderLink={({ href, children, ...props }) => (
          <Link
            {...props}
            href={href}
            onClick={(event) => {
              // Plain clicks on document links open a panel; modified clicks keep the browser's.
              const plain =
                event.button === 0 &&
                !event.metaKey &&
                !event.ctrlKey &&
                !event.shiftKey &&
                !event.altKey;
              if (plain && href.startsWith('/documents/')) {
                event.preventDefault();
                setOpened(`Opened ${href} in the side panel`);
              }
            }}
          >
            {children}
          </Link>
        )}
      >
        {text}
      </Markdown>
      <Text variant="caption" emphasis="muted" role="status">
        {opened}
      </Text>
    </Stack>
  );
}
