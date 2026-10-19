// The module the CLI hands jscodeshift's workers. It runs the transform the `transform` option
// names and says which files it changes, with their new text under --print, because jscodeshift's
// runner counts changed files without naming them and prints new text without the file it is for.
import { pathToFileURL } from 'node:url';
import { transforms } from './transforms.mjs';

export const parser = 'tsx';

export default async function runTransform(file, api, options) {
  const { default: transform } = await import(pathToFileURL(transforms[options.transform].file));
  const output = await transform(file, api, options);
  if (output != null && output !== file.source) {
    const changed = `${options.dry ? 'Would change' : 'Changed'} ${file.path}`;
    // One write per file, so files that workers finish at once do not interleave.
    console.log(options.printChanges ? `${changed}\n==> ${file.path} <==\n${output}` : changed);
  }
  return output;
}
