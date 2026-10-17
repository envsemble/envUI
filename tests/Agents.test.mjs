import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, parse, relative, resolve } from 'node:path';
import { after, before, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  documentationDirectory,
  examplesDirectory,
  packageDocumentation,
  readDocumentation,
} from '../scripts/GenerateDocumentation.mjs';
import {
  buildManifest,
  generatedAgentFiles,
  manifestFile,
  renderLlmsFull,
  writeAgentFiles,
} from '../scripts/GenerateManifest.mjs';
import {
  beginMarker,
  endMarker,
  indexBudget,
  packagePathFor,
  renderIndex,
  updateAgentsFile,
  withIndex,
} from '../packages/ui/bin/agents.mjs';
import { exportOf, findComponent, plan, search } from '../packages/ui/bin/catalog.mjs';
import { createServer, protocolVersions } from '../packages/ui/bin/mcp.mjs';

const repository = fileURLToPath(new URL('../', import.meta.url));
const manifest = buildManifest();
const props = JSON.parse(readFileSync(join(repository, 'docs/generated/props.json'), 'utf8'));
const cacheDirectory = join(repository, '.cache');
/** A package root like the installed one: bin/, package.json, the agent files and docs/. */
let packageRoot;
let workDirectory;

before(() => {
  mkdirSync(cacheDirectory, { recursive: true });
  workDirectory = mkdtempSync(join(cacheDirectory, 'agents-'));
  packageRoot = join(workDirectory, 'package');
  mkdirSync(packageRoot);
  cpSync(join(repository, 'packages/ui/bin'), join(packageRoot, 'bin'), { recursive: true });
  writeFileSync(join(packageRoot, 'package.json'), JSON.stringify({ version: '9.8.7-test.1' }));
  writeAgentFiles(packageRoot, { version: '9.8.7-test.1' });
  packageDocumentation(join(packageRoot, 'docs'));
});

/** Servers a test started; a failed assertion must not leave one running and the run waiting. */
const servers = new Set();

after(() => {
  for (const child of servers) child.kill();
  const inside = relative(cacheDirectory, workDirectory ?? '');
  if (workDirectory && inside && !inside.startsWith('..'))
    rmSync(workDirectory, { recursive: true, force: true });
});

test('the committed manifest and llms.txt match their sources', () => {
  for (const { file, contents } of generatedAgentFiles())
    assert.equal(
      readFileSync(file, 'utf8'),
      contents,
      `${relative(repository, file)} is stale. Run \`npm run docs:manifest\` and commit the result.`,
    );
});

test('the manifest has every component page, export, example and token', () => {
  assert.deepEqual(Object.keys(manifest), [
    '$comment',
    'schemaVersion',
    'package',
    'rule',
    'files',
    'imports',
    'categories',
    'components',
    'guides',
    'foundations',
    'patterns',
    'templates',
    'exports',
    'tokens',
  ]);
  assert.equal(manifest.schemaVersion, 1);
  // Every runtime export, with the entry point it imports from.
  assert.deepEqual(Object.keys(manifest.exports).sort(), Object.keys(props.exports).sort());
  for (const [name, entry] of Object.entries(manifest.exports)) {
    assert.ok(manifest.imports.entryPoints.includes(entry.import), name);
    if (entry.page)
      assert.ok(
        [...manifest.components, ...manifest.guides, ...manifest.foundations].some(
          (page) => (page.page ?? page.name) === entry.page,
        ),
        `${name} names page ${entry.page}`,
      );
  }
  const button = manifest.components.find((component) => component.name === 'Button');
  assert.deepEqual(Object.keys(button), [
    'name',
    'page',
    'doc',
    'category',
    'status',
    'since',
    'summary',
    'aliases',
    'useWhen',
    'avoidWhen',
    'related',
    'exports',
    'examples',
  ]);
  assert.deepEqual(button.exports, [
    'Button',
    'IconButton',
    'ConfirmButton',
    'CopyButton',
    'ButtonGroup',
  ]);
  const variant = manifest.exports.Button.props.find((prop) => prop.name === 'variant');
  assert.equal(variant.default, "'primary'");
  assert.ok(button.avoidWhen.some((avoid) => avoid.use === 'Link'));
  for (const component of manifest.components) {
    assert.ok(existsSync(join(repository, component.doc)), component.doc);
    assert.ok(manifest.categories.includes(component.category));
    assert.ok(component.summary && component.aliases.length, component.name);
    for (const avoid of component.avoidWhen)
      if (avoid.use) assert.ok(manifest.exports[avoid.use], `${component.name}: ${avoid.use}`);
    for (const name of component.exports) {
      assert.ok(props.exports[name], name);
      assert.equal(manifest.exports[name].page, component.page, name);
    }
    for (const example of component.examples) {
      assert.equal(example.file, `docs/examples/${component.page}/${example.name}.tsx`);
      assert.ok(
        existsSync(join(examplesDirectory, component.page, `${example.name}.tsx`)),
        example.file,
      );
      assert.ok(example.title, example.file);
    }
  }
  // A namespace lists its parts, which are exports in their own right.
  // Every export carries its own data, also one without a component page, such as Theme.
  for (const [name, entry] of Object.entries(props.exports)) {
    const exported = manifest.exports[name];
    assert.equal(exported.import, entry.entries[0], name);
    if (entry.kind === 'component') assert.deepEqual(exported.props, entry.props, name);
    if (entry.kind === 'function') assert.equal(exported.signature, entry.signature, name);
    if (exported.page) assert.ok(existsSync(join(repository, exported.doc)), name);
  }
  assert.equal(manifest.exports.Theme.page, 'setup');
  assert.equal(manifest.exports.Theme.doc, 'docs/setup.md');
  assert.ok(manifest.exports.Theme.props.length >= 3);
  for (const name of Object.keys(manifest.exports))
    assert.ok(manifest.exports[name].page, `${name} has a page that documents it`);
  // Names that every object inherits are not exports.
  for (const name of ['constructor', '__proto__', 'toString', 'hasOwnProperty'])
    assert.equal(exportOf(manifest, name), undefined, name);
  const menu = findComponent(manifest, 'Menu.Item');
  assert.equal(menu.component.name, 'Menu');
  assert.equal(menu.entry.name, 'Menu.Item');
  assert.ok(manifest.patterns.some((page) => page.name === 'loading'));
  assert.deepEqual(manifest.templates, []);
  // Tokens: current names with values, and the 0.7 names with their successors.
  const muted = manifest.tokens.items.find((token) => token.id === 'color.fg.muted');
  assert.equal(muted.cssVariable, '--env-color-fg-muted');
  assert.deepEqual(Object.keys(muted.values), manifest.tokens.themes);
  assert.ok(
    manifest.tokens.items.some((token) => token.compact),
    'scale values',
  );
  assert.ok(
    manifest.tokens.legacy.every(
      (token) => !manifest.tokens.items.some((item) => item.cssVariable === token.cssVariable),
    ),
  );
  assert.equal(
    manifest.tokens.legacy.find((token) => token.cssVariable === '--color-text-muted').use,
    '--env-color-fg-muted',
  );
  assert.equal(
    manifest.tokens.legacy.find((token) => token.cssVariable === '--space-4').use,
    '--env-space-4',
  );
});

test('llms.txt links to pages that exist and llms-full.txt holds every page', () => {
  const llms = readFileSync(join(repository, 'docs/generated/llms.txt'), 'utf8');
  assert.match(llms, /^# envUI\n\n> /);
  const packageFiles = new Set(['llms-full.txt', 'manifest.json', 'icon-manifest.json']);
  for (const [, target] of llms.matchAll(/\]\(([^)]+)\)/g))
    if (!packageFiles.has(target)) assert.ok(existsSync(join(repository, target)), target);
  for (const component of manifest.components) assert.ok(llms.includes(`](${component.doc})`));
  const full = renderLlmsFull(manifest);
  for (const page of [...manifest.components, ...manifest.guides, ...manifest.patterns])
    assert.ok(full.includes(`<!-- ${page.doc} -->`), page.doc);
  assert.match(full, /```tsx example=ConfirmDelete\nimport /);
});

test('the AGENTS.md index fits in 8 KB and names only what envUI exports', () => {
  const block = renderIndex({ ...manifest, version: '10.10.10-next.10' });
  const bytes = Buffer.byteLength(block);
  assert.ok(bytes <= indexBudget, `The index is ${bytes} bytes; the budget is ${indexBudget}.`);
  assert.ok(block.startsWith(`${beginMarker}\n`) && block.endsWith(`${endMarker}\n`));
  assert.ok(
    block.includes(
      '**Search envUI before writing any UI element; propose an envUI addition instead of a local copy.**',
    ),
  );
  assert.ok(block.includes('node_modules/@envsemble/envui/docs/'));
  assert.ok(block.includes('@envsemble/envui 10.10.10-next.10'));
  for (const component of manifest.components)
    assert.match(block, new RegExp(`[:;] ${component.page}: [^;(]*\\b${component.name}\\b`));
  // Every PascalCase or camelCase name before an alias list is an export.
  for (const line of block.split('\n').filter((text) => /^- [A-Z][^:]+: [a-z-]+: /.test(text)))
    for (const entry of line.replace(/^- [^:]+: /, '').split('; ')) {
      const names = entry
        .replace(/^[a-z-]+: /, '')
        .replace(/ \(.*\)$/, '')
        .split(' ');
      for (const name of names) assert.ok(manifest.exports[name], `${name} is not an export`);
    }
  // An alias written as code, inside the parentheses, is always an export: 0.x names such as
  // ToastProvider, TableHead or GroupedRows would otherwise be imported.
  const componentLines = block
    .slice(block.indexOf('### Components'))
    .split('\n')
    .filter((line) => line.startsWith('- ') && !line.startsWith('- Other exports'))
    .join('\n');
  const aliasLists = [...componentLines.matchAll(/ \(([^)]*)\)(?=;|$)/gm)].map((match) => match[1]);
  assert.ok(aliasLists.length > 30);
  for (const alias of aliasLists.flatMap((list) => list.split(', ')))
    if (/^[A-Za-z_$][\w$]*(?:\.[\w$]+)+$|^[A-Z][\w$]*[a-z][\w$]*$|^[a-z]+[A-Z][\w$]*$/.test(alias))
      assert.ok(manifest.exports[alias], `The index shows ${alias}, which envUI doesn't export.`);
  for (const name of [
    'ToastProvider',
    'TableHead',
    'MenuItem',
    'LoadingBar',
    'GroupedRows',
    'DateTimeField',
  ])
    assert.doesNotMatch(block, new RegExp(`\\b${name}\\b`), name);
  // llms-full.txt is too large to read whole, so the index doesn't offer it.
  assert.doesNotMatch(block, /llms-full/);
  // A library that outgrows the budget loses aliases before anything else, and fails beyond that.
  const crowded = {
    ...manifest,
    components: [
      ...manifest.components,
      ...manifest.components.map((c) => ({ ...c, page: `${c.page}-copy` })),
    ],
  };
  assert.ok(Buffer.byteLength(renderIndex(crowded)) <= indexBudget);
  assert.throws(() => renderIndex(manifest, { budget: 1024 }), /does not fit in 1024 bytes/);
});

test('the index goes between its markers and leaves the rest of the file', () => {
  const block = renderIndex(manifest);
  assert.equal(withIndex('', block), block);
  const own = '# Project\n\nRun the tests before committing.\n';
  const added = withIndex(own, block);
  assert.equal(added, `${own}\n${block}`);
  assert.equal(withIndex(added, block), added, 'idempotent');
  const surrounded = `# Project\n\n${beginMarker}\nold index\n${endMarker}\n\n## Later\n\nKeep this.\n`;
  assert.equal(withIndex(surrounded, block), `# Project\n\n${block}\n## Later\n\nKeep this.\n`);
  const windows = own.replaceAll('\n', '\r\n');
  const written = withIndex(windows, block);
  assert.ok(written.startsWith(windows) && !/[^\r]\n/.test(written), 'CRLF stays CRLF');
  assert.equal(withIndex(written, block), written);
  assert.throws(() => withIndex(`${beginMarker}\nno end\n`, block), /no <!-- END envui -->/);
  assert.throws(() => withIndex(`${endMarker}\n${beginMarker}\n`, block), /out of order/);
  assert.throws(
    () => withIndex(`${beginMarker}\nold\n${endMarker}\nmine\n${endMarker}\n`, block),
    /out of order or twice/,
  );
});

test('envui agents creates, updates and checks AGENTS.md', () => {
  const project = join(workDirectory, 'project');
  mkdirSync(project);
  const envui = (...args) =>
    spawnSync(process.execPath, [join(packageRoot, 'bin/envui.mjs'), ...args], {
      cwd: project,
      encoding: 'utf8',
    });
  const file = join(project, 'AGENTS.md');
  let result = envui('agents', '--check');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /AGENTS\.md does not exist\. Run `npx --no envui agents`/);
  result = envui('agents');
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /^Created AGENTS\.md with the envUI index \(\d+ bytes\)\./);
  const created = readFileSync(file, 'utf8');
  assert.ok(created.includes('@envsemble/envui 9.8.7-test.1'));
  assert.equal(envui('agents', '--check').status, 0);
  // An edit inside the block is outdated; one outside it stays.
  writeFileSync(
    file,
    `# Our app\n\nUse pnpm.\n\n${created.replace('## envUI', '## envUI (edited)')}\nNotes.\n`,
  );
  assert.equal(envui('agents', '--check').status, 1);
  result = envui('agents');
  assert.match(result.stdout, /^Updated AGENTS\.md/);
  assert.equal(readFileSync(file, 'utf8'), `# Our app\n\nUse pnpm.\n\n${created}\nNotes.\n`);
  assert.match(envui('agents').stdout, /already has the current envUI index/);
  // Another file, and the index alone.
  assert.equal(envui('agents', '--file', 'CLAUDE.md').status, 0);
  assert.equal(readFileSync(join(project, 'CLAUDE.md'), 'utf8'), created);
  assert.equal(envui('agents', '--print').stdout, created);
  assert.equal(envui('--version').stdout.trim(), '9.8.7-test.1');
  assert.equal(envui('unknown').status, 2);
});

test('the index points at the package where the project installs it', () => {
  // A workspace that hoists its dependencies to the root: the index in apps/web/AGENTS.md leads
  // two folders up.
  const workspace = join(workDirectory, 'workspace');
  const app = join(workspace, 'apps/web');
  const installed = join(workspace, 'node_modules/@envsemble/envui');
  mkdirSync(app, { recursive: true });
  mkdirSync(installed, { recursive: true });
  writeFileSync(join(installed, 'package.json'), '{}');
  assert.equal(packagePathFor(join(app, 'AGENTS.md')).path, '../../node_modules/@envsemble/envui');
  assert.equal(packagePathFor(join(workspace, 'AGENTS.md')).path, 'node_modules/@envsemble/envui');
  const file = join(app, 'AGENTS.md');
  updateAgentsFile(file, manifest);
  const written = readFileSync(file, 'utf8');
  assert.ok(written.includes('`../../node_modules/@envsemble/envui/docs/`'));
  assert.ok(written.includes('`../../node_modules/@envsemble/envui/manifest.json`'));
  assert.equal(updateAgentsFile(file, manifest, { check: true }).code, 0);
  // Without an installation in or above the folder, nor the running package below it, the usual
  // path and a warning.
  const nowhere = packagePathFor(
    join(parse(workDirectory).root, 'envui-test-no-such-folder', 'AGENTS.md'),
    { installed: join(workDirectory, 'package') },
  );
  assert.equal(nowhere.path, 'node_modules/@envsemble/envui');
  assert.match(nowhere.warning, /envUI is not installed in or below/);
});

test('a root index names the link pnpm makes, not the folder it points to', () => {
  const root = mkdtempSync(join(tmpdir(), 'envui-pnpm-link-'));
  try {
    const store = join(
      root,
      'node_modules/.pnpm/@envsemble+envui@1.0.0/node_modules/@envsemble/envui',
    );
    mkdirSync(store, { recursive: true });
    writeFileSync(join(store, 'package.json'), '{}');
    const link = join(root, 'apps/web/node_modules/@envsemble/envui');
    mkdirSync(dirname(link), { recursive: true });
    symlinkSync(store, link, 'junction');
    // The running package is the store folder, as Node resolves the bin's link.
    assert.deepEqual(packagePathFor(join(root, 'AGENTS.md'), { installed: store }), {
      path: 'apps/web/node_modules/@envsemble/envui',
    });
    // From the workspace package itself, the link is found above as usual.
    assert.deepEqual(packagePathFor(join(root, 'apps/web/AGENTS.md'), { installed: store }), {
      path: 'node_modules/@envsemble/envui',
    });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('a root index finds a package that pnpm installed only in a workspace package', () => {
  // Outside the repository, whose own node_modules a folder inside it would find above.
  const root = mkdtempSync(join(tmpdir(), 'envui-pnpm-'));
  try {
    const installed = join(root, 'apps/web/node_modules/@envsemble/envui');
    mkdirSync(installed, { recursive: true });
    writeFileSync(join(installed, 'package.json'), '{}');
    const file = join(root, 'AGENTS.md');
    assert.deepEqual(packagePathFor(file, { installed }), {
      path: 'apps/web/node_modules/@envsemble/envui',
    });
    const result = updateAgentsFile(file, manifest, { installed });
    assert.equal(result.warning, undefined);
    assert.ok(
      readFileSync(file, 'utf8').includes('`apps/web/node_modules/@envsemble/envui/docs/`'),
    );
    // A package that runs from elsewhere, such as a global install, gets the usual path and a
    // warning rather than a path out of the project.
    const elsewhere = updateAgentsFile(join(root, 'Other.md'), manifest, {
      installed: join(workDirectory, 'package'),
    });
    assert.match(elsewhere.warning, /not installed in or below/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('npx always runs envui with --no, in the docs, skills and what the bin prints', () => {
  // npx assumes yes in CI and without a terminal: without --no, it would fetch and run whatever
  // the public registry has under the unclaimed name envui.
  const withoutNo = /\bnpx\s+(?:(?!--no\b)\S+\s+)*envui\b/;
  const texts = [
    ['README.md', readFileSync(join(repository, 'README.md'), 'utf8')],
    [
      '.changeset/agent-tooling.md',
      readFileSync(join(repository, '.changeset/agent-tooling.md'), 'utf8'),
    ],
    ['docs/generated/llms.txt', readFileSync(join(repository, 'docs/generated/llms.txt'), 'utf8')],
    ['index', renderIndex(manifest)],
    [
      'check message',
      updateAgentsFile(join(workDirectory, 'Missing.md'), manifest, { check: true }).message,
    ],
  ];
  const walk = (folder) =>
    readdirSync(join(repository, folder), { withFileTypes: true }).flatMap((entry) =>
      entry.isDirectory()
        ? walk(join(folder, entry.name))
        : /\.(?:md|mjs)$/.test(entry.name)
          ? [join(folder, entry.name)]
          : [],
    );
  for (const file of [
    ...walk('docs'),
    ...walk('.agents/skills'),
    ...walk('packages/ui/bin'),
    ...walk('bench').filter((file) => !/[\\/](?:results|fixtures)[\\/]/.test(file)),
  ])
    texts.push([file, readFileSync(join(repository, file), 'utf8')]);
  for (const name of ['--help', 'mcp --help', 'agents --help'])
    texts.push([
      `envui ${name}`,
      spawnSync(process.execPath, [join(packageRoot, 'bin/envui.mjs'), ...name.split(' ')], {
        encoding: 'utf8',
      }).stdout,
    ]);
  for (const [name, text] of texts) {
    const line = text.split('\n').find((item) => withoutNo.test(item));
    assert.equal(line, undefined, `${name} runs npx envui without --no: ${line}`);
  }
  assert.ok(withoutNo.test('npx envui agents') && withoutNo.test('npx -y envui mcp'));
  assert.ok(
    !withoutNo.test('npx --no envui agents') && !withoutNo.test('npx --no -- envui --version'),
  );
});

test('updateAgentsFile reports what it did', () => {
  const file = join(workDirectory, 'Direct.md');
  assert.equal(updateAgentsFile(file, manifest, { check: true }).code, 1);
  assert.match(updateAgentsFile(file, manifest).message, /^Created /);
  assert.equal(updateAgentsFile(file, manifest, { check: true }).code, 0);
});

/** Starts `envui mcp` from the package root and talks to it one line per message. */
function startServer() {
  const child = spawn(process.execPath, [join(packageRoot, 'bin/envui.mjs'), 'mcp'], {
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  servers.add(child);
  child.on('exit', () => servers.delete(child));
  const waiting = new Map();
  const lines = [];
  let buffer = '';
  let stderr = '';
  child.stderr.on('data', (chunk) => (stderr += chunk));
  child.stdout.on('data', (chunk) => {
    buffer += chunk;
    for (let end = buffer.indexOf('\n'); end !== -1; end = buffer.indexOf('\n')) {
      const message = JSON.parse(buffer.slice(0, end));
      buffer = buffer.slice(end + 1);
      lines.push(message);
      const key = Array.isArray(message) ? 'batch' : message.id;
      waiting.get(key)?.(message);
      waiting.delete(key);
    }
  });
  let next = 0;
  const send = (text, key) =>
    new Promise((resolveMessage, reject) => {
      const timer = setTimeout(() => reject(new Error(`No answer to ${text}\n${stderr}`)), 10000);
      waiting.set(key, (message) => {
        clearTimeout(timer);
        resolveMessage(message);
      });
      child.stdin.write(`${text}\n`);
    });
  return {
    request(method, params) {
      const id = ++next;
      return send(JSON.stringify({ jsonrpc: '2.0', id, method, params }), id);
    },
    raw: send,
    notify(method, params) {
      child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', method, params })}\n`);
    },
    async call(name, args) {
      const response = await this.request('tools/call', { name, arguments: args });
      assert.ok(response.result, JSON.stringify(response));
      const [content, ...more] = response.result.content;
      assert.equal(content.type, 'text');
      if (response.result.isError) return { error: content.text };
      const value = JSON.parse(content.text);
      return more.length ? { value, more: more.map((item) => item.text) } : value;
    },
    lines,
    stop: () =>
      new Promise((resolveExit) => {
        child.on('exit', (code) => resolveExit({ code, stderr }));
        child.stdin.end();
      }),
  };
}

test('envui mcp answers every tool over stdio from the installed files', async () => {
  const server = startServer();
  const initialized = await server.request('initialize', {
    protocolVersion: '2025-06-18',
    capabilities: {},
    clientInfo: { name: 'test', version: '1.0.0' },
  });
  assert.equal(initialized.result.protocolVersion, '2025-06-18');
  assert.deepEqual(initialized.result.serverInfo, {
    name: 'envui',
    title: 'envUI',
    version: '9.8.7-test.1',
  });
  assert.deepEqual(initialized.result.capabilities, { tools: { listChanged: false } });
  assert.match(initialized.result.instructions, /Search envUI before writing any UI element/);
  server.notify('notifications/initialized');
  assert.deepEqual((await server.request('ping')).result, {});

  const { tools } = (await server.request('tools/list', {})).result;
  assert.deepEqual(
    tools.map((tool) => tool.name),
    [
      'search',
      'list_components',
      'get_component',
      'get_props',
      'get_example',
      'list_patterns',
      'list_templates',
      'get_tokens',
      'plan',
    ],
  );
  for (const tool of tools) {
    assert.equal(tool.inputSchema.type, 'object', tool.name);
    assert.equal(tool.annotations.readOnlyHint, true, tool.name);
    assert.ok(tool.description.length > 40, tool.name);
  }

  const found = await server.call('search', { query: 'sidebar toggle', limit: 3 });
  assert.equal(found.results[0].name, 'AppShell');
  assert.equal((await server.call('search', { query: 'modal' })).results[0].name, 'Dialog');
  assert.equal(
    (await server.call('search', { query: 'muted text', kind: 'token' })).results[0].name,
    'color.fg.muted',
  );
  assert.ok((await server.call('search', { query: 'zzzz' })).note);

  const listed = await server.call('list_components', { category: 'Actions' });
  assert.deepEqual(
    listed.components.map((component) => component.name),
    ['Button', 'CloseButton', 'SearchTrigger', 'Toolbar', 'Link'],
  );
  assert.equal(listed.components[0].import, '@envsemble/envui');

  const iconButton = await server.call('get_component', { name: 'IconButton' });
  assert.equal(iconButton.name, 'Button');
  assert.equal(iconButton.requested, 'IconButton');
  assert.ok(iconButton.exports.find((entry) => entry.name === 'IconButton').props.includes('icon'));
  // The page comes as a Markdown content item of its own, not escaped inside the JSON.
  const byAlias = await server.call('get_component', { name: 'modal', docs: true });
  assert.equal(byAlias.value.name, 'Dialog');
  assert.equal(byAlias.value.markdown, undefined);
  assert.match(byAlias.more[0], /^---\ntitle: Dialog\n[\s\S]*\n## Props\n/);
  const theme = await server.call('get_component', { name: 'Theme' });
  assert.equal(theme.page, 'setup');
  assert.equal(theme.doc, 'docs/setup.md');
  assert.ok(theme.props.includes('theme'));
  assert.match((await server.call('get_component', { name: 'Fooo' })).error, /no component/);
  for (const name of ['constructor', '__proto__', 'toString'])
    assert.match((await server.call('get_component', { name })).error, /no component/, name);
  assert.match((await server.call('get_props', { name: 'toString' })).error, /no component/);
  // An export without a component page has its props too.
  const themeProps = await server.call('get_props', { name: 'Theme' });
  assert.equal(themeProps.page, 'setup');
  assert.deepEqual(
    themeProps.exports[0].props.map((prop) => prop.name),
    manifest.exports.Theme.props.map((prop) => prop.name),
  );
  assert.ok(themeProps.exports[0].props.length >= 3);
  assert.match(
    (await server.call('get_props', { name: 'createThemeBootstrapScript' })).exports[0].signature,
    /^\(/,
  );
  assert.equal(
    (await server.call('search', { query: 'ThemeToggle', limit: 3 })).results[0].name,
    'ThemeToggle',
  );

  const menuItem = await server.call('get_props', { name: 'Menu.Item' });
  assert.deepEqual(
    menuItem.exports.map((entry) => entry.name),
    ['Menu.Item'],
  );
  assert.ok(menuItem.exports[0].props.some((prop) => prop.name === 'href'));
  const textField = await server.call('get_props', { name: 'text-field' });
  assert.deepEqual(
    textField.exports.map((entry) => entry.name),
    ['TextField', 'SearchField', 'Textarea'],
  );

  const examples = await server.call('get_example', { component: 'Dialog' });
  assert.ok(examples.examples.some((example) => example.name === 'ConfirmDelete'));
  const example = await server.call('get_example', {
    component: 'dialog',
    example: 'confirmdelete',
  });
  assert.equal(
    example.source,
    readFileSync(join(examplesDirectory, 'dialog/ConfirmDelete.tsx'), 'utf8'),
  );
  assert.match(
    (await server.call('get_example', { component: 'Dialog', example: '../../package' })).error,
    /no example/,
  );

  assert.deepEqual(
    (await server.call('list_patterns', {})).patterns.map((pattern) => pattern.name),
    manifest.patterns.map((pattern) => pattern.name),
  );
  assert.deepEqual((await server.call('list_templates', {})).templates, []);

  const spacing = await server.call('get_tokens', { prefix: 'space.' });
  assert.ok(spacing.total >= 5);
  assert.ok(spacing.tokens.every((token) => token.id.startsWith('space.')));
  assert.ok(
    spacing.tokens.some((token) => token.compact),
    'compact values',
  );
  const colors = await server.call('get_tokens', { type: 'color', limit: 3 });
  assert.equal(colors.tokens.length, 3);
  const legacy = await server.call('get_tokens', { legacy: true, prefix: 'color.canvas' });
  assert.ok(legacy.legacy.length >= 1);
  const legacyChecks = await server.call('get_tokens', { legacy: true, query: 'checkbox' });
  assert.ok(legacyChecks.total >= 1);
  assert.ok(legacyChecks.legacy.every((token) => token.cssVariable.includes('checkbox')));
  assert.equal(
    (await server.call('get_tokens', { legacy: true, type: 'shadow', query: 'checkbox' })).total,
    0,
  );

  const planned = await server.call('plan', {
    description:
      'A members page: a filterable table with an empty state, pagination and a confirm-delete dialog',
  });
  const names = planned.candidates.map((item) => item.component);
  for (const name of ['Table', 'EmptyState', 'Pagination', 'ConfirmDialog'])
    assert.ok(names.includes(name), name);
  // Candidates to confirm, each with the words that matched, never a list of imports to paste.
  assert.equal(planned.imports, undefined);
  const table = planned.candidates.find((item) => item.component === 'Table');
  assert.equal(table.import, '@envsemble/envui');
  assert.ok(table.matched.includes('table'));
  assert.match(planned.next[0], /candidates matched on words, not an import list/);
  assert.match((await server.call('plan', {})).error, /"description" must be a non-empty string/);

  const { code, stderr } = await server.stop();
  assert.equal(code, 0);
  assert.match(stderr, /serving envUI 9\.8\.7-test\.1 over stdio/);
});

test('envui mcp follows JSON-RPC for versions, errors, notifications and batches', async () => {
  const server = startServer();
  const newest = await server.request('initialize', {
    protocolVersion: '1999-01-01',
    capabilities: {},
    clientInfo: { name: 'test', version: '1' },
  });
  assert.equal(newest.result.protocolVersion, protocolVersions[0]);
  assert.equal((await server.request('resources/list', {})).error.code, -32601);
  // Params that are null or not an object read as none, rather than stopping the server.
  assert.equal(
    (await server.request('initialize', null)).result.protocolVersion,
    protocolVersions[0],
  );
  assert.equal((await server.request('tools/call', null)).error.code, -32602);
  assert.equal(
    (await server.request('tools/call', { name: 'nope', arguments: {} })).error.code,
    -32602,
  );
  assert.equal(
    (await server.request('tools/call', { name: 'search', arguments: [] })).error.code,
    -32602,
  );
  assert.equal((await server.raw('{not json', null)).error.code, -32700);
  assert.equal(
    (await server.raw(JSON.stringify({ id: 99, method: 'ping' }), 99)).error.code,
    -32600,
  );
  server.notify('notifications/cancelled', { requestId: 1 });
  const batch = await server.raw(
    JSON.stringify([
      { jsonrpc: '2.0', id: 'a', method: 'ping' },
      { jsonrpc: '2.0', method: 'notifications/initialized' },
      { jsonrpc: '2.0', id: 'b', method: 'ping' },
    ]),
    'batch',
  );
  assert.deepEqual(
    batch.map((message) => message.id),
    ['a', 'b'],
  );
  const { code } = await server.stop();
  assert.equal(code, 0);
  // Notifications got no answer: one line per request.
  assert.equal(server.lines.length, 9);
});

test('a message the server fails on gets an internal error, and the server goes on', () => {
  const logged = [];
  const server = createServer({
    root: packageRoot,
    manifest: { ...manifest, version: '1.0.0' },
    log: (text) => logged.push(text),
  });
  const broken = {
    jsonrpc: '2.0',
    id: 7,
    get method() {
      throw new Error('broken message');
    },
  };
  assert.deepEqual(server.handle(broken), {
    jsonrpc: '2.0',
    id: 7,
    error: { code: -32603, message: 'Internal error.' },
  });
  assert.match(logged[0], /broken message/);
  assert.deepEqual(server.handleLine('{"jsonrpc":"2.0","id":8,"method":"ping"}').result, {});
  // A line that starts with a byte order mark, from a pipe that adds one, still parses.
  assert.deepEqual(server.handleLine('\uFEFF{"jsonrpc":"2.0","id":9,"method":"ping"}').result, {});
});

test('search finds exports without a component page by name', () => {
  for (const name of ['ThemeToggle', 'Text', 'Theme', 'LinkProvider', 'useTheme']) {
    const [first] = search(manifest, name, { limit: 3 });
    assert.equal(first.name, name);
    assert.equal(first.kind, 'export');
    assert.ok(first.doc, name);
  }
  assert.deepEqual(
    plan(manifest, 'a dark mode toggle').candidates.map((item) => item.component),
    ['ThemeToggle'],
  );
});

test('search and plan rank by names, aliases and situations', () => {
  const top = (query) => search(manifest, query, { kinds: ['component'], limit: 1 })[0]?.name;
  assert.equal(top('hamburger'), 'AppShell');
  assert.equal(top('dropdown'), 'Select');
  assert.equal(top('toggle switch'), 'Switch');
  assert.equal(top('snackbar'), 'Toast');
  assert.equal(top('Notice'), 'Alert', 'an earlier name');
  assert.equal(top('ConfirmButton'), 'Button', 'an export on another page');
  const settings = plan(
    manifest,
    'a settings form with a name field, a notifications switch and a save button',
  );
  const planned = settings.candidates.map((item) => item.component);
  for (const name of ['Button', 'Switch', 'TextField']) assert.ok(planned.includes(name), name);
  for (const candidate of settings.candidates) {
    assert.equal(candidate.import, '@envsemble/envui');
    assert.ok(candidate.matched.length && candidate.parts.length, candidate.component);
    assert.equal(new Set(candidate.parts).size, candidate.parts.length, 'parts once each');
  }
  // Structure words lead to templates and patterns, not to Pager or Pagination.
  const signIn = plan(manifest, 'a sign-in page');
  assert.deepEqual(signIn.candidates, []);
  assert.deepEqual(signIn.uncovered, ['a sign-in page']);
  assert.ok(signIn.next.some((step) => /No template matches "a sign-in page"/.test(step)));
  // A part a chosen component also matches stays with it.
  assert.deepEqual(
    plan(manifest, 'add a collapsible sidebar with a toggle').candidates.map(
      (item) => item.component,
    ),
    ['AppShell'],
  );
  const form = plan(manifest, 'a sign-in form with email and password');
  assert.ok(form.candidates.some((item) => item.component === 'TextField'));
  assert.ok(!form.uncovered.some((part) => /email|password/.test(part)), form.uncovered.join());
  const chart = plan(manifest, 'a line chart of weekly sign-ups');
  assert.deepEqual(chart.uncovered, ['a line chart of weekly sign-ups']);
  assert.ok(
    chart.next.some((step) => /propose an envUI addition instead of a local copy/.test(step)),
  );
  assert.ok(
    plan(manifest, 'an error message in danger color').tokens.some((token) =>
      token.name.includes('danger'),
    ),
  );
});

test('the manifest file is what the generator writes', () => {
  assert.equal(manifestFile, resolve(repository, 'docs/generated/manifest.json'));
  const packaged = JSON.parse(readFileSync(join(packageRoot, 'manifest.json'), 'utf8'));
  assert.equal(packaged.version, '9.8.7-test.1');
  const { version: _version, ...rest } = packaged;
  assert.deepEqual(rest, manifest);
});

/**
 * The benchmark's tasks, phrased as a product engineer would ask: the capabilities each plan must
 * cover, by capability id in bench/tasks.json. A capability is covered when the plan names one of
 * its envUI exports. The list records today's plans; it may grow, and a capability that drops out
 * fails the test.
 */
const planned = {
  sidebar: ['collapsible-sidebar', 'nav-links'],
  'settings-form': ['text-field', 'time-zone', 'form-actions'],
  'projects-table': ['table', 'sortable-headers', 'search', 'empty-state'],
  'confirm-delete': ['delete-action', 'confirmation'],
  'save-toast': ['toast', 'name-field', 'save-button'],
  'page-header': ['breadcrumbs', 'actions'],
  'command-palette': ['palette'],
  'tabs-counts': ['tabs'],
  'account-menu': ['avatar', 'menu', 'menu-items'],
  'file-upload': ['dropzone', 'remove-file', 'upload-progress'],
  'date-form': ['date-picker', 'submit'],
  'loading-skeletons': ['placeholders', 'error-message', 'retry'],
  'inline-notice': ['upgrade-link'],
};

test('plan covers the capabilities of the benchmark tasks, and suggests few others', () => {
  const tasks = JSON.parse(readFileSync(join(repository, 'bench/tasks.json'), 'utf8'));
  const list = tasks.tasks ?? tasks;
  assert.deepEqual(Object.keys(planned).sort(), list.map((task) => task.id).sort());
  let suggested = 0;
  let relevant = 0;
  for (const task of list) {
    const result = plan(manifest, task.prompt);
    const names = new Set(result.candidates.flatMap((item) => [item.component, ...item.use]));
    for (const id of planned[task.id]) {
      const capability = task.capabilities.find((item) => item.id === id);
      assert.ok(
        capability.envui.some((name) => names.has(name) || names.has(name.split('.')[0])),
        `${task.id}: ${id} (${capability.envui.join(', ')}) is not in the plan: ${[...names].join(', ')}`,
      );
    }
    for (const candidate of result.candidates) {
      suggested += 1;
      const allowed = task.capabilities.flatMap((item) =>
        item.envui.map((name) => name.split('.')[0]),
      );
      if ([candidate.component, ...candidate.use].some((name) => allowed.includes(name)))
        relevant += 1;
    }
    // Code and file names in a prompt are the application's, never a part to build.
    assert.ok(!result.uncovered.some((part) => /\.tsx?\b|`/.test(part)), task.id);
  }
  // Recall is the list above: 30 of the 43 capabilities. Precision is the share of candidates the
  // tasks list as a way to build them: 26 of 46 when this was written, a floor of one half. Stack,
  // Badge and the like count against it although they fit, so it understates.
  const recall = Object.values(planned).flat().length;
  assert.ok(recall >= 30, `benchmark recall ${recall} of 43`);
  assert.ok(relevant / suggested >= 0.5, `benchmark precision ${relevant} of ${suggested}`);
});

test('plan leaves out what a part does not ask for', () => {
  const names = (description) =>
    plan(manifest, description).candidates.map((item) => item.component);
  const tasks = JSON.parse(readFileSync(join(repository, 'bench/tasks.json'), 'utf8'));
  const prompt = (id) => (tasks.tasks ?? tasks).find((task) => task.id === id).prompt;
  const settings = names(prompt('settings-form'));
  for (const name of ['TextField', 'Select']) assert.ok(settings.includes(name), name);
  for (const name of ['DocumentTabs', 'ThemeToggle', 'List'])
    assert.ok(!settings.includes(name), `${name} in ${settings.join(', ')}`);
  assert.deepEqual(names('a toggle for the newsletter'), ['Switch']);
  assert.deepEqual(names('a notifications toggle'), ['Switch']);
  // The labels of a list of links are content, not a Switch for "Settings".
  assert.ok(!names(prompt('sidebar')).includes('Switch'));
  // One word of two is not a match.
  assert.deepEqual(names('the workspace name'), []);
  // Building blocks the foundations document come from the pages that use them.
  for (const description of ['an icon', 'some text'])
    for (const name of ['Icon', 'Text'])
      assert.ok(!names(description).includes(name), `${name} for ${description}`);
});

test('plan finds the right component for paraphrases the benchmark does not use', () => {
  const names = (description) =>
    plan(manifest, description).candidates.map((item) => item.component);
  assert.deepEqual(names('a sidebar with links'), ['NavList']);
  assert.deepEqual(names('let users switch between light and dark themes'), ['ThemeToggle']);
  assert.deepEqual(names('a theme switcher in the header'), ['ThemeToggle']);
  assert.deepEqual(names('a dark mode toggle'), ['ThemeToggle']);
  // An export without a page has aliases from the page that documents it.
  assert.ok(manifest.exports.ThemeToggle.aliases.includes('theme switcher'));
  assert.equal(search(manifest, 'theme switcher', { limit: 1 })[0].name, 'ThemeToggle');
});

test('exportAliases names only exports its page lists', () => {
  const directory = mkdtempSync(join(workDirectory, 'docs-'));
  cpSync(documentationDirectory, directory, { recursive: true });
  const setup = join(directory, 'setup.md');
  writeFileSync(
    setup,
    readFileSync(setup, 'utf8').replace(
      'exportAliases:\n',
      'exportAliases:\n  Button:\n    - push\n',
    ),
  );
  assert.throws(
    () => readDocumentation(directory, { props, versions: undefined }),
    /exportAliases names Button, which components does not list/,
  );
});

test('the server answers an empty batch, a guide page and invalid filters clearly', () => {
  const server = createServer({ root: packageRoot, manifest: { ...manifest, version: '1.0.0' } });
  assert.deepEqual(server.handleLine('[]'), {
    jsonrpc: '2.0',
    id: null,
    error: { code: -32600, message: 'Invalid request: an empty batch.' },
  });
  const call = (name, args) =>
    server.handle({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: { name, arguments: args },
    }).result;
  const setup = JSON.parse(call('get_props', { name: 'setup' }).content[0].text);
  assert.equal(setup.page, 'setup');
  assert.ok(setup.exports.some((entry) => entry.name === 'Theme' && entry.props.length >= 3));
  for (const args of [{ category: 3 }, { category: 'Nope' }, { status: ['beta'] }]) {
    const result = call('list_components', args);
    assert.equal(result.isError, true, JSON.stringify(args));
    assert.match(result.content[0].text, /must be/);
  }
});

/**
 * Descriptions that are not the benchmark's, with the components plan must suggest, the ones it
 * may suggest, and the ones it must not: the wrong picks reviews found.
 */
const corpus = [
  ['Open a Modal to edit the user', ['Dialog'], [], ['Avatar']],
  [
    'Add a Date Picker and a Search Box to the filters',
    ['DatePicker', 'TextField'],
    [],
    ['SegmentedControl'],
  ],
  ['a Dark Mode switch in the header', ['ThemeToggle'], ['AppShell'], ['Switch']],
  ['a form with a postal code field', [], ['TextField', 'Stack', 'Field'], ['Code']],
  ['A top bar with the product name', [], ['AppShell'], ['Menubar']],
  ['pick a date range for the report', [], ['DatePicker'], ['Slider']],
  ['a remember me checkbox on the sign-in form', ['Checkbox'], [], ['ThemePreferenceProvider']],
  ['A header with the page title', [], ['AppShell', 'PageHeader'], ['PanelDock']],
  ['Add a "Delete" button and a confirm dialog', ['Button', 'ConfirmDialog'], ['Dialog'], []],
  ['show the account details', [], [], ['Disclosure']],
  ['a toggle for the newsletter', ['Switch'], [], ['ThemeToggle']],
  ['a list of team members with their avatars', ['Avatar'], ['List'], []],
  ['a dropdown to choose the language', ['Select'], ['Menu'], []],
  ['a tooltip on the info icon', ['Tooltip'], ['IconButton'], ['Icon']],
  ['a progress bar while the file uploads', ['Progress'], ['DropZone'], []],
  ['tabs for Overview, Activity and Settings', ['Tabs'], [], ['Switch']],
  ['a snackbar after saving', ['Toast'], [], []],
  ['a confirmation before removing a member', [], ['ConfirmButton', 'Dialog'], ['Avatar']],
  ['some text and an icon', [], [], ['Text', 'Icon']],
  ['the workspace name', [], ['TextField'], ['DocumentTabs']],
];

test('plan suggests the right candidates for descriptions it was not tuned on', () => {
  let expected = 0;
  let found = 0;
  let suggested = 0;
  let right = 0;
  const wrong = [];
  for (const [description, must, may, mustNot] of corpus) {
    const names = plan(manifest, description).candidates.map((item) => item.component);
    expected += must.length;
    found += must.filter((name) => names.includes(name)).length;
    suggested += names.length;
    right += names.filter((name) => must.includes(name) || may.includes(name)).length;
    for (const name of names)
      if (mustNot.includes(name)) wrong.push(`${name} for "${description}"`);
    for (const name of must)
      assert.ok(names.includes(name), `${name} for "${description}": ${names}`);
  }
  assert.deepEqual(wrong, []);
  // Recall: every component the corpus requires (14 of 14 when this was written). Precision: the
  // share of candidates the corpus requires or allows (16 of 18), a floor of 0.85.
  assert.equal(found, expected, `corpus recall ${found} of ${expected}`);
  assert.ok(right / suggested >= 0.85, `corpus precision ${right} of ${suggested}`);
});

test('plan never drops words silently', () => {
  // Capitalized words envUI knows stay: a whole name or alias, or part of one for a run of several.
  const modal = plan(manifest, 'Open a Modal to edit the user');
  assert.deepEqual(
    modal.candidates.map((item) => item.component),
    ['Dialog'],
  );
  assert.deepEqual(modal.ignored, []);
  const picker = plan(manifest, 'Add a Date Picker to the filters');
  assert.ok(picker.candidates.some((item) => item.component === 'DatePicker'));
  // Labels, quoted text and code are content: they are left out, and listed as ignored.
  const sidebar = plan(
    manifest,
    'A sidebar with links to Projects, Members and Settings. Call `openProject`.',
  );
  for (const word of ['Projects', 'Members', 'Settings', '`openProject`'])
    assert.ok(sidebar.ignored.includes(word), `${word} in ${sidebar.ignored}`);
  assert.ok(plan(manifest, 'Add a "Delete" button').ignored.includes('"Delete"'));
  // A part reads as written, without the gaps the left-out words leave.
  for (const candidate of sidebar.candidates)
    for (const part of candidate.parts) assert.doesNotMatch(part, /\s{2,}|^\s|\s$/, part);
});
