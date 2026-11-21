import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { format, resolveConfig } from 'prettier';
import { repositoryPath } from '../RepositoryPaths.ts';

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

interface OutputOptions {
  check: boolean;
  regenerate: string;
  advice?: string;
}

export class GeneratedOutput {
  readonly changed: string[] = [];
  readonly #options: OutputOptions;

  constructor(options: OutputOptions) {
    this.#options = options;
  }

  writeOrCheck(path: string, contents: string) {
    if (readIfExists(path) === contents) return false;
    if (!this.#options.check) writeIfChanged(path, contents);
    this.changed.push(repositoryPath(path));
    return true;
  }

  get staleMessage() {
    const { check, regenerate, advice } = this.#options;
    if (!check || !this.changed.length) return undefined;
    const files = this.changed.join(', ');
    return `${files} ${this.changed.length === 1 ? 'is' : 'are'} stale: run \`${regenerate}\` and commit the result${advice ? `, ${advice}` : ''}.`;
  }

  throwIfStale() {
    const message = this.staleMessage;
    if (message) throw new Error(message);
  }

  exitIfStale() {
    const message = this.staleMessage;
    if (!message) return;
    console.error(message);
    process.exit(1);
  }
}
