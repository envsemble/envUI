import {
  Accordion,
  Button,
  Composer,
  Disclosure,
  IconButton,
  Kbd,
  Message,
  MessageList,
} from '@envsemble/envui';
import { Code, CodeBlock, Markdown, MarkdownEditor } from '@envsemble/envui/content';
import { CodeDiff } from '@envsemble/envui/diff';
import { IconAttachFile } from '@envsemble/envui/icons/AttachFile';
import { Cell, Section, Strip, interactionStates } from './ContactSheetParts.fixture.js';

function Accordions() {
  const items = (
    <>
      <Accordion.Item value="billing" title="Billing">
        Invoices go out on the first of the month.
      </Accordion.Item>
      <Accordion.Item value="seats" title="Seats">
        Add seats at any time; we prorate them.
      </Accordion.Item>
      <Accordion.Item value="export" title="Export (disabled)" disabled>
        Export everything as CSV.
      </Accordion.Item>
    </>
  );
  return (
    <Section name="Accordion">
      <Strip>
        <Cell caption="Billing open, Export disabled" width="22rem">
          <Accordion.Root defaultValue={['billing']}>{items}</Accordion.Root>
        </Cell>
        {interactionStates.slice(1).map(({ caption, force }) => (
          <Cell
            key={caption}
            caption={`Seats: ${caption}`}
            force={force}
            target=".env-accordion-item:nth-child(2) button"
            width="22rem"
          >
            <Accordion.Root>{items}</Accordion.Root>
          </Cell>
        ))}
        <Cell caption="Multiple open" width="22rem">
          <Accordion.Root multiple defaultValue={['billing', 'seats']}>
            {items}
          </Accordion.Root>
        </Cell>
        <Cell caption="Disabled" width="22rem">
          <Accordion.Root disabled>{items}</Accordion.Root>
        </Cell>
        <Cell caption="Skeleton" width="22rem">
          <Accordion.Root skeleton>{items}</Accordion.Root>
        </Cell>
      </Strip>
    </Section>
  );
}

function Disclosures() {
  return (
    <Section name="Disclosure">
      <Strip>
        {interactionStates.map(({ caption, force }) => (
          <Cell key={caption} caption={caption} force={force} target="summary" width="18rem">
            <Disclosure title="Advanced settings">Retry failed jobs three times.</Disclosure>
          </Cell>
        ))}
        <Cell caption="Open" width="18rem">
          <Disclosure title="Advanced settings" defaultOpen>
            Retry failed jobs three times.
          </Disclosure>
        </Cell>
      </Strip>
    </Section>
  );
}

const source = `import { Button } from '@envsemble/envui';

export function Save({ pending }: { pending: boolean }) {
  return <Button pending={pending}>Save changes</Button>;
}`;
const before = `export function total(items) {
  let sum = 0;
  for (const item of items) sum += item.price;
  return sum;
}`;
const after = `export function total(items: Item[]) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}`;

function Codes() {
  return (
    <Section name="Code, CodeBlock, CodeDiff, Kbd">
      <Strip label="Inline">
        <Cell caption="Code in text" width="22rem">
          <p style={{ margin: 0 }}>
            Run <Code>npm install</Code> and import <Code>@envsemble/envui</Code>.
          </p>
        </Cell>
        <Cell caption="Kbd">
          <Kbd keys={['Ctrl', 'K']} />
        </Cell>
        <Cell caption="Kbd, one key">
          <Kbd keys={['Esc']} />
        </Cell>
        <Cell caption="Kbd in text" width="16rem">
          <p style={{ margin: 0 }}>
            Press <Kbd keys={['Shift', '?']} /> for shortcuts.
          </p>
        </Cell>
      </Strip>
      <Strip label="CodeBlock">
        <Cell caption="Language, label, copyable" width="30rem">
          <CodeBlock language="tsx" label="Save.tsx" copyable>
            {source}
          </CodeBlock>
        </Cell>
        <Cell caption="Copy: hover" force="hover" target="button" width="30rem">
          <CodeBlock language="tsx" copyable>
            {source}
          </CodeBlock>
        </Cell>
        <Cell caption="Wrapping, no language" width="20rem">
          <CodeBlock wrap>
            {
              'curl -X POST https://api.example.com/v1/projects -H "Authorization: Bearer $TOKEN" -d \'{"name":"Northwind"}\''
            }
          </CodeBlock>
        </Cell>
      </Strip>
      <Strip label="CodeDiff">
        <Cell caption="Header, auto layout (split where wide)" width="66rem">
          <CodeDiff filename="total.ts" language="ts" before={before} after={after} />
        </Cell>
        <Cell caption="Unified, no header" width="30rem">
          <CodeDiff
            filename="total.ts"
            language="ts"
            layout="unified"
            header={false}
            before={before}
            after={after}
          />
        </Cell>
      </Strip>
    </Section>
  );
}

function Composers() {
  const start = <IconButton variant="text" icon={<IconAttachFile />} aria-label="Attach files" />;
  return (
    <Section name="Composer">
      <Strip>
        <Cell caption="Empty, description" width="26rem">
          <Composer
            aria-label="Comment"
            placeholder="Add a comment"
            start={start}
            description="Files up to 10 MB."
            onSend={() => {}}
          />
        </Cell>
        <Cell caption="Hover" force="hover" target="textarea" width="26rem">
          <Composer
            aria-label="Comment"
            placeholder="Add a comment"
            start={start}
            onSend={() => {}}
          />
        </Cell>
        <Cell caption="Focus-visible, filled" force="focus" target="textarea" width="26rem">
          <Composer
            aria-label="Comment"
            defaultValue="Ship it on Friday."
            start={start}
            onSend={() => {}}
          />
        </Cell>
        <Cell caption="Pending (sending)" width="26rem">
          <Composer
            aria-label="Comment"
            defaultValue="Ship it on Friday."
            pending
            onSend={() => {}}
          />
        </Cell>
        <Cell caption="Running (stop)" width="26rem">
          <Composer aria-label="Prompt" running onSend={() => {}} onStop={() => {}} />
        </Cell>
        <Cell caption="Disabled" width="26rem">
          <Composer aria-label="Comment" placeholder="Add a comment" disabled onSend={() => {}} />
        </Cell>
      </Strip>
    </Section>
  );
}

const markdown = `## Release notes

The **pricing page** ships first, then _onboarding_. See the [plan](#plan).

- Book the venue
- Send the press kit
  1. Draft
  2. Review

> Quotes stand out from the text.

| Step | Owner | Due |
| ---- | ----- | --: |
| Draft | Alex | 12 Nov |
| Review | Sam | 14 Nov |

\`\`\`ts
const launch = new Date('2026-11-20');
\`\`\``;

function Markdowns() {
  return (
    <Section name="Markdown and MarkdownEditor">
      <Strip label="Markdown">
        <Cell caption="Headings, lists, quote, table, code" width="36rem">
          <Markdown headingOffset={1} codeCopyable>
            {markdown}
          </Markdown>
        </Cell>
      </Strip>
      <Strip label="Editor">
        <Cell caption="Outline, toolbar" width="24rem">
          <MarkdownEditor
            label="Description"
            description="Markdown: headings, lists, links and code."
            rows={3}
            defaultValue="Ship the **pricing page** first."
          />
        </Cell>
        <Cell caption="Focus-visible" force="focus" target="textarea" width="24rem">
          <MarkdownEditor
            label="Description"
            rows={3}
            defaultValue="Ship the **pricing page** first."
          />
        </Cell>
        <Cell caption="Preview" width="24rem">
          <MarkdownEditor
            label="Description"
            rows={3}
            preview
            defaultValue="Ship the **pricing page** first."
          />
        </Cell>
        <Cell caption="Ghost, content sizing" width="24rem">
          <MarkdownEditor
            label="Description"
            variant="ghost"
            sizing="content"
            rows={2}
            defaultValue="Ship the **pricing page** first."
          />
        </Cell>
        <Cell caption="Invalid" width="24rem">
          <MarkdownEditor
            label="Description"
            rows={2}
            defaultValue="Short."
            error="Write at least two sentences."
          />
        </Cell>
        <Cell caption="No toolbar, disabled" width="24rem">
          <MarkdownEditor
            label="Description"
            rows={2}
            toolbar={false}
            disabled
            defaultValue="Ship the **pricing page** first."
          />
        </Cell>
      </Strip>
    </Section>
  );
}

function Messages() {
  return (
    <Section name="Message and MessageList">
      <Strip>
        <Cell caption="Other and self, author, meta, actions" width="26rem">
          <MessageList aria-label="Conversation">
            <Message
              from="other"
              author="Assistant"
              meta="09:40"
              actions={
                <Button variant="outline" size="sm">
                  Reply
                </Button>
              }
            >
              The review is on Friday at ten.
            </Message>
            <Message from="self" meta="09:41">
              Thanks, I will bring the budget.
            </Message>
          </MessageList>
        </Cell>
        <Cell caption="Sending, failed" width="26rem">
          <MessageList aria-label="Conversation">
            <Message from="self" status="sending">
              On my way.
            </Message>
            <Message
              from="self"
              status="failed"
              actions={<Button variant="text">Try again</Button>}
            >
              Can we move it to Monday?
            </Message>
          </MessageList>
        </Cell>
        <Cell caption="Busy list (a reply coming)" width="26rem">
          <MessageList aria-label="Conversation" busy busyAuthor="Assistant">
            <Message from="self">Summarise the notes.</Message>
          </MessageList>
        </Cell>
        <Cell caption="Skeleton" width="26rem">
          <MessageList aria-label="Conversation">
            <Message from="other" skeleton author="Assistant">
              Loading the reply text here.
            </Message>
            <Message from="self" skeleton>
              Loading.
            </Message>
          </MessageList>
        </Cell>
      </Strip>
    </Section>
  );
}

export function ContentSheet() {
  return (
    <>
      <Accordions />
      <Disclosures />
      <Codes />
      <Composers />
      <Markdowns />
      <Messages />
    </>
  );
}
