import { Suspense, useState } from 'react';
import {
  Alert,
  NavigationBar,
  Button,
  Column,
  IconButton,
  Row,
  SearchField,
  Switch,
  Text,
  type AlertTone,
  type ControlSize,
  type Destination,
} from '@envsemble/envui';
import { IconAdd } from '@envsemble/envui/icons/Add';
import { IconDelete } from '@envsemble/envui/icons/Delete';
import { IconEdit } from '@envsemble/envui/icons/Edit';
import { IconHome } from '@envsemble/envui/icons/Home';
import { IconInbox } from '@envsemble/envui/icons/Inbox';
import { IconMoreVert } from '@envsemble/envui/icons/MoreVert';
import { IconPerson } from '@envsemble/envui/icons/Person';
import { IconSettings } from '@envsemble/envui/icons/Settings';
import { IconStar } from '@envsemble/envui/icons/Star';
import { usePointer, useTimeline, type PointerStep } from '../../motion/Motion';
import { LoadBoundary, lazyPart } from '../../template/LoadBoundary';
import { PartSkeleton, placeholderText } from '../../template/Loading';
import { Example } from '../Example';
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
        <Button size={size} startIcon={<IconAdd />}>
          New report
        </Button>
        <Button size={size} variant="secondary" startIcon={<IconEdit />}>
          Rename
        </Button>
        <Button size={size} variant="ghost" tone="danger" startIcon={<IconDelete />}>
          Delete
        </Button>
        <IconButton size={size} variant="ghost" icon={<IconMoreVert />} aria-label="More" />
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
const destination = (index: number) =>
  `.env-navigation-bar-list > li:nth-child(${index}) > .env-navigation-bar-item`;

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
  { label: 'Home', icon: <IconHome /> },
  { label: 'Inbox', icon: <IconInbox /> },
  { label: 'Saved', icon: <IconStar /> },
  { label: 'Profile', icon: <IconPerson /> },
  { label: 'Settings', icon: <IconSettings /> },
] as const;

/** A bar of five destinations, the selected one with its icon filled, used by the pointer. */
function DestinationSteps() {
  const [current, setCurrent] = useState('Home');
  usePointer(destinationsScript);
  const destinations: Destination[] = places.map((place) => ({
    ...place,
    current: current === place.label,
    onClick: () => setCurrent(place.label),
  }));
  return (
    <div className="catalogue-icons-bar">
      <NavigationBar destinations={destinations} />
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
  'src/figures/foundations/IconCatalogue.tsx',
);

/** How many icons a page of the list shows (IconCatalogue.tsx), and its skeleton. */
export const iconPageSize = 72;
/** Lengths of the icons' names on the list's first page, in turn, for the skeleton's bars. */
const nameLengths = [6, 4, 4, 5, 8, 12, 8, 3, 6, 10, 4, 13];

/**
 * Every icon while the list loads: the list's own search, switch, page of icons and pager, as a
 * skeleton, each icon a shape over a bar of its name.
 */
function IconCatalogueSkeleton() {
  return (
    <PartSkeleton what="icons">
      <Example size="collection">
        <div className="catalogue-icon-toolbar">
          <SearchField variant="floating" label="Search icons" showLabel />
          <Switch label="Filled icons" />
        </div>
        <ul className="catalogue-icon-catalogue">
          {Array.from({ length: iconPageSize }, (_, index) => (
            <li key={index}>
              <span className="catalogue-icon-tile">
                <IconHome width="2rem" height="2rem" />
                <Text
                  render={<span />}
                  variant="caption"
                  emphasis="default"
                  className="catalogue-icon-label"
                >
                  {placeholderText(nameLengths[index % nameLengths.length]!)}
                </Text>
              </span>
            </li>
          ))}
        </ul>
        <Row wrap align="center" gap={4}>
          <Button variant="secondary">Previous</Button>
          <Text variant="caption">Page 1 of 99</Text>
          <Button variant="secondary">Next</Button>
        </Row>
      </Example>
    </PartSkeleton>
  );
}

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
      <Suspense fallback={<IconCatalogueSkeleton />}>
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
