#!/usr/bin/env node
// envUI agent benchmark: runs coding agents on product tasks in a fixture app that uses envUI,
// then scores how much of each result is built with envUI. See bench/README.md.
import { existsSync, readFileSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { agents } from './lib/agents.mjs';
import { conditions } from './lib/conditions/index.mjs';
import {
  commitBaseline,
  createWorkspace,
  ensureTemplate,
  packLibrary,
  writeJson,
} from './lib/prepare.mjs';
import { killStragglers, runWithTimeout } from './lib/process.mjs';
import { aggregate, compactRun, renderSummary } from './lib/report.mjs';
import { scoreRun } from './lib/score.mjs';

const benchDir = fileURLToPath(new URL('.', import.meta.url));
const repoDir = resolve(benchDir, '..');
const fixtureDir = join(benchDir, 'fixture');
const allTasks = JSON.parse(readFileSync(join(benchDir, 'tasks.json'), 'utf8')).tasks;

const usage = `Usage:
  npm run bench -- [--condition baseline] [--agents claude,codex] [--tasks all|id,id]
                   [--concurrency 4] [--timeout 12] [--run-id <id>] [--workdir <dir>]
                   [--build] [--no-save] [--dry-run]
  npm run bench -- rescore --run-id <id> [--workdir <dir>] [--no-save]

  --condition    one or more conditions, comma-separated (${Object.keys(conditions).join(', ')})
  --agents       ${Object.keys(agents).join(', ')}
  --tasks        all, or task ids: ${allTasks.map((task) => task.id).join(', ')}
  --timeout      minutes per run (default 12)
  --workdir      where workspaces, transcripts and caches go (default %TEMP%/agent-workspaces)
  --build        run npm run build:library before packing
  --no-save      do not copy results.json and summary.md into bench/results/<run-id>/
  --dry-run      prepare one workspace per agent and print the commands without running agents
  --model-<agent> / --effort-<agent>  override an agent's model or effort, e.g. --model-codex gpt-6-luna`;

const { values: options, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    condition: { type: 'string', default: 'baseline' },
    agents: { type: 'string', default: 'claude,codex' },
    tasks: { type: 'string', default: 'all' },
    concurrency: { type: 'string', default: '4' },
    timeout: { type: 'string', default: '12' },
    'run-id': { type: 'string' },
    workdir: { type: 'string', default: join(tmpdir(), 'agent-workspaces') },
    build: { type: 'boolean', default: false },
    'no-save': { type: 'boolean', default: false },
    'dry-run': { type: 'boolean', default: false },
    help: { type: 'boolean', default: false },
    ...Object.fromEntries(
      Object.keys(agents).flatMap((name) => [
        [`model-${name}`, { type: 'string' }],
        [`effort-${name}`, { type: 'string' }],
      ]),
    ),
  },
});
if (options.help) {
  console.log(usage);
  process.exit(0);
}

const log = (message) => console.log(`[${new Date().toLocaleTimeString('sv-SE')}] ${message}`);
const localDate = () => new Date().toLocaleDateString('sv-SE');
const list = (value) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
const workdir = resolve(options.workdir);
const cacheDir = join(workdir, '_cache');

function selectTasks() {
  if (options.tasks === 'all') return allTasks;
  return list(options.tasks).map((id) => {
    const task = allTasks.find((candidate) => candidate.id === id);
    if (!task) throw new Error(`Unknown task ${id}`);
    return task;
  });
}

function agentSettings(name) {
  const agent = agents[name];
  if (!agent) throw new Error(`Unknown agent ${name}`);
  return {
    model: options[`model-${name}`] ?? agent.model,
    effort: options[`effort-${name}`] ?? agent.effort,
  };
}

function defaultRunId(conditionNames) {
  const base = `${localDate()}-${conditionNames.join('+')}`;
  let id = base;
  for (let index = 2; existsSync(join(workdir, id)); index += 1) id = `${base}-${index}`;
  return id;
}

/** Prepares, runs and scores one task for one agent under one condition. */
async function runJob(job, context) {
  const { task, agentName, condition } = job;
  const name = `${context.multipleConditions ? `${condition.name}-` : ''}${agentName}-${task.id}`;
  const appDir = join(context.runDir, name);
  const logDir = join(context.runDir, '_logs', name);
  await mkdir(logDir, { recursive: true });
  const record = { task: task.id, agent: agentName, condition: condition.name, appDir, logDir };
  try {
    await createWorkspace({ templateDir: context.templateDir, appDir });
    await condition.setup({ appDir, repoDir, task, agent: agentName });
    record.baseCommit = await commitBaseline(appDir);
    const agent = agents[agentName];
    const settings = agentSettings(agentName);
    const lastMessageFile = join(logDir, 'last-message.txt');
    const command = agent.command({
      ...settings,
      appDir,
      lastMessageFile,
      extraArgs: condition.agentArgs({ agent: agentName, appDir }),
    });
    record.command = [command.file, ...command.args];
    if (options['dry-run']) {
      log(`dry run ${name}: ${record.command.join(' ')}`);
      record.status = 'dry-run';
      return record;
    }
    log(`start ${name}`);
    const transcriptFile = join(logDir, 'transcript.jsonl');
    const outcome = await runWithTimeout(command.file, command.args, {
      cwd: appDir,
      env: command.env,
      input: task.prompt,
      stdoutFile: transcriptFile,
      stderrFile: join(logDir, 'stderr.log'),
      timeoutMs: context.timeoutMs,
    });
    killStragglers(`${appDir}${sep}`);
    Object.assign(record, outcome);
    record.agentReport = agent.parse(transcriptFile, { lastMessageFile });
    record.agentReport.model ??= settings.model;
    await scoreInto(record, task);
    log(
      `done  ${name}: ${record.status}, score ${record.scoreDetail?.score}, ${Math.round(outcome.durationMs / 1000)} s`,
    );
  } catch (error) {
    record.status = 'harness-error';
    record.harnessError = String(error?.stack ?? error).slice(0, 2000);
    log(`error ${name}: ${String(error?.message ?? error).slice(0, 300)}`);
  }
  await writeJson(join(logDir, 'meta.json'), { ...record, scoreDetail: undefined });
  return record;
}

async function scoreInto(record, task) {
  const detail = scoreRun({
    appDir: record.appDir,
    baseCommit: record.baseCommit,
    task,
    fixtureDir,
  });
  await writeFile(join(record.logDir, 'diff.patch'), detail.patch ?? '');
  delete detail.patch;
  await writeJson(join(record.logDir, 'score.json'), detail);
  record.scoreDetail = detail;
  record.status = record.timedOut
    ? 'timeout'
    : record.error || record.exitCode !== 0 || record.agentReport?.completed === false
      ? 'agent-error'
      : detail.hasOutput
        ? 'completed'
        : 'no-output';
}

async function pool(items, size, worker) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(size, items.length) }, async () => {
      while (next < items.length) {
        const index = next;
        next += 1;
        results[index] = await worker(items[index]);
      }
    }),
  );
  return results;
}

async function writeResults(context, records) {
  const runs = records.filter((record) => record.status !== 'dry-run').map(compactRun);
  const results = {
    runId: context.runId,
    createdAt: context.createdAt,
    date: context.date,
    conditions: context.conditionNames,
    envui: context.envui,
    agents: context.agents,
    settings: context.settings,
    workdir: context.runDir,
    aggregates: aggregate(runs),
    runs,
  };
  const tasks = allTasks.filter((task) => context.settings.tasks.includes(task.id));
  const summary = renderSummary(results, tasks);
  await writeJson(join(context.runDir, 'results.json'), results);
  await writeFile(join(context.runDir, 'summary.md'), summary);
  if (!options['no-save']) {
    const saveDir = join(benchDir, 'results', context.runId);
    await mkdir(saveDir, { recursive: true });
    await writeFile(join(saveDir, 'results.json'), `${JSON.stringify(results)}\n`);
    await writeFile(join(saveDir, 'summary.md'), summary);
    log(`saved ${saveDir}`);
  }
  log(`results ${join(context.runDir, 'summary.md')}`);
  return results;
}

async function main() {
  if (positionals[0] === 'rescore') return rescore();
  if (positionals.length) throw new Error(`Unknown command ${positionals[0]}\n${usage}`);
  const conditionNames = list(options.condition);
  const selectedConditions = conditionNames.map((conditionName) => {
    if (!conditions[conditionName]) throw new Error(`Unknown condition ${conditionName}`);
    return conditions[conditionName];
  });
  const agentNames = list(options.agents);
  for (const agentName of agentNames) agentSettings(agentName);
  const tasks = selectTasks();
  const runId = options['run-id'] ?? defaultRunId(conditionNames);
  const runDir = join(workdir, runId);
  if (existsSync(join(runDir, 'results.json')) && !options['dry-run'])
    throw new Error(`Run ${runId} already has results; choose another --run-id.`);

  log(`packing envUI from ${join(repoDir, 'packages/ui')}`);
  const pack = await packLibrary({ repoDir, cacheDir, build: options.build });
  const templateDir = await ensureTemplate({ fixtureDir, cacheDir, pack, log });
  const agentInfo = {};
  for (const agentName of agentNames) {
    let cliVersion = 'unknown';
    try {
      cliVersion = agents[agentName].version();
    } catch (error) {
      log(`warning: ${agentName} --version failed: ${error.message}`);
    }
    const settings = agentSettings(agentName);
    agentInfo[agentName] = { label: agents[agentName].label, cliVersion, ...settings };
  }
  const context = {
    runId,
    runDir,
    templateDir,
    createdAt: new Date().toISOString(),
    date: localDate(),
    conditionNames,
    multipleConditions: conditionNames.length > 1,
    envui: { version: pack.version, sha256: pack.sha256, tarball: pack.tarball },
    agents: agentInfo,
    timeoutMs: Number(options.timeout) * 60_000,
    settings: {
      tasks: tasks.map((task) => task.id),
      timeoutMinutes: Number(options.timeout),
      concurrency: Number(options.concurrency),
    },
  };
  // Interleave agents so parallel runs spread across both services.
  const jobs = [];
  for (const condition of selectedConditions)
    for (const task of options['dry-run'] ? tasks.slice(0, 1) : tasks)
      for (const agentName of agentNames) jobs.push({ task, agentName, condition });
  log(`run ${runId}: ${jobs.length} runs in ${runDir}`);
  await mkdir(runDir, { recursive: true });
  await writeJson(join(runDir, 'run.json'), {
    ...context,
    jobs: jobs.map((job) => ({
      task: job.task.id,
      agent: job.agentName,
      condition: job.condition.name,
    })),
  });
  const records = await pool(jobs, context.settings.concurrency, (job) => runJob(job, context));
  if (options['dry-run']) return;
  await writeJson(
    join(runDir, 'records.json'),
    records.map((record) => ({ ...record, scoreDetail: undefined })),
  );
  const results = await writeResults(context, records);
  for (const group of results.aggregates)
    log(
      `${group.condition} / ${group.agent}: mean score ${group.score.mean} over ${group.runs} runs`,
    );
}

/** Recomputes every score of an earlier run from its workspaces, for example after a scorer change. */
async function rescore() {
  if (!options['run-id']) throw new Error('rescore needs --run-id');
  const runDir = join(workdir, options['run-id']);
  const context = JSON.parse(await readFile(join(runDir, 'run.json'), 'utf8'));
  const records = JSON.parse(await readFile(join(runDir, 'records.json'), 'utf8'));
  for (const record of records) {
    if (!record.baseCommit) continue;
    const task = allTasks.find((candidate) => candidate.id === record.task);
    const agent = agents[record.agent];
    record.agentReport = agent.parse(join(record.logDir, 'transcript.jsonl'), {
      lastMessageFile: join(record.logDir, 'last-message.txt'),
    });
    record.agentReport.model ??= context.agents[record.agent]?.model;
    await scoreInto(record, task);
    log(`rescored ${record.agent}-${record.task}: ${record.scoreDetail.score}`);
  }
  await writeJson(
    join(runDir, 'records.json'),
    records.map((record) => ({ ...record, scoreDetail: undefined })),
  );
  await writeResults({ ...context, runDir }, records);
}

main().catch((error) => {
  console.error(error?.stack ?? error);
  process.exit(1);
});
