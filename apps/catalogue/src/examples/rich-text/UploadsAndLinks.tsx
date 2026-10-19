import { RichTextEditor, type RichTextAttachment } from '@envsemble/envui/rich-text';

/** Stands in for an upload: after a moment the file has a URL. */
function upload(file: File, { signal }: { signal: AbortSignal }) {
  return new Promise<RichTextAttachment | null>((resolve) => {
    const timer = setTimeout(
      () =>
        resolve({
          kind: file.type.startsWith('image/') ? 'image' : 'file',
          id: `file:${file.name}`,
          label: file.name,
          url: `/files/${encodeURIComponent(file.name)}`,
        }),
      800,
    );
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      resolve(null);
    });
  });
}

/** Stands in for the application's own page picker, where someone chose the launch plan. */
async function pickPage({ selectedText }: { selectedText: string }) {
  return { label: selectedText || 'Launch plan', href: '/docs/launch-plan' };
}

export default function UploadsAndLinks() {
  return (
    <RichTextEditor
      label="Project brief"
      defaultValue="The budget and the **launch plan** are attached below."
      accept="image/*,.pdf,.txt"
      onUpload={upload}
      onRequestLink={pickPage}
    />
  );
}
