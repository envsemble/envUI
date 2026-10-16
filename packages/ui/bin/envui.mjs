#!/usr/bin/env node
// The envui command of @envsemble/envui: tools for coding agents, from the installed package.
//
//   npx envui agents   write the envUI index into the project's AGENTS.md
//   npx envui mcp      serve the installed manifest and docs as an MCP server over stdio
import { readFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { agentsUsage, runAgents } from './agents.mjs';
import { loadManifest } from './catalog.mjs';

const version = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
).version;

const usage = `Usage: envui <command> [options]

Commands:
  agents   Write the envUI index into AGENTS.md: the rule to search envUI first, and where its
           docs are in node_modules. --check fails when it is missing or outdated.
  mcp      Serve envUI's components, props, examples, patterns and tokens to coding agents as an
           MCP server over stdio, from the installed version.

Options:
  -h, --help     Show this help, or a command's.
  -v, --version  Show the installed envUI version.

Docs: node_modules/@envsemble/envui/docs/agents.md`;

function main(argv) {
  const [command, ...rest] = argv;
  if (!command || command === '-h' || command === '--help' || command === 'help') {
    console.log(usage);
    return 0;
  }
  if (command === '-v' || command === '--version') {
    console.log(version);
    return 0;
  }
  if (command === 'agents') {
    const { values } = parseArgs({
      args: rest,
      options: {
        check: { type: 'boolean' },
        file: { type: 'string' },
        print: { type: 'boolean' },
        help: { type: 'boolean', short: 'h' },
      },
    });
    if (values.help) {
      console.log(agentsUsage);
      return 0;
    }
    return runAgents(values, loadManifest());
  }
  if (command === 'mcp') {
    const { values } = parseArgs({
      args: rest,
      options: { help: { type: 'boolean', short: 'h' } },
    });
    if (values.help) {
      console.log(`Usage: envui mcp

Serves envUI to coding agents as an MCP server over stdio. Register it in the project, for example:
  claude mcp add envui -- npx --no envui mcp
  codex mcp add envui -- npx --no envui mcp
Tools: search, list_components, get_component, get_props, get_example, list_patterns,
list_templates, get_tokens and plan.`);
      return 0;
    }
    return import('./mcp.mjs').then(({ runMcp }) => runMcp()).then(() => 0);
  }
  console.error(`Unknown command: ${command}\n\n${usage}`);
  return 2;
}

try {
  const code = await main(process.argv.slice(2));
  process.exitCode = code;
} catch (error) {
  console.error(`envui: ${error.message}`);
  process.exitCode = 1;
}
