import { TableOfContents } from '@envsemble/envui';

export default function DeepOutline() {
  return (
    <TableOfContents
      aria-label="Sections of the import guide, nested deeply"
      style={{ inlineSize: '12rem' }}
      items={[
        {
          id: 'deep-outline-import',
          label: 'Import',
          children: [
            {
              id: 'deep-outline-file',
              label: 'From a file',
              children: [
                {
                  id: 'deep-outline-columns',
                  label: 'Columns',
                  children: [
                    { id: 'deep-outline-names', label: 'Names' },
                    { id: 'deep-outline-types', label: 'Types' },
                  ],
                },
              ],
            },
          ],
        },
      ]}
    />
  );
}
