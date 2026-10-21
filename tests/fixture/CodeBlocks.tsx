import { EnvUIProvider, Column } from '@envsemble/envui';
import { CodeBlock } from '@envsemble/envui/content';

const source = 'npm install @envsemble/envui\nnpm run build';

/** Code blocks to copy, in English and with the provider's words, mounted with ?fixture=code-block. */
export function CodeBlockFixture() {
  return (
    <Column gap={4}>
      <CodeBlock copyable language="sh" data-testid="install">
        {source}
      </CodeBlock>
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
