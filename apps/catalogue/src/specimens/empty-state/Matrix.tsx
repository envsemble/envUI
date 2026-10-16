import { Button, EmptyState, Surface } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import { FolderOpen } from '@envsemble/envui/icons/FolderOpen';
import { Refresh } from '@envsemble/envui/icons/Refresh';
import { Example, Specimen, SpecimenGrid } from '../../previews/Example';

const states = [
  {
    title: 'Neutral',
    tone: 'neutral',
    state: {
      icon: <FolderOpen />,
      title: 'No projects yet',
      description: 'Create a project to bring plans and people together.',
      action: <Button startIcon={<Add />}>Create project</Button>,
    },
  },
  {
    title: 'Error',
    tone: 'error',
    state: {
      title: 'Projects couldn’t load',
      description: 'The server didn’t respond. Try again in a moment.',
      action: (
        <Button variant="secondary" startIcon={<Refresh />}>
          Try again
        </Button>
      ),
    },
  },
] as const;

/** Each tone aligned to the start, in a card, and centred, in place of a region's content. */
export default function Matrix() {
  return (
    <Example title="Alignments and tones" size="collection">
      <SpecimenGrid size="card">
        {states.map(({ title, tone, state }) => (
          <Specimen key={`start-${tone}`} title={`${title}, start`}>
            <Surface background="muted">
              <EmptyState tone={tone} {...state} />
            </Surface>
          </Specimen>
        ))}
        {states.map(({ title, tone, state }) => (
          <Specimen key={`center-${tone}`} title={`${title}, centred`}>
            <Surface
              background="default"
              padding={0}
              style={{ display: 'grid', minBlockSize: '20rem' }}
            >
              <EmptyState tone={tone} align="center" {...state} />
            </Surface>
          </Specimen>
        ))}
      </SpecimenGrid>
    </Example>
  );
}
