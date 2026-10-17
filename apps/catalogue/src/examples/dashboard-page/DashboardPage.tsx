import { useId, useState, type ReactNode } from 'react';
import {
  Badge,
  Button,
  CalendarHeatmap,
  EmptyState,
  Link,
  List,
  Meter,
  Page,
  PageHeader,
  Progress,
  RelativeTime,
  Select,
  Stack,
  Stat,
  Surface,
  Table,
  Text,
  type CalendarHeatmapDay,
} from '@envsemble/envui';
import { Download } from '@envsemble/envui/icons/Download';
import { NotificationsOff } from '@envsemble/envui/icons/NotificationsOff';

type Period = '7' | '30' | '90';

/**
 * An overview of the workspace inside the app frame: four figures for a period, then panels of
 * activity, storage, goals, recent documents, what's due and alerts. envUI has no line or bar
 * charts; the figures, meters, progress bars and the calendar heatmap stand in for them.
 */
export default function DashboardPage() {
  const [period, setPeriod] = useState<Period>('30');
  const figures = stats[period];
  return (
    <Page
      width="full"
      header={
        <PageHeader
          title="Dashboard"
          description="How Northwind’s projects are going."
          controlSize="sm"
          actions={
            <>
              <Select
                aria-label="Period"
                size="sm"
                variant="outline"
                items={periods}
                value={period}
                onValueChange={(value) => {
                  if (value === '7' || value === '30' || value === '90') setPeriod(value);
                }}
              />
              <Button
                variant="secondary"
                startIcon={<Download />}
                href={`/reports/dashboard.csv?days=${period}`}
              >
                Export
              </Button>
            </>
          }
        />
      }
    >
      <Stack gap={6}>
        <Stat.Group aria-label={`Figures for the ${periodLabel(period)}`}>
          {figures.map((figure) => (
            <Stat.Root
              key={figure.label}
              label={figure.label}
              value={figure.value}
              trend={figure.trend}
            />
          ))}
        </Stat.Group>
        {/* envUI has no grid of panels yet: the panels share rows of at least 22 rem and wrap,
            so a phone shows one column and a desktop two or three. */}
        <Stack direction="row" wrap align="stretch" gap={4}>
          <Panel title="Activity" wide>
            <CalendarHeatmap
              aria-label="Tasks completed each day since October"
              data={activity}
              tone="success"
            />
          </Panel>
          <Panel title="Storage">
            <Meter
              label="Storage used"
              value={68}
              max={100}
              valueText="68 GB of 100 GB"
              aria-valuetext="68 of 100 gigabytes used"
            />
            <Text variant="body-sm" emphasis="muted">
              Documents take 52 GB, and files attached to tasks 16 GB.
            </Text>
          </Panel>
          <Panel title="Goals">
            {goals.map((goal) => (
              <Progress
                key={goal.label}
                label={goal.label}
                value={goal.done}
                max={goal.target}
                valueText={`${goal.done} of ${goal.target}`}
                aria-valuetext={`${goal.done} of ${goal.target} ${goal.unit}`}
              />
            ))}
          </Panel>
          <Panel title="Recent documents" wide>
            <Table.Root
              aria-label="Recently edited documents"
              density="sm"
              narrowLayout="stack"
              stackBelow="24rem"
            >
              <Table.Head>
                <Table.Row>
                  <Table.HeaderCell>Document</Table.HeaderCell>
                  <Table.HeaderCell>Project</Table.HeaderCell>
                  <Table.HeaderCell>Edited</Table.HeaderCell>
                </Table.Row>
              </Table.Head>
              <Table.Body>
                {documents.map((document) => (
                  <Table.Row key={document.href} interactive>
                    <Table.Cell>
                      <Link href={document.href}>{document.name}</Link>
                    </Table.Cell>
                    <Table.Cell label="Project">{document.project}</Table.Cell>
                    <Table.Cell label="Edited" nowrap>
                      <RelativeTime value={document.edited} />
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Panel>
          <Panel title="Due soon">
            <List.Root aria-label="Due soon" density="sm">
              {upcoming.map((task) => (
                <List.Item
                  key={task.title}
                  label={task.title}
                  description={task.project}
                  action={<Badge tone={task.tone}>{dueLabel(task.due)}</Badge>}
                />
              ))}
            </List.Root>
          </Panel>
          <Panel title="Alerts">
            {/* A panel with nothing to show says so in its own place, in its own words. */}
            <EmptyState
              icon={<NotificationsOff />}
              headingLevel={3}
              title="No alerts"
              description="Overdue tasks and projects at risk show here."
            />
          </Panel>
        </Stack>
      </Stack>
    </Page>
  );
}

/** A panel of the dashboard: a region named by its heading. */
function Panel({ title, wide, children }: { title: string; wide?: boolean; children: ReactNode }) {
  const id = useId();
  return (
    <Surface
      background="muted"
      render={<section aria-labelledby={id} />}
      // envUI has no grid of panels yet: a wide panel grows twice as fast as the others.
      style={{ flex: wide ? '2 1 30rem' : '1 1 22rem', minInlineSize: 0 }}
    >
      <Stack gap={4}>
        <Text id={id} variant="title" render={<h2 />}>
          {title}
        </Text>
        {children}
      </Stack>
    </Surface>
  );
}

const periods = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
];
const periodLabel = (period: Period) => `last ${period} days`;

type Figure = {
  label: string;
  value: string;
  // The tone says whether the change is good news: fewer open tasks and a shorter lead time are.
  trend: {
    direction: 'up' | 'down' | 'flat';
    label: string;
    tone?: 'success' | 'danger' | 'neutral';
  };
};

const stats: Record<Period, Figure[]> = {
  '7': [
    { label: 'Active projects', value: '18', trend: { direction: 'flat', label: 'No change' } },
    { label: 'Tasks done', value: '64', trend: { direction: 'up', label: '+9 from last week' } },
    {
      label: 'Median lead time',
      value: '2.1 days',
      trend: { direction: 'down', label: '−0.3 days', tone: 'success' },
    },
    {
      label: 'Open tasks',
      value: '142',
      trend: { direction: 'down', label: '−11 this week', tone: 'success' },
    },
  ],
  '30': [
    { label: 'Active projects', value: '18', trend: { direction: 'up', label: '+2 this month' } },
    {
      label: 'Tasks done',
      value: '286',
      trend: { direction: 'up', label: '+12% from last month' },
    },
    {
      label: 'Median lead time',
      value: '2.5 days',
      trend: { direction: 'flat', label: 'No change' },
    },
    {
      label: 'Open tasks',
      value: '142',
      trend: { direction: 'up', label: '+8 this month', tone: 'danger' },
    },
  ],
  '90': [
    { label: 'Active projects', value: '18', trend: { direction: 'up', label: '+5 this quarter' } },
    {
      label: 'Tasks done',
      value: '812',
      trend: { direction: 'up', label: '+4% from last quarter' },
    },
    {
      label: 'Median lead time',
      value: '2.8 days',
      trend: { direction: 'up', label: '+0.4 days', tone: 'danger' },
    },
    {
      label: 'Open tasks',
      value: '142',
      trend: { direction: 'down', label: '−20 this quarter', tone: 'success' },
    },
  ],
};

const goals = [
  { label: 'Website refresh tasks', done: 7, target: 12, unit: 'tasks done' },
  { label: 'Onboarding guide chapters', done: 4, target: 5, unit: 'chapters written' },
  { label: 'Annual review interviews', done: 9, target: 20, unit: 'interviews held' },
];

const documents = [
  {
    name: 'Home page copy',
    project: 'Website refresh',
    edited: '2026-03-04T08:05:00Z',
    href: '/documents/home-page-copy',
  },
  {
    name: 'Revenue summary',
    project: 'Quarterly report',
    edited: '2026-03-03T17:20:00Z',
    href: '/documents/revenue-summary',
  },
  {
    name: 'First week checklist',
    project: 'Onboarding guide',
    edited: '2026-03-03T11:45:00Z',
    href: '/documents/first-week-checklist',
  },
  {
    name: 'Release plan',
    project: 'Mobile release',
    edited: '2026-03-02T15:10:00Z',
    href: '/documents/release-plan',
  },
  {
    name: 'Field mapping',
    project: 'Data migration',
    edited: '2026-02-27T09:30:00Z',
    href: '/documents/field-mapping',
  },
];

const upcoming: { title: string; project: string; due: string; tone: 'warning' | 'neutral' }[] = [
  {
    title: 'Design the product pages',
    project: 'Website refresh',
    due: '2026-03-06',
    tone: 'warning',
  },
  {
    title: 'Send the draft to finance',
    project: 'Quarterly report',
    due: '2026-03-09',
    tone: 'neutral',
  },
  { title: 'Test the import', project: 'Data migration', due: '2026-03-12', tone: 'neutral' },
];

/** A due date in the reader's language, such as "Due 6 Mar" or "Due Mar 6". */
const dueDate = new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
});
const dueLabel = (date: string) => `Due ${dueDate.format(new Date(`${date}T00:00:00Z`))}`;

/** Stands in for the tasks completed each day from October to today: busier midweek. */
function completedPerDay(): CalendarHeatmapDay[] {
  const end = Date.UTC(2026, 2, 4);
  const days = 155;
  return Array.from({ length: days }, (_, index) => {
    const time = end - (days - 1 - index) * 86_400_000;
    const weekday = new Date(time).getUTCDay();
    const wave = Math.sin(index / 7) + Math.sin((index * 3) / 17) + 1.2;
    const count = Math.max(0, Math.round(wave * 2.5 * (weekday === 0 || weekday === 6 ? 0.2 : 1)));
    return {
      date: new Date(time).toISOString().slice(0, 10),
      value: count,
      label: `${count} ${count === 1 ? 'task' : 'tasks'} completed`,
    };
  });
}

const activity = completedPerDay();
