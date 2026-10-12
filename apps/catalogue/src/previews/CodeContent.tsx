import { Text } from '@envsemble/envui';
import { Code, CodeBlock } from '@envsemble/envui/content';
import { Example } from './Example';
import { Preview } from './Preview';

export function CodePreview() {
  return (
    <Preview>
      <Example title="Inline code">
        <Text>
          Set <Code>theme="dark"</Code> on the surrounding <Code>Theme</Code> component.
        </Text>
      </Example>
      <Example
        title="Subtle inline code"
        caption="For prose dense with identifiers, paths and hashes, the subtle appearance follows the app theme."
      >
        <Text>
          The ledger pins revision <Code appearance="subtle">c9f60ee</Code> of{' '}
          <Code appearance="subtle">active/0013-envui-redesign/plan.md</Code> on branch{' '}
          <Code appearance="subtle">atlas-port</Code>.
        </Text>
      </Example>
      <Example
        title="Highlighted source"
        caption="Uses GitHub Dark Default in both app themes. Copying preserves the original source."
      >
        <CodeBlock
          language="tsx"
          label="A React component"
          copyable
        >{`import { Button } from '@envsemble/envui';

export function SaveAction({ onSave }: { onSave: () => void }) {
  return <Button onClick={onSave}>Save changes</Button>;
}`}</CodeBlock>
      </Example>
      <Example title="Wrapped source">
        <CodeBlock language="json" wrap copyable>{`{
  "description": "Long lines can wrap when readability matters more than preserving the source layout. The copied text retains its original line breaks.",
  "enabled": true
}`}</CodeBlock>
      </Example>
      <Example title="Plain text">
        <CodeBlock copyable>{`Build completed.
3 files updated.
No remote assets are required.`}</CodeBlock>
      </Example>
    </Preview>
  );
}
