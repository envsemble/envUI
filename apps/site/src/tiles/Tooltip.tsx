import { IconButton, Row, Tooltip } from '@envsemble/envui';
import { IconDownload } from '@envsemble/envui/icons/Download';
import { IconRefresh } from '@envsemble/envui/icons/Refresh';
import { IconShare } from '@envsemble/envui/icons/Share';
import { usePointer, type PointerStep } from '../motion/Motion';

const button = (index: number) => `.env-icon-button:nth-child(${index} of .env-icon-button)`;

/*
 * The pointer, resting on the middle button, moves to the next, whose tooltip opens once it rests
 * there for the tooltip's delay, and back, where the loop began. The delay is short, as it is
 * between the buttons of a toolbar once one tooltip has shown, so the row is never long without
 * one.
 */
const script: PointerStep[] = [
  { to: button(2), y: 0.6 },
  { wait: 1500 },
  { to: button(3), y: 0.6, duration: 300 },
  { wait: 2000 },
  { to: button(2), y: 0.6, duration: 300 },
  { wait: 500 },
];

/** How long the pointer rests on a button before its tooltip opens. */
const delay = 120;

const actions = [
  { label: 'Refresh', icon: <IconRefresh /> },
  { label: 'Download', icon: <IconDownload /> },
  { label: 'Share', icon: <IconShare /> },
];

/** Icon buttons, the middle one's tooltip open above it. */
export default function TooltipTile() {
  usePointer(script);
  return (
    <Row gap={2} align="center">
      {actions.map(({ label, icon }) => (
        <Tooltip key={label} content={label} delay={delay} defaultOpen={label === 'Download'}>
          <IconButton icon={icon} aria-label={label} variant="secondary" />
        </Tooltip>
      ))}
    </Row>
  );
}
