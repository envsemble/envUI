import {
  Home,
  Apps,
  Palette,
  TextFields,
  ViewList,
  Devices,
  TouchApp,
  Info,
  Category,
} from '@envsemble/envui/icons';
import { type Reference } from '../Reference';

export const foundationIcons: Record<string, typeof Palette> = {
  colors: Palette,
  typography: TextFields,
  spacing: ViewList,
  icons: Category,
  responsive: Devices,
  motion: TouchApp,
};
const groupIcons = {
  Foundations: Category,
  'Layout & surfaces': ViewList,
  Actions: TouchApp,
  'Forms & selection': TextFields,
  Navigation: Home,
  'Content & guidance': Category,
  'Feedback & overlays': Info,
} satisfies Record<Reference['group'], typeof Apps>;
export function getComponentIcon(group: Reference['group']) {
  return groupIcons[group];
}
