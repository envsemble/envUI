import * as ui from '@envsemble/envui';

export const field = ui['TextField'];
export const item = ui.Menu.Item;
export const loading = ui['LoadingBar'];
export const pick = (name: 'Input' | 'Button') => ui[name];
export const { ['Notice']: Callout, 'Menu': Menu } = ui;
