import { Card, Text } from '@envsemble/envui';
import { Code, CodeBlock } from '@envsemble/envui/content';
import { Example } from './Example';
import { Preview } from './Preview';

export function CodePreview() {
  return (
    <Preview>
      <Example title="Inline code">
        <Card>
          <Text>
            Set <Code>theme="dark"</Code> on the surrounding <Code>Theme</Code> component.
          </Text>
        </Card>
      </Example>
      <Example
        title="Highlighted source"
        caption="Uses VS Code Light+ and Dark+ colors. Copying preserves the original source."
      >
        <Card>
          <CodeBlock
            language="tsx"
            label="A React component"
            copyable
          >{`import { Button } from '@envsemble/envui';

export function SaveAction({ onSave }: { onSave: () => void }) {
  return <Button onClick={onSave}>Save changes</Button>;
}`}</CodeBlock>
        </Card>
      </Example>
      <Example title="Wrapped source">
        <Card>
          <CodeBlock language="json" wrap>{`{
  "description": "Long lines can wrap when readability matters more than preserving the source layout. The copied text retains its original line breaks.",
  "enabled": true
}`}</CodeBlock>
        </Card>
      </Example>
      <Example title="Plain text">
        <Card>
          <CodeBlock>{`Build completed.
3 files updated.
No remote assets are required.`}</CodeBlock>
        </Card>
      </Example>
    </Preview>
  );
}
