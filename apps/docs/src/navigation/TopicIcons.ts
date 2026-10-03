import { Home } from '@envsemble/envui/icons/Home';
import { Apps } from '@envsemble/envui/icons/Apps';
import { Palette } from '@envsemble/envui/icons/Palette';
import { TextFields } from '@envsemble/envui/icons/TextFields';
import { ViewList } from '@envsemble/envui/icons/ViewList';
import { TouchApp } from '@envsemble/envui/icons/TouchApp';
import { Info } from '@envsemble/envui/icons/Info';
import { Category } from '@envsemble/envui/icons/Category';
import { type Reference } from '../Reference';

export const foundationIcons: Record<string, typeof Palette> = {
  colors: Palette,
  typography: TextFields,
  spacing: ViewList,
  icons: Category,
  composition: ViewList,
  accessibility: TouchApp,
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
