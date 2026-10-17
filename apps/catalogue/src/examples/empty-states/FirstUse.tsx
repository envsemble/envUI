import { useEffect, useRef, useState } from 'react';
import { Button, EmptyState, List, Stack, Surface, Text } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import { FolderOpen } from '@envsemble/envui/icons/FolderOpen';

export default function FirstUse() {
  const [projects, setProjects] = useState<string[]>([]);
  const list = useRef<HTMLUListElement>(null);
  const leftEmpty = useRef(false);
  // The empty state's button goes with it, so focus moves to the list that replaced it.
  useEffect(() => {
    if (leftEmpty.current) list.current?.focus();
    leftEmpty.current = false;
  }, [projects]);

  const create = () => {
    leftEmpty.current = projects.length === 0;
    // A real application opens the create form here; the example adds a project at once.
    setProjects((current) => [...current, sample[current.length % sample.length]]);
  };

  return (
    <Stack gap={4}>
      <Stack direction="row" wrap align="center" justify="between" gap={3}>
        <Text render={<h3 />} variant="title">
          Projects
        </Text>
        {/* The page's own action appears with the first project; until then the state offers it. */}
        {projects.length > 0 && (
          <Button size="sm" startIcon={<Add />} onClick={create}>
            Create project
          </Button>
        )}
      </Stack>
      {projects.length > 0 ? (
        <List.Root ref={list} aria-label="Projects" tabIndex={-1}>
          {projects.map((project, index) => (
            <List.Item key={`${project}-${index}`} label={project} />
          ))}
        </List.Root>
      ) : (
        // envUI has no region height for an example: the state fills the place the list will.
        <Surface
          background="default"
          padding={0}
          style={{ display: 'grid', minBlockSize: '18rem' }}
        >
          <EmptyState
            align="center"
            headingLevel={4}
            icon={<FolderOpen />}
            title="No projects yet"
            description="A project brings its documents, tasks and people together in one place."
            action={
              <Button startIcon={<Add />} onClick={create}>
                Create project
              </Button>
            }
          />
        </Surface>
      )}
    </Stack>
  );
}

const sample = ['Website refresh', 'Quarterly report', 'Onboarding guide'];
