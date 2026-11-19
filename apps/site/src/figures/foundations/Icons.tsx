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
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { useTimeline } from '../../motion/Timeline';
import { LoadBoundary } from '../../loading/LoadBoundary';
import { lazyPart } from '../../loading/LoadedPart';
import { PartSkeleton, placeholderText } from '../../loading/Skeletons';
import { SpecimenFrame } from '../SpecimenFrame';
import type { FoundationFigureEntry } from './FoundationFigures';
import { FoundationFrame } from './FoundationFrame';

const followSteps: readonly { size: ControlSize; tone: AlertTone; title: string }[] = [
  { size: 'md', tone: 'success', title: 'The report is shared' },
  { size: 'lg', tone: 'info', title: 'A new version is ready' },
  { size: 'sm', tone: 'warning', title: 'Two reports need a review' },
  { size: 'md', tone: 'danger', title: 'The report wasn’t saved' },
];

const followStepMs = 1560;

function FollowTextSteps() {
  const step = useTimeline(followSteps.map(() => followStepMs));
  const { size, tone, title } = followSteps[step]!;
  return (
    <Column gap={4} align="center" className="catalogue-icons-sample">
      <Row gap={2} wrap justify="center" align="center" className="catalogue-icons-buttons">
        <Button size={size} start={<IconAdd />}>
          New report
        </Button>
        <Button size={size} variant="secondary" start={<IconEdit />}>
          Rename
        </Button>
        <Button size={size} variant="ghost" tone="danger" start={<IconDelete />}>
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
    <FoundationFrame label="Icons follow their text" motion="the icons following their text">
      <FollowTextSteps />
    </FoundationFrame>
  );
}

const destinationAt = (position: number) =>
  `.env-navigation-bar-list > li:nth-child(${position}) > .env-navigation-bar-item`;

const destinationsScript: PointerStep[] = [
  { wait: 420 },
  { to: destinationAt(2), y: 0.4 },
  { wait: 180 },
  ...[2, 3, 4, 5].flatMap((index): PointerStep[] => [
    ...(index > 2 ? [{ to: destinationAt(index), y: 0.4, duration: 450 }, { wait: 90 }] : []),
    { click: true },
    { wait: 660 },
  ]),
  { to: destinationAt(1), y: 0.4, duration: 900 },
  { wait: 90 },
  { click: true },
  { wait: 540 },
  { leave: true },
  { wait: 300 },
];

const places = [
  { label: 'Home', icon: <IconHome /> },
  { label: 'Inbox', icon: <IconInbox /> },
  { label: 'Saved', icon: <IconStar /> },
  { label: 'Profile', icon: <IconPerson /> },
  { label: 'Settings', icon: <IconSettings /> },
] as const;

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

function OutlinedAndFilledFigure() {
  return (
    <FoundationFrame label="Outlined and filled" motion="the selected icon filling">
      <DestinationSteps />
    </FoundationFrame>
  );
}

const iconList = lazyPart(
  () => import('./IconCatalogue'),
  (module) => module.IconCatalogue,
  'src/figures/foundations/IconCatalogue.tsx',
);

export const iconPageSize = 72;
const firstPageNameLengths = [6, 4, 4, 5, 8, 12, 8, 3, 6, 10, 4, 13];

function IconCatalogueSkeleton() {
  return (
    <PartSkeleton what="icons">
      <SpecimenFrame size="collection">
        <div className="catalogue-icon-toolbar">
          <SearchField size="lg" label="Search icons" showLabel />
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
                  {placeholderText(firstPageNameLengths[index % firstPageNameLengths.length]!)}
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
      </SpecimenFrame>
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

export const iconsFigures: Record<string, FoundationFigureEntry> = {
  FollowText: { render: FollowTextFigure },
  OutlinedAndFilled: { render: OutlinedAndFilledFigure },
  Catalogue: { render: CatalogueFigure, wide: true },
};
