import '../../styles/Base.css';
import '../../styles/Calendar.css';

export function calendarInitialFocus(root: ParentNode | null | undefined): HTMLElement | null {
  return root?.querySelector<HTMLElement>('.env-calendar-day[tabindex="0"]') ?? null;
}
