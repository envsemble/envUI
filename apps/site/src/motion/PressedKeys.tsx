import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Kbd } from '@envsemble/envui';
import { useStageLayer } from './Playback';

/** The space kept between the key cap and the element it sits beside, in px. */
const gap = 12;

/**
 * Shows the keys an animated figure's keyboard presses, such as Ctrl+K or Enter, as a key cap in
 * the top start corner of its stage, above whatever opens there, backdrop included. Nothing else
 * shows a key that the virtual pointer presses. `press` counts the presses, so the cap appears
 * again with each one; `keys` null shows nothing. With `beside`, a selector of the element the keys
 * go to, such as a palette's field, the cap sits beside that element instead: outside the popup it
 * is in, where the stage has room at its start, else inside the popup's end, so it shows next to
 * what it acts on.
 *
 *     const [pressed, setPressed] = useState<{ keys: string[]; press: number } | null>(null);
 *     <PressedKeys keys={pressed?.keys ?? null} press={pressed?.press ?? 0} />
 */
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
    // Horizontally, next to the popup it is in, such as the palette's panel, so the cap sits
    // outside it.
    const across = (target.closest('[role="dialog"]') ?? target).getBoundingClientRect();
    const width = element.offsetWidth;
    const top = box.top - own.top + (box.height - element.offsetHeight) / 2;
    const left =
      across.left - own.left >= width + 2 * gap
        ? across.left - own.left - gap - width
        : box.right - own.left - gap - width;
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
