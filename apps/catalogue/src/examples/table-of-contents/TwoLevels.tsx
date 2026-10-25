import { TableOfContents } from '@envsemble/envui';

export default function TwoLevels() {
  return (
    <TableOfContents
      aria-label="Sections of the import guide"
      style={{ inlineSize: '12rem' }}
      items={[
        { id: 'two-levels-prepare', label: 'Prepare a file' },
        {
          id: 'two-levels-import',
          label: 'Import',
          children: [
            { id: 'two-levels-columns', label: 'Match the columns' },
            { id: 'two-levels-check', label: 'Check the rows' },
          ],
        },
        { id: 'two-levels-undo', label: 'Undo an import' },
      ]}
    />
  );
}
