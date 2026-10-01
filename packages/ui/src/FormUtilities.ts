import type { Ref } from 'react';

export function setRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') ref(value);
  else if (ref) ref.current = value;
}
/** The browser resets native input properties after dispatching the reset event. */
export function subscribeFormReset(form: HTMLFormElement, apply: () => void) {
  const timers = new Set<ReturnType<typeof setTimeout>>();
  function reset(event: Event) {
    const timer = setTimeout(function applyReset() {
      timers.delete(timer);
      if (!event.defaultPrevented) apply();
    }, 0);
    timers.add(timer);
  }
  form.addEventListener('reset', reset);
  return function unsubscribe() {
    form.removeEventListener('reset', reset);
    timers.forEach((timer) => clearTimeout(timer));
  };
}
