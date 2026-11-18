import { useLayoutEffect, useState, type RefObject } from 'react';
import type { DeviceKind } from '../../documentation/DocumentationTypes';
import { arrivedEvent } from '../../loading/useArrival';
import { remeasure } from '../../shared/Remeasure';
import type { ScriptReader } from '../FitKind';
import { sameFit, type DeviceFit } from './DeviceFit';
import { deviceFit, type DeviceFitting } from './DeviceMeasure';

const pointerScriptDelayMs = 600;

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
    const fits = remeasure(
      (changed) => {
        const fromMutation = [...changed].every(
          (change) => change === 'mutation' || change === 'event',
        );
        const next = deviceFit(fitting, fromMutation);
        if (next) setFit((current) => (current && sameFit(current, next) ? current : next));
      },
      {
        first: 'now',
        resize: [stageElement, rowElement],
        ...(root && {
          mutation: {
            target: rowElement,
            options: { childList: true, attributes: true, subtree: true },
          },
          events: [{ target: root, types: [heading] }],
        }),
      },
    );
    rowElement.addEventListener(arrivedEvent, fits.update);
    const timer = setTimeout(fits.update, pointerScriptDelayMs);
    return () => {
      fits.stop();
      rowElement.removeEventListener(arrivedEvent, fits.update);
      clearTimeout(timer);
    };
  }, [stage, row, kind, read, heading]);
  return fit;
}
