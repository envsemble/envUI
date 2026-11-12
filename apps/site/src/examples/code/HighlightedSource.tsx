import { CodeBlock } from '@envsemble/envui/code';

const source = `// Saves the draft
<Button onClick={save}>
  Save changes
</Button>`;

export default function HighlightedSource() {
  return (
    <CodeBlock language="tsx" label="SaveButton.tsx" copyable>
      {source}
    </CodeBlock>
  );
}
