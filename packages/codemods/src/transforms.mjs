// The codemods the CLI runs, with the files each one reads by default.
import { fileURLToPath } from 'node:url';

const scripts = ['js', 'jsx', 'ts', 'tsx', 'mjs', 'cjs', 'mts', 'cts'];
const styleSheets = ['css', 'scss', 'sass', 'less', 'pcss'];

export const transforms = {
  'v1-names': {
    file: fileURLToPath(new URL('./transforms/v1-names.mjs', import.meta.url)),
    description:
      'Move imports from envUI 0.x to their 1.0 names: renamed exports, namespace parts, the DirectionLink split and removed exports.',
    extensions: scripts,
  },
  'v1-props': {
    file: fileURLToPath(new URL('./transforms/v1-props.mjs', import.meta.url)),
    description:
      'Move the props 1.0 removed or changed: density, compact and size-as-density become sizes, row densities or the Theme scale, and what cannot move is reported.',
    extensions: scripts,
  },
  'v1-classes': {
    file: fileURLToPath(new URL('./transforms/v1-classes.mjs', import.meta.url)),
    description:
      'Rename envUI 0.x class names and custom properties in style sheets, className values and selector strings.',
    extensions: [...scripts, ...styleSheets],
  },
};
