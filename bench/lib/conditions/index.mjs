import baseline from './baseline.mjs';

/**
 * Conditions change what an agent gets before a run. Each one has:
 * - `setup({ appDir, repoDir, task, agent })`: edit the fresh app copy before the baseline commit,
 *   for example append an AGENTS.md block, add `.mcp.json`, or install an ESLint config;
 * - `agentArgs({ agent, appDir })`: extra CLI arguments for that agent, for example
 *   `--mcp-config` for Claude Code or `-c mcp_servers...` for Codex.
 * Register new conditions here.
 */
export const conditions = { baseline };
