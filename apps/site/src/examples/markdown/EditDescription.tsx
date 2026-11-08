import { useState } from 'react';
import { MarkdownEditor } from '@envsemble/envui/markdown';

export default function EditDescription() {
  const [description, setDescription] = useState(
    '## Goals\n\nShip the **pricing page** before the launch, and _measure_ sign-ups for a month.',
  );
  return (
    <MarkdownEditor
      label="Description"
      description="Markdown: headings, lists, links and code."
      sizing="content"
      rows={4}
      value={description}
      onValueChange={setDescription}
      previewProps={{ headingOffset: 2 }}
    />
  );
}
