import { useLayoutEffect, useState, type RefObject } from 'react';
import type { DeviceKind } from '../../../../scripts/docs/model/DocumentationTypes';
import { headingEvent } from '../motion/MustShow';
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
) {
  const [fit, setFit] = useState<DeviceFit>();
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
      view: { x: 0, y: 0 },
      held: { size: '' },
    };
    // `fromMutation`: whether it follows a change on the screen as the figure plays, not its layout.
    const update = (fromMutation = false) => {
      const next = deviceFit(fitting, fromMutation);
      if (next) setFit((current) => (current && sameFit(current, next) ? current : next));
    };
    update();
    // Measured in the next frame: the size it sets resizes the stage it observes.
    let request = 0;
    const later = (mutation = false) => {
      cancelAnimationFrame(request);
      request = requestAnimationFrame(() => update(mutation));
    };
    const observer = new ResizeObserver(() => later());
    observer.observe(stageElement);
    observer.observe(rowElement);
    const { root } = fitting;
    const heads = () => later(true);
    root?.addEventListener(headingEvent, heads);
    // What opens and closes on the screen, such as a pane the pointer heads into, moves the view
    // to what is left of its points.
    const mutations = new MutationObserver(() => later(true));
    if (root) mutations.observe(rowElement, { childList: true, attributes: true, subtree: true });
    // The pointer's script names its points as its picture starts, a moment after.
    const timer = setTimeout(() => later(), 600);
    return () => {
      cancelAnimationFrame(request);
      clearTimeout(timer);
      observer.disconnect();
      mutations.disconnect();
      root?.removeEventListener(headingEvent, heads);
    };
  }, [stage, row, kind]);
  return fit;
}
