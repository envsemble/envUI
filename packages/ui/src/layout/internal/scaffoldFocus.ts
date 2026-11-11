/** The element of a navigation form to put focus on: its current item, else its first one. */
export function entryOf(form: HTMLElement) {
  const focusable = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
  const current = form.querySelector<HTMLElement>('[aria-current]:not([aria-current="false"])');
  return (
    (current?.matches(focusable) ? current : current?.querySelector<HTMLElement>(focusable)) ??
    form.querySelector<HTMLElement>(focusable)
  );
}

/** Whether a navigation form's slot shows at the Scaffold's width, as CSS decided. */
export const showing = (slot: Element) => getComputedStyle(slot).display !== 'none';

/** Moves focus to a region without scrolling it under the top bar, as a skip link does. */
export function focusRegion(target: HTMLElement) {
  // A region that takes no focus takes it for as long as it keeps it, so a press inside it later
  // doesn't focus the region itself.
  if (!target.hasAttribute('tabindex')) {
    target.setAttribute('tabindex', '-1');
    target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
  }
  target.focus();
}
