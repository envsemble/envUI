import { useLayoutEffect, useState, type RefObject } from 'react';
import type { DeviceKind } from '@docs-model/DocumentationTypes';
import { remeasure } from '../../shared/Remeasure';
import type { ScriptReader } from '../FitKind';
import { deviceFit, sameFit, type DeviceFit, type DeviceFitting } from './DeviceFit';

/**
 * A device's fit in its stage (DeviceStage, DeviceFrame.tsx), as its stage and the row that holds
 * it at its own size resize, its figure's pointer heads somewhere else and what is on its screen
 * changes; none before it has a size (deviceFit).
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
    // Measured at once, then in the next frame: the size it sets resizes the stage it observes.
    const fits = remeasure(
      (changed) => {
        // Whether it follows only a change on the screen as the figure plays, not its layout.
        const fromMutation = [...changed].every(
          (change) => change === 'mutation' || change === 'event',
        );
        const next = deviceFit(fitting, fromMutation);
        if (next) setFit((current) => (current && sameFit(current, next) ? current : next));
      },
      {
        first: 'now',
        resize: [stageElement, rowElement],
        // What opens and closes on the screen, such as a pane the pointer heads into, moves the
        // view to what is left of its points, as the pointer heading somewhere else does.
        ...(root && {
          mutation: {
            target: rowElement,
            options: { childList: true, attributes: true, subtree: true },
          },
          events: [{ target: root, types: [heading] }],
        }),
      },
    );
    // The pointer's script names its points as its picture starts, a moment after.
    const timer = setTimeout(fits.update, 600);
    return () => {
      fits.stop();
      clearTimeout(timer);
    };
  }, [stage, row, kind, read, heading]);
  return fit;
}
