import type { WindowClass } from '../../foundations/windowClasses.js';
import type { ScaffoldForms, ScaffoldNavigation, ScaffoldNavigationForm } from '../Scaffold.js';

/** The window classes, smallest first. */
const classes = ['compact', 'medium', 'expanded', 'large'] as const;

const defaultForms: Record<WindowClass, ScaffoldNavigationForm> = {
  compact: 'bar',
  medium: 'rail',
  expanded: 'drawer',
  large: 'drawer',
};

/** The forms that stand in for one that wasn't given, nearest first. */
const standIns: Record<ScaffoldNavigationForm, readonly ScaffoldNavigationForm[]> = {
  bar: ['bar', 'rail', 'drawer'],
  rail: ['rail', 'drawer', 'bar'],
  drawer: ['drawer', 'rail', 'bar'],
};

/**
 * The form that shows at each window class: the one asked for, else the nearest one given, else
 * none. Worked out from the props alone, so the server's markup has it, and CSS shows it at its
 * width.
 */
export function resolveNavigationForms(
  navigation: ScaffoldNavigation | undefined,
  forms: ScaffoldForms | undefined,
): Record<WindowClass, ScaffoldNavigationForm | 'none'> {
  const given = (form: ScaffoldNavigationForm) => navigation?.[form] != null;
  const resolved = {} as Record<WindowClass, ScaffoldNavigationForm | 'none'>;
  for (const windowClass of classes) {
    const asked = forms?.[windowClass] ?? defaultForms[windowClass];
    resolved[windowClass] =
      asked === 'none' ? 'none' : (standIns[asked].find(given) ?? ('none' as const));
  }
  return resolved;
}
