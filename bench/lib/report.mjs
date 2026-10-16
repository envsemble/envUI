import { scoring } from './score.mjs';

const mean = (values) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0);
const median = (values) => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};
const round = (value, digits = 1) => Math.round(value * 10 ** digits) / 10 ** digits;
const minutes = (ms) => `${round(ms / 60000, 1)} min`;
const thousands = (value) => `${round(value / 1000, 0).toLocaleString('en-US')}k`;

/** Reduces a full score to what results.json keeps per run. */
export function compactRun(run) {
  const score = run.scoreDetail;
  const rawByKey = {};
  for (const entry of score?.rawHtml.occurrences ?? [])
    rawByKey[entry.key] = (rawByKey[entry.key] ?? 0) + 1;
  return {
    task: run.task,
    agent: run.agent,
    condition: run.condition,
    status: run.status,
    exitCode: run.exitCode,
    timedOut: run.timedOut,
    durationMs: run.durationMs,
    agentReport: run.agentReport,
    harnessError: run.harnessError,
    score: score?.score ?? 0,
    parts: score?.parts,
    files: score?.files,
    typecheck: score && {
      passed: score.typecheck.passed,
      errorCount: score.typecheck.errorCount,
      errors: score.typecheck.errors
        .slice(0, 10)
        .map(({ code, file, line, message }) => ({ code, file, line, message })),
    },
    coverage: score?.coverage,
    envui: score?.envui,
    rawHtml: score && {
      weighted: score.rawHtml.weighted,
      count: score.rawHtml.count,
      byKey: rawByKey,
      occurrences: score.rawHtml.occurrences
        .slice(0, 25)
        .map((entry) => `${entry.file}:${entry.line} ${entry.key}`),
    },
    duplicates: score?.duplicates,
    envuiErrors: score?.envuiErrors.map(({ code, kind, component, file, line, message }) => ({
      code,
      kind,
      component,
      file,
      line,
      message,
    })),
    styles: score && {
      total: score.styles.total,
      cssColors: score.styles.css.colors,
      cssPx: score.styles.css.px,
      cssPrivateClasses: score.styles.css.privateClasses,
      cssLinesAdded: score.styles.css.linesAdded,
      inlineColors: score.styles.inline.colors,
      inlinePx: score.styles.inline.px,
      privateClassNames: score.styles.privateClassNames,
      samples: [...score.styles.css.samples, ...score.styles.inline.samples].slice(0, 8),
    },
    dependencies: score?.dependencies,
  };
}

export function aggregate(runs) {
  const groups = new Map();
  for (const run of runs) {
    const key = `${run.condition}\u0000${run.agent}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(run);
  }
  return [...groups.entries()].map(([key, group]) => {
    const [condition, agent] = key.split('\u0000');
    const scores = group.map((run) => run.score);
    const count = (predicate) => group.filter(predicate).length;
    const sum = (select) => group.reduce((total, run) => total + (select(run) ?? 0), 0);
    const costs = group
      .map((run) => run.agentReport?.costUsd)
      .filter((cost) => typeof cost === 'number');
    const rawRuns = {};
    for (const run of group)
      for (const name of Object.keys(run.rawHtml?.byKey ?? {}))
        rawRuns[name] = (rawRuns[name] ?? 0) + 1;
    return {
      condition,
      agent,
      runs: group.length,
      statuses: Object.fromEntries(
        ['completed', 'timeout', 'agent-error', 'no-output', 'harness-error'].map((status) => [
          status,
          count((run) => run.status === status),
        ]),
      ),
      score: {
        mean: round(mean(scores)),
        median: round(median(scores)),
        min: Math.min(...scores),
        max: Math.max(...scores),
      },
      typecheckPassRate: round(count((run) => run.typecheck?.passed) / group.length, 2),
      coverageMean: round(mean(group.map((run) => run.coverage?.ratio ?? 0)), 2),
      capabilities: {
        covered: sum(
          (run) => run.coverage?.capabilities.filter((capability) => capability.covered).length,
        ),
        total: sum((run) => run.coverage?.capabilities.length),
      },
      newEnvuiExportsMean: round(mean(group.map((run) => run.envui?.newExportCount ?? 0))),
      readEnvuiDocs: count((run) => run.agentReport?.envuiLookups?.docs > 0),
      lookedInPackage: count((run) => run.agentReport?.envuiLookups?.any > 0),
      rawHtml: {
        runsWithAny: count((run) => (run.rawHtml?.count ?? 0) > 0),
        weightedTotal: round(sum((run) => run.rawHtml?.weighted)),
        runsByKind: rawRuns,
      },
      duplicates: {
        total: sum((run) => run.duplicates?.length),
        runsWithAny: count((run) => run.duplicates?.length > 0),
      },
      envuiErrors: {
        total: sum((run) => run.envuiErrors?.length),
        runsWithAny: count((run) => run.envuiErrors?.length > 0),
      },
      rawStyles: {
        total: sum((run) => run.styles?.total),
        runsWithAny: count((run) => (run.styles?.total ?? 0) > 0),
      },
      uiDependencies: group.flatMap((run) => run.dependencies?.ui ?? []),
      time: {
        totalMs: sum((run) => run.durationMs),
        meanMs: Math.round(mean(group.map((run) => run.durationMs ?? 0))),
      },
      costUsd: costs.length
        ? round(
            costs.reduce((a, b) => a + b, 0),
            2,
          )
        : null,
      tokens: {
        input: sum((run) => run.agentReport?.tokens?.input),
        cachedInput: sum((run) => run.agentReport?.tokens?.cachedInput),
        cacheWrite: sum((run) => run.agentReport?.tokens?.cacheWrite),
        output: sum((run) => run.agentReport?.tokens?.output),
      },
    };
  });
}

const cell = (value) =>
  String(value ?? '')
    .replaceAll('|', '\\|')
    .replaceAll('\n', ' ');

export function renderSummary(results, tasks) {
  const { aggregates, runs } = results;
  const agentNames = [...new Set(runs.map((run) => run.agent))];
  const lines = [];
  const push = (...items) => lines.push(...items);
  push(`# envUI agent benchmark: ${results.runId}`, '');
  push(
    `- Date: ${results.date ?? results.createdAt.slice(0, 10)}; condition${results.conditions.length > 1 ? 's' : ''}: ${results.conditions.map((name) => `\`${name}\``).join(', ')}`,
    `- envUI ${results.envui.version} from a packed tarball (sha256 ${results.envui.sha256.slice(0, 12)})`,
    ...Object.entries(results.agents).map(
      ([name, agent]) =>
        `- ${agent.label} (\`${name}\`): ${agent.cliVersion}, model \`${agent.model}\`, effort \`${agent.effort}\``,
    ),
    `- ${results.settings.tasks.length} tasks, one run per task and agent, ${results.settings.timeoutMinutes} min timeout, ${results.settings.concurrency} runs in parallel`,
    `- Transcripts and workspaces: \`${results.workdir}\` (not in git)`,
    '',
  );

  push('## Aggregates', '');
  push(
    '| Condition | Agent | Runs | Mean score | Median | Read envUI docs | Typecheck pass | Capabilities via envUI | Runs with raw HTML | Local duplicates | envUI type errors | Raw style values | UI deps added | Timeouts / errors | Time | Cost | Tokens in / cached / out |',
  );
  push('|---|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|');
  for (const group of aggregates)
    push(
      `| ${group.condition} | ${group.agent} | ${group.runs} | **${group.score.mean}** | ${group.score.median} | ${group.readEnvuiDocs}/${group.runs} | ${Math.round(group.typecheckPassRate * 100)}% | ${group.capabilities.covered}/${group.capabilities.total} | ${group.rawHtml.runsWithAny}/${group.runs} | ${group.duplicates.total} | ${group.envuiErrors.total} | ${group.rawStyles.total} | ${group.uiDependencies.length} | ${group.statuses.timeout} / ${group.statuses['agent-error'] + group.statuses['harness-error']} | ${minutes(group.time.totalMs)} | ${group.costUsd === null ? 'n/a' : `$${group.costUsd}`} | ${thousands(group.tokens.input + group.tokens.cachedInput + group.tokens.cacheWrite)} / ${thousands(group.tokens.cachedInput)} / ${thousands(group.tokens.output)} |`,
    );
  push('');

  push('## Runs', '');
  push(
    '| Task | Agent | Score | Read envUI docs | Typecheck | Capabilities via envUI | Raw HTML (weighted) | Duplicates | envUI errors | Raw styles | Time | Status |',
  );
  push('|---|---|--:|--:|---|---|--:|--:|--:|--:|--:|---|');
  for (const task of tasks)
    for (const run of runs.filter((candidate) => candidate.task === task.id)) {
      const covered =
        run.coverage?.capabilities.filter((capability) => capability.covered).length ?? 0;
      const total = run.coverage?.capabilities.length ?? task.capabilities.length;
      push(
        `| ${task.id} | ${run.agent} | **${run.score}** | ${run.agentReport?.envuiLookups?.docs ? 'yes' : 'no'} | ${run.typecheck ? (run.typecheck.passed ? 'pass' : `${run.typecheck.errorCount} errors`) : 'n/a'} | ${covered}/${total} | ${run.rawHtml?.weighted ?? 0} | ${run.duplicates?.length ?? 0} | ${run.envuiErrors?.length ?? 0} | ${run.styles?.total ?? 0} | ${minutes(run.durationMs ?? 0)} | ${run.status} |`,
      );
    }
  push('');

  push('## Failure modes', '');
  const weak = runs.filter((run) => run.score < 90);
  if (weak.length)
    push(
      `${weak.length} of ${runs.length} runs scored below 90; ${weak.filter((run) => run.agentReport?.envuiLookups?.docs > 0).length} of those read envUI's Markdown docs or skills, against ${runs.filter((run) => run.score >= 90 && run.agentReport?.envuiLookups?.docs > 0).length} of the ${runs.length - weak.length} others.`,
      '',
    );
  push('### Capabilities not built with envUI', '');
  push(`| Task | Capability | envUI provides | ${agentNames.join(' | ')} |`);
  push(`|---|---|---|${agentNames.map(() => '---').join('|')}|`);
  for (const task of tasks)
    for (const capability of task.capabilities) {
      const marks = agentNames.map((agent) => {
        const matching = runs.filter((run) => run.task === task.id && run.agent === agent);
        const missed = matching.filter(
          (run) => !run.coverage?.capabilities.find((entry) => entry.id === capability.id)?.covered,
        );
        return matching.length
          ? missed.length
            ? `missed ${missed.length}/${matching.length}`
            : 'ok'
          : '';
      });
      if (marks.some((mark) => mark.startsWith('missed')))
        push(
          `| ${task.id} | ${capability.label} | ${capability.envui.map((name) => `\`${name}\``).join(', ')} | ${marks.join(' | ')} |`,
        );
    }
  push('');

  push('### Raw HTML where envUI has a component (runs containing it)', '');
  const kinds = [...new Set(aggregates.flatMap((group) => Object.keys(group.rawHtml.runsByKind)))];
  kinds.sort((a, b) => sumKind(aggregates, b) - sumKind(aggregates, a));
  if (kinds.length) {
    push(
      `| Element | ${aggregates.map((group) => `${group.agent} (${group.condition})`).join(' | ')} |`,
    );
    push(`|---|${aggregates.map(() => '--:').join('|')}|`);
    for (const kind of kinds)
      push(
        `| \`${cell(kind)}\` | ${aggregates.map((group) => `${group.rawHtml.runsByKind[kind] ?? 0}/${group.runs}`).join(' | ')} |`,
      );
  } else push('None.');
  push('');

  push('### Local components that duplicate envUI', '');
  const duplicateRows = runs.flatMap((run) =>
    (run.duplicates ?? []).map((duplicate) => ({ run, duplicate })),
  );
  if (duplicateRows.length) {
    push('| Task | Agent | Component | Instead of |', '|---|---|---|---|');
    for (const { run, duplicate } of duplicateRows)
      push(
        `| ${run.task} | ${run.agent} | \`${duplicate.name}\` (${duplicate.file}:${duplicate.line}) | ${duplicate.envui.map((name) => `\`${name}\``).join(', ')} |`,
      );
  } else push('None.');
  push('');

  push('### Type errors on envUI (invented exports, props or members)', '');
  const errorRows = runs.flatMap((run) => (run.envuiErrors ?? []).map((error) => ({ run, error })));
  if (errorRows.length) {
    push('| Task | Agent | Kind | Where | Message |', '|---|---|---|---|---|');
    for (const { run, error } of errorRows)
      push(
        `| ${run.task} | ${run.agent} | ${error.kind}${error.component ? ` (${cell(error.component)})` : ''} | ${error.file ?? ''}:${error.line ?? ''} | ${cell(error.message)} |`,
      );
  } else push('None.');
  push('');

  push('### Raw style values and added dependencies', '');
  const styleRows = runs.filter(
    (run) => (run.styles?.total ?? 0) > 0 || run.dependencies?.added.length,
  );
  if (styleRows.length) {
    push(
      '| Task | Agent | Raw colors | Raw px | `.env-*` overrides | Added dependencies | Examples |',
      '|---|---|--:|--:|--:|---|---|',
    );
    for (const run of styleRows)
      push(
        `| ${run.task} | ${run.agent} | ${run.styles.cssColors + run.styles.inlineColors} | ${run.styles.cssPx + run.styles.inlinePx} | ${run.styles.cssPrivateClasses + run.styles.privateClassNames} | ${(run.dependencies?.added ?? []).map((name) => `\`${name}\``).join(', ')} | ${cell(run.styles.samples.slice(0, 3).join('; '))} |`,
      );
  } else push('None.');
  push('');

  const failed = runs.filter((run) => run.status !== 'completed');
  if (failed.length) {
    push('### Runs that did not complete', '');
    for (const run of failed)
      push(
        `- ${run.task} / ${run.agent}: ${run.status}${run.harnessError ? ` (${cell(run.harnessError)})` : ''}${run.agentReport?.errors?.length ? ` (${cell(run.agentReport.errors[0])})` : ''}`,
      );
    push('');
  }

  push('## Scoring', '');
  push(
    `Per run, over the files the agent created or changed (counts in a changed file are relative to its base version): typecheck passes ${scoring.typecheck.max}; task capabilities built with envUI ${scoring.coverage.max} × covered share; raw HTML ${scoring.rawHtml.max} − ${scoring.rawHtml.cost} per weighted element; local duplicates of envUI ${scoring.duplicates.max} − ${scoring.duplicates.cost} each; type errors on envUI ${scoring.envuiErrors.max} − ${scoring.envuiErrors.cost} each; raw colors, px and \`.env-*\` overrides ${scoring.rawStyles.max} − ${scoring.rawStyles.cost} each; −${scoring.uiLibraryPenalty} per third-party UI package added. Parts never go below zero; a run that changed no source scores 0. See bench/README.md.`,
    '',
  );
  return `${lines.join('\n')}\n`;
}

function sumKind(aggregates, kind) {
  return aggregates.reduce((total, group) => total + (group.rawHtml.runsByKind[kind] ?? 0), 0);
}
