// @envsemble/envui/dev: dev mode, for development only. It reads the page's DOM and describes and
// checks its layout for agents (`envui.layout`), and shows it to people in 3D with an inspector.
// No other entry point imports it, so an app's production build contains none of it unless the app
// imports it; load it behind a development check, as docs/dev-mode.md shows.
export { installDevMode, type DevModeHandle, type DevModeOptions } from './dev/install.js';
export { layout, type LayoutApi, type LayoutAtResult, type LayoutOptions } from './dev/api.js';
export type { LayoutProblem, ProblemRule } from './dev/model.js';
