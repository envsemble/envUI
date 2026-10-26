import { CodeBlock } from '@envsemble/envui/content';

export default function CommandToCopy() {
  return (
    <CodeBlock language="sh" label="Terminal" copyable>
      {'npm ci\nnpm run build'}
    </CodeBlock>
  );
}
