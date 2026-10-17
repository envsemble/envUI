import { Code, CodeBlock, Markdown } from '@envsemble/envui/content';

export function Reference({ slug, body, source, appearance }) {
  return (
    <>
      <Code>{slug}</Code>
      <Code>{slug}</Code>
      <Code appearance={appearance}>{slug}</Code>
      <Markdown>{body}</Markdown>
      <CodeBlock code={source} language="ts" />
    </>
  );
}
