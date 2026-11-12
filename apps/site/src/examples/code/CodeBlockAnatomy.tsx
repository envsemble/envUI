import { CodeBlock } from '@envsemble/envui/code';

export default function CodeBlockAnatomy() {
  return (
    <CodeBlock language="sh" label="Terminal" copyable>
      {'npm run build'}
    </CodeBlock>
  );
}
