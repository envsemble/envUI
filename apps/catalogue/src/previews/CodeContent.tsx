import { Text } from '@envsemble/envui';
import { Code, CodeBlock } from '@envsemble/envui/content';
import { CodeDiff } from '@envsemble/envui/diff';
import { Example } from './Example';
import { Preview } from './Preview';

export function CodePreview() {
  return (
    <Preview>
      <Example title="Inline code">
        <Text>
          Set <Code>theme="dark"</Code> on the surrounding <Code>Theme</Code> component.
        </Text>
        <Text>
          Commit <Code>c9f60ee</Code> moves <Code>src/config/defaults.ts</Code> to the{' '}
          <Code>release-2.4</Code> branch.
        </Text>
      </Example>
      <Example
        title="Highlighted source"
        caption="Uses the code theme of the app theme. Copying preserves the original source."
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
      <Example
        title="Code diff"
        size="wide"
        caption="Rendered by Diffs in its Pierre theme for the app theme, which code blocks share."
      >
        <CodeDiff
          filename="settings.json"
          before={`{
  "theme": "light",
  "density": "standard",
  "notifications": true
}
`}
          after={`{
  "theme": "system",
  "density": "compact",
  "notifications": true,
  "language": "en"
}
`}
        />
      </Example>
    </Preview>
  );
}
