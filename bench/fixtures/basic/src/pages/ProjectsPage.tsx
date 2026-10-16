import { Stack, Text } from '@envsemble/envui';
import { projects } from '../data/projects';

export function ProjectsPage() {
  return (
    <Stack gap={5}>
      <Text as="h1" variant="page-heading">
        Projects
      </Text>
      <Stack gap={3}>
        {projects.map((project) => (
          <Stack key={project.id} gap={1}>
            <Text>{project.name}</Text>
            <Text variant="caption" tone="muted">
              {project.owner} · {project.status}
            </Text>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}
