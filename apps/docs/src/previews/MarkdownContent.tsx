import { useState } from 'react';
import { Text } from '@envsemble/envui';
import { Markdown } from '@envsemble/envui/content';
import { Example } from './Example';
import { Preview } from './Preview';

const markdownSample = `## Project checklist

Prepare the **sample project** for review.

- Confirm the project details.
- Review the [draft document](/documents/draft) before sharing it.
  - Keep a copy of the original notes.

> Share the project after the review is complete.

### Progress

| Task | Status |
| --- | --- |
| Outline | Ready |
| Review | In progress |

- [x] Outline completed
- [ ] Review scheduled

`;

export function MarkdownPreview() {
  const [selectedLink, setSelectedLink] = useState('');
  return (
    <Preview>
      <Example
        title="Prose and formatting"
        caption="Task-list checkboxes are read-only; use Checkbox for interactive selection."
      >
        <Markdown headingOffset={1}>{markdownSample}</Markdown>
      </Example>
      <Example
        title="Application links"
        caption="Links remain ordinary URLs; the application decides how to open them."
      >
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
          {
            'Open the [sample project](/projects/sample), then review the [draft document](/documents/draft).'
          }
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
