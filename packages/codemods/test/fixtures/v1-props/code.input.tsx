import { Code, CodeBlock, Markdown } from '@envsemble/envui/content';

export function Reference({ slug, body, source, appearance, dark }) {
  return (
    <>
      <Code appearance="subtle">{slug}</Code>
      <Code appearance="dark">{slug}</Code>
      <Code appearance={appearance}>{slug}</Code>
      <Code appearance={dark ? 'dark' : appearance}>{slug}</Code>
      <Code appearance={dark ? 'dark' : 'subtle'}>{slug}</Code>
      <Markdown inlineCode="subtle">{body}</Markdown>
      <CodeBlock code={source} language="ts" theme="light" />
    </>
  );
}
