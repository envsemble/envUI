import { TableOfContents } from '@envsemble/envui';

export default function LongLabels() {
  return (
    <TableOfContents
      aria-label="Sections of the migration guide"
      style={{ inlineSize: '100%' }}
      items={[
        { id: 'long-labels-before', label: 'Before you move your projects' },
        {
          id: 'long-labels-move',
          label: 'Move projects between workspaces',
          children: [
            { id: 'long-labels-owners', label: 'Keep owners and editors as they were' },
            { id: 'long-labels-links', label: 'Links to moved projects' },
          ],
        },
      ]}
    />
  );
}
