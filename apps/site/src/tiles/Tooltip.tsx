import { IconButton, Row, Tooltip } from '@envsemble/envui';
import { IconDownload } from '@envsemble/envui/icons/Download';
import { IconRefresh } from '@envsemble/envui/icons/Refresh';
import { IconShare } from '@envsemble/envui/icons/Share';
import { useHeldView } from '../motion/Playback';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';

const button = (index: number) => `.env-icon-button:nth-child(${index} of .env-icon-button)`;

const script: PointerStep[] = [
  { to: button(2), y: 0.6 },
  { wait: 900 },
  { to: button(2), y: 1.1, duration: 200 },
  { wait: 270 },
  { to: button(3), y: 0.6, duration: 300 },
  { wait: 1200 },
  { to: button(3), y: 1.1, duration: 200 },
  { wait: 270 },
  { to: button(2), y: 0.6, duration: 300 },
  { wait: 300 },
];

const tooltipDelayMs = 120;

const actions = [
  { label: 'Refresh', icon: <IconRefresh /> },
  { label: 'Download', icon: <IconDownload /> },
  { label: 'Share', icon: <IconShare /> },
];

export default function TooltipTile() {
  useHeldView();
  usePointer(script);
  return (
    <Row gap={2} align="center">
      {actions.map(({ label, icon }) => (
        <Tooltip
          key={label}
          content={label}
          delay={tooltipDelayMs}
          defaultOpen={label === 'Download'}
        >
          <IconButton icon={icon} aria-label={label} variant="secondary" />
        </Tooltip>
      ))}
    </Row>
  );
}
