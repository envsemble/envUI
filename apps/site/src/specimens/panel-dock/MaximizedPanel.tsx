import MaximizedPanel from '../../examples/panel-dock/MaximizedPanel';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const panel = (title: string) => `.env-panel-dock-panel[aria-label="${title}"]`;
const control = (title: string, name: string) => `${panel(title)} [aria-label="${name}"]`;
const tab = (label: string) => `.env-panel-dock-tab-restore[aria-label="Show ${label}"]`;

const title = (name: string) => `${panel(name)}:not([data-placement='fill']) .env-panel-dock-title`;

const maximizedTitleWhileOtherIsTab = (name: string, tabbed: string) =>
  `.env-panel-dock:has(${tab(tabbed)}) ${panel(name)}[data-placement='fill'] .env-panel-dock-title`;

const script: PointerStep[] = [
  { wait: 300 },
  { to: title('Press release'), x: 0.02, y: 0.9 },
  { wait: 300 },
  { to: control('Press release', 'Minimize'), duration: 700 },
  { wait: 210 },
  { click: true },
  { wait: 240 },
  {
    to: maximizedTitleWhileOtherIsTab('Launch plan', 'Press release'),
    x: 0.02,
    y: 0.9,
    duration: 700,
  },
  { wait: 420 },
  { to: control('Launch plan', 'Restore'), duration: 800 },
  { wait: 300 },
  { click: true },
  { wait: 540 },
  { to: title('Launch plan'), x: 0.02, y: 0.9, duration: 700 },
  { wait: 300 },
  { to: control('Launch plan', 'Maximize'), duration: 700 },
  { wait: 210 },
  { click: true },
  { wait: 600 },
  { to: tab('Press release'), duration: 700 },
  { wait: 210 },
  { click: true },
  { wait: 540 },
  { leave: true },
  { wait: 480 },
];

function Switching() {
  usePointer(script);
  return (
    <div style={{ inlineSize: '100%' }}>
      <MaximizedPanel />
    </div>
  );
}

export default function MaximizedPanelMotion() {
  return (
    <MotionStage label="the panels minimized, restored and maximized">
      <Switching />
    </MotionStage>
  );
}
