import { useLayoutEffect, useRef, useState } from 'react';
import { Tooltip } from '@envsemble/envui';
import { TouchApp } from '@envsemble/envui/icons/TouchApp';

/** What the mark says, as its name and its tooltip alike. */
export const interactiveLabel = 'Interactive: try it';

/** What a reader could use in a stage: controls, links and anything focusable or editable. */
const interactive =
  'a[href], button, input:not([type="hidden"]), select, textarea, summary, [tabindex], [contenteditable]:not([contenteditable="false"]), audio[controls], video[controls]';

/** Whether an element can be used: not inert, not disabled and not taken out of the tab order. */
function usable(element: Element) {
  if (element.closest('[inert], .docs-interactive-mark')) return false;
  if (element.matches(':disabled') || element.getAttribute('tabindex') === '-1') return false;
  return true;
}

/**
 * The mark at the bottom end of a stage whose example can be used, such as a live example of a
 * button: a small, quiet touch icon, so a reader knows to try it. A picture, such as an anatomy
 * figure, an example shown open or a specimen whose parts are inert, shows nothing. Place it last
 * in the stage: it follows what the stage holds as it loads and changes, such as an editor that
 * mounts after the stage, and shows while something there can be used, unless `enabled` is false.
 * It is focusable, so the keyboard reaches its tooltip, and named by the same words, which a
 * screen reader reads as it reaches the figure. It sits in the stage's padding, clear of what the
 * stage shows (Stage.css).
 */
export function InteractiveMark({ enabled = true }: { enabled?: boolean }) {
  const anchor = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(false);
  useLayoutEffect(() => {
    const stage = anchor.current?.parentElement;
    if (!enabled || !stage) {
      setShown(false);
      return;
    }
    const read = () =>
      setShown([...stage.querySelectorAll(interactive)].some((part) => usable(part)));
    read();
    const observer = new MutationObserver(read);
    observer.observe(stage, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['inert', 'tabindex', 'disabled', 'contenteditable', 'href'],
    });
    return () => observer.disconnect();
  }, [enabled]);
  return (
    <>
      <span ref={anchor} hidden />
      {shown && (
        <Tooltip content={interactiveLabel}>
          <span
            className="docs-interactive-mark"
            role="img"
            aria-label={interactiveLabel}
            tabIndex={0}
          >
            <TouchApp />
          </span>
        </Tooltip>
      )}
    </>
  );
}
