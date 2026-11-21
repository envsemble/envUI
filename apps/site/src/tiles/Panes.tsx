import { DescriptionList, Panes, Surface, Text } from '@envsemble/envui';
import { useMedia } from '../motion/Autoplay';
import { useMustShow } from '../motion/Playback';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import { narrowGallery } from './Tiles';

const panes = '.env-panes';
const handle = '.env-panes-resize-handle';

const panesWidthRem = 24;

const halfHandleReachRem = 0.375;

const wide = { details: 10, widened: 13, least: 9 };
const narrow = { details: 9, widened: 11, least: 8 };

const detailsStartShare = (width: number) =>
  (panesWidthRem - width - halfHandleReachRem) / panesWidthRem;

const scriptOf = ({ details, widened }: typeof wide): PointerStep[] => [
  { wait: 240 },
  { to: handle, x: 0.5, y: 0.5 },
  { wait: 240 },
  { press: true },
  { to: panes, x: detailsStartShare(widened), duration: 1000 },
  { wait: 600 },
  { to: panes, x: detailsStartShare(details), duration: 900 },
  { release: true },
  { wait: 300 },
  { leave: true },
  { wait: 300 },
];
const scripts = { wide: scriptOf(wide), narrow: scriptOf(narrow) };

export default function PanesTile() {
  const sizes = useMedia(narrowGallery) ? narrow : wide;
  usePointer(sizes === narrow ? scripts.narrow : scripts.wide);
  useMustShow(handle);
  return (
    <Panes.Root
      sized="end"
      defaultWidth={sizes.details}
      minWidth={sizes.least}
      style={{ inlineSize: `${panesWidthRem}rem`, blockSize: '7rem' }}
    >
      <Panes.Pane label="Launch checklist">
        <Surface radius="none" padding={2} background="page" style={{ minBlockSize: '100%' }}>
          <Text variant="title" render={<h3 />}>
            Launch checklist
          </Text>
          <Text variant="body-sm" emphasis="muted">
            The banner, the pricing page and the email.
          </Text>
        </Surface>
      </Panes.Pane>
      <Panes.ResizeHandle label="Resize details" />
      <Panes.Pane label="Checklist details">
        <Surface radius="none" padding={2} style={{ minBlockSize: '100%' }}>
          <DescriptionList.Root aria-label="About the checklist" size="sm">
            <DescriptionList.Item label="Owner">Priya Shah</DescriptionList.Item>
            <DescriptionList.Item label="Due">March 12</DescriptionList.Item>
          </DescriptionList.Root>
        </Surface>
      </Panes.Pane>
    </Panes.Root>
  );
}
