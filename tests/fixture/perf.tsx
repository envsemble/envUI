import { useLayoutEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { Badge, Button, List, Menu, Popover, Select, Table, Text, Theme } from '@envsemble/envui';
import '@envsemble/envui/styles.css';

const count = 1000;
const statuses = ['Ready', 'Blocked', 'Draft', 'Shipped'] as const;
const tones = { Ready: 'success', Blocked: 'warning', Draft: 'neutral', Shipped: 'done' } as const;
const owners = ['Alex Morgan', 'Mira Okafor', 'Sam Lee', 'Aurora Diaz', 'Noah Kim'];

interface Report {
  id: string;
  title: string;
  owner: string;
  reviews: number;
  status: (typeof statuses)[number];
}

const reports: Report[] = Array.from({ length: count }, (_, index) => ({
  id: `report-${index}`,
  title: `Quarterly report ${index + 1}`,
  owner: owners[index % owners.length]!,
  reviews: (index * 37) % 101,
  status: statuses[index % statuses.length]!,
}));

let changeRow: (index: number) => void = () => {};

function BigTable() {
  const [rows, setRows] = useState(reports);
  useLayoutEffect(() => {
    changeRow = (index) =>
      setRows((current) =>
        current.map((row, at) =>
          at === index ? { ...row, reviews: row.reviews + 1, status: 'Shipped' } : row,
        ),
      );
  }, []);
  return (
    <Table.Root aria-label="Reports">
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>Report</Table.HeaderCell>
          <Table.HeaderCell>Owner</Table.HeaderCell>
          <Table.HeaderCell numeric>Reviews</Table.HeaderCell>
          <Table.HeaderCell>Status</Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {rows.map((row) => (
          <Table.Row key={row.id}>
            <Table.Cell>{row.title}</Table.Cell>
            <Table.Cell nowrap>{row.owner}</Table.Cell>
            <Table.Cell numeric>{row.reviews}</Table.Cell>
            <Table.Cell>
              <Badge tone={tones[row.status]}>{row.status}</Badge>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}

function BigList() {
  return (
    <List.Root aria-label="Reports">
      {reports.map((row) => (
        <List.Item
          key={row.id}
          label={row.title}
          description={`${row.owner}, ${row.reviews} reviews`}
        >
          <Badge tone={tones[row.status]}>{row.status}</Badge>
        </List.Item>
      ))}
    </List.Root>
  );
}

const visibilityOptions = [
  'Team',
  'Private',
  'Public',
  'Organization',
  'Guests',
  'Reviewers',
  'Editors',
  'Owners',
].map((label) => ({ value: label.toLowerCase(), label }));

function Popups() {
  const [visibility, setVisibility] = useState<string | null>('team');
  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'end', padding: 24 }}>
      <Menu.Root
        aria-label="Report actions"
        trigger={<Button data-perf-trigger="menu">Actions</Button>}
      >
        <Menu.Item>Open</Menu.Item>
        <Menu.Item>Rename</Menu.Item>
        <Menu.Item>Duplicate</Menu.Item>
        <Menu.Item>Move to folder</Menu.Item>
        <Menu.Item>Share</Menu.Item>
        <Menu.Item>Download</Menu.Item>
        <Menu.Separator />
        <Menu.Item>Delete</Menu.Item>
      </Menu.Root>
      <div data-perf-trigger="select">
        <Select
          label="Visibility"
          items={visibilityOptions}
          value={visibility}
          onValueChange={setVisibility}
        />
      </div>
      <Popover
        title="Launch plan.md"
        trigger={<Button data-perf-trigger="popover">Details</Button>}
      >
        <Text emphasis="muted">Changed today by Alex Morgan. 3 open decisions, 1 blocked.</Text>
      </Popover>
    </div>
  );
}

const scenarios = { table: BigTable, list: BigList, popups: Popups };
type Scenario = keyof typeof scenarios;

const container = document.getElementById('root')!;
const root = createRoot(container);
const scenario = (new URLSearchParams(location.search).get('scenario') ?? 'popups') as Scenario;
const Content = scenarios[scenario];
const page = (
  <Theme theme="light">
    <Content />
  </Theme>
);

function nextFrame() {
  return new Promise<number>((resolve) =>
    requestAnimationFrame(() => {
      const channel = new MessageChannel();
      channel.port1.onmessage = () => resolve(performance.now());
      channel.port2.postMessage(undefined);
    }),
  );
}

const longTasks: { start: number; duration: number }[] = [];
const longFrames: { start: number; duration: number }[] = [];
new PerformanceObserver((list) => {
  for (const entry of list.getEntries())
    longTasks.push({ start: entry.startTime, duration: entry.duration });
}).observe({ type: 'longtask', buffered: true });
new PerformanceObserver((list) => {
  for (const entry of list.getEntries())
    longFrames.push({ start: entry.startTime, duration: entry.duration });
}).observe({ type: 'long-animation-frame', buffered: true });
const events: { name: string; start: number; duration: number }[] = [];
new PerformanceObserver((list) => {
  for (const entry of list.getEntries())
    events.push({ name: entry.name, start: entry.startTime, duration: entry.duration });
}).observe({ type: 'event', durationThreshold: 16, buffered: true } as PerformanceObserverInit);

function longTasksBetween(start: number, end: number) {
  const overlapping = (entry: { start: number; duration: number }) =>
    entry.start + entry.duration > start && entry.start < end;
  const frames = longFrames.filter(overlapping);
  return {
    longTasks: longTasks.filter(overlapping).length,
    longFrames: frames.length,
    longestFrame: frames.reduce((longest, frame) => Math.max(longest, frame.duration), 0),
  };
}

const popupSelectors = {
  menu: '[role="menu"]',
  select: '[role="listbox"]',
  popover: '[role="dialog"]',
};

function shown(selector: string) {
  const element = document.querySelector(selector);
  if (!element) return false;
  const box = element.getBoundingClientRect();
  return box.width > 0 && box.height > 0;
}

function timed(change: () => void) {
  return new Promise<Record<string, number>>((resolve) =>
    setTimeout(async () => {
      const start = performance.now();
      flushSync(change);
      const commit = performance.now() - start;
      const end = await nextFrame();
      await nextFrame();
      resolve({ commit, frame: end - start, ...longTasksBetween(start, end) });
    }),
  );
}

let pending: Promise<Record<string, number>> | undefined;

const api = {
  scenario,
  mount: () => timed(() => root.render(page)),
  update: (index: number) => timed(() => changeRow(index)),
  arm(kind: keyof typeof popupSelectors) {
    const selector = popupSelectors[kind];
    pending = new Promise<Record<string, number>>((resolve) => {
      document.addEventListener(
        'pointerdown',
        (event) => {
          const start = event.timeStamp;
          const finish = async () => {
            const end = await nextFrame();
            await nextFrame();
            const slowest = events
              .filter((entry) => entry.start >= start - 1)
              .reduce((longest, entry) => Math.max(longest, entry.duration), 0);
            resolve({
              toPaint: end - start,
              slowestEvent: slowest,
              ...longTasksBetween(start, end),
            });
          };
          if (shown(selector)) return void finish();
          const observer = new MutationObserver(() => {
            if (!shown(selector)) return;
            observer.disconnect();
            void finish();
          });
          observer.observe(document.body, { childList: true, subtree: true, attributes: true });
        },
        { capture: true, once: true },
      );
    });
  },
  result() {
    if (!pending) throw new Error('Arm a popup before asking for its result.');
    return pending;
  },
  shown: (kind: keyof typeof popupSelectors) => shown(popupSelectors[kind]),
};

declare global {
  interface Window {
    envuiPerf: typeof api;
  }
}
window.envuiPerf = api;
if (scenario === 'popups') root.render(page);
