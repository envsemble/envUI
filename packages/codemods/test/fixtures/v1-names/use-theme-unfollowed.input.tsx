import * as ui from '@envsemble/envui';

export function Destructured() {
  const { useTheme } = ui;
  return useTheme() === 'dark';
}

export function Required() {
  const { useTheme } = require('@envsemble/envui');
  return useTheme() === 'dark';
}

export async function Loaded() {
  const { useTheme } = await import('@envsemble/envui');
  return useTheme;
}
