import { Stack, Text } from '@envsemble/envui';
import { projects } from '../data/projects';

export function ProjectsPage() {
  return (
    <Stack gap={5}>
      <Text render={<h1 />} variant="headline">
        Projects
      </Text>
      <Stack gap={3}>
        {projects.map((project) => (
          <Stack key={project.id} gap={1}>
            <Text>{project.name}</Text>
            <Text variant="caption">
              {project.owner} · {project.status}
            </Text>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}
