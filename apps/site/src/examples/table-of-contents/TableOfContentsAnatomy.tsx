import { Column, Row, TableOfContents, Text } from '@envsemble/envui';

const sections = [
  { id: 'anatomy-setup', title: 'Setup' },
  { id: 'anatomy-install', title: 'Install' },
  { id: 'anatomy-configure', title: 'Configure' },
];

export default function TableOfContentsAnatomy() {
  return (
    <Row gap={5} align="start">
      <TableOfContents
        aria-label="Sections of the setup guide"
        style={{ inlineSize: '9rem' }}
        items={[
          {
            id: 'anatomy-setup',
            label: 'Setup',
            children: [
              { id: 'anatomy-install', label: 'Install' },
              { id: 'anatomy-configure', label: 'Configure' },
            ],
          },
        ]}
      />
      <Column gap={3} style={{ inlineSize: '12rem' }}>
        {sections.map(({ id, title }) => (
          <Column key={id} id={id} gap={1}>
            <Text variant="title" render={<h3 />}>
              {title}
            </Text>
            <Text variant="body-sm">A few lines of the guide.</Text>
          </Column>
        ))}
      </Column>
    </Row>
  );
}
