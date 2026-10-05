import { useState } from 'react';
import { Button, Card, Tabs, Text } from '@envsemble/envui';
import { CodeBlock, Markdown, MarkdownEditor } from '@envsemble/envui/content';
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
  const [draft, setDraft] = useState(markdownSample);
  return (
    <Preview>
      <Example
        title="Rendered markdown"
        caption="Switch between Input to inspect the Markdown string and Output to see it rendered. Task-list checkboxes are read-only."
      >
        <Text>
          Use Markdown to display a Markdown string from your application, such as a saved
          description, project note or document. Headings, lists, links, quotes and tables use envUI
          typography and spacing.
        </Text>
        <Text>
          Rendering uses react-markdown with remark-gfm for GitHub Flavored Markdown features such
          as tables, task lists and strikethrough. Code blocks use Shiki for syntax highlighting.
          Raw HTML is ignored, and your application can customize how links open.
        </Text>
        <Card tone="pane">
          <Tabs
            aria-label="Markdown rendering example"
            defaultValue="output"
            items={[
              {
                value: 'input',
                button: <Button>Input</Button>,
                content: (
                  <CodeBlock language="markdown" copyable>
                    {markdownSample}
                  </CodeBlock>
                ),
              },
              {
                value: 'output',
                button: <Button>Output</Button>,
                content: (
                  <Markdown headingOffset={1} codeCopyable>
                    {markdownSample}
                  </Markdown>
                ),
              },
            ]}
          />
        </Card>
      </Example>
      <Example
        title="Markdown editor demo"
        caption="Edit the sample in Input, then open Output to see your changes rendered. This demo is not saved."
      >
        <Text>
          Use MarkdownEditor when people need to write or update that content. It edits an ordinary
          Markdown string and adds a formatting toolbar, undo and redo, and a Preview view using the
          same Markdown renderer shown above. This example uses Input and Output tabs to compare
          your draft with its rendered result.
        </Text>
        <Text>
          The editor is an envUI component built on a native textarea. Its outlined field grows with
          the content, and Markdown syntax stays visible while writing. Your application owns the
          value and saving; the card below is an interactive example you can try.
        </Text>
        <Card tone="pane">
          <Tabs
            aria-label="Markdown editor example"
            defaultValue="input"
            keepMounted
            items={[
              {
                value: 'input',
                button: <Button>Input</Button>,
                content: (
                  <MarkdownEditor
                    variant="outlined"
                    sizing="content"
                    aria-label="Markdown input"
                    value={draft}
                    onValueChange={setDraft}
                    rows={8}
                    preview={false}
                  />
                ),
              },
              {
                value: 'output',
                button: <Button>Output</Button>,
                content: (
                  <Markdown headingOffset={1} codeCopyable>
                    {draft}
                  </Markdown>
                ),
              },
            ]}
          />
        </Card>
      </Example>
    </Preview>
  );
}
