import { CodeBlock } from '@envsemble/envui';

export default function PlainOutput() {
  return (
    <CodeBlock label="Build output">
      {'Build completed in 4.2 s.\n3 files updated.\nNo warnings.'}
    </CodeBlock>
  );
}
