import { CodeBlock } from '@envsemble/envui/code';

export default function CommandToCopy() {
  return (
    <CodeBlock language="sh" label="Terminal" copyable>
      {'npm ci\nnpm run build'}
    </CodeBlock>
  );
}
