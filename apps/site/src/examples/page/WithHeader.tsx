import { Button, List, Page, PageHeader } from '@envsemble/envui';
import { IconAdd } from '@envsemble/envui/icons/Add';

const projects = [
  { name: 'Northwind launch', owner: 'Alex Morgan' },
  { name: 'Annual report', owner: 'Priya Shah' },
  { name: 'Website refresh', owner: 'Sam Lee' },
];

export default function WithHeader() {
  return (
    <Page
      width="md"
      header={
        <PageHeader
          headingLevel={3}
          title="Projects"
          description="Everything your team is working on."
          actions={<Button start={<IconAdd />}>New project</Button>}
        />
      }
    >
      <List.Root aria-label="Projects">
        {projects.map((project) => (
          <List.Item
            key={project.name}
            label={project.name}
            description={`Owned by ${project.owner}`}
          />
        ))}
      </List.Root>
    </Page>
  );
}
