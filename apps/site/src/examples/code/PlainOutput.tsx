import { CodeBlock } from '@envsemble/envui/content';

export default function PlainOutput() {
  // Without a language, or with one envUI doesn't highlight, the source stays plain text.
  return (
    <CodeBlock label="Build output">
      {'Build completed in 4.2 s.\n3 files updated.\nNo warnings.'}
    </CodeBlock>
  );
}
