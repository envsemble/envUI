import { RichTextEditor, type RichTextAttachment } from '@envsemble/envui/rich-text';

function simulatedUpload(file: File, { signal }: { signal: AbortSignal }) {
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

async function simulatedPagePicker({ selectedText }: { selectedText: string }) {
  return { label: selectedText || 'Launch plan', href: '/docs/launch-plan' };
}

export default function UploadsAndLinks() {
  return (
    <RichTextEditor
      label="Project brief"
      defaultValue="The budget and the **launch plan** are attached below."
      accept="image/*,.pdf,.txt"
      onUpload={simulatedUpload}
      pickLink={simulatedPagePicker}
    />
  );
}
