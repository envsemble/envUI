import { CodeBlock } from '@envsemble/envui/code';

const description =
  'Long lines wrap when reading them matters more than keeping the source layout. ' +
  'Copying keeps the original line breaks.';
const settings = `{
  "description": "${description}",
  "notifications": true
}`;

export default function WrapLongLines() {
  return (
    <CodeBlock language="json" label="settings.json" wrap copyable>
      {settings}
    </CodeBlock>
  );
}
