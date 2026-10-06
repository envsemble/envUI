import { useRef, useState } from 'react';
import { Button, Stack, Theme } from '@envsemble/envui';
import {
  RichText,
  RichTextEditor,
  type RichTextAttachment,
  type RichTextEditorHandle,
  type RichTextReference,
  type RichTextReferenceSource,
  type RichTextSlashCommand,
} from '@envsemble/envui/rich-text';

interface DeferredRequest<T> {
  query: string;
  aborted: boolean;
  resolve: (value: T) => void;
  reject: () => void;
}

declare global {
  interface Window {
    richTextFixture: {
      requests: DeferredRequest<readonly RichTextReference[]>[];
      uploads: DeferredRequest<RichTextAttachment | null>[];
    };
  }
}

window.richTextFixture = { requests: [], uploads: [] };

function deferred<T>(query: string, signal: AbortSignal, requests: DeferredRequest<T>[]) {
  return new Promise<T>((resolve, reject) => {
    const request = {
      query,
      aborted: signal.aborted,
      resolve,
      reject: () => reject(new Error('Host failed')),
    };
    requests.push(request);
    signal.addEventListener(
      'abort',
      () => {
        request.aborted = true;
      },
      { once: true },
    );
  });
}

export const punctuatedReference = {
  id: 'record/"42"[a]',
  label: 'River [east] "quote", slash/ amp&!',
  kind: 'application-record',
  href: '/records/42',
};
const references: RichTextReferenceSource[] = [
  {
    char: '@',
    label: 'People',
    items: () => [punctuatedReference, { id: 'person-2', label: 'Second person' }],
  },
  {
    char: '#',
    label: 'Records',
    items: () => [{ id: 'issue-17', label: 'Roadmap issue', kind: 'issue' }],
  },
  {
    char: '/',
    label: 'Files',
    items: () => [{ id: 'file-8', label: 'Release file', kind: 'file' }],
  },
];
const asyncReferences: RichTextReferenceSource[] = [
  {
    char: '@',
    label: 'Remote references',
    items: ({ query, signal }) => deferred(query, signal, window.richTextFixture.requests),
  },
];
const slashCommands: RichTextSlashCommand[] = [
  {
    id: 'host-greeting',
    label: 'Host greeting',
    run: (editor) => {
      editor.commands.insertContent('Hello from host');
    },
  },
];
const originalControlled = 'Original [guide](/guide)';

export function RichTextEditingFixture() {
  const fixtures = new URLSearchParams(location.search).getAll('fixture');
  const includes = (name: string) => fixtures.length === 0 || fixtures.includes(name);
  const [source, setSource] = useState('alpha');
  const [submitted, setSubmitted] = useState('');
  const [formDisabled, setFormDisabled] = useState(false);
  const [clickedReference, setClickedReference] = useState('');
  const [clickedLink, setClickedLink] = useState('');
  const [controlled, setControlled] = useState(originalControlled);
  const [rejectEdits, setRejectEdits] = useState(false);
  const [lastChange, setLastChange] = useState('');
  const [remoteDisabled, setRemoteDisabled] = useState(false);
  const [remoteReadOnly, setRemoteReadOnly] = useState(false);
  const [uploadReadOnly, setUploadReadOnly] = useState(false);
  const [uploadSource, setUploadSource] = useState('');
  const [scopedTheme, setScopedTheme] = useState<'light' | 'dark'>('light');
  const [themedSource, setThemedSource] = useState('seed');
  const [themedReadOnly, setThemedReadOnly] = useState(false);
  const [rendererLabel, setRendererLabel] = useState('First');
  const [keyboardClicks, setKeyboardClicks] = useState(0);
  const editorHandle = useRef<RichTextEditorHandle>(null);
  return (
    <Stack as="section" className="fixture-section" data-testid="rich-text-editing">
      {includes('form') && (
        <>
          <form
            data-testid="rich-text-form"
            onSubmit={(event) => {
              event.preventDefault();
              setSubmitted(
                String(new FormData(event.currentTarget).get('richSource') ?? 'missing'),
              );
            }}
          >
            <RichTextEditor
              ref={editorHandle}
              label="Rich source"
              defaultValue="alpha"
              name="richSource"
              references={references}
              disabled={formDisabled}
              onValueChange={setSource}
            />
            <Button type="submit">Submit rich text</Button>
            <Button type="reset">Reset rich text</Button>
          </form>
          <Button onClick={() => setFormDisabled((value) => !value)}>Toggle form disabled</Button>
          <Button
            onClick={() =>
              editorHandle.current?.editor?.commands.setContent(source, { contentType: 'markdown' })
            }
          >
            Reparse rich text
          </Button>
          <output data-testid="rich-text-source">{source}</output>
          <output data-testid="rich-text-submitted">{submitted}</output>
          <RichText
            data-testid="rich-text-preview"
            onReferenceClick={(reference, event) => {
              event.preventDefault();
              setClickedReference(
                `${reference.id}|${reference.label}|${reference.kind}|${reference.char}`,
              );
            }}
            onLinkClick={(href, event) => {
              event.preventDefault();
              setClickedLink(href);
            }}
          >
            {source}
          </RichText>
          <RichTextEditor
            data-testid="rich-text-readonly"
            label="Read only rich source"
            value={source}
            readOnly
            toolbar={false}
            onReferenceClick={(reference, event) => {
              event.preventDefault();
              setClickedReference(`editor:${reference.id}`);
            }}
            onLinkClick={(href, event) => {
              event.preventDefault();
              setClickedLink(`editor:${href}`);
            }}
          />
          <output data-testid="rich-text-reference-click">{clickedReference}</output>
          <output data-testid="rich-text-link-click">{clickedLink}</output>
        </>
      )}
      {includes('controlled') && (
        <div data-testid="rich-text-controlled">
          <RichTextEditor
            label="Controlled rich source"
            value={controlled}
            toolbar={false}
            onValueChange={(next) => {
              setLastChange(next);
              if (!rejectEdits) setControlled(next);
            }}
          />
          <Button onClick={() => setControlled('## Replacement\n\n[updated](/updated)')}>
            Replace rich text
          </Button>
          <Button
            onClick={() => {
              setControlled(originalControlled);
              setRejectEdits(true);
            }}
          >
            Reject rich edits
          </Button>
          <output data-testid="rich-text-last-change">{lastChange}</output>
        </div>
      )}
      {includes('remote') && (
        <div data-testid="rich-text-remote">
          <RichTextEditor
            label="Remote rich source"
            references={asyncReferences}
            toolbar={false}
            disabled={remoteDisabled}
            readOnly={remoteReadOnly}
          />
          <Button onClick={() => setRemoteDisabled((value) => !value)}>
            Toggle remote disabled
          </Button>
          <Button onClick={() => setRemoteReadOnly((value) => !value)}>
            Toggle remote read only
          </Button>
        </div>
      )}
      {includes('commands') && (
        <RichTextEditor
          data-testid="rich-text-commands"
          label="Command rich source"
          slashCommands={slashCommands}
          toolbar={false}
        />
      )}
      {includes('upload') && (
        <div data-testid="rich-text-upload">
          <RichTextEditor
            label="Attachment rich source"
            readOnly={uploadReadOnly}
            onValueChange={setUploadSource}
            onUpload={(file, { signal }) =>
              deferred(file.name, signal, window.richTextFixture.uploads)
            }
          />
          <Button onClick={() => setUploadReadOnly((value) => !value)}>
            Toggle upload read only
          </Button>
          <output data-testid="rich-text-upload-source">{uploadSource}</output>
        </div>
      )}
      {includes('themed') && (
        <Theme theme={scopedTheme} data-testid="rich-text-themed">
          <RichTextEditor
            label="Themed rich source"
            defaultValue="seed"
            references={references}
            readOnly={themedReadOnly}
            onValueChange={setThemedSource}
            renderReference={(reference, context) => (
              <span
                data-testid="rich-text-custom-reference"
                data-readonly={context.readOnly}
                data-selected={context.selected}
              >
                {rendererLabel} {reference.label}
              </span>
            )}
            onReferenceClick={() => setKeyboardClicks((count) => count + 1)}
          />
          <Button onClick={() => setScopedTheme((value) => (value === 'light' ? 'dark' : 'light'))}>
            Switch rich theme
          </Button>
          <Button onClick={() => setThemedReadOnly((value) => !value)}>
            Toggle themed read only
          </Button>
          <Button onClick={() => setRendererLabel('Updated')}>
            Change rich reference renderer
          </Button>
          <RichText
            data-testid="rich-text-keyboard-view"
            onReferenceClick={() => setKeyboardClicks((count) => count + 1)}
          >
            {themedSource}
          </RichText>
          <output data-testid="rich-text-keyboard-clicks">{keyboardClicks}</output>
        </Theme>
      )}
    </Stack>
  );
}
