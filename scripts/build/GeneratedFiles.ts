// Writing the files the scripts generate, and checking them: a file is written only when its
// contents change, so an unchanged one keeps its timestamp and a watcher doesn't reload for nothing,
// and a check compares the committed file with a fresh output.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { format, resolveConfig } from 'prettier';

/** The text of the file at `path`, or null when there is none. */
export function readIfExists(path: string) {
  try {
    return readFileSync(path, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw error;
  }
}

/** Writes `contents` to `path`, and its folder, unless the file holds them already; whether it wrote. */
export function writeIfChanged(path: string, contents: string) {
  if (readIfExists(path) === contents) return false;
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents);
  return true;
}

/** `contents` as Prettier formats the file at `path`. */
export async function formatted(path: string, contents: string) {
  return format(contents, { ...(await resolveConfig(path)), filepath: path });
}
