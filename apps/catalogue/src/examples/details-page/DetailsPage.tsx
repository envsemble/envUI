import { useId, useState } from 'react';
import {
  Avatar,
  AvatarGroup,
  Badge,
  Breadcrumbs,
  Button,
  ConfirmDialog,
  DescriptionList,
  IconButton,
  Link,
  List,
  Menu,
  Page,
  PageHeader,
  Progress,
  RelativeTime,
  Stack,
  Surface,
  Tabs,
  Text,
  Tooltip,
  useToast,
  type BadgeTone,
} from '@envsemble/envui';
import { Archive } from '@envsemble/envui/icons/Archive';
import { Delete } from '@envsemble/envui/icons/Delete';
import { Description } from '@envsemble/envui/icons/Description';
import { Edit } from '@envsemble/envui/icons/Edit';
import { FileCopy } from '@envsemble/envui/icons/FileCopy';
import { MoreVert } from '@envsemble/envui/icons/MoreVert';

/** Dates in the reader's language; pass the application's locale where it sets one. */
const day = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeZone: 'UTC' });

/**
 * One object's page inside the app frame: where it sits, its name, status and actions, then its
 * content in tabs beside a panel of its details. Replace `project` and the handlers with your data
 * and your service's calls.
 */
export default function DetailsPage() {
  const id = useId();
  const toast = useToast();
  const [archived, setArchived] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const done = project.tasks.filter((task) => task.done).length;

  const archive = () => {
    // Archiving can be undone, so it happens at once, with Undo in the toast.
    setArchived(true);
    const shown = toast.show({
      message: `${project.name} archived`,
      action: {
        label: 'Undo',
        onClick: () => {
          setArchived(false);
          toast.dismiss(shown);
        },
      },
    });
  };

  return (
    <Page
      width="lg"
      header={
        <PageHeader
          title={project.name}
          description={project.summary}
          breadcrumbs={
            <Breadcrumbs
              items={[{ label: 'Projects', href: '/projects' }, { label: project.name }]}
            />
          }
          meta={
            archived ? <Badge>Archived</Badge> : <Badge tone={statusTone}>{project.status}</Badge>
          }
          actions={
            <>
              <Button
                variant="secondary"
                startIcon={<Edit />}
                href="/projects/website-refresh/edit"
              >
                Edit
              </Button>
              <Menu.Root
                aria-label={`Actions for ${project.name}`}
                align="end"
                trigger={
                  // The Tooltip shows the icon's name and passes the menu button's props on.
                  <Tooltip content="More actions">
                    <IconButton variant="secondary" icon={<MoreVert />} aria-label="More actions" />
                  </Tooltip>
                }
              >
                <Menu.Item icon={<FileCopy />} href="/projects/new?from=website-refresh">
                  Duplicate
                </Menu.Item>
                {!archived && (
                  <Menu.Item icon={<Archive />} onClick={archive}>
                    Archive
                  </Menu.Item>
                )}
                <Menu.Separator />
                {/* envUI has no danger menu item yet: the label names the consequence, and the
                    ellipsis says a confirmation follows. */}
                <Menu.Item icon={<Delete />} onClick={() => setConfirming(true)}>
                  Delete project…
                </Menu.Item>
              </Menu.Root>
            </>
          }
        />
      }
    >
      {/* The application leaves the page once the project is deleted; the sample says so. */}
      <Text role="status" emphasis="muted">
        {deleted ? `${project.name} deleted. Going back to Projects.` : ''}
      </Text>
      {/* envUI has no responsive columns yet: the main column and the panel share a row and wrap,
          the main column first, when the row is narrower than about 56 rem. */}
      <Stack direction="row" wrap align="start" gap={8}>
        <Stack gap={4} style={{ flex: '1 1 32rem', minInlineSize: 0 }}>
          <Tabs
            aria-label="Project views"
            items={[
              { value: 'overview', button: <Button>Overview</Button>, content: <Overview /> },
              { value: 'activity', button: <Button>Activity</Button>, content: <Activity /> },
              { value: 'files', button: <Button>Files</Button>, content: <Files /> },
            ]}
          />
        </Stack>
        <Surface
          background="muted"
          render={<aside aria-labelledby={`${id}-details`} />}
          // envUI has no responsive columns yet: the panel is 20 to 28 rem beside the main column.
          style={{ flex: '1 1 20rem', maxInlineSize: '28rem' }}
        >
          <Stack gap={5}>
            <Text id={`${id}-details`} variant="title" render={<h2 />}>
              Details
            </Text>
            <DescriptionList.Root layout="stacked" aria-labelledby={`${id}-details`}>
              <DescriptionList.Item label="Owner">
                <Stack direction="row" align="center" gap={2}>
                  <Avatar name={project.owner} size="sm" />
                  {project.owner}
                </Stack>
              </DescriptionList.Item>
              <DescriptionList.Item label="Status">
                {archived ? (
                  <Badge>Archived</Badge>
                ) : (
                  <Badge tone={statusTone}>{project.status}</Badge>
                )}
              </DescriptionList.Item>
              <DescriptionList.Item label="Created">
                {day.format(new Date(project.created))}
              </DescriptionList.Item>
              <DescriptionList.Item label="Due">
                {day.format(new Date(project.due))}
              </DescriptionList.Item>
            </DescriptionList.Root>
            <Progress
              label="Tasks done"
              value={done}
              max={project.tasks.length}
              valueText={`${done} of ${project.tasks.length}`}
              aria-valuetext={`${done} of ${project.tasks.length} tasks done`}
            />
            <Stack gap={2}>
              <Text variant="body-sm" emphasis="muted" render={<h3 />}>
                Members
              </Text>
              <AvatarGroup people={project.members.map((name) => ({ name }))} max={4} />
            </Stack>
          </Stack>
        </Surface>
      </Stack>
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        tone="danger"
        title={`Delete ${project.name}?`}
        description="This deletes the project, its documents and its tasks for everyone. You can’t undo this."
        confirmLabel="Delete project"
        onConfirm={() => {
          // The project is deleted on a server; return its promise here, so the dialog waits.
          // Then the application goes to /projects, where a toast confirms it.
          setDeleted(true);
        }}
      />
    </Page>
  );
}

function Overview() {
  return (
    <Stack gap={6}>
      <Stack gap={2}>
        <Text variant="title" render={<h2 />}>
          About this project
        </Text>
        <Text>{project.description}</Text>
      </Stack>
      <Stack gap={3}>
        <Text variant="title" render={<h2 />}>
          Tasks
        </Text>
        <List.Root aria-label="Tasks">
          {project.tasks.map((task) => (
            <List.Item
              key={task.title}
              label={task.title}
              description={`${task.assignee} · Due ${day.format(new Date(task.due))}`}
              action={task.done ? <Badge tone="success">Done</Badge> : <Badge>To do</Badge>}
            />
          ))}
        </List.Root>
      </Stack>
    </Stack>
  );
}

function Activity() {
  return (
    <Stack gap={3}>
      <Text variant="title" render={<h2 />}>
        Activity
      </Text>
      <List.Root aria-label="Activity">
        {activity.map((event) => (
          <List.Item
            key={event.when}
            start={<Avatar name={event.person} size="sm" />}
            label={`${event.person} ${event.what}`}
            description={<RelativeTime value={event.when} />}
          />
        ))}
      </List.Root>
    </Stack>
  );
}

function Files() {
  return (
    <Stack gap={3}>
      <Text variant="title" render={<h2 />}>
        Files
      </Text>
      <List.Root aria-label="Files">
        {files.map((file) => (
          <List.Item
            key={file.name}
            interactive
            start={<Description />}
            label={<Link href={file.href}>{file.name}</Link>}
            description={file.detail}
          />
        ))}
      </List.Root>
    </Stack>
  );
}

const statusTone: BadgeTone = 'success';

const project = {
  name: 'Website refresh',
  summary: 'A new home page, product pages and navigation for the public site.',
  description:
    'The refresh replaces the home page and the product pages, and simplifies the navigation to five sections. Content moves to the new templates in March, and the new site goes live once the review is done.',
  status: 'Active',
  owner: 'Alex Morgan',
  created: '2026-02-02',
  due: '2026-03-27',
  members: ['Alex Morgan', 'Sam Lee', 'Priya Shah', 'Jordan Kim', 'Maria Garcia', 'Chen Wei'],
  tasks: [
    { title: 'Agree the site map', assignee: 'Alex Morgan', due: '2026-02-13', done: true },
    { title: 'Write the home page copy', assignee: 'Maria Garcia', due: '2026-02-24', done: true },
    { title: 'Design the product pages', assignee: 'Chen Wei', due: '2026-03-06', done: false },
    {
      title: 'Move content to the new templates',
      assignee: 'Sam Lee',
      due: '2026-03-18',
      done: false,
    },
    { title: 'Review accessibility', assignee: 'Priya Shah', due: '2026-03-24', done: false },
  ],
};

const activity = [
  { person: 'Chen Wei', what: 'uploaded Product page drafts', when: '2026-03-04T08:20:00Z' },
  {
    person: 'Maria Garcia',
    what: 'completed Write the home page copy',
    when: '2026-03-03T15:05:00Z',
  },
  { person: 'Sam Lee', what: 'commented on Site map', when: '2026-03-02T10:40:00Z' },
  { person: 'Alex Morgan', what: 'changed the due date to 27 March', when: '2026-02-26T09:15:00Z' },
];

const files = [
  { name: 'Site map', detail: 'Edited by Alex Morgan', href: '/documents/site-map' },
  { name: 'Home page copy', detail: 'Edited by Maria Garcia', href: '/documents/home-page-copy' },
  {
    name: 'Product page drafts',
    detail: 'Edited by Chen Wei',
    href: '/documents/product-page-drafts',
  },
];
