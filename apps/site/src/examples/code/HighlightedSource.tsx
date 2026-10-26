import { CodeBlock } from '@envsemble/envui/content';

const source = `import { Button } from '@envsemble/envui';

export function SaveAction({ onSave }: { onSave: () => void }) {
  return <Button onClick={onSave}>Save changes</Button>;
}`;

export default function HighlightedSource() {
  return (
    <CodeBlock language="tsx" label="SaveAction.tsx" copyable>
      {source}
    </CodeBlock>
  );
}
