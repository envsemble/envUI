import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Kbd } from '@envsemble/envui';
import { useStageLayer } from './Playback';

const capGapPx = 12;

export function PressedKeys({
  keys,
  press,
  beside,
}: {
  keys: readonly string[] | null;
  press: number;
  beside?: string;
}) {
  const layer = useStageLayer();
  const cap = useRef<HTMLSpanElement>(null);
  const [place, setPlace] = useState<CSSProperties>();
  const shown = Boolean(layer && keys);
  useLayoutEffect(() => {
    const element = cap.current;
    const target = beside && layer?.parentElement?.querySelector(beside);
    if (!shown || !element || !layer || !target) {
      setPlace(undefined);
      return;
    }
    const own = layer.getBoundingClientRect();
    const box = target.getBoundingClientRect();
    const popupBox = (target.closest('[role="dialog"]') ?? target).getBoundingClientRect();
    const width = element.offsetWidth;
    const top = box.top - own.top + (box.height - element.offsetHeight) / 2;
    const roomBeforePopup = popupBox.left - own.left >= width + 2 * capGapPx;
    const left = roomBeforePopup
      ? popupBox.left - own.left - capGapPx - width
      : box.right - own.left - capGapPx - width;
    setPlace({ insetBlockStart: top, insetInlineStart: left });
  }, [shown, beside, layer, press]);
  if (!layer || !keys) return null;
  return createPortal(
    <span ref={cap} className="catalogue-corner-label catalogue-pressed-keys" style={place}>
      <Kbd key={press} keys={[...keys]} className="catalogue-key-cap" />
    </span>,
    layer,
  );
}
