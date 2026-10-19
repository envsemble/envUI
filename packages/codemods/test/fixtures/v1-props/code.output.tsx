import { Code, CodeBlock, Markdown } from '@envsemble/envui/content';

export function Reference({ slug, body, source, appearance, dark }) {
  return (
    <>
      <Code>{slug}</Code>
      <Code>{slug}</Code>
      <Code appearance={appearance}>{slug}</Code>
      <Code appearance={dark ? 'dark' : appearance}>{slug}</Code>
      <Code>{slug}</Code>
      <Markdown>{body}</Markdown>
      <CodeBlock code={source} language="ts" />
    </>
  );
}
