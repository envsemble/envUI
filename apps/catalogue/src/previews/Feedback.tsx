import { useState } from 'react';
import { Text, Button, EmptyState, Surface } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import { Search } from '@envsemble/envui/icons/Search';
import { Apps } from '@envsemble/envui/icons/Apps';
import { Refresh } from '@envsemble/envui/icons/Refresh';
import { Example, Specimen, SpecimenGrid } from './Example';
import { Preview } from './Preview';

export function EmptyStatePreview() {
  const [actionResult, setActionResult] = useState('');
  return (
    <Preview>
      <Example title="Empty content" size="collection">
        <SpecimenGrid size="card">
          <Specimen title="First project">
            <EmptyState
              icon={<Apps />}
              title="No projects yet"
              description="Create a project to bring plans and people together."
              action={
                <Button
                  startIcon={<Add />}
                  onClick={() => setActionResult('Project creation started')}
                >
                  Create project
                </Button>
              }
            />
          </Specimen>
          <Specimen title="Failed to load">
            <EmptyState
              tone="error"
              title="Projects couldn’t load"
              description="Something went wrong. Please try again."
              action={
                <Button
                  variant="secondary"
                  startIcon={<Refresh />}
                  onClick={() => setActionResult('Retrying')}
                >
                  Try again
                </Button>
              }
            />
          </Specimen>
          <Specimen title="No search results">
            <EmptyState
              icon={<Search />}
              title="No matching projects"
              description="Try another name or clear the filters."
              action={
                <Button variant="secondary" onClick={() => setActionResult('Filters cleared')}>
                  Clear filters
                </Button>
              }
            />
          </Specimen>
        </SpecimenGrid>
        <Text variant="caption" className="docs-caption" aria-live="polite">
          {actionResult}
        </Text>
      </Example>
      <Example title="In place of a page’s content" size="collection">
        <Surface tone="pane" padding={0} style={{ display: 'grid', minBlockSize: '22rem' }}>
          <EmptyState
            align="center"
            icon={<Apps />}
            title="No projects yet"
            description="Create a project to bring plans and people together."
            action={
              <Button
                startIcon={<Add />}
                onClick={() => setActionResult('Project creation started')}
              >
                Create project
              </Button>
            }
          />
        </Surface>
      </Example>
    </Preview>
  );
}
