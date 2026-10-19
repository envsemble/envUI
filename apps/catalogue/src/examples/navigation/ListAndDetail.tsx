import { useState } from 'react';
import { Badge, DescriptionList, Link, List, ListDetail, Stack, Text } from '@envsemble/envui';

export default function ListAndDetail() {
  const [chosen, setChosen] = useState(projects[0]);
  const [detailShown, setDetailShown] = useState(false);
  return (
    // As narrow as a phone, so the list and the detail show one at a time. Wider than 44 rem of
    // its own width, ListDetail shows them side by side.
    <Stack style={{ inlineSize: 'min(100%, 24rem)' }}>
      <ListDetail.Root
        detailShown={detailShown}
        onBack={() => setDetailShown(false)}
        backLabel="All projects"
        style={{ blockSize: '18rem' }}
      >
        <ListDetail.List label="Projects">
          <List.Root aria-label="Projects">
            {projects.map((project) => (
              <List.Item
                key={project.id}
                interactive
                label={
                  // The chosen project's link carries aria-current, where Back returns focus.
                  <Link
                    href={`/projects/${project.id}`}
                    underline={false}
                    data-row-target
                    draggable={false}
                    aria-current={project.id === chosen.id || undefined}
                    onClick={() => {
                      setChosen(project);
                      setDetailShown(true);
                    }}
                  >
                    {project.name}
                  </Link>
                }
                description={project.owner}
              />
            ))}
          </List.Root>
        </ListDetail.List>
        <ListDetail.Detail label={chosen.name}>
          <Stack gap={3} style={{ padding: 'var(--env-space-4)' }}>
            <Stack direction="row" wrap align="center" gap={2}>
              <Text variant="title" render={<h3 />}>
                {chosen.name}
              </Text>
              <Badge tone={chosen.status === 'At risk' ? 'warning' : 'success'}>
                {chosen.status}
              </Badge>
            </Stack>
            <DescriptionList.Root aria-label={`About ${chosen.name}`}>
              <DescriptionList.Item label="Owner">{chosen.owner}</DescriptionList.Item>
              <DescriptionList.Item label="Due">{chosen.due}</DescriptionList.Item>
              <DescriptionList.Item label="Open tasks">{chosen.tasks}</DescriptionList.Item>
            </DescriptionList.Root>
          </Stack>
        </ListDetail.Detail>
      </ListDetail.Root>
    </Stack>
  );
}

const projects = [
  {
    id: 'website-refresh',
    name: 'Website refresh',
    owner: 'Priya Shah',
    status: 'On track',
    due: '27 March 2026',
    tasks: 12,
  },
  {
    id: 'quarterly-report',
    name: 'Quarterly report',
    owner: 'Sam Lee',
    status: 'At risk',
    due: '31 March 2026',
    tasks: 5,
  },
  {
    id: 'onboarding-guide',
    name: 'Onboarding guide',
    owner: 'Jordan Kim',
    status: 'On track',
    due: '13 March 2026',
    tasks: 8,
  },
];
