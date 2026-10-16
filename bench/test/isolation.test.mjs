import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { after, before, describe, it } from 'node:test';
import { agentEnv } from '../lib/agents.mjs';
import { auditMarkers, auditRun } from '../lib/audit.mjs';
import { excerpt, redactPaths } from '../lib/paths.mjs';

const repoDir = resolve(import.meta.dirname, '../..');
const isWindows = process.platform === 'win32';
/** A path as a JSON transcript spells it: backslashes doubled on Windows. */
const json = (path) => JSON.stringify(path).slice(1, -1);
/** Git Bash's spelling of a Windows path, as in /c/Users/me. */
const msys = (path) =>
  path.replace(/^([A-Za-z]):/, (_, drive) => `/${drive.toLowerCase()}`).replaceAll('\\', '/');

describe('isolation audit', () => {
  let dir;
  let runDir;
  let audit;
  before(() => {
    dir = mkdtempSync(join(tmpdir(), 'bench-audit-'));
    runDir = join(dir, 'run');
    audit = auditMarkers({ repoDir, runDir, jobNames: ['claude-sidebar', 'codex-sidebar'] });
  });
  after(() => rmSync(dir, { recursive: true, force: true }));

  const scan = (text, name = 'claude-sidebar') => {
    const file = join(dir, `${name}-${Math.random().toString(36).slice(2)}.jsonl`);
    writeFileSync(file, text);
    return auditRun({ files: [file], audit, name });
  };

  it("passes a transcript that stays in the run's workspace and temp folder", () => {
    const result = scan(
      [
        `{"cwd":"${json(join(runDir, 'claude-sidebar'))}"}`,
        `{"command":"cat ${json(join(runDir, 'claude-sidebar', 'node_modules', '@envsemble', 'envui', 'docs', 'index.md'))}"}`,
        `{"output":"Session cwd remains ${json(join(runDir, 'claude-sidebar'))}; directory changes"}`,
        `{"output":"Note: your current working directory is ${json(join(runDir, 'claude-sidebar'))}."}`,
        `{"output":"${json(join(runDir, '_tmp', 'claude-sidebar', 'claude', 'task.out'))}"}`,
        '{"output":"assets/envUI/envUI-favicon.ico and https://github.com/envsemble/envUI/issues"}',
        '{"command":"cat ../src/App.tsx"}',
      ].join('\n'),
    );
    assert.deepEqual(result, { escaped: false, hits: [] });
  });

  it('flags the folder that holds the source checkout, in any spelling', () => {
    const parent = resolve(repoDir, '..');
    for (const spelling of [parent, json(join(parent, 'other', 'node_modules')), msys(parent)]) {
      const result = scan(`{"output":"PATH=/usr/bin:${spelling}/node_modules/.bin"}`);
      assert.equal(result.escaped, true, spelling);
    }
  });

  it("flags the checkout's own folder name in a relative path", () => {
    const name = repoDir.split(/[\\/]/).pop();
    if (name.toLowerCase() === 'envui') return;
    const result = scan(`{"command":"ls ../../${name}/node_modules/playwright"}`);
    assert.equal(result.escaped, true);
  });

  it('flags extra paths such as notes folders', () => {
    const notes = join(dir, 'notes');
    const withNotes = auditMarkers({ repoDir, runDir, extraPaths: [notes] });
    const file = join(dir, 'notes.jsonl');
    writeFileSync(file, `{"command":"cat ${json(join(notes, 'plan.md'))}"}`);
    assert.equal(
      auditRun({ files: [file], audit: withNotes, name: 'claude-sidebar' }).escaped,
      true,
    );
  });

  it("flags another run's workspace, temp folder or logs", () => {
    for (const text of [
      `{"command":"cat ${json(join(runDir, '_logs', 'codex-sidebar', 'transcript.jsonl'))}"}`,
      `{"command":"ls ${json(join(runDir, 'codex-sidebar', 'src'))}"}`,
      `{"command":"ls ${json(join(runDir, '_tmp', 'codex-sidebar'))}"}`,
      '{"command":"cat ../codex-sidebar/src/App.tsx"}',
      '{"command":"ls ../_logs"}',
    ])
      assert.equal(scan(text).escaped, true, text);
  });

  it('keeps a wrapped line in its own workspace path', () => {
    const own = join(runDir, 'codex-inline-notice');
    const wrapped = `${json(own).slice(0, -4)}\\r\\n${json(own).slice(-4)}\\\\node_modules`;
    const result = scan(`{"output":"Cannot find path '${wrapped}'"}`, 'codex-inline-notice');
    assert.equal(result.escaped, false);
  });
});

describe('redaction', () => {
  it('makes run paths relative and hides the user profile', () => {
    const runDir = join(homedir(), 'AppData', 'Local', 'Temp', 'agent-workspaces', 'run-1');
    const inRun = join(runDir, 'claude-sidebar', 'src', 'App.tsx');
    const text = `${inRun} and ${json(join(homedir(), '.claude'))} and ${msys(homedir())}/x`;
    const redacted = redactPaths(text, { runDir });
    assert.ok(!redacted.includes(homedir()), redacted);
    assert.ok(redacted.startsWith(join('claude-sidebar', 'src', 'App.tsx')), redacted);
    assert.match(redacted, /~[\\/]+\.claude/);
    if (isWindows) assert.match(redacted, /~\/x$/);
  });

  it('cuts long messages to an excerpt', () => {
    assert.equal(excerpt('a'.repeat(1000)).length, 280);
    assert.equal(excerpt('short\n\nmessage'), 'short message');
  });
});

describe('agent environment', () => {
  it('is an allow-list without the repository, npm settings, tokens or outer sessions', () => {
    const saved = { ...process.env };
    try {
      process.env.PATH = [join(repoDir, 'node_modules', '.bin'), process.env.PATH].join(
        isWindows ? ';' : ':',
      );
      process.env.INIT_CWD = repoDir;
      process.env.npm_config_cache = join(repoDir, '.cache');
      process.env.CLAUDECODE = '1';
      process.env.GITHUB_PERSONAL_ACCESS_TOKEN = 'secret';
      const tmp = join(tmpdir(), 'run', '_tmp', 'claude-sidebar');
      const env = agentEnv({ tmpDir: tmp, homeDir: join(tmp, 'home'), npmCache: join(tmp, 'npm') });
      for (const name of ['INIT_CWD', 'CLAUDECODE', 'GITHUB_PERSONAL_ACCESS_TOKEN'])
        assert.equal(env[name], undefined, name);
      assert.equal(env.npm_config_cache, join(tmp, 'npm'));
      assert.equal(env.TEMP, tmp);
      assert.equal(env.TMP, tmp);
      const parent = resolve(repoDir, '..').toLowerCase();
      for (const entry of env.PATH.split(isWindows ? ';' : ':')) {
        assert.ok(!entry.toLowerCase().startsWith(parent), entry);
        assert.ok(!/node_modules/i.test(entry), entry);
      }
      if (isWindows) {
        assert.equal(env.HOME, join(tmp, 'home'));
        assert.equal(env.USERPROFILE, saved.USERPROFILE);
      }
    } finally {
      for (const name of Object.keys(process.env)) if (!(name in saved)) delete process.env[name];
      Object.assign(process.env, saved);
    }
  });
});
