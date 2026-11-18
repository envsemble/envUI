export const triggerOf = (room: HTMLElement) =>
  room.querySelector<HTMLElement>('[aria-haspopup]:not([aria-expanded="true"])') ??
  room.querySelector<HTMLElement>('button:not(:disabled)');

export function press(trigger: HTMLElement) {
  const box = trigger.getBoundingClientRect();
  const init = {
    bubbles: true,
    cancelable: true,
    composed: true,
    clientX: box.left + box.width / 2,
    clientY: box.top + box.height / 2,
    view: window,
  };
  const pointer = { ...init, pointerId: 1, pointerType: 'mouse', isPrimary: true, button: 0 };
  trigger.dispatchEvent(new PointerEvent('pointerdown', { ...pointer, buttons: 1 }));
  trigger.dispatchEvent(new MouseEvent('mousedown', { ...init, buttons: 1, detail: 1 }));
  trigger.dispatchEvent(new PointerEvent('pointerup', pointer));
  trigger.dispatchEvent(new MouseEvent('mouseup', { ...init, detail: 1 }));
  trigger.dispatchEvent(new MouseEvent('click', { ...init, detail: 1 }));
}
