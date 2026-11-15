import { CodeBlock } from '@envsemble/envui';

export default function CodeBlockAnatomy() {
  return (
    <CodeBlock label="Terminal" copyable>
      {'npm run build'}
    </CodeBlock>
  );
}
