import { useState } from 'react';
import { Button, IconButton, Menu, Stack, Text, Tooltip } from '@envsemble/envui';
import { Archive } from '@envsemble/envui/icons/Archive';
import { Download } from '@envsemble/envui/icons/Download';
import { Edit } from '@envsemble/envui/icons/Edit';
import { FileCopy } from '@envsemble/envui/icons/FileCopy';
import { Link as LinkIcon } from '@envsemble/envui/icons/Link';
import { MoreVert } from '@envsemble/envui/icons/MoreVert';
import { Share } from '@envsemble/envui/icons/Share';

export default function OverflowActions() {
  const [status, setStatus] = useState('');
  return (
    <Stack gap={3}>
      <Stack direction="row" wrap align="center" justify="between" gap={3}>
        <Text render={<h3 />} variant="title">
          Launch brief
        </Text>
        {/* The two actions people take most stay visible; the rest wait in one menu. */}
        <Stack direction="row" wrap align="center" gap={2}>
          <Button variant="secondary" startIcon={<Share />} href="/documents/launch-brief/share">
            Share
          </Button>
          <Button startIcon={<Edit />} href="/documents/launch-brief/edit">
            Edit
          </Button>
          <Menu.Root
            aria-label="Launch brief actions"
            trigger={
              // The Tooltip names the icon-only trigger and passes the menu's props on to it.
              <Tooltip content="More actions">
                <IconButton variant="ghost" icon={<MoreVert />} aria-label="More actions" />
              </Tooltip>
            }
          >
            {/* The application does each item's work; the example reports it in the status. */}
            <Menu.Item icon={<FileCopy />} onClick={() => setStatus('Launch brief duplicated.')}>
              Duplicate
            </Menu.Item>
            <Menu.Item
              icon={<LinkIcon />}
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
              icon={<Download />}
              onClick={() => setStatus('Launch brief exported as launch-brief.pdf.')}
            >
              Export as PDF
            </Menu.Item>
            <Menu.Separator />
            <Menu.Item icon={<Archive />} onClick={() => setStatus('Launch brief archived.')}>
              Archive
            </Menu.Item>
          </Menu.Root>
        </Stack>
      </Stack>
      <Text role="status" variant="body-sm" emphasis="muted">
        {status}
      </Text>
    </Stack>
  );
}
