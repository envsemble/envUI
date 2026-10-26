import { createPortal } from 'react-dom';
import { Kbd } from '@envsemble/envui';
import { usePreviewLayer } from './Motion';

/**
 * The keys an animated figure's keyboard presses, such as Ctrl+K or Enter, as a key cap in the top
 * start corner of its stage, over what opens there, scrim included, since nothing else shows a key
 * that a pointer no one sees presses. `press` counts the presses, so the cap comes again with each;
 * `keys` null shows none.
 *
 *     const [pressed, setPressed] = useState<{ keys: string[]; press: number } | null>(null);
 *     <PressedKeys keys={pressed?.keys ?? null} press={pressed?.press ?? 0} />
 */
export function PressedKeys({ keys, press }: { keys: readonly string[] | null; press: number }) {
  const layer = usePreviewLayer();
  if (!layer || !keys) return null;
  return createPortal(
    <span className="catalogue-corner-label catalogue-pressed-keys">
      <Kbd key={press} keys={[...keys]} className="catalogue-key-cap" />
    </span>,
    layer,
  );
}
