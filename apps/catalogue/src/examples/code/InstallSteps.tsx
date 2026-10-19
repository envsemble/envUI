import { Stack, Text } from '@envsemble/envui';
import { Code, CodeBlock } from '@envsemble/envui/content';

export default function InstallSteps() {
  return (
    <Stack gap={3}>
      <Text>
        Run <Code>npm run build</Code> before you deploy. The latest release is commit{' '}
        <Code>c9f60ee</Code>.
      </Text>
      <CodeBlock language="sh" label="Terminal" copyable>
        {'npm ci\nnpm run build\nnpm run deploy -- --environment staging'}
      </CodeBlock>
    </Stack>
  );
}
