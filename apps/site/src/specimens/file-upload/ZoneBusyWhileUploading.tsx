import { useState } from 'react';
import ZoneBusyWhileUploading from '../../examples/file-upload/ZoneBusyWhileUploading';
import { usePointer } from '../../motion/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';
import { Renew } from '../../motion/Renew';
import { busyScript, zoneClock } from './Zone';

function Waiting() {
  const [round, setRound] = useState(0);
  // On the do's clock: the same file waits over the busy zone until both uploads are done.
  usePointer(busyScript, { clock: zoneClock, onCue: () => setRound((count) => count + 1) });
  return (
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
        <ZoneBusyWhileUploading />
      </Renew>
    </div>
  );
}

/** The Rules' don't: the zone takes nothing until both uploads are done. */
export default function ZoneBusyWhileUploadingMotion() {
  return (
    <MotionStage label="the zone busy until both files are up">
      <Waiting />
    </MotionStage>
  );
}
