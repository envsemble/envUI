import { Button, Card, Page, PageHeader, Column, Text } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';

const projects = [
  { name: 'Northwind launch', owner: 'Alex Morgan' },
  { name: 'Annual report', owner: 'Priya Shah' },
];

export default function WithHeader() {
  return (
    <Page
      width="md"
      header={
        // Level 3 inside these docs; a page's own header keeps the default, 1.
        <PageHeader
          headingLevel={3}
          title="Projects"
          description="Everything your team is working on."
          actions={<Button startIcon={<Add />}>New project</Button>}
        />
      }
    >
      <Column gap={3}>
        {projects.map((project) => (
          <Card key={project.name} title={project.name}>
            <Text variant="body-sm">Owned by {project.owner}</Text>
          </Card>
        ))}
      </Column>
    </Page>
  );
}
