import type { ComponentType, ReactNode } from 'react';
import { IconChat } from '@envsemble/envui/icons/Chat';
import { IconEditNote } from '@envsemble/envui/icons/EditNote';
import { IconSpaceDashboard } from '@envsemble/envui/icons/SpaceDashboard';
import { IconTableRows } from '@envsemble/envui/icons/TableRows';
import { Assistant } from './samples/Assistant';
import assistantSource from './samples/Assistant.tsx?raw';
import { Member } from './samples/Member';
import memberSource from './samples/Member.tsx?raw';
import { QuarterlyReport } from './samples/QuarterlyReport';
import quarterlyReportSource from './samples/QuarterlyReport.tsx?raw';
import { Releases } from './samples/Releases';
import releasesSource from './samples/Releases.tsx?raw';

type Needles = readonly [first: string, last?: string, after?: string];

export interface SampleRegion {
  id: string;
  lines: readonly Needles[];
  find: (stage: HTMLElement) => Element[];
}

export interface Sample {
  id: string;
  label: string;
  icon: ReactNode;
  file: string;
  source: string;
  wide?: boolean;
  Specimen: ComponentType;
  regions: readonly SampleRegion[];
  rest: { id: string; css: string };
}

const all =
  (selector: string, start = 0, end?: number) =>
  (stage: HTMLElement): Element[] =>
    [...stage.querySelectorAll(selector)].slice(start, end);

const region = (id: string, find: SampleRegion['find'], ...lines: Needles[]): SampleRegion => ({
  id,
  lines,
  find,
});

export const samples: readonly Sample[] = [
  {
    id: 'profile',
    label: 'Profile',
    icon: <IconEditNote />,
    file: 'Member.tsx',
    source: memberSource.trimEnd(),
    Specimen: Member,
    rest: { id: 'badge', css: '.env-card-meta .env-badge' },
    regions: [
      region('card', all('.env-card'), ['<Card', '</Card>']),
      region('title', all('.env-card-title'), ['title=']),
      region('description', all('.env-card-description'), ['description=']),
      region('badge', all('.env-card-meta .env-badge'), ['meta=']),
      region('avatar', all('.env-card-header-end .env-avatar'), ['headerEnd=']),
      region('role', all('.env-text-field'), ['<TextField', '/>']),
      region('publish', all('.env-switch'), ['<Switch']),
      region('save', all('.env-card-actions .env-button'), ['actions=']),
    ],
  },
  {
    id: 'table',
    label: 'Table',
    icon: <IconTableRows />,
    file: 'Releases.tsx',
    source: releasesSource.trimEnd(),
    wide: true,
    Specimen: Releases,
    rest: { id: 'table', css: '.env-table' },
    regions: [
      region('table', all('.env-table'), ['<Table.Root', '</Table.Root>']),
      region('head', all('.env-table-head'), ['<Table.Head>', '</Table.Head>']),
      region('row', all('.env-table-body > tr'), ['{Object.entries', '))}']),
      region('name', all('.env-table-body td:first-child'), ['<Table.Cell>{name}']),
      region('status', all('.env-table-body td:nth-child(2)'), ['<Table.Cell>{state}']),
    ],
  },
  {
    id: 'chat',
    label: 'Chat',
    icon: <IconChat />,
    file: 'Assistant.tsx',
    source: assistantSource.trimEnd(),
    Specimen: Assistant,
    rest: { id: 'question', css: '.env-message-list > :first-child .env-message-content' },
    regions: [
      region('list', all('.env-message-list'), ['<MessageList', '</MessageList>']),
      region('question', all('.env-message-content', 0, 1), [
        '<Message from="self">',
        '</Message>',
      ]),
      region('answer', all('.env-message-content', 1, 2), ['<Message from="other"', '</Message>']),
      region('composer', all('.env-composer'), ['<Composer', '/>']),
    ],
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <IconSpaceDashboard />,
    file: 'QuarterlyReport.tsx',
    source: quarterlyReportSource.trimEnd(),
    Specimen: QuarterlyReport,
    rest: { id: 'badge', css: '.env-card-header-end .env-badge' },
    regions: [
      region('card', all('.env-card'), ['<Card', '</Card>']),
      region('title', all('.env-card-title'), ['title="Quarterly report"']),
      region('meta', all('.env-card-meta'), ['meta=']),
      region('badge', all('.env-card-header-end .env-badge'), ['headerEnd=', '}']),
      region('figure', all(".env-text[data-variant='display']"), ['<Text variant']),
      region('sales', all('.env-meter', 0, 1), ['<Meter', '/>']),
      region('seats', all('.env-meter', 1, 2), ['<Meter', '/>', 'label="Sales"']),
    ],
  },
];

export function linesOf(source: string, { lines: needles }: SampleRegion): [number, number][] {
  const lines = source.split('\n');
  return needles.map(([first, last, after]) => {
    const from = after ? lines.findIndex((line) => line.includes(after)) + 1 : 0;
    const start = Math.max(
      0,
      lines.findIndex((line, index) => index >= from && line.includes(first)),
    );
    const opener = lines[start]!;
    if (!last || opener.includes(last, opener.indexOf(first) + first.length)) return [start, start];
    const indent = lines[start]!.search(/\S/);
    const end = lines.findIndex(
      (line, index) => index > start && line.includes(last) && line.search(/\S/) === indent,
    );
    return [start, end < 0 ? start : end];
  });
}
