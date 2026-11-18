import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { format, resolveConfig } from 'prettier';

export function readIfExists(path: string) {
  try {
    return readFileSync(path, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw error;
  }
}

export function writeIfChanged(path: string, contents: string) {
  if (readIfExists(path) === contents) return false;
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents);
  return true;
}

export async function formatted(path: string, contents: string) {
  return format(contents, { ...(await resolveConfig(path)), filepath: path });
}
