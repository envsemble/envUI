import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { after, before, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { examplesDirectory, packageDocumentation } from '../scripts/GenerateDocumentation.mjs';
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
  renderIndex,
  updateAgentsFile,
  withIndex,
} from '../packages/ui/bin/agents.mjs';
import { findComponent, plan, search } from '../packages/ui/bin/catalog.mjs';
import { protocolVersions } from '../packages/ui/bin/mcp.mjs';

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

after(() => {
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
  assert.deepEqual(
    button.exports.map((entry) => entry.name),
    ['Button', 'IconButton', 'ConfirmButton', 'CopyButton', 'ButtonGroup'],
  );
  const variant = button.exports[0].props.find((prop) => prop.name === 'variant');
  assert.equal(variant.default, "'primary'");
  assert.ok(button.avoidWhen.some((avoid) => avoid.use === 'Link'));
  for (const component of manifest.components) {
    assert.ok(existsSync(join(repository, component.doc)), component.doc);
    assert.ok(manifest.categories.includes(component.category));
    assert.ok(component.summary && component.aliases.length, component.name);
    for (const avoid of component.avoidWhen)
      if (avoid.use) assert.ok(manifest.exports[avoid.use], `${component.name}: ${avoid.use}`);
    for (const entry of component.exports) assert.ok(props.exports[entry.name], entry.name);
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
  const menu = findComponent(manifest, 'Menu.Item');
  assert.equal(menu.component.name, 'Menu');
  assert.equal(menu.entry.name, 'Menu.Item');
  assert.ok(manifest.patterns.some((page) => page.name === 'loading'));
  assert.deepEqual(manifest.templates, []);
  // Tokens: current names with values, and the 0.7 names with their successors.
  const muted = manifest.tokens.items.find((token) => token.id === 'color.fg.muted');
  assert.equal(muted.cssVariable, '--color-fg-muted');
  assert.deepEqual(Object.keys(muted.values), manifest.tokens.themes);
  assert.ok(
    manifest.tokens.items.some((token) => token.compact),
    'scale values',
  );
  assert.ok(
    manifest.tokens.legacy.every(
      (token) => !manifest.tokens.items.some((item) => item.id === token.id),
    ),
  );
  assert.ok(manifest.tokens.legacy.some((token) => token.use));
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
  assert.match(result.stderr, /AGENTS\.md does not exist\. Run `npx envui agents`/);
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
      const [content] = response.result.content;
      assert.equal(content.type, 'text');
      return response.result.isError ? { error: content.text } : JSON.parse(content.text);
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
    ['Button', 'Link', 'SegmentedControl'],
  );
  assert.equal(listed.components[0].import, '@envsemble/envui');

  const iconButton = await server.call('get_component', { name: 'IconButton' });
  assert.equal(iconButton.name, 'Button');
  assert.equal(iconButton.requested, 'IconButton');
  assert.ok(iconButton.exports.find((entry) => entry.name === 'IconButton').props.includes('icon'));
  const byAlias = await server.call('get_component', { name: 'modal', docs: true });
  assert.equal(byAlias.name, 'Dialog');
  assert.match(byAlias.markdown, /^---\ntitle: Dialog\n[\s\S]*\n## Props\n/);
  assert.equal((await server.call('get_component', { name: 'Theme' })).page, null);
  assert.match((await server.call('get_component', { name: 'Fooo' })).error, /no component/);

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

  const planned = await server.call('plan', {
    description:
      'A members page: a filterable table with an empty state, pagination and a confirm-delete dialog',
  });
  const names = planned.components.map((component) => component.name);
  for (const name of ['Table', 'EmptyState', 'Pagination', 'Dialog'])
    assert.ok(names.includes(name), name);
  assert.ok(
    planned.imports.some((line) =>
      /import \{[^}]*\bTable\b[^}]*\} from '@envsemble\/envui';/.test(line),
    ),
  );
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
  assert.equal(server.lines.length, 7);
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
  const planned = settings.components.map((component) => component.name);
  for (const name of ['Button', 'Switch', 'TextField']) {
    assert.ok(planned.includes(name), name);
    assert.match(settings.imports.join('\n'), new RegExp(`\\b${name}\\b`));
  }
  assert.ok(settings.imports.every((line) => line.endsWith("from '@envsemble/envui';")));
  const chart = plan(manifest, 'a line chart of weekly sign-ups');
  assert.deepEqual(chart.uncovered, ['a line chart of weekly sign-ups']);
  assert.match(chart.next.at(-1), /propose an envUI addition instead of a local copy/);
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
