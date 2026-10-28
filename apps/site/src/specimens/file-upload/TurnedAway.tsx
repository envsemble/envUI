import { useState } from 'react';
import TurnedAway from '../../examples/file-upload/TurnedAway';
import { usePointer, type PointerStep } from '../../motion/Motion';
import { MotionStage } from '../../motion/MotionStage';
import { Renew } from '../../motion/Renew';

const zone = '.env-drop-zone-target';

/*
 * The pointer carries a spreadsheet and a PDF onto the zone, which takes PDFs and images: the PDF
 * joins the list, and the zone says why the spreadsheet was turned away. Then it starts anew.
 */
const script: PointerStep[] = [
  { wait: 400 },
  {
    carry: [
      {
        name: 'budget-2026.xlsx',
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
      { name: 'annual-review.pdf', type: 'application/pdf' },
    ],
  },
  { to: zone, x: 0.9, y: 1.3 },
  { to: zone, x: 0.55, y: 0.55, duration: 550 },
  { wait: 300 },
  { drop: true },
  { wait: 200 },
  { leave: true },
  { wait: 2600 },
  { cue: 'renew' },
  { wait: 700 },
];

function Dropping() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    // As tall as the zone with its message and both files, so the figure keeps its height.
    <div
      style={{
        display: 'grid',
        alignContent: 'start',
        inlineSize: '100%',
        minBlockSize: '19.75rem',
      }}
    >
      <Renew round={round}>
        <TurnedAway />
      </Renew>
    </div>
  );
}

/** Two files dropped by a pointer no one sees: the zone takes one and says why not the other. */
export default function TurnedAwayMotion() {
  return (
    <MotionStage label="a file turned away and another taken">
      <Dropping />
    </MotionStage>
  );
}
