import ListAndDetail from '../../examples/panes/ListAndDetail';
import { usePointer, type PointerStep } from '../../previews/Motion';
import { MotionStage } from '../../previews/MotionStage';

const message = (id: string) => `.env-panes-list a[href="/inbox/${id}"]`;
const back = '.env-panes-back .env-button';

/*
 * Narrow, one pane at a time: the pointer opens the budget review, which takes the list's place
 * with a back button named Inbox, and goes back; then it opens the launch checklist and goes back,
 * the message chosen as it began.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: message('budget'), x: 0.4 },
  { wait: 350 },
  { click: true },
  { wait: 1700 },
  { to: back, duration: 600 },
  { wait: 300 },
  { click: true },
  { wait: 1000 },
  { to: message('launch'), x: 0.4, duration: 600 },
  { wait: 300 },
  { click: true },
  { wait: 1500 },
  { to: back, duration: 500 },
  { wait: 300 },
  { click: true },
  { wait: 600 },
  { leave: true },
  { wait: 900 },
];

function Reading() {
  usePointer(script);
  return (
    // As wide as the stage; a press on a message's link opens it here, never the link's page.
    <div
      style={{ inlineSize: '100%' }}
      onClickCapture={(event) => {
        if ((event.target as Element).closest('a')) event.preventDefault();
      }}
    >
      <ListAndDetail />
    </div>
  );
}

/** Messages opened from the list and closed by the back button, one pane at a time. */
export default function ListAndDetailMotion() {
  return (
    <MotionStage label="a message opened from the list and back">
      <Reading />
    </MotionStage>
  );
}
