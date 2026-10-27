import { useState } from 'react';
import ZoneStaysReady from '../../examples/file-upload/ZoneStaysReady';
import { usePointer } from '../../previews/Motion';
import { MotionStage } from '../../previews/MotionStage';
import { Renew } from '../../previews/Renew';
import { readyScript, zoneClock } from './Zone';

function Adding() {
  const [round, setRound] = useState(0);
  // On one clock with the don't beside it, whose zone is busy until both files are up.
  usePointer(readyScript, { clock: zoneClock, onCue: () => setRound((count) => count + 1) });
  return (
    // As tall as the list with three files, and as the don't, so both keep still and in line.
    <div
      style={{
        display: 'grid',
        alignContent: 'start',
        justifyItems: 'center',
        inlineSize: '100%',
        minBlockSize: '20rem',
      }}
    >
      <Renew round={round}>
        <ZoneStaysReady />
      </Renew>
    </div>
  );
}

/** The Rules' do: a third file dropped while two upload, and taken at once. */
export default function ZoneStaysReadyMotion() {
  return (
    <MotionStage label="a third file added while two upload">
      <Adding />
    </MotionStage>
  );
}
