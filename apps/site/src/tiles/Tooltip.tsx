import { IconButton, Row, Tooltip } from '@envsemble/envui';
import { Download } from '@envsemble/envui/icons/Download';
import { Refresh } from '@envsemble/envui/icons/Refresh';
import { Share } from '@envsemble/envui/icons/Share';
import { usePointer, type PointerStep } from '../previews/Motion';

const button = (index: number) => `.env-icon-button:nth-child(${index} of .env-icon-button)`;

/*
 * The pointer, resting on the middle button, moves to the next, whose tooltip opens once it rests
 * there for the tooltip's delay, and back, where the loop began.
 */
const script: PointerStep[] = [
  { to: button(2), y: 0.6 },
  { wait: 900 },
  { to: button(3), y: 0.6, duration: 400 },
  { wait: 1500 },
  { to: button(2), y: 0.6, duration: 400 },
  { wait: 1200 },
];

const actions = [
  { label: 'Refresh', icon: <Refresh /> },
  { label: 'Download', icon: <Download /> },
  { label: 'Share', icon: <Share /> },
];

/** Icon buttons, the middle one's tooltip open above it. */
export default function TooltipTile() {
  usePointer(script);
  return (
    <Row gap={2} align="center">
      {actions.map(({ label, icon }) => (
        <Tooltip key={label} content={label} defaultOpen={label === 'Download'}>
          <IconButton icon={icon} aria-label={label} variant="secondary" />
        </Tooltip>
      ))}
    </Row>
  );
}
