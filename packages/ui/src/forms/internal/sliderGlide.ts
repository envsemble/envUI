// A slider's fill and handle, which glide to a chosen value and follow a drag at once.

/**
 * Follows a pointer that presses the slider's control: once it moves while pressed, the slider's root
 * --env-slider-glide is 0s, so the fill and the handle follow the drag at once, and a release takes
 * it away, so a press on the track or a key glides to its value (Slider.css). Returns the cleanup.
 */
export function followDrag(control: HTMLElement, slider: HTMLElement): () => void {
  const owner = control.ownerDocument;
  const view = owner.defaultView;
  let pointer: number | null = null;
  const move = (event: PointerEvent) => {
    if (event.pointerId !== pointer) return;
    // A move without a button means the release went to something that kept it.
    if (event.buttons === 0) return stop();
    slider.style.setProperty('--env-slider-glide', '0s');
  };
  const end = (event: Event) => {
    if (!('pointerId' in event) || (event as PointerEvent).pointerId === pointer) stop();
  };
  const stop = () => {
    pointer = null;
    owner.removeEventListener('pointermove', move, true);
    owner.removeEventListener('pointerup', end, true);
    owner.removeEventListener('pointercancel', end, true);
    control.removeEventListener('lostpointercapture', end);
    view?.removeEventListener('blur', end);
    slider.style.removeProperty('--env-slider-glide');
  };
  const down = (event: PointerEvent) => {
    if (pointer !== null || event.button !== 0 || !event.isPrimary) return;
    pointer = event.pointerId;
    owner.addEventListener('pointermove', move, true);
    owner.addEventListener('pointerup', end, true);
    owner.addEventListener('pointercancel', end, true);
    control.addEventListener('lostpointercapture', end);
    view?.addEventListener('blur', end);
  };
  control.addEventListener('pointerdown', down);
  return () => {
    control.removeEventListener('pointerdown', down);
    if (pointer !== null) stop();
  };
}
