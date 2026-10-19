import { useState } from 'react';
import { Badge, Button, List, PageHeader, Stack, Tabs, Text } from '@envsemble/envui';
import { Settings } from '@envsemble/envui/icons/Settings';

export default function ViewsOfOneThing() {
  const [view, setView] = useState<string | null>('tasks');
  return (
    <Stack gap={4}>
      <PageHeader
        headingLevel={3}
        title="Website refresh"
        meta={<Badge tone="success">On track</Badge>}
        actions={
          // Settings is another page, so it is a link, not a tab.
          <Button
            variant="secondary"
            startIcon={<Settings />}
            href="/projects/website-refresh/settings"
          >
            Project settings
          </Button>
        }
      />
      {/* Views of the one project: the tabs switch what shows below them, in place. */}
      <Tabs
        aria-label="Website refresh views"
        value={view}
        onValueChange={setView}
        items={[
          {
            value: 'overview',
            button: <Button>Overview</Button>,
            content: (
              <Text>
                A new website for Northwind by the end of March: fewer pages, clearer words and a
                faster home page.
              </Text>
            ),
          },
          {
            value: 'tasks',
            button: <Button>Tasks</Button>,
            content: (
              <List.Root aria-label="Tasks of Website refresh">
                {tasks.map((task) => (
                  <List.Item key={task.name} label={task.name} description={task.owner} />
                ))}
              </List.Root>
            ),
          },
          {
            value: 'files',
            button: <Button>Files</Button>,
            content: (
              <List.Root aria-label="Files of Website refresh">
                {files.map((file) => (
                  <List.Item key={file.name} label={file.name} description={file.size} />
                ))}
              </List.Root>
            ),
          },
        ]}
      />
    </Stack>
  );
}

const tasks = [
  { name: 'Write the home page', owner: 'Sam Lee' },
  { name: 'Review the page inventory', owner: 'Priya Shah' },
  { name: 'Choose the new photos', owner: 'Maria Garcia' },
];

const files = [
  { name: 'page-inventory.xlsx', size: '84 KB' },
  { name: 'launch-plan.pdf', size: '1.2 MB' },
];
