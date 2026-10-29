import { useState } from 'react';
import { Button, IconButton, Menu, Column, Row, Text, Tooltip } from '@envsemble/envui';
import { IconArchive } from '@envsemble/envui/icons/Archive';
import { IconDownload } from '@envsemble/envui/icons/Download';
import { IconEdit } from '@envsemble/envui/icons/Edit';
import { IconFileCopy } from '@envsemble/envui/icons/FileCopy';
import { IconLink } from '@envsemble/envui/icons/Link';
import { IconMoreVert } from '@envsemble/envui/icons/MoreVert';
import { IconShare } from '@envsemble/envui/icons/Share';

export default function OverflowActions() {
  const [status, setStatus] = useState('');
  return (
    <Column gap={3}>
      <Row wrap align="center" justify="between" gap={3}>
        <Text render={<h3 />} variant="title">
          Launch brief
        </Text>
        {/* The two actions people take most stay visible; the rest wait in one menu. */}
        <Row wrap align="center" gap={2}>
          <Button
            variant="secondary"
            startIcon={<IconShare />}
            href="/documents/launch-brief/share"
          >
            Share
          </Button>
          <Button startIcon={<IconEdit />} href="/documents/launch-brief/edit">
            Edit
          </Button>
          <Menu.Root
            aria-label="Launch brief actions"
            trigger={
              // The Tooltip names the icon-only trigger and passes the menu's props on to it.
              <Tooltip content="More actions">
                <IconButton variant="ghost" icon={<IconMoreVert />} aria-label="More actions" />
              </Tooltip>
            }
          >
            {/* The application does each item's work; the example reports it in the status. */}
            <Menu.Item
              icon={<IconFileCopy />}
              onClick={() => setStatus('Launch brief duplicated.')}
            >
              Duplicate
            </Menu.Item>
            <Menu.Item
              icon={<IconLink />}
              onClick={() =>
                navigator.clipboard
                  .writeText(new URL('/documents/launch-brief', location.origin).href)
                  .then(
                    () => setStatus('Link copied.'),
                    () => setStatus('Couldn’t copy the link.'),
                  )
              }
            >
              Copy link
            </Menu.Item>
            <Menu.Item
              icon={<IconDownload />}
              onClick={() => setStatus('Launch brief exported as launch-brief.pdf.')}
            >
              Export as PDF
            </Menu.Item>
            <Menu.Separator />
            <Menu.Item icon={<IconArchive />} onClick={() => setStatus('Launch brief archived.')}>
              Archive
            </Menu.Item>
          </Menu.Root>
        </Row>
      </Row>
      <Text role="status" variant="body-sm" emphasis="muted">
        {status}
      </Text>
    </Column>
  );
}
