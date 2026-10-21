// `envui mcp`: a Model Context Protocol server over stdio that answers from the installed package's
// manifest.json and docs/, so it always describes the version the project has installed.
//
// It is a small JSON-RPC 2.0 server written against the MCP specification rather than built on the
// official SDK: it only offers tools, reads local files and needs nothing beyond Node, while the SDK
// would add some 90 packages (an HTTP server, auth and schema libraries) to every application that
// installs envUI. Messages are one JSON object per line on stdin and stdout; logs go to stderr.
import { existsSync, readFileSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { createInterface } from 'node:readline';
import {
  findComponent,
  findPage,
  loadManifest,
  packageRoot,
  plan,
  search,
  suggestions,
  summarize,
  terms,
  exportOf,
  exportsOf,
} from './catalog.mjs';

/** Protocol versions this server speaks, newest first. */
export const protocolVersions = ['2025-11-25', '2025-06-18', '2025-03-26', '2024-11-05'];

const readOnly = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
};
const string = (description) => ({ type: 'string', description });
const object = (properties, required = []) => ({
  type: 'object',
  properties,
  ...(required.length && { required }),
  additionalProperties: false,
});

const searchKinds = ['component', 'export', 'pattern', 'template', 'foundation', 'guide', 'token'];

/** The tools, with their JSON Schemas and what each returns. */
export const tools = [
  {
    name: 'search',
    title: 'Search envUI',
    description:
      'Search envUI components, patterns, templates, foundations, guides and tokens by what they do or what people call them, such as "sidebar toggle", "modal" or "muted text". Search before writing any UI element.',
    inputSchema: object(
      {
        query: string('What you need, in your own words.'),
        kind: { type: 'string', enum: searchKinds, description: 'Only this kind of result.' },
        limit: {
          type: 'integer',
          minimum: 1,
          maximum: 50,
          description: 'At most this many; 10 by default.',
        },
      },
      ['query'],
    ),
  },
  {
    name: 'list_components',
    title: 'List envUI components',
    description:
      'Every envUI component page with its exports, import path, status and one-line summary, optionally in one category.',
    inputSchema: object({
      category: string('Only this category, such as "Forms & selection".'),
      status: { type: 'string', enum: ['experimental', 'beta', 'stable', 'deprecated'] },
    }),
  },
  {
    name: 'get_component',
    title: 'Get an envUI component',
    description:
      "A component's summary, aliases, when to use it and what to use instead, its exports with their import paths, its examples, its parts (the part classes and state attributes CSS may target, each with what it is) and related pages. Accepts a component, an export such as IconButton or Menu.Item, a page name or an alias. Set docs to true for the whole page as Markdown.",
    inputSchema: object(
      {
        name: string('A component, export, part, page name or alias.'),
        docs: {
          type: 'boolean',
          description:
            "Include the page's Markdown: guidelines, accessibility, examples and props.",
        },
      },
      ['name'],
    ),
  },
  {
    name: 'get_props',
    title: 'Get the props of an envUI export',
    description:
      'The props of an export or part, such as Button or Menu.Item: type, default, whether required and what each does, from the TypeScript declarations. A page name returns the props of every export on it.',
    inputSchema: object({ name: string('An export, part or page name.') }, ['name']),
  },
  {
    name: 'get_example',
    title: 'Get an envUI example',
    description:
      "The source of an example: a small component an application can copy. Without an example name, lists the examples of a component, pattern, template, export or alias, with what each shows; a template's screens are listed too.",
    inputSchema: object(
      {
        component: string('A component, pattern, template, export, page name or alias.'),
        example: string('The example file name, such as ConfirmDelete; leave out to list them.'),
      },
      ['component'],
    ),
  },
  {
    name: 'list_patterns',
    title: 'List envUI patterns',
    description:
      'Patterns: guidance for a recurring need, such as forms, empty states, loading or destructive actions, that combines components; each with its intent, summary, status and the exports it composes.',
    inputSchema: object({
      intent: string(
        'Only patterns of this intent, such as "Keep people informed"; the result lists the intents.',
      ),
    }),
  },
  {
    name: 'get_pattern',
    title: 'Get an envUI pattern',
    description:
      'A pattern: its summary, when to use it and what to use or read instead, what it composes, its examples and related pages. Accepts a name, title or alias. Set docs to true for the whole page as Markdown, with the examples inline.',
    inputSchema: object(
      {
        name: string('A pattern name, title or alias, such as loading.'),
        docs: { type: 'boolean', description: "Include the page's Markdown." },
      },
      ['name'],
    ),
  },
  {
    name: 'list_templates',
    title: 'List envUI templates',
    description:
      'Templates: whole screens, such as a settings page or a sign-in page, built from envUI as source to copy and edit; each with whether it renders inside the app frame and its files.',
    inputSchema: object({}),
  },
  {
    name: 'get_template',
    title: 'Get an envUI template',
    description:
      'A template: its summary, when to use it, what it composes and its files. With file, the source of one of its screens or examples, to copy into the application and edit. Set docs to true for the whole page as Markdown.',
    inputSchema: object(
      {
        name: string('A template name, title or alias, such as settings-page.'),
        file: string('A file name or title of the template, such as SettingsPage.'),
        docs: { type: 'boolean', description: "Include the page's Markdown." },
      },
      ['name'],
    ),
  },
  {
    name: 'get_tokens',
    title: 'Get envUI tokens',
    description:
      'Design tokens with their CSS custom property and values per theme and scale. Filter by words ("danger text", "spacing"), by a name prefix ("color.fg") or by type. Style application CSS with these, never raw colors or pixel sizes.',
    inputSchema: object({
      query: string('Words to search the tokens for.'),
      prefix: string('A token name prefix, such as color.fg, space or radius.'),
      type: string('A token type, such as color, dimension, shadow or typography.'),
      legacy: {
        type: 'boolean',
        description:
          'List the names before 1.0, of 0.x and without the --env- prefix, and what replaces each instead.',
      },
      limit: {
        type: 'integer',
        minimum: 1,
        maximum: 400,
        description: 'At most this many; 60 by default.',
      },
    }),
  },
  {
    name: 'plan',
    title: 'Find envUI candidates for a UI',
    description:
      'Candidates for a description of a screen or feature: for each part, the envUI component whose names, aliases or description match it, with the words that matched; matching patterns and templates; tokens it names; the parts nothing matched; and words left out as content. The candidates come from matching words, not understanding: confirm each with get_component and get_props, and search for the uncovered parts. Not an import list.',
    inputSchema: object(
      {
        description: string(
          'The UI to build, such as "a settings page with a form and a save button".',
        ),
      },
      ['description'],
    ),
  },
].map((tool) => ({ ...tool, annotations: { title: tool.title, ...readOnly } }));

class ToolError extends Error {}

/** A page's Markdown, which a tool returns as a content item of its own rather than inside JSON. */
const markdownContent = Symbol('markdown');

const requireString = (args, key) => {
  const value = args[key];
  if (typeof value !== 'string' || !value.trim())
    throw new ToolError(`"${key}" must be a non-empty string.`);
  return value.trim();
};

function componentOrError(manifest, name) {
  const found = findComponent(manifest, name);
  if (found) return found;
  const exported = exportOf(manifest, name);
  if (exported) return { exported };
  const close = suggestions(manifest, name);
  throw new ToolError(
    `envUI has no component, export or alias "${name}".${close.length ? ` Closest: ${close.join(', ')}.` : ''} Try search.`,
  );
}

/** A pattern or template page by name, title or alias, or a ToolError that lists them. */
function pageOrError(manifest, kind, name) {
  const found = findPage(manifest, kind, name);
  if (found) return found;
  const pages = manifest[`${kind}s`];
  throw new ToolError(
    pages.length
      ? `envUI has no ${kind} "${name}". Its ${kind}s: ${pages.map((page) => page.name).join(', ')}.`
      : `This version of envUI has no ${kind}s yet. Try search or plan.`,
  );
}

/**
 * The page whose examples get_example lists: a pattern or template by its own name or title, else
 * a component page by name, export or alias, else a pattern or template by alias.
 */
function exampleOwner(manifest, name) {
  const ofPage = (kind, page) => ({
    name: page.name,
    kind,
    examples: [...(page.files ?? []), ...(page.examples ?? [])],
  });
  for (const kind of ['pattern', 'template']) {
    const found = findPage(manifest, kind, name);
    if (found && !found.requested) return ofPage(kind, found.page);
  }
  const component = findComponent(manifest, name);
  if (component) return { name: component.component.name, examples: component.component.examples };
  for (const kind of ['pattern', 'template']) {
    const found = findPage(manifest, kind, name);
    if (found) return ofPage(kind, found.page);
  }
  const { exported } = componentOrError(manifest, name);
  if (exported) throw new ToolError(`${name} has no component page with examples.`);
  return undefined;
}

/** A file of a list by its name or title, in any case. */
const fileOf = (files, wanted) =>
  files.find(
    (item) =>
      item.name.toLowerCase() === wanted.toLowerCase() ||
      item.title.toLowerCase() === wanted.toLowerCase(),
  );

/** Reads a file of the package by a path the manifest gave, never outside the package. */
function readPackageFile(root, path) {
  const file = resolve(root, path);
  if (!file.startsWith(resolve(root) + sep) || !existsSync(file))
    throw new ToolError(`${path} is not in the installed package.`);
  return readFileSync(file, 'utf8');
}

/** Runs a tool; returns what it found, or throws a ToolError for the caller to read. */
export function callTool(context, name, args = {}) {
  const { manifest, root } = context;
  switch (name) {
    case 'search': {
      const query = requireString(args, 'query');
      if (args.kind !== undefined && !searchKinds.includes(args.kind))
        throw new ToolError(`"kind" must be one of ${searchKinds.join(', ')}.`);
      const results = search(manifest, query, {
        kinds: args.kind ? [args.kind] : undefined,
        limit: Number.isInteger(args.limit) ? Math.min(Math.max(args.limit, 1), 50) : 10,
      });
      return {
        query,
        results,
        ...(!results.length && {
          note: 'Nothing matched. Try other words, or list_components. If envUI lacks it, propose an addition rather than a local copy.',
        }),
      };
    }
    case 'list_components': {
      for (const key of ['category', 'status'])
        if (args[key] !== undefined && typeof args[key] !== 'string')
          throw new ToolError(`"${key}" must be a string.`);
      if (
        args.category !== undefined &&
        !manifest.categories.some(
          (category) => category.toLowerCase() === args.category.toLowerCase(),
        )
      )
        throw new ToolError(`"category" must be one of ${manifest.categories.join(', ')}.`);
      const components = manifest.components.filter(
        (component) =>
          (!args.category ||
            component.category.toLowerCase() === String(args.category).toLowerCase()) &&
          (!args.status || component.status === args.status),
      );
      return {
        categories: manifest.categories,
        components: components.map((component) => ({
          ...summarize(manifest, 'component', component),
          category: component.category,
        })),
      };
    }
    case 'get_component': {
      const found = componentOrError(manifest, requireString(args, 'name'));
      const brief = ({ props, native: _native, ...rest }) => ({
        ...rest,
        ...(props && { props: props.map((prop) => prop.name) }),
      });
      if (found.exported) {
        const { exported } = found;
        const result = {
          ...brief(exported),
          note: exported.doc
            ? `This export has no component page; ${exported.doc} documents it. get_props gives its props.`
            : 'This export has no page; get_props gives its props.',
        };
        if (args.docs && exported.doc)
          result[markdownContent] = readPackageFile(root, exported.doc);
        return result;
      }
      const { component, entry } = found;
      const result = {
        ...component,
        ...(entry && entry.name !== component.name && { requested: entry.name }),
        exports: exportsOf(manifest, component).map(brief),
      };
      if (args.docs) result[markdownContent] = readPackageFile(root, component.doc);
      return result;
    }
    case 'get_props': {
      const requested = requireString(args, 'name');
      // A guide or foundation page, such as setup, gives the props of every export it documents.
      const page = [...manifest.guides, ...manifest.foundations].find(
        (item) => item.name === requested.toLowerCase() && !findComponent(manifest, requested),
      );
      if (page)
        return {
          page: page.name,
          exports: (page.exports ?? [])
            .map((name) => exportOf(manifest, name))
            .filter(Boolean)
            .map(propsOf),
        };
      const found = componentOrError(manifest, requested);
      if (found.exported) return { page: found.exported.page, exports: [propsOf(found.exported)] };
      const { component, entry } = found;
      const entries =
        entry && normalizeName(entry.name) === normalizeName(requested)
          ? [entry]
          : exportsOf(manifest, component);
      return { page: component.name, exports: entries.map(propsOf) };
    }
    case 'get_example': {
      const owner = exampleOwner(manifest, requireString(args, 'component'));
      const named = { component: owner.name, ...(owner.kind && { kind: owner.kind }) };
      if (args.example === undefined || args.example === '')
        return {
          ...named,
          examples: owner.examples.map(({ name: exampleName, title, description }) => ({
            name: exampleName,
            title,
            description,
          })),
        };
      const example = fileOf(owner.examples, requireString(args, 'example'));
      if (!example)
        throw new ToolError(
          `${owner.name} has no example "${args.example}". Its examples: ${owner.examples.map((item) => item.name).join(', ')}.`,
        );
      return { ...named, ...example, source: readPackageFile(root, example.file) };
    }
    case 'list_patterns': {
      if (args.intent !== undefined && typeof args.intent !== 'string')
        throw new ToolError('"intent" must be a string.');
      const intents = manifest.intents ?? [];
      const intent = args.intent?.trim()
        ? intents.find((item) => item.toLowerCase() === args.intent.trim().toLowerCase())
        : undefined;
      if (args.intent?.trim() && !intent)
        throw new ToolError(
          intents.length
            ? `"intent" must be one of ${intents.join(', ')}.`
            : 'This version of envUI has no patterns yet, so no intents to choose from. Try search or plan.',
        );
      const patterns = manifest.patterns.filter((page) => !intent || page.intent === intent);
      return {
        intents,
        patterns: patterns.map((page) => summarize(manifest, 'pattern', page)),
        ...(!manifest.patterns.length && { note: 'This version has no patterns yet.' }),
      };
    }
    case 'get_pattern': {
      const { page, requested } = pageOrError(manifest, 'pattern', requireString(args, 'name'));
      const result = { ...page, ...(requested && { requested }) };
      if (args.docs) result[markdownContent] = readPackageFile(root, page.doc);
      return result;
    }
    case 'list_templates':
      return {
        templates: manifest.templates.map((page) => summarize(manifest, 'template', page)),
        ...(!manifest.templates.length && {
          note: 'This version has no templates yet. Use plan to choose components for a page.',
        }),
      };
    case 'get_template': {
      const { page, requested } = pageOrError(manifest, 'template', requireString(args, 'name'));
      if (args.file === undefined || args.file === '') {
        const result = { ...page, ...(requested && { requested }) };
        if (args.docs) result[markdownContent] = readPackageFile(root, page.doc);
        return result;
      }
      const files = [...(page.files ?? []), ...(page.examples ?? [])];
      const file = fileOf(files, requireString(args, 'file'));
      if (!file)
        throw new ToolError(
          `${page.name} has no file "${args.file}". Its files: ${files.map((item) => item.name).join(', ')}.`,
        );
      const result = {
        template: page.name,
        ...(requested && { requested }),
        name: file.name,
        title: file.title,
        description: file.description,
        ...(file.frame && { frame: file.frame }),
        file: file.file,
        source: readPackageFile(root, file.file),
        ...(file.frame === 'app' && {
          note: 'Renders inside AppShell.Main. Start the frame from get_template app-frame.',
        }),
      };
      if (args.docs) result[markdownContent] = readPackageFile(root, page.doc);
      return result;
    }
    case 'get_tokens': {
      const { tokens } = manifest;
      const limit = Number.isInteger(args.limit) ? Math.min(Math.max(args.limit, 1), 400) : 60;
      if (args.legacy) {
        const wanted = typeof args.query === 'string' ? terms(args.query) : [];
        // A name before 1.0, such as --color-canvas, also matches the prefix color.canvas.
        const prefix = args.prefix
          ? `--${String(args.prefix).replace(/^--/, '').replaceAll('.', '-')}`
          : '';
        const legacy = tokens.legacy.filter(
          (token) =>
            (!prefix || token.cssVariable.startsWith(prefix)) &&
            (!args.type || token.type === args.type) &&
            (!wanted.length ||
              wanted.some((term) =>
                terms(`${token.cssVariable} ${token.use ?? ''}`).includes(term),
              )),
        );
        return { total: legacy.length, legacy: legacy.slice(0, limit) };
      }
      let items = tokens.items;
      if (args.prefix) items = items.filter((token) => token.id.startsWith(String(args.prefix)));
      if (args.type) items = items.filter((token) => token.type === args.type);
      if (typeof args.query === 'string' && args.query.trim()) {
        const order = search(manifest, args.query, { kinds: ['token'], limit: 400 }).map(
          (hit) => hit.name,
        );
        items = order.map((id) => items.find((token) => token.id === id)).filter(Boolean);
      }
      return {
        themes: tokens.themes,
        scales: tokens.scales,
        usage: tokens.usage,
        total: items.length,
        tokens: items.slice(0, limit),
      };
    }
    case 'plan':
      return plan(manifest, requireString(args, 'description'));
    default:
      return undefined;
  }
}

const normalizeName = (name) => String(name).toLowerCase();

/** An export's props, signature or parts, as get_props returns them. */
function propsOf({
  name,
  kind,
  import: from,
  status,
  description,
  props,
  native,
  signature,
  parts,
}) {
  return {
    name,
    kind,
    import: from,
    // A beta export on a stable page, such as MarkdownEditor, says so where its props are read.
    ...(status && { status }),
    description,
    ...(props && { props }),
    ...(native?.length && {
      native: `Also accepts the native props of ${native.map((tag) => (tag === 'element' ? 'an HTML element' : `<${tag}>`)).join(' or ')}.`,
    }),
    ...(signature && { signature }),
    ...(parts && { parts }),
  };
}

/** A JSON-RPC server for one connection: hand it a parsed message, get the response or nothing. */
export function createServer({
  root = packageRoot,
  manifest = loadManifest(root),
  log = () => {},
} = {}) {
  const version = manifest.version ?? JSON.parse(readPackageFile(root, 'package.json')).version;
  const context = { manifest, root };
  const instructions = `envUI ${version} (${manifest.package}). ${manifest.rule} Use plan for candidates for a screen or feature and search to find a component, then get_component and get_props to confirm one before using it, and get_example for code to start from. Use list_templates and get_template for whole screens, and list_patterns and get_pattern for recurring needs such as forms, empty states or destructive actions. Use only exports these tools confirm exist.`;
  const result = (id, value) => ({ jsonrpc: '2.0', id, result: value });
  const error = (id, code, message) => ({ jsonrpc: '2.0', id, error: { code, message } });

  function handle(message) {
    const valid = message && typeof message === 'object' && message.jsonrpc === '2.0';
    if (valid && message.method === undefined && ('result' in message || 'error' in message))
      return undefined; // A response; this server sends no requests.
    if (!valid || typeof message.method !== 'string')
      return error(message?.id ?? null, -32600, 'Invalid request.');
    const { id, method } = message;
    const params =
      message.params && typeof message.params === 'object' && !Array.isArray(message.params)
        ? message.params
        : {};
    const notification = !('id' in message);
    if (notification) return undefined;
    switch (method) {
      case 'initialize': {
        const requested = params.protocolVersion;
        return result(id, {
          protocolVersion: protocolVersions.includes(requested) ? requested : protocolVersions[0],
          capabilities: { tools: { listChanged: false } },
          serverInfo: { name: 'envui', title: 'envUI', version },
          instructions,
        });
      }
      case 'ping':
        return result(id, {});
      case 'tools/list':
        return result(id, { tools });
      case 'tools/call': {
        const { name } = params;
        if (!tools.some((tool) => tool.name === name))
          return error(id, -32602, `Unknown tool: ${name}`);
        const args = params.arguments ?? {};
        if (typeof args !== 'object' || Array.isArray(args))
          return error(id, -32602, 'Tool arguments must be an object.');
        try {
          const value = callTool(context, name, args);
          const content = [{ type: 'text', text: JSON.stringify(value) }];
          if (value?.[markdownContent])
            content.push({ type: 'text', text: value[markdownContent] });
          return result(id, { content });
        } catch (caught) {
          if (!(caught instanceof ToolError)) log(caught.stack ?? String(caught));
          return result(id, {
            content: [
              {
                type: 'text',
                text:
                  caught instanceof ToolError
                    ? caught.message
                    : `envUI tool failed: ${caught.message}`,
              },
            ],
            isError: true,
          });
        }
      }
      default:
        return error(id, -32601, `Method not found: ${method}`);
    }
  }

  /** One line of input: a message or a batch, answered with a line or nothing. */
  function handleLine(line) {
    if (!line.trim()) return undefined;
    let message;
    try {
      // A byte order mark, from a pipe that adds one, is not part of the JSON.
      message = JSON.parse(line.replace(/^\uFEFF/, ''));
    } catch {
      return error(null, -32700, 'Parse error.');
    }
    if (Array.isArray(message)) {
      if (!message.length) return error(null, -32600, 'Invalid request: an empty batch.');
      const responses = message.map(safely).filter(Boolean);
      return responses.length ? responses : undefined;
    }
    return safely(message);
  }

  /** Answers a message, or an internal error for one the server failed on, and keeps serving. */
  function safely(message) {
    try {
      return handle(message);
    } catch (caught) {
      log(caught?.stack ?? String(caught));
      const id = message && typeof message === 'object' && 'id' in message ? message.id : null;
      return error(id ?? null, -32603, 'Internal error.');
    }
  }

  return { handle: safely, handleLine, version };
}

export function runMcp({ input = process.stdin, output = process.stdout } = {}) {
  const log = (text) => process.stderr.write(`envui mcp: ${text}\n`);
  const server = createServer({ log });
  log(`serving envUI ${server.version} over stdio`);
  const lines = createInterface({ input, crlfDelay: Infinity });
  lines.on('line', (line) => {
    const response = server.handleLine(line);
    if (response) output.write(`${JSON.stringify(response)}\n`);
  });
  return new Promise((resolveClosed) => lines.on('close', resolveClosed));
}
