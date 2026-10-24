import { useLayoutEffect, useState, type RefObject } from 'react';
import { Tooltip } from '@envsemble/envui';
import { Imagesmode } from '@envsemble/envui/icons/Imagesmode';

/** What the mark says, as its name and its tooltip alike. */
export const pictureLabel = 'Picture: not interactive';

/**
 * The mark at the top end of a stage whose figure is only a picture, such as an anatomy figure, an
 * example shown open or a specimen of forced states: a small, quiet image icon, so a reader can
 * tell it from a live example, which has none. It is focusable, so the keyboard reaches its
 * tooltip, and named by the same words, which a screen reader reads as it reaches the figure.
 * It sits in the stage's padding, clear of what the stage shows (Stage.css).
 */
export function PictureMark() {
  return (
    <Tooltip content={pictureLabel}>
      <span className="docs-picture-mark" role="img" aria-label={pictureLabel} tabIndex={0}>
        <Imagesmode />
      </span>
    </Tooltip>
  );
}

/** What a reader could use in a stage: controls, links and anything focusable or editable. */
const interactive =
  'a[href], button, input:not([type="hidden"]), select, textarea, summary, [tabindex], [contenteditable]:not([contenteditable="false"]), audio[controls], video[controls]';

/** Whether an element can be used: not inert, not disabled and not taken out of the tab order. */
function usable(element: Element) {
  if (element.closest('[inert], .docs-picture-mark')) return false;
  if (element.matches(':disabled') || element.getAttribute('tabindex') === '-1') return false;
  return true;
}

/**
 * Whether a stage shows only a picture: nothing in it can be used, as in a specimen whose parts are
 * inert or a figure of surfaces. Followed as its content loads and changes, such as an editor that
 * mounts after the stage. Off where `enabled` is false.
 */
export function useShowsPicture(stage: RefObject<HTMLElement | null>, enabled = true) {
  const [picture, setPicture] = useState(false);
  useLayoutEffect(() => {
    const element = stage.current;
    if (!enabled || !element) {
      setPicture(false);
      return;
    }
    const read = () =>
      setPicture(![...element.querySelectorAll(interactive)].some((part) => usable(part)));
    read();
    const observer = new MutationObserver(read);
    observer.observe(element, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['inert', 'tabindex', 'disabled', 'contenteditable', 'href'],
    });
    return () => observer.disconnect();
  }, [stage, enabled]);
  return picture;
}
