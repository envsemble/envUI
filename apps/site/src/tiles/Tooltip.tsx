import { IconButton, Row, Tooltip } from '@envsemble/envui';
import { IconDownload } from '@envsemble/envui/icons/Download';
import { IconRefresh } from '@envsemble/envui/icons/Refresh';
import { IconShare } from '@envsemble/envui/icons/Share';
import { useHeldView } from '../motion/Playback';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';

const button = (index: number) => `.env-icon-button:nth-child(${index} of .env-icon-button)`;

/*
 * The pointer rests on the middle button, steps off it downward, and its tooltip closes. Once that
 * has gone, the pointer moves onto the next button, whose tooltip opens once the pointer has rested
 * there for the tooltip's delay; then the same back, where the loop began. The delay is short, as
 * it is between the buttons of a toolbar once one tooltip has shown, so the row is never long
 * without a tooltip, and no two tooltips show at once. Its view holds while it plays (useHeldView),
 * framed on its still with a tooltip open, so the row stays in place as one tooltip closes and the
 * next opens. The pointer steps off just below a button, so its cursor stays inside a phone's low
 * stage.
 */
const script: PointerStep[] = [
  { to: button(2), y: 0.6 },
  { wait: 1500 },
  { to: button(2), y: 1.1, duration: 200 },
  { wait: 450 },
  { to: button(3), y: 0.6, duration: 300 },
  { wait: 2000 },
  { to: button(3), y: 1.1, duration: 200 },
  { wait: 450 },
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

/** Icon buttons, with the middle one's tooltip open above it. */
export default function TooltipTile() {
  useHeldView();
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
