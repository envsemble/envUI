import MaximizedPanel from '../../examples/panel-dock/MaximizedPanel';
import { usePointer, type PointerStep } from '../../motion/Motion';
import { MotionStage } from '../../motion/MotionStage';

const panel = (title: string) => `.env-panel-dock-panel[aria-label="${title}"]`;
const control = (title: string, name: string) => `${panel(title)} [aria-label="${name}"]`;
const tab = (label: string) => `.env-panel-dock-tab-restore[aria-label="Show ${label}"]`;

/** An open panel's title: a maximized one's is at the start of the dock, far from its controls. */
const title = (name: string) => `${panel(name)}:not([data-placement='fill']) .env-panel-dock-title`;

/*
 * The pointer minimizes the press release to a tab, restores the launch plan to the row, maximizes
 * it again, and brings the press release back from its tab: the three modes in turn, ending where
 * they began. It passes an open panel's title on its way to the panel's controls, which a window
 * cut off at a phone's width shows together, at the dock's end, with the tabs.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: title('Press release'), x: 0.02, y: 0.9 },
  { wait: 500 },
  { to: control('Press release', 'Minimize'), duration: 700 },
  { wait: 350 },
  { click: true },
  { wait: 900 },
  { to: control('Launch plan', 'Restore'), duration: 800 },
  { wait: 500 },
  { click: true },
  { wait: 900 },
  { to: title('Launch plan'), x: 0.02, y: 0.9, duration: 700 },
  { wait: 500 },
  { to: control('Launch plan', 'Maximize'), duration: 700 },
  { wait: 350 },
  { click: true },
  { wait: 1000 },
  { to: tab('Press release'), duration: 700 },
  { wait: 350 },
  { click: true },
  { wait: 900 },
  { leave: true },
  { wait: 800 },
];

function Switching() {
  usePointer(script);
  // As wide as the stage: the dock fills its region, which has no width of its own.
  return (
    <div style={{ inlineSize: '100%' }}>
      <MaximizedPanel />
    </div>
  );
}

/** One dock through its modes: a panel minimized, restored, maximized and brought back. */
export default function MaximizedPanelMotion() {
  return (
    <MotionStage label="the panels minimized, restored and maximized">
      <Switching />
    </MotionStage>
  );
}
