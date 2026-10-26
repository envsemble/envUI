import { Suspense, useState } from 'react';
import {
  Alert,
  Bar,
  Button,
  Column,
  IconButton,
  Row,
  type AlertTone,
  type ControlSize,
  type Destination,
} from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import { Delete } from '@envsemble/envui/icons/Delete';
import { Edit } from '@envsemble/envui/icons/Edit';
import { Home } from '@envsemble/envui/icons/Home';
import { Inbox } from '@envsemble/envui/icons/Inbox';
import { MoreVert } from '@envsemble/envui/icons/MoreVert';
import { Person } from '@envsemble/envui/icons/Person';
import { Settings } from '@envsemble/envui/icons/Settings';
import { Star } from '@envsemble/envui/icons/Star';
import { usePointer, useTimeline, type PointerStep } from '../Motion';
import { LoadBoundary, lazyPart } from '../../template/LoadBoundary';
import { Loading } from '../../template/Loading';
import type { FoundationFigure } from './FoundationFigures';
import { Figure } from './Topic';

/*
 * The figures of the Icons foundation. Its words are in docs/foundations/icons.md, the page's one
 * source, which places each figure by name and gives it its legend.
 */

/** The sizes the buttons step through, and the tone the message takes at each step. */
const followSteps: readonly { size: ControlSize; tone: AlertTone; title: string }[] = [
  { size: 'md', tone: 'success', title: 'The report is shared' },
  { size: 'lg', tone: 'info', title: 'A new version is ready' },
  { size: 'sm', tone: 'warning', title: 'Two reports need a review' },
  { size: 'md', tone: 'danger', title: 'The report wasn’t saved' },
];

/**
 * Buttons stepping through their sizes and a message through its tones: each icon grows and
 * shrinks with its label and takes the color of its words.
 */
function FollowTextSteps() {
  const step = useTimeline(followSteps.map(() => 2600));
  const { size, tone, title } = followSteps[step]!;
  return (
    <Column gap={4} align="center" className="catalogue-icons-sample">
      <Row gap={2} wrap justify="center" align="center" className="catalogue-icons-buttons">
        <Button size={size} startIcon={<Add />}>
          New report
        </Button>
        <Button size={size} variant="secondary" startIcon={<Edit />}>
          Rename
        </Button>
        <Button size={size} variant="ghost" tone="danger" startIcon={<Delete />}>
          Delete
        </Button>
        <IconButton size={size} variant="ghost" icon={<MoreVert />} aria-label="More" />
      </Row>
      <Alert tone={tone} title={title} className="catalogue-icons-alert" />
    </Column>
  );
}

function FollowTextFigure() {
  return (
    <Figure label="Icons follow their text" motion="the icons following their text">
      <FollowTextSteps />
    </Figure>
  );
}

/** A destination of the bar, by its place from 1. */
const destination = (index: number) => `.env-bar-list > li:nth-child(${index}) > .env-bar-item`;

/**
 * The pointer taps across the destinations and back to the first: each one it selects fills its
 * icon, and the one it leaves goes back to outlined.
 */
const destinationsScript: PointerStep[] = [
  { wait: 700 },
  { to: destination(2), y: 0.4 },
  { wait: 300 },
  ...[2, 3, 4, 5].flatMap((index): PointerStep[] => [
    ...(index > 2 ? [{ to: destination(index), y: 0.4, duration: 450 }, { wait: 150 }] : []),
    { click: true },
    { wait: 1100 },
  ]),
  { to: destination(1), y: 0.4, duration: 900 },
  { wait: 150 },
  { click: true },
  { wait: 900 },
  { leave: true },
  { wait: 500 },
];

const places = [
  { label: 'Home', icon: <Home /> },
  { label: 'Inbox', icon: <Inbox /> },
  { label: 'Saved', icon: <Star /> },
  { label: 'Profile', icon: <Person /> },
  { label: 'Settings', icon: <Settings /> },
] as const;

/** A bar of five destinations, the selected one with its icon filled, used by the pointer. */
function DestinationSteps() {
  const [current, setCurrent] = useState('Home');
  usePointer(destinationsScript);
  const destinations: Destination[] = places.map((place) => ({
    ...place,
    current: current === place.label,
    onSelect: () => setCurrent(place.label),
  }));
  return (
    <div className="catalogue-icons-bar">
      <Bar destinations={destinations} />
    </div>
  );
}

/** Outlined destinations, the selected one filled, as the pointer moves between them. */
function OutlinedAndFilledFigure() {
  return (
    <Figure label="Outlined and filled" motion="the selected icon filling">
      <DestinationSteps />
    </Figure>
  );
}

/** Every icon, a tool rather than a figure: its list loads when it is shown. */
const iconList = lazyPart(
  () => import('./IconCatalogue'),
  (module) => module.IconCatalogue,
  'src/previews/foundations/IconCatalogue.tsx',
);

function CatalogueFigure() {
  const [, setAttempt] = useState(0);
  const IconCatalogue = iconList.component;
  return (
    <LoadBoundary
      what="icon list"
      modules={iconList.modules}
      onRetry={() => {
        iconList.retry();
        setAttempt((count) => count + 1);
      }}
    >
      <Suspense fallback={<Loading what="icons" />}>
        <IconCatalogue />
      </Suspense>
    </LoadBoundary>
  );
}

/** The figures docs/foundations/icons.md places, by name. */
export const iconsFigures: Record<string, FoundationFigure> = {
  FollowText: { render: FollowTextFigure },
  OutlinedAndFilled: { render: OutlinedAndFilledFigure },
  Catalogue: { render: CatalogueFigure, wide: true },
};
