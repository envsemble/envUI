// Archives the offline catalogue of each released minor version inside the hosted catalogue. Every
// GitHub release carries its version's envUI.html; the latest patch of each minor is placed at
// dist/site/v<major>.<minor>/index.html, and dist/site/versions.json lists them for a version
// switcher. Prereleases and drafts are not archived.
//
//   node scripts/AssembleSiteVersions.mjs
//
// It reads releases with GH_TOKEN or GITHUB_TOKEN, a token that can read the repository's
// contents, or else with the token of a signed-in gh CLI. Without either it warns and skips the
// archive, so local builds stay offline. Once a token is found, a failed request fails the build
// rather than deploying a site whose archived versions are missing. Downloads are kept in
// .cache/site-versions, keyed by release asset, so later builds copy them instead.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { copyFile, mkdir, rename, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));
const libraryManifest = JSON.parse(
  readFileSync(resolve(repositoryRoot, 'packages/ui/package.json'), 'utf8'),
);
/** `owner/name`, from the package's repository URL. */
const repository = libraryManifest.repository.url.match(
  /github\.com[/:]([^/]+\/[^/]+?)(?:\.git)?$/,
)[1];
const assetName = 'envUI.html';
/** Workers static assets reject a deployment that has a file larger than 25 MiB. */
const maximumAssetBytes = 25 * 1024 * 1024;
const cacheDirectory = resolve(repositoryRoot, '.cache/site-versions');

/**
 * Writes versions.json into the site and, when `download` is set, the archived versions it lists.
 * Returns the archived versions, newest first. Callers report a failure through
 * `process.exitCode`: exiting while a request's connection is still closing aborts Node on Windows.
 */
export async function assembleSiteVersions({
  siteDirectory = resolve(repositoryRoot, 'dist/site'),
  download = true,
} = {}) {
  const versions = download ? await archiveReleases(siteDirectory) : [];
  const manifest = { current: { version: libraryManifest.version, path: '/' }, versions };
  await writeFile(
    resolve(siteDirectory, 'versions.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  return versions;
}

async function archiveReleases(siteDirectory) {
  const credentials = findCredentials();
  if (!credentials) {
    console.warn(
      `Skipped the version archive: set GH_TOKEN or GITHUB_TOKEN, or sign in to the gh CLI, to download the released ${assetName} files.`,
    );
    return [];
  }
  console.log(`Reading ${repository} releases with ${credentials.source}.`);
  const versions = [];
  for (const { version, path, release, asset } of latestPatchPerMinor(
    await listReleases(credentials.token),
  )) {
    if (asset.size > maximumAssetBytes) {
      console.warn(
        `Skipped ${release.tag_name}: its ${assetName} is ${megabytes(asset.size)}, over the 25 MiB a Worker serves.`,
      );
      continue;
    }
    const directory = resolve(siteDirectory, path.slice(1));
    await mkdir(directory, { recursive: true });
    await copyFile(await downloadAsset(asset, credentials.token), resolve(directory, 'index.html'));
    versions.push({ version, date: release.published_at.slice(0, 10), path });
    console.log(`Placed ${release.tag_name} at ${path} (${megabytes(asset.size)}).`);
  }
  return versions;
}

function findCredentials() {
  for (const name of ['GH_TOKEN', 'GITHUB_TOKEN'])
    if (process.env[name]) return { token: process.env[name], source: name };
  try {
    const token = execFileSync('gh', ['auth', 'token'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    if (token) return { token, source: 'the gh CLI' };
  } catch {
    // gh is not installed or not signed in.
  }
  return undefined;
}

async function listReleases(token) {
  const releases = [];
  for (let page = 1; ; page++) {
    const response = await gitHub(
      `https://api.github.com/repos/${repository}/releases?per_page=100&page=${page}`,
      token,
    );
    const batch = await response.json();
    releases.push(...batch);
    if (batch.length < 100) return releases;
  }
}

/** The newest patch of every stable minor that has an offline catalogue, newest minor first. */
export function latestPatchPerMinor(releases) {
  const latest = new Map();
  for (const release of releases) {
    const match = /^v(\d+)\.(\d+)\.(\d+)$/.exec(release.tag_name);
    if (!match || release.draft || release.prerelease) continue;
    const asset = release.assets.find(({ name }) => name === assetName);
    if (!asset) {
      console.warn(`Skipped ${release.tag_name}: the release has no ${assetName}.`);
      continue;
    }
    const [major, minor, patch] = match.slice(1).map(Number);
    const known = latest.get(`${major}.${minor}`);
    if (known && known.patch > patch) continue;
    latest.set(`${major}.${minor}`, {
      major,
      minor,
      patch,
      version: `${major}.${minor}.${patch}`,
      path: `/v${major}.${minor}/`,
      release,
      asset,
    });
  }
  return [...latest.values()].sort(
    (first, second) => second.major - first.major || second.minor - first.minor,
  );
}

async function downloadAsset(asset, token) {
  const cached = resolve(cacheDirectory, `${asset.id}-${asset.name}`);
  if ((await stat(cached).catch(() => undefined))?.size === asset.size) return cached;
  // The API answers with a redirect to the file; fetch drops the token on the way there.
  const response = await gitHub(asset.url, token, 'application/octet-stream');
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length !== asset.size)
    throw new Error(`Downloaded ${bytes.length} of ${asset.size} bytes from ${asset.url}.`);
  await mkdir(cacheDirectory, { recursive: true });
  await writeFile(`${cached}.partial`, bytes);
  await rename(`${cached}.partial`, cached);
  return cached;
}

async function gitHub(url, token, accept = 'application/vnd.github+json') {
  const response = await fetch(url, {
    headers: {
      Accept: accept,
      Authorization: `Bearer ${token}`,
      'User-Agent': 'envui-site-versions',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  if (!response.ok)
    throw new Error(`${url} answered ${response.status} ${response.statusText}.`, {
      cause: await response.text().catch(() => undefined),
    });
  return response;
}

function megabytes(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MiB`;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.length > 2) throw new Error('Usage: AssembleSiteVersions.mjs');
  if (!(await stat(resolve(repositoryRoot, 'dist/site/index.html')).catch(() => undefined)))
    throw new Error('Build the hosted catalogue first: npm run build:site');
  try {
    const versions = await assembleSiteVersions();
    console.log(`Archived ${versions.length} released versions in dist/site.`);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
