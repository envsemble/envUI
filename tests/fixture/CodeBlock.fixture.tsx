import { CodeBlock, EnvUIProvider, Column } from '@envsemble/envui';
import { HighlightedCodeBlock } from '@envsemble/envui/code';

export const mount = 'standalone';

const source = 'npm install @envsemble/envui\nnpm run build';

export default function CodeBlockFixture() {
  return (
    <Column gap={4}>
      <CodeBlock copyable data-testid="install">
        {source}
      </CodeBlock>
      <HighlightedCodeBlock language="ts" label="answer.ts" data-testid="highlighted">
        {'const answer = 42;'}
      </HighlightedCodeBlock>
      <EnvUIProvider
        messages={{
          codeBlock: {
            title: 'Quelltext',
            copy: 'Quelltext kopieren',
            copied: 'Quelltext kopiert',
            copiedStatus: 'Kopiert.',
            label: ({ language }) => `Quelltext in ${language}`,
            plainText: 'Klartext',
            selected: 'Quelltext markiert. Kopieren Sie ihn mit der Tastatur.',
          },
        }}
      >
        <CodeBlock copyable data-testid="translated">
          Hallo
        </CodeBlock>
      </EnvUIProvider>
    </Column>
  );
}
