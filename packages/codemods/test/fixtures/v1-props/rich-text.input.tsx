import { RichTextEditor } from '@envsemble/envui/rich-text';

export function Notes({ look }) {
  return (
    <>
      <RichTextEditor label="Notes" hint="Shown to the team." variant="plain" />
      <RichTextEditor label="Brief" variant="quiet" />
      <RichTextEditor label="Summary" variant="outlined" />
      <RichTextEditor label="Draft" variant={look} />
    </>
  );
}
