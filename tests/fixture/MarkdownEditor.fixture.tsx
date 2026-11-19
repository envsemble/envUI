import { useRef, useState, type ReactNode } from 'react';
import { Button, Column, Toolbar } from '@envsemble/envui';
import { IconAlternateEmail } from '@envsemble/envui/icons/AlternateEmail';
import { HighlightedCodeBlock } from '@envsemble/envui/code';
import { MarkdownEditor, type MarkdownEditorHandle } from '@envsemble/envui/markdown';

const ownPreviewComponents = {
  strong: ({ children }: { children?: ReactNode }) => <strong data-mention="">{children}</strong>,
};

const defaultSource =
  Array.from(
    { length: 40 },
    (_, index) =>
      `Paragraph ${index}: [Reference ${index}](/reference/${index}) explains the editing workload.`,
  ).join('\n\n') + '\n\n```javascript\nconst example = 1;\n```';

export default function MarkdownEditorFixture() {
  const [submitted, setSubmitted] = useState('');
  const [controlled, setControlled] = useState('## Original heading\n\n[Original](/original)');
  const [headingOffset, setHeadingOffset] = useState<0 | 1>(0);
  const [requiredSubmissions, setRequiredSubmissions] = useState(0);
  const [block, setBlock] = useState<string | null>(null);
  const [commentMode, setCommentMode] = useState<'write' | 'preview'>('write');
  const commentEditor = useRef<MarkdownEditorHandle>(null);
  return (
    <Column gap={4} render={<section />} className="fixture-section" data-testid="markdown-editing">
      <form
        data-testid="markdown-form"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(String(new FormData(event.currentTarget).get('source')));
        }}
      >
        <MarkdownEditor
          label="Workload source"
          name="source"
          rows={4}
          defaultValue={defaultSource}
        />
        <Button type="submit">Submit Markdown</Button>
        <Button type="reset" variant="secondary">
          Reset Markdown
        </Button>
      </form>
      <output data-testid="markdown-submitted">{submitted}</output>
      <div data-testid="controlled-markdown">
        <MarkdownEditor
          label="Controlled source"
          value={controlled}
          onValueChange={setControlled}
          toolbar={false}
          previewProps={{ headingOffset }}
        />
        <Button onClick={() => setControlled('## Replacement heading\n\n[Updated](/updated)')}>
          Replace Markdown document
        </Button>
        <Button onClick={() => setHeadingOffset((offset) => (offset ? 0 : 1))}>
          Change preview heading offset
        </Button>
      </div>
      <form
        data-testid="required-markdown"
        onSubmit={(event) => {
          event.preventDefault();
          setRequiredSubmissions((count) => count + 1);
        }}
      >
        <MarkdownEditor
          label="Required source"
          name="requiredSource"
          required
          className="required-markdown-editor"
          style={{ maxInlineSize: '40rem' }}
        />
        <Button type="submit">Submit required Markdown</Button>
        <output data-testid="required-markdown-submissions">{requiredSubmissions}</output>
      </form>
      <div data-testid="own-toolbar-markdown">
        <MarkdownEditor
          label="Comment source"
          toolbar={['bold']}
          editorRef={commentEditor}
          toolbarEnd={
            <Toolbar.Button
              icon={<IconAlternateEmail />}
              label="Mention"
              onClick={() => commentEditor.current?.insert('**@alex** ')}
            />
          }
          viewSwitch={false}
          mode={commentMode}
          onModeChange={setCommentMode}
          previewProps={{ components: ownPreviewComponents }}
        />
        <Button onClick={() => setCommentMode((mode) => (mode === 'write' ? 'preview' : 'write'))}>
          Toggle comment preview
        </Button>
        <Button onClick={() => commentEditor.current?.insert('🎉')}>Insert party emoji</Button>
      </div>
      <div data-testid="highlight-lifecycle">
        <Button onClick={() => setBlock('const first = 1;')}>Show code workload</Button>
        <Button onClick={() => setBlock('const latest = 2;')}>Replace code workload</Button>
        <Button onClick={() => setBlock(null)}>Remove code workload</Button>
        {block !== null && (
          <HighlightedCodeBlock language="javascript">{block}</HighlightedCodeBlock>
        )}
      </div>
    </Column>
  );
}
