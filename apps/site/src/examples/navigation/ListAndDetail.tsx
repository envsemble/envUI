import { useState } from 'react';
import {
  Badge,
  DescriptionList,
  Link,
  List,
  Panes,
  Column,
  Row,
  Surface,
  Text,
} from '@envsemble/envui';

export default function ListAndDetail() {
  const [chosen, setChosen] = useState(projects[0]);
  const [detailShown, setDetailShown] = useState(false);
  return (
    // As narrow as a phone, so the list and the detail show one at a time. From an expanded width
    // of their own, 52.5 rem, Panes show them side by side, each on a surface with the divider
    // between them.
    <Column gap={4} style={{ inlineSize: 'min(100%, 24rem)' }}>
      <Panes.Root
        behavior="list-detail"
        open={detailShown}
        onOpenChange={setDetailShown}
        backLabel="All projects"
        style={{ blockSize: '18rem' }}
      >
        <Panes.List label="Projects">
          <Surface padding={2} style={{ minBlockSize: '100%' }}>
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
          </Surface>
        </Panes.List>
        <Panes.Divider label="Resize project list" />
        <Panes.Detail label={chosen.name}>
          <Surface padding={4} render={<Column gap={3} />} style={{ minBlockSize: '100%' }}>
            <Row wrap align="center" gap={2}>
              <Text variant="title" render={<h3 />}>
                {chosen.name}
              </Text>
              <Badge tone={chosen.status === 'At risk' ? 'warning' : 'success'}>
                {chosen.status}
              </Badge>
            </Row>
            <DescriptionList.Root aria-label={`About ${chosen.name}`}>
              <DescriptionList.Item label="Owner">{chosen.owner}</DescriptionList.Item>
              <DescriptionList.Item label="Due">{chosen.due}</DescriptionList.Item>
              <DescriptionList.Item label="Open tasks">{chosen.tasks}</DescriptionList.Item>
            </DescriptionList.Root>
          </Surface>
        </Panes.Detail>
      </Panes.Root>
    </Column>
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
