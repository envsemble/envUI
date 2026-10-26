import { useEffect, useRef, useState } from 'react';
import { Button, List, Column, Row, Surface, Text } from '@envsemble/envui';
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
    <Column gap={4}>
      {/* As tall as its button from the start, so the heading stays put as the button comes. */}
      <Row
        wrap
        align="center"
        justify="between"
        gap={3}
        style={{ minBlockSize: 'var(--env-control-height-sm)' }}
      >
        <Text render={<h3 />} variant="title">
          Projects
        </Text>
        {/* The page's own action appears with the first project; until then the state offers it. */}
        {projects.length > 0 && (
          <Button size="sm" startIcon={<Add />} onClick={create}>
            Create project
          </Button>
        )}
      </Row>
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
          {/* An icon, a heading of the level the page's outline needs, a sentence and the one
              action, centred in the room the list will take. */}
          <Column
            gap={4}
            padding={5}
            align="center"
            justify="center"
            style={{ textAlign: 'center' }}
          >
            <Text render={<span />} emphasis="muted">
              <FolderOpen width="2.5rem" height="2.5rem" />
            </Text>
            <Column gap={2} align="center" style={{ maxInlineSize: '30rem' }}>
              <Text render={<h4 />} variant="title">
                No projects yet
              </Text>
              <Text variant="body-sm">
                A project brings its documents, tasks and people together in one place.
              </Text>
            </Column>
            <Button startIcon={<Add />} onClick={create}>
              Create project
            </Button>
          </Column>
        </Surface>
      )}
    </Column>
  );
}

const sample = ['Website refresh', 'Quarterly report', 'Onboarding guide'];
