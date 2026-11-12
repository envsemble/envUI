import { useLayoutEffect, useState, type RefObject } from 'react';
import type { DeviceKind } from '../../documentation/DocumentationTypes';
import { arrivedEvent } from '../../loading/useArrival';
import { remeasure } from '../../shared/Remeasure';
import type { ScriptReader } from '../FitKind';
import { sameFit, type DeviceFit } from './DeviceFit';
import { deviceFit, type DeviceFitting } from './DeviceMeasure';

/**
 * The fit of a device figure in its stage (deviceFit, for DeviceStage in DeviceFrame.tsx), or
 * undefined before it has a size. It fits again when the stage or the device's row resizes, when
 * its example arrives in place of its skeleton, and, for an animated figure, when its screen
 * changes or its pointer's heading changes (`script`).
 */
export function useDeviceFit(
  stage: RefObject<HTMLElement | null>,
  row: RefObject<HTMLElement | null>,
  kind: DeviceKind,
  script: ScriptReader,
) {
  const [fit, setFit] = useState<DeviceFit>();
  const { read, heading } = script;
  useLayoutEffect(() => {
    const stageElement = stage.current;
    const rowElement = row.current;
    const box = rowElement?.parentElement;
    if (!stageElement || !rowElement || !box) return;
    const fitting: DeviceFitting = {
      kind,
      stage: stageElement,
      box,
      row: rowElement,
      root: stageElement.closest('.catalogue-motion-subject'),
      readScript: read,
      view: { x: 0, y: 0 },
      held: { size: '' },
    };
    const { root } = fitting;
    // Measured at once, then again in later frames: the size it sets resizes the stage it
    // observes.
    const fits = remeasure(
      (changed) => {
        // Whether only the screen's content changed (as the figure plays), not its layout.
        const fromMutation = [...changed].every(
          (change) => change === 'mutation' || change === 'event',
        );
        const next = deviceFit(fitting, fromMutation);
        if (next) setFit((current) => (current && sameFit(current, next) ? current : next));
      },
      {
        first: 'now',
        resize: [stageElement, rowElement],
        // Something opening or closing on the screen, such as a pane the pointer heads into,
        // changes which points are visible, so it fits again, as a new heading does.
        ...(root && {
          mutation: {
            target: rowElement,
            options: { childList: true, attributes: true, subtree: true },
          },
          events: [{ target: root, types: [heading] }],
        }),
      },
    );
    // The screen is a fixed size, so the example arriving in place of its skeleton resizes
    // nothing, and it fades in, its words see-through until it has: it fits again once it has
    // arrived (useArrival), its words measured as on a resize.
    rowElement.addEventListener(arrivedEvent, fits.update);
    // The pointer's script registers its points a moment after the picture starts, so fit
    // again after 600 ms.
    const timer = setTimeout(fits.update, 600);
    return () => {
      fits.stop();
      rowElement.removeEventListener(arrivedEvent, fits.update);
      clearTimeout(timer);
    };
  }, [stage, row, kind, read, heading]);
  return fit;
}
