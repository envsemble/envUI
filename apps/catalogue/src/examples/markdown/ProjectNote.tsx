import { Markdown } from '@envsemble/envui/content';

const note = `## Launch checklist

Prepare **Northwind** for the spring launch.

- Confirm the pricing with Priya Shah.
- Review the [launch plan](/documents/launch-plan) before sharing it.
  - Keep the original notes.

> Share the plan once the review is done.

| Task | Owner | Status |
| --- | --- | --- |
| Pricing page | Sam Lee | Ready |
| Release notes | Alex Morgan | In review |

- [x] Outline written
- [ ] Review scheduled

Save a draft with <kbd>Ctrl</kbd>+<kbd>S</kbd>, then build:

\`\`\`sh
npm run build
\`\`\`
`;

export default function ProjectNote() {
  // The note sits under the page's h2, so its headings start one level lower.
  return (
    <Markdown headingOffset={1} codeCopyable>
      {note}
    </Markdown>
  );
}
