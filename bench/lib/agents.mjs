import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { npmCli } from './prepare.mjs';
import { run } from './process.mjs';

/**
 * Environment for an agent CLI: the caller's environment without the variables of an outer
 * Claude Code or Codex session (so a run started from inside an agent is not treated as a nested
 * session) and without the outer npm run's settings. Auth stays in each CLI's own home.
 */
function agentEnv(extra = {}) {
  const env = Object.fromEntries(
    Object.entries(process.env).filter(
      ([name]) =>
        !/^(CLAUDECODE|CLAUDE_CODE_|CLAUDE_AGENT_SDK|CLAUDE_PID|CLAUDE_EFFORT|CODEX_(?!HOME)|npm_(config|package|lifecycle)_)/i.test(
          name,
        ),
    ),
  );
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

export const agents = {
  claude: {
    label: 'Claude Code',
    model: 'claude-opus-5-5',
    effort: 'high',
    version: () => run('claude', ['--version']),
    /**
     * Headless and non-interactive. Permissions are skipped inside the throwaway workspace; user
     * settings, plugins, hooks and MCP servers are not loaded, so the run sees only the project.
     */
    command({ model, effort, extraArgs = [] }) {
      return {
        file: 'claude',
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
        env: agentEnv(),
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
        finalMessage: String(result.result ?? '').slice(0, 2000),
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
     * headless; the npm cache is added as a writable root so `npm install` works.
     */
    command({ model, effort, appDir, lastMessageFile, extraArgs = [] }) {
      const npmCache =
        process.env.npm_config_cache ??
        (process.platform === 'win32'
          ? join(process.env.LOCALAPPDATA ?? join(homedir(), 'AppData/Local'), 'npm-cache')
          : join(homedir(), '.npm'));
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
          '--add-dir',
          npmCache,
          '--cd',
          appDir,
          '--output-last-message',
          lastMessageFile,
          ...extraArgs,
          '-',
        ],
        env: agentEnv(),
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
        lastMessageFile && existsSync(lastMessageFile)
          ? readFileSync(lastMessageFile, 'utf8').slice(0, 2000)
          : '';
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
