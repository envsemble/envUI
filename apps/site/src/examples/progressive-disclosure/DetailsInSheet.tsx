import { useState } from 'react';
import { Badge, Button, DescriptionList, List, Sheet } from '@envsemble/envui';

export default function DetailsInSheet() {
  const [openId, setOpenId] = useState<string | null>(null);
  // The project stays shown while the sheet slides out.
  const [shownId, setShownId] = useState<string | null>(null);
  const project = projects.find((candidate) => candidate.id === shownId);
  return (
    <>
      <List.Root aria-label="Projects">
        {projects.map((candidate) => (
          <List.Item
            key={candidate.id}
            interactive
            label={
              // The row opens its details over the list, so people keep their place in it.
              <Button
                variant="text"
                data-row-target
                aria-haspopup="dialog"
                onClick={() => {
                  setShownId(candidate.id);
                  setOpenId(candidate.id);
                }}
              >
                {candidate.name}
              </Button>
            }
            description={candidate.owner}
          >
            <Badge tone={candidate.status === 'At risk' ? 'warning' : 'success'}>
              {candidate.status}
            </Badge>
          </List.Item>
        ))}
      </List.Root>
      {/* Focus moves into the sheet as it opens, and back to the row's button as it closes. */}
      <Sheet
        open={openId !== null}
        onOpenChange={(open) => {
          if (!open) setOpenId(null);
        }}
        title={project?.name ?? 'Project'}
        description={project ? `Owned by ${project.owner}` : undefined}
        closeLabel="Close details"
        actions={project && <Button href={`/projects/${project.id}`}>Open project</Button>}
      >
        {project && (
          <DescriptionList.Root layout="stacked">
            <DescriptionList.Item label="Status">{project.status}</DescriptionList.Item>
            <DescriptionList.Item label="Due">{project.due}</DescriptionList.Item>
            <DescriptionList.Item label="Open tasks">{project.tasks}</DescriptionList.Item>
            <DescriptionList.Item label="Team">{project.team}</DescriptionList.Item>
          </DescriptionList.Root>
        )}
      </Sheet>
    </>
  );
}

const projects = [
  {
    id: 'website-refresh',
    name: 'Website refresh',
    owner: 'Alex Morgan',
    status: 'On track',
    due: '31 March 2026',
    tasks: 12,
    team: 'Alex Morgan, Sam Lee, Jordan Kim',
  },
  {
    id: 'mobile-release',
    name: 'Mobile release',
    owner: 'Jordan Kim',
    status: 'At risk',
    due: '20 March 2026',
    tasks: 27,
    team: 'Jordan Kim, Chen Wei',
  },
  {
    id: 'quarterly-report',
    name: 'Quarterly report',
    owner: 'Priya Shah',
    status: 'On track',
    due: '27 March 2026',
    tasks: 4,
    team: 'Priya Shah, Maria Garcia',
  },
];
