import { RichTextEditor } from '@envsemble/envui/rich-text';

export function Notes({ look }) {
  return (
    <>
      <RichTextEditor label="Notes" description="Shown to the team." />
      <RichTextEditor label="Log" />
      <RichTextEditor label="Brief" variant="ghost" />
      <RichTextEditor label="Summary" variant="outline" />
      <RichTextEditor label="Draft" variant={look} />
    </>
  );
}
