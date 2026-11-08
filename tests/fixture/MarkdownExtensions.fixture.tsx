import { Markdown } from '@envsemble/envui/markdown';

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

export default function MarkdownExtensionsFixture() {
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
          '# Project plan\n\n> A quoted decision\n\nTODO\n\n| A | B |\n| - | - |\n| 1 | 2 |\n\nSome <span>inline</span> HTML\n\n<div>A block</div>\n\nPress <kbd>Ctrl</kbd>+<kbd>P</kbd> or <kbd><b>F1</b></kbd>.\n\nNot keys: <kbd onclick="alert(1)">A</kbd> <kbd class="x">B</kbd>'
        }
      </Markdown>
    </section>
  );
}
