import { useCallback, useState, type MouseEvent } from 'react';
import { ActionGroup, Button, Card, Tabs, Text, Kbd } from '@envsemble/envui';
import { CodeBlock } from '@envsemble/envui/content';
import {
  RichText,
  RichTextEditor,
  type RichTextAttachment,
  type RichTextReference,
  type RichTextReferenceSource,
} from '@envsemble/envui/rich-text';
import { Example } from './Example';
import { Preview } from './Preview';

const initialNotes = `## Review notes

Share the **draft** with [reference id="contact%3Aada" label="Ada%20Lin" kind="contact" href="%2Fcontacts%2Fada" mentionSuggestionChar="%40"].

- [ ] Review the outline
- [x] Collect the notes

Add a contact, topic or file while writing.`;

const alternateNotes = `## Another draft

This document was loaded by the application.

Discuss [reference id="topic%3Aaccessibility" label="Accessibility" kind="topic" href="%2Ftopics%2Faccessibility" mentionSuggestionChar="%23"] before sharing.`;

const contacts: RichTextReference[] = [
  { id: 'contact:ada', label: 'Ada Lin', kind: 'contact', href: '/contacts/ada' },
  { id: 'contact:sam', label: 'Sam Rivera', kind: 'contact', href: '/contacts/sam' },
];
const topics: RichTextReference[] = [
  {
    id: 'topic:accessibility',
    label: 'Accessibility',
    kind: 'topic',
    href: '/topics/accessibility',
  },
  { id: 'topic:research', label: 'Research', kind: 'topic', href: '/topics/research' },
];
const files: RichTextReference[] = [
  { id: 'file:outline', label: 'Outline.pdf', kind: 'file', href: '/files/outline' },
  { id: 'file:notes', label: 'Notes.txt', kind: 'file', href: '/files/notes' },
];

function source(
  char: string,
  label: string,
  collection: RichTextReference[],
): RichTextReferenceSource {
  return {
    char,
    label,
    items: async ({ query, signal }) =>
      signal.aborted
        ? []
        : collection.filter((item) => item.label.toLowerCase().includes(query.toLowerCase())),
  };
}
const references = [
  source('@', 'Contacts', contacts),
  source('#', 'Topics', topics),
  source('/', 'Files', files),
];

async function sampleUpload(
  file: File,
  { signal }: { signal: AbortSignal },
): Promise<RichTextAttachment | null> {
  return signal.aborted
    ? null
    : {
        kind: 'file',
        id: `file:${file.name}`,
        label: file.name,
        url: `/files/${encodeURIComponent(file.name)}`,
      };
}

export function RichTextPreview() {
  const [draft, setDraft] = useState(initialNotes);
  const [slashDraft, setSlashDraft] = useState('');
  const [selected, setSelected] = useState('');
  const selectReference = useCallback(
    (reference: RichTextReference, event: MouseEvent<HTMLElement>) => {
      event.preventDefault();
      setSelected(reference.label);
    },
    [],
  );
  return (
    <Preview>
      <Example
        title="Formatted editing and saved content"
        caption="This draft exists only in this example. Markdown is normalized when edited; reference IDs remain in the saved source."
      >
        <Text>
          Format the draft directly. Type <Kbd>@</Kbd> for contacts, <Kbd>#</Kbd> for topics or{' '}
          <Kbd>/</Kbd> for files, then use <Kbd>↑</Kbd> <Kbd>↓</Kbd> and <Kbd>Enter</Kbd> to choose
          a result; <Kbd>Esc</Kbd> dismisses the menu. These small collections stand in for
          application searches.
        </Text>
        <Text>
          Read-only uses the same document schema and references. Attach files delegates to a sample
          application callback that returns a file reference; this demo does not upload data. Load
          another draft demonstrates replacing a controlled document from outside the editor.
        </Text>
        <ActionGroup>
          <Button variant="secondary" onClick={() => setDraft(alternateNotes)}>
            Load another draft
          </Button>
        </ActionGroup>
        <Card tone="pane">
          <Tabs
            aria-label="Rich text example"
            defaultValue="editor"
            keepMounted
            items={[
              {
                value: 'editor',
                button: <Button>Editor</Button>,
                content: (
                  <RichTextEditor
                    label="Rich text notes"
                    value={draft}
                    onValueChange={setDraft}
                    references={references}
                    onReferenceClick={selectReference}
                    onUpload={sampleUpload}
                  />
                ),
              },
              {
                value: 'viewer',
                button: <Button>Read-only</Button>,
                content: <RichText onReferenceClick={selectReference}>{draft}</RichText>,
              },
              {
                value: 'source',
                button: <Button>Markdown source</Button>,
                content: (
                  <CodeBlock language="markdown" copyable>
                    {draft}
                  </CodeBlock>
                ),
              },
            ]}
          />
        </Card>
        {selected && <Text role="status">Selected reference: {selected}</Text>}
      </Example>
      <Example
        title="Optional slash commands"
        caption="Use / for block commands or a reference source in a given editor. The application can also supply custom Tiptap commands."
      >
        <Text>
          Type / on a new paragraph to choose a standard formatting command with the same keyboard
          menu. This editor enables the built-in slash commands through one public prop.
        </Text>
        <RichTextEditor
          label="Slash command notes"
          value={slashDraft}
          onValueChange={setSlashDraft}
          slashCommands
          placeholder="Type / to choose a block"
        />
      </Example>
    </Preview>
  );
}
