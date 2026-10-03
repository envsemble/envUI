import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

/** Include the locked runtime dependencies, including optional bundled grammar modules. */
export async function collectDependencyNotices(repositoryRoot) {
  const lock = JSON.parse(await readFile(resolve(repositoryRoot, 'package-lock.json'), 'utf8'));
  const entries = Object.entries(lock.packages)
    .filter(([path, entry]) => path.startsWith('node_modules/') && !entry.dev && !entry.link)
    .sort(([first], [second]) => first.localeCompare(second));
  const notices = await Promise.all(
    entries.map(async ([path, entry]) => {
      const directory = resolve(repositoryRoot, path);
      const metadata = JSON.parse(await readFile(resolve(directory, 'package.json'), 'utf8'));
      const licenseFiles = (await readdir(directory))
        .filter((name) => /^(licen[sc]e|notice)([.\-_]|$)/i.test(name))
        .sort();
      const contents = await Promise.all(
        licenseFiles.map(
          async (name) => `${name}\n${await readFile(resolve(directory, name), 'utf8')}`,
        ),
      );
      if (!contents.length) throw new Error(`Missing runtime license notice: ${metadata.name}`);
      return `${metadata.name}@${entry.version} (${metadata.license ?? entry.license ?? 'see license'})\n${contents.join('\n\n')}`;
    }),
  );
  return notices.join('\n\n');
}
