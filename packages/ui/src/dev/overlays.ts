// The open overlays of a page, which dev mode measures wherever they are in the document:
// dialogs, popovers and the popups of components.
import type { OverlayKind } from './model.js';

/**
 * What can be an open overlay, if it floats: dialogs, popovers, and the popups of components, which
 * take a role or the side of their anchor (`data-side`), but not their positioners.
 */
export const overlaySelector = [
  'dialog[open]',
  '[popover]',
  '[role="dialog"]',
  '[role="alertdialog"]',
  '[role="menu"]',
  '[role="listbox"]',
  '[role="tooltip"]',
  '[data-side]:not([role="presentation"])',
].join(', ');

/** Whether an open overlay: in the top layer, or floating, and shown. */
export function isOpenOverlay(element: Element): boolean {
  if (element instanceof HTMLDialogElement) return element.open;
  if (element.hasAttribute('popover')) {
    try {
      return element.matches(':popover-open');
    } catch {
      return false;
    }
  }
  // Floating is the element's own position, or its positioner's: Base UI places a popup in a
  // positioner, its parent, and a dialog or a command palette sits in a positioner fixed over the
  // window. A listbox or menu inside some other floating box is no overlay.
  const position = (at: Element) => getComputedStyle(at).position;
  if (['fixed', 'absolute'].includes(position(element))) return true;
  const parent = element.parentElement;
  if (parent === null) return false;
  if (parent.matches('[role="presentation"]') && ['fixed', 'absolute'].includes(position(parent)))
    return true;
  return element.matches('[role="dialog"], [role="alertdialog"]') && position(parent) === 'fixed';
}

/** What an open overlay is, by its element and role. */
export function overlayKind(element: Element): OverlayKind {
  const role = element.getAttribute('role');
  if (element instanceof HTMLDialogElement || role === 'dialog' || role === 'alertdialog')
    return 'dialog';
  if (role === 'menu') return 'menu';
  if (role === 'tooltip') return 'tooltip';
  return 'popover';
}

/** The overlays that no other one of them holds. */
export function outermost<T extends Element>(overlays: readonly T[]): T[] {
  const all = new Set<Element>(overlays);
  return overlays.filter((element) => {
    for (let at = element.parentElement; at; at = at.parentElement) if (all.has(at)) return false;
    return true;
  });
}
