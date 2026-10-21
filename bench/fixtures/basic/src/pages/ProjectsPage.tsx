import { Column, Text } from '@envsemble/envui';
import { projects } from '../data/projects';

export function ProjectsPage() {
  return (
    <Column gap={5}>
      <Text render={<h1 />} variant="headline">
        Projects
      </Text>
      <Column gap={3}>
        {projects.map((project) => (
          <Column key={project.id} gap={1}>
            <Text>{project.name}</Text>
            <Text variant="caption">
              {project.owner} · {project.status}
            </Text>
          </Column>
        ))}
      </Column>
    </Column>
  );
}
