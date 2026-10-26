import { CodeBlock } from '@envsemble/envui/content';

export default function CommandWithPrompt() {
  return (
    <CodeBlock language="sh" label="Terminal" copyable>
      {'$ npm ci\n$ npm run build'}
    </CodeBlock>
  );
}
