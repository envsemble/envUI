import { useState } from 'react';
import { Text } from '@envsemble/envui';
import { Markdown } from '@envsemble/envui/content';
import { Example } from './Example';
import { Preview } from './Preview';

export const markdownSample = `## Release checklist

Prepare **Router A** for the autumn release. Use \`release-ready\` as the status label.

- Confirm the device configuration.
- Review [job #42](/jobs/42) before restarting the service.
  - Keep the existing configuration as a backup.

> Schedule the restart after the backup completes.

### Progress

| Task | Status |
| --- | --- |
| Configuration | Ready |
| Backup | In progress |

- [x] Configuration reviewed
- [ ] Restart scheduled

### Configuration

\`\`\`json
{
  "device": "Router A",
  "enabled": true,
  "retries": 3
}
\`\`\`
`;

export function MarkdownPreview() {
  const [selectedLink, setSelectedLink] = useState('');
  return (
    <Preview>
      <Example title="Prose and code">
        <Markdown headingOffset={1} codeCopyable>
          {markdownSample}
        </Markdown>
      </Example>
      <Example title="Application links">
        <Markdown
          renderLink={({ href, children, ...props }) => (
            <a
              {...props}
              href={href}
              onClick={(event) => {
                event.preventDefault();
                setSelectedLink(href);
              }}
            >
              {children}
            </a>
          )}
        >
          {'Inspect [Router A](/devices/router-a), then review [job #42](/jobs/42).'}
        </Markdown>
        {selectedLink && (
          <Text variant="caption" role="status">
            Selected destination: {selectedLink}
          </Text>
        )}
      </Example>
    </Preview>
  );
}
