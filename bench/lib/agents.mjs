import { existsSync, readFileSync } from 'node:fs';
import { delimiter, dirname, join } from 'node:path';
import { npmCli } from './prepare.mjs';
import { run } from './process.mjs';

const isWindows = process.platform === 'win32';

/** The full path of a command on the runner's PATH, or null. */
function locate(command) {
  try {
    const found = run(isWindows ? 'where.exe' : 'which', [command])
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    return (isWindows ? found.find((path) => /\.(exe|cmd)$/i.test(path)) : found[0]) ?? null;
  } catch {
    return null;
  }
}

/** Git's folder of commands. Both agents use git, and Claude Code finds Git Bash through it. */
function gitDir() {
  const git = locate('git');
  if (!git) return null;
  if (!isWindows) return dirname(git);
  const root = git.replace(/[\\/](cmd|bin|mingw64[\\/]bin)[\\/]git\.exe$/i, '');
  return existsSync(join(root, 'cmd', 'git.exe')) ? join(root, 'cmd') : dirname(git);
}

/**
 * Variables an agent keeps from the runner's environment: what Windows programs need to start,
 * and the user profile, where both CLIs keep their login (~/.claude/.credentials.json and
 * ~/.codex/auth.json). A custom config home is kept for the same reason.
 */
const inherited = isWindows
  ? [
      'SystemRoot',
      'windir',
      'SystemDrive',
      'COMSPEC',
      'PATHEXT',
      'OS',
      'NUMBER_OF_PROCESSORS',
      'PROCESSOR_ARCHITECTURE',
      'USERPROFILE',
      'CLAUDE_CONFIG_DIR',
      'CODEX_HOME',
    ]
  : ['HOME', 'USER', 'LOGNAME', 'SHELL', 'LANG', 'TERM', 'CLAUDE_CONFIG_DIR', 'CODEX_HOME'];

/**
 * The environment an agent runs in, built from an allow-list rather than the runner's own
 * environment, which names the repository (npm adds its node_modules/.bin to PATH and sets
 * INIT_CWD) and carries tokens and outer agent sessions. PATH holds only the system folders, Node
 * and npm, git and the agent CLI's own folder. TEMP and, on Windows, HOME point into the run's own
 * temp folder, so Git Bash's ~ is not the user's; npm uses the benchmark's cache.
 */
export function agentEnv({ tmpDir, homeDir, npmCache, pathDirs = [], extra = {} }) {
  const env = {};
  for (const name of inherited) if (process.env[name] !== undefined) env[name] = process.env[name];
  const systemRoot = process.env.SystemRoot ?? 'C:\\Windows';
  const systemDirs = isWindows
    ? [
        join(systemRoot, 'System32'),
        systemRoot,
        join(systemRoot, 'System32', 'Wbem'),
        join(systemRoot, 'System32', 'WindowsPowerShell', 'v1.0'),
      ]
    : ['/usr/local/bin', '/usr/bin', '/bin'];
  env.PATH = [...new Set([...systemDirs, dirname(process.execPath), gitDir(), ...pathDirs])]
    .filter(Boolean)
    .join(delimiter);
  if (tmpDir) {
    env.TEMP = tmpDir;
    env.TMP = tmpDir;
    if (!isWindows) env.TMPDIR = tmpDir;
  }
  if (homeDir && isWindows) env.HOME = homeDir;
  if (npmCache) env.npm_config_cache = npmCache;
  return { ...env, ...extra };
}

function readJsonLines(file) {
  if (!existsSync(file)) return [];
  return readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .filter((line) => line.startsWith('{'))
    .flatMap((line) => {
      try {
        return [JSON.parse(line)];
      } catch {
        return [];
      }
    });
}

const packagePath = /@envsemble[\\/]+envui/i;
const docsPath = /@envsemble[\\/]+envui[\\/]+(docs|skills|README\.md)/i;
const relativeDocs = /(^|[\s"'/\\])(docs|skills)[\\/]|README\.md/i;
const typesPath = /\.d\.ts\b/i;

/**
 * Counts tool calls that looked into the installed envUI package: its Markdown docs or agent
 * skills, its type declarations, or anything in it. The input is each call's command or arguments.
 */
function envuiLookups(inputs) {
  const lookups = { docs: 0, types: 0, any: 0 };
  for (const input of inputs) {
    if (!packagePath.test(input)) continue;
    lookups.any += 1;
    // Reading or searching Markdown docs or skills; listing the docs folder does not count.
    const searchesDocs =
      docsPath.test(input) && /\b(rg|grep|select-string|findstr)\b|"pattern"/i.test(input);
    if (/\.md\b/i.test(input) && (docsPath.test(input) || relativeDocs.test(input)))
      lookups.docs += 1;
    else if (searchesDocs) lookups.docs += 1;
    if (typesPath.test(input)) lookups.types += 1;
  }
  return lookups;
}

function resolveCodexScript() {
  if (process.env.CODEX_JS && existsSync(process.env.CODEX_JS)) return process.env.CODEX_JS;
  const globalRoot = run(process.execPath, [npmCli(), 'root', '-g']);
  const script = join(globalRoot, '@openai/codex/bin/codex.js');
  if (!existsSync(script))
    throw new Error('Codex CLI not found; install @openai/codex or set CODEX_JS.');
  return script;
}

function resolveClaude() {
  const found = locate('claude');
  if (!found) throw new Error('Claude Code CLI not found on PATH.');
  return found;
}

export const agents = {
  claude: {
    label: 'Claude Code',
    model: 'claude-opus-5-5',
    effort: 'high',
    version: () => run(resolveClaude(), ['--version']),
    /**
     * Headless and non-interactive. Permissions are skipped inside the throwaway workspace; user
     * settings, plugins, hooks and MCP servers are not loaded, so the run sees only the project.
     */
    command({ model, effort, tmpDir, homeDir, npmCache, extraArgs = [] }) {
      const file = resolveClaude();
      return {
        file,
        args: [
          '-p',
          '--model',
          model,
          '--effort',
          effort,
          '--dangerously-skip-permissions',
          '--output-format',
          'stream-json',
          '--verbose',
          '--no-session-persistence',
          '--setting-sources',
          'project,local',
          '--strict-mcp-config',
          ...extraArgs,
        ],
        // No self-update in the middle of a benchmark.
        env: agentEnv({
          tmpDir,
          homeDir,
          npmCache,
          pathDirs: [dirname(file)],
          extra: { DISABLE_AUTOUPDATER: '1' },
        }),
      };
    },
    /** Reads usage and cost from the stream-json transcript's result event. */
    parse(transcriptFile) {
      const events = readJsonLines(transcriptFile);
      const result = events.findLast((event) => event.type === 'result');
      const init = events.find((event) => event.type === 'system' && event.subtype === 'init');
      const toolUses = events
        .filter((event) => event.type === 'assistant')
        .flatMap((event) => event.message?.content ?? [])
        .filter((block) => block.type === 'tool_use');
      const toolCalls = toolUses.length;
      const lookups = envuiLookups(toolUses.map((block) => JSON.stringify(block.input ?? {})));
      if (!result)
        return {
          completed: false,
          model: init?.model,
          toolCalls,
          envuiLookups: lookups,
          events: events.length,
        };
      const usage = result.usage ?? {};
      const models = Object.values(result.modelUsage ?? {});
      const sum = (key) => models.reduce((total, entry) => total + (entry[key] ?? 0), 0);
      return {
        completed: result.subtype === 'success' && !result.is_error,
        model: Object.keys(result.modelUsage ?? {}).join(', ') || init?.model,
        turns: result.num_turns,
        toolCalls,
        envuiLookups: lookups,
        costUsd: result.total_cost_usd,
        // modelUsage is cumulative per model, including subagents; usage covers the main model.
        tokens: models.length
          ? {
              input: sum('inputTokens'),
              cachedInput: sum('cacheReadInputTokens'),
              cacheWrite: sum('cacheCreationInputTokens'),
              output: sum('outputTokens'),
            }
          : {
              input: usage.input_tokens ?? 0,
              cachedInput: usage.cache_read_input_tokens ?? 0,
              cacheWrite: usage.cache_creation_input_tokens ?? 0,
              output: usage.output_tokens ?? 0,
            },
        finalMessage: String(result.result ?? ''),
        events: events.length,
      };
    },
  },
  codex: {
    label: 'Codex',
    model: 'gpt-6-luna',
    effort: 'high',
    version: () => run(process.execPath, [resolveCodexScript(), '--version']),
    /**
     * `codex exec` with the workspace-write sandbox. User config is ignored (no MCP servers,
     * plugins or model overrides). On Windows the unelevated sandbox is the one that can run
     * headless. The npm cache and the run's temp folder are added as writable roots, so
     * `npm install` and temp files work.
     */
    command({ model, effort, appDir, lastMessageFile, tmpDir, homeDir, npmCache, extraArgs = [] }) {
      return {
        file: process.execPath,
        args: [
          resolveCodexScript(),
          'exec',
          '--json',
          '--ignore-user-config',
          '--ephemeral',
          '--sandbox',
          'workspace-write',
          '--model',
          model,
          '-c',
          `model_reasoning_effort="${effort}"`,
          '-c',
          'sandbox_workspace_write.network_access=true',
          ...(process.platform === 'win32' ? ['-c', 'windows.sandbox="unelevated"'] : []),
          ...[npmCache, tmpDir].filter(Boolean).flatMap((dir) => ['--add-dir', dir]),
          '--cd',
          appDir,
          '--output-last-message',
          lastMessageFile,
          ...extraArgs,
          '-',
        ],
        env: agentEnv({ tmpDir, homeDir, npmCache }),
      };
    },
    /** Sums token usage over turn.completed events; Codex reports no cost. */
    parse(transcriptFile, { lastMessageFile } = {}) {
      const events = readJsonLines(transcriptFile);
      const turns = events.filter((event) => event.type === 'turn.completed');
      const lastTurn = events.findLast((event) =>
        ['turn.completed', 'turn.failed'].includes(event.type),
      );
      const tokens = { input: 0, cachedInput: 0, cacheWrite: 0, output: 0, reasoning: 0 };
      for (const turn of turns) {
        // OpenAI's input_tokens include cached ones; keep input as the uncached part, as for Claude.
        tokens.input += Math.max(
          0,
          (turn.usage?.input_tokens ?? 0) -
            (turn.usage?.cached_input_tokens ?? 0) -
            (turn.usage?.cache_write_input_tokens ?? 0),
        );
        tokens.cachedInput += turn.usage?.cached_input_tokens ?? 0;
        tokens.cacheWrite += turn.usage?.cache_write_input_tokens ?? 0;
        tokens.output += turn.usage?.output_tokens ?? 0;
        tokens.reasoning += turn.usage?.reasoning_output_tokens ?? 0;
      }
      const toolCalls = events.filter(
        (event) =>
          event.type === 'item.completed' &&
          ['command_execution', 'file_change', 'mcp_tool_call', 'web_search'].includes(
            event.item?.type,
          ),
      ).length;
      const lookups = envuiLookups(
        events
          .filter((event) => event.type === 'item.completed')
          .map((event) => event.item?.command ?? JSON.stringify(event.item?.changes ?? '')),
      );
      const errors = events
        .filter((event) => event.type === 'error' || event.type === 'turn.failed')
        .map((event) => String(event.message ?? event.error?.message ?? '').slice(0, 300));
      const finalMessage =
        lastMessageFile && existsSync(lastMessageFile) ? readFileSync(lastMessageFile, 'utf8') : '';
      return {
        completed: lastTurn?.type === 'turn.completed',
        turns: turns.length,
        toolCalls,
        envuiLookups: lookups,
        costUsd: undefined,
        tokens,
        errors,
        finalMessage,
        events: events.length,
      };
    },
  },
};
