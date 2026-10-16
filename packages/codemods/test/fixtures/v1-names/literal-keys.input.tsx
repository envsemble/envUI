import * as ui from '@envsemble/envui';

export const field = ui['Input'];
export const item = ui[`MenuItem`];
export const loading = ui['LoadingBar'];
export const pick = (name: 'Input' | 'Button') => ui[name];
export const { ['Notice']: Callout, 'Menu': Menu } = ui;
