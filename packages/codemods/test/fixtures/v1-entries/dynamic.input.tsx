import { lazy } from 'react';

// Loaded at run time: the module has no ColorPicker in 1.0. The codemod can't follow what each load
// reads, so every load of the entry point in a file that names a moved export is reported.
export const Picker = lazy(() =>
  import('@envsemble/envui').then((module) => ({ default: module.ColorPicker })),
);
export const loadButton = () => import('@envsemble/envui').then((module) => module.Button);
export const { ColorSwatch } = require('@envsemble/envui');
