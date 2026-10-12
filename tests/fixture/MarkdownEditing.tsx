import { useState } from 'react';
import { Button, Stack } from '@envsemble/envui';
import {
  CodeBlock,
  Markdown,
  MarkdownEditor,
  type MarkdownLinkProps,
} from '@envsemble/envui/content';

declare global {
  interface Window {
    markdownPreviewWork: { linkRenders: number };
  }
}

window.markdownPreviewWork = { linkRenders: 0 };

const defaultSource =
  Array.from(
    { length: 40 },
    (_, index) =>
      `Paragraph ${index}: [Reference ${index}](/reference/${index}) explains the editing workload.`,
  ).join('\n\n') + '\n\n```javascript\nconst example = 1;\n```';

function PreviewLink({ children, onClick, ...props }: MarkdownLinkProps) {
  const [visits, setVisits] = useState(0);
  return (
    <a
      {...props}
      data-visits={visits}
      onClick={(event) => {
        event.preventDefault();
        onClick?.(event);
        setVisits((count) => count + 1);
      }}
    >
      {children}
    </a>
  );
}

function renderPreviewLink(props: MarkdownLinkProps) {
  window.markdownPreviewWork.linkRenders++;
  return <PreviewLink {...props} />;
}

export function MarkdownEditingFixture() {
  const [submitted, setSubmitted] = useState('');
  const [controlled, setControlled] = useState('## Original heading\n\n[Original](/original)');
  const [headingOffset, setHeadingOffset] = useState<0 | 1>(0);
  const [requiredSubmissions, setRequiredSubmissions] = useState(0);
  const [block, setBlock] = useState<string | null>(null);
  return (
    <Stack as="section" className="fixture-section" data-testid="markdown-editing">
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
          previewProps={{ renderLink: renderPreviewLink }}
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
        <MarkdownEditor label="Required source" name="requiredSource" required />
        <Button type="submit">Submit required Markdown</Button>
        <output data-testid="required-markdown-submissions">{requiredSubmissions}</output>
      </form>
      <div data-testid="highlight-lifecycle">
        <Button onClick={() => setBlock('const first = 1;')}>Show code workload</Button>
        <Button onClick={() => setBlock('const latest = 2;')}>Replace code workload</Button>
        <Button onClick={() => setBlock(null)}>Remove code workload</Button>
        {block !== null && <CodeBlock language="javascript">{block}</CodeBlock>}
      </div>
    </Stack>
  );
}

interface HastNode {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

/** A small rehype plugin: headings get ids from their text. */
function headingIds() {
  const text = (node: HastNode): string =>
    node.type === 'text' ? (node.value ?? '') : (node.children ?? []).map(text).join('');
  return (tree: HastNode) => {
    const visit = (node: HastNode) => {
      if (node.type === 'element' && /^h[1-6]$/.test(node.tagName ?? ''))
        node.properties = {
          ...node.properties,
          id: text(node).toLowerCase().replace(/\W+/g, '-'),
        };
      node.children?.forEach(visit);
    };
    visit(tree);
  };
}

/** Stands in for rehype-raw: raw HTML that reaches the HTML tree would show as marked text. */
function renderRaw() {
  return (tree: HastNode) => {
    const visit = (node: HastNode) => {
      node.children = node.children?.map((child) =>
        child.type === 'raw'
          ? {
              type: 'element',
              tagName: 'mark',
              properties: { 'data-raw': '' },
              children: [{ type: 'text', value: child.value }],
            }
          : child,
      );
      node.children?.forEach(visit);
    };
    visit(tree);
  };
}

/** A small remark plugin: the text "TODO" becomes emphasized. */
function emphasizeTodo() {
  interface MdastNode {
    type: string;
    value?: string;
    children?: MdastNode[];
  }
  return (tree: MdastNode) => {
    const visit = (node: MdastNode) => {
      if (node.type === 'emphasis') return;
      node.children = node.children?.map((child) =>
        child.type === 'text' && child.value === 'TODO'
          ? { type: 'emphasis', children: [{ type: 'text', value: 'TODO' }] }
          : child,
      );
      node.children?.forEach(visit);
    };
    visit(tree);
  };
}

export function MarkdownExtensionsFixture() {
  return (
    <section data-testid="markdown-extensions">
      <Markdown
        headingOffset={1}
        className="fixture-markdown"
        rehypePlugins={[headingIds, renderRaw]}
        remarkPlugins={[emphasizeTodo]}
        components={{
          blockquote: ({ node: _node, ...props }) => <blockquote {...props} data-custom-quote="" />,
        }}
      >
        {
          '# Project plan\n\n> A quoted decision\n\nTODO\n\n| A | B |\n| - | - |\n| 1 | 2 |\n\nSome <span>inline</span> HTML\n\n<div>A block</div>'
        }
      </Markdown>
    </section>
  );
}
