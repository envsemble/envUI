import { Button, Card, Page, PageHeader, Stack, Text } from '@envsemble/envui';
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
        <PageHeader
          title="Projects"
          description="Everything your team is working on."
          actions={<Button startIcon={<Add />}>New project</Button>}
        />
      }
    >
      <Stack gap={3}>
        {projects.map((project) => (
          <Card key={project.name} heading={project.name}>
            <Text variant="body-sm">Owned by {project.owner}</Text>
          </Card>
        ))}
      </Stack>
    </Page>
  );
}
