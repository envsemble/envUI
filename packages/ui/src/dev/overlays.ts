import type { OverlayKind } from './model.js';

export const overlayCandidateSelector = [
  'dialog[open]',
  '[popover]',
  '[role="dialog"]',
  '[role="alertdialog"]',
  '[role="menu"]',
  '[role="listbox"]',
  '[role="tooltip"]',
  '[data-side]:not([role="presentation"])',
].join(', ');

export function isOpenOverlay(element: Element): boolean {
  if (element instanceof HTMLDialogElement) return element.open;
  if (element.hasAttribute('popover')) {
    try {
      return element.matches(':popover-open');
    } catch {
      return false;
    }
  }
  const position = (at: Element) => getComputedStyle(at).position;
  const floats = (at: Element) => ['fixed', 'absolute'].includes(position(at));
  if (floats(element)) return true;
  const baseUIPositioner = element.parentElement;
  if (baseUIPositioner === null) return false;
  const popupInFloatingPositioner =
    baseUIPositioner.matches('[role="presentation"]') && floats(baseUIPositioner);
  if (popupInFloatingPositioner) return true;
  const isDialog = element.matches('[role="dialog"], [role="alertdialog"]');
  const dialogInPositionerFixedOverWindow = isDialog && position(baseUIPositioner) === 'fixed';
  return dialogInPositionerFixedOverWindow;
}

export function overlayKind(element: Element): OverlayKind {
  const role = element.getAttribute('role');
  if (element instanceof HTMLDialogElement || role === 'dialog' || role === 'alertdialog')
    return 'dialog';
  if (role === 'menu') return 'menu';
  if (role === 'tooltip') return 'tooltip';
  return 'popover';
}

export function outermostOverlays<T extends Element>(overlays: readonly T[]): T[] {
  const all = new Set<Element>(overlays);
  return overlays.filter((element) => {
    for (let at = element.parentElement; at; at = at.parentElement) if (all.has(at)) return false;
    return true;
  });
}
