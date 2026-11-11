import { CodeBlock } from '@envsemble/envui/code';

export default function CommandWithPrompt() {
  return (
    <CodeBlock language="sh" label="Terminal" copyable>
      {'$ npm ci\n$ npm run build'}
    </CodeBlock>
  );
}
