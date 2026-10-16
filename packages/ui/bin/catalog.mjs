// Reads the installed package's manifest.json and answers questions about it: lookups by name or
// alias, ranked search, and plans that map a description of an interface to components, patterns
// and tokens. The ranking is plain term matching with weights per field; no model is involved.
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/** The installed package: the folder above bin/. */
export const packageRoot = fileURLToPath(new URL('../', import.meta.url));

export function loadManifest(root = packageRoot) {
  const file = resolve(root, 'manifest.json');
  if (!existsSync(file))
    throw new Error(
      `${file} is missing. It ships in the published package; in an envUI checkout, run npm run build:library first.`,
    );
  return JSON.parse(readFileSync(file, 'utf8'));
}

const stopWords = new Set(
  `a an and are as at be but by can do does for from has have how i if in into is it its me my need
  needs of on or our please should so some such that the their them then there these this those to
  use uses using want wants we when where which while who will with without would you your`.split(
    /\s+/,
  ),
);

/** A word reduced to a rough stem, so "rows", "toggles" and "sorting" meet "row", "toggle" and "sort". */
function stem(word) {
  if (word.length > 4 && word.endsWith('ies')) return `${word.slice(0, -3)}y`;
  if (word.length > 5 && /(?:ches|shes|sses|xes)$/.test(word)) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith('s') && !/(?:ss|us|is)$/.test(word))
    return word.slice(0, -1);
  if (word.length > 5 && word.endsWith('ing')) return word.slice(0, -3);
  if (word.length > 4 && word.endsWith('ed')) return word.slice(0, -2);
  return word;
}

/** The searchable terms of a text: camelCase split, lowercased, stop words dropped, stemmed. */
export function terms(text) {
  return String(text ?? '')
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .split(/[^a-z\d]+/)
    .filter((word) => word && !stopWords.has(word))
    .map(stem);
}

const phrase = (text) => terms(text).join(' ');

/** Everyday words for the segments of token names, so "error text color" finds color.fg.danger. */
const tokenWords = {
  fg: 'text foreground icon',
  bg: 'background surface fill',
  border: 'outline stroke divider',
  danger: 'error destructive critical',
  success: 'ok positive',
  warning: 'caution',
  space: 'spacing gap padding margin',
  radius: 'corner rounded',
  elevation: 'shadow depth',
  motion: 'animation transition',
  font: 'text typography',
  type: 'typography text',
};

/** Words of a description that ask for a style, such as "error", "spacing" or "muted text". */
const styleVocabulary = new Set(
  [
    ...Object.keys(tokenWords),
    ...Object.values(tokenWords),
    'color colour muted accent brand neutral info selected focus disabled shape size height',
  ].flatMap(terms),
);
const styleTerms = (text) => terms(text).filter((term) => styleVocabulary.has(term));

/** Field weights: a match on a name counts most, then aliases, then the prose. */
const weights = { name: 8, alias: 5, summary: 2, use: 1.5, text: 1 };

function searchDocuments(manifest) {
  const documents = [];
  const avoidFor = new Map();
  for (const component of manifest.components)
    for (const avoid of component.avoidWhen)
      if (avoid.use) avoidFor.set(avoid.use, [...(avoidFor.get(avoid.use) ?? []), avoid.text]);
  for (const component of manifest.components) {
    const names = [component.name, ...component.exports.map((item) => item.name)];
    documents.push({
      kind: 'component',
      item: component,
      names: names.map(phrase),
      aliases: component.aliases.map(phrase),
      fields: {
        name: names.flatMap(terms),
        alias: component.aliases.flatMap(terms),
        summary: terms(component.summary),
        use: [
          ...component.useWhen.flatMap(terms),
          // A situation another page sends here, such as "a destination inside running text".
          ...names.flatMap((name) => avoidFor.get(name) ?? []).flatMap(terms),
        ],
        text: component.exports.flatMap((item) => terms(item.description)),
      },
    });
  }
  for (const kind of ['pattern', 'template', 'foundation', 'guide']) {
    for (const page of manifest[`${kind}s`] ?? [])
      documents.push({
        kind,
        item: page,
        names: [phrase(page.title), phrase(page.name)],
        aliases: (page.aliases ?? []).map(phrase),
        fields: {
          name: [...terms(page.title), ...terms(page.name)],
          alias: (page.aliases ?? []).flatMap(terms),
          summary: terms(page.summary),
          use: [],
          text: (page.exports ?? []).flatMap(terms),
        },
      });
  }
  for (const token of manifest.tokens.items) {
    const segments = token.id.split(/[.-]/);
    documents.push({
      kind: 'token',
      item: token,
      names: [phrase(token.id)],
      aliases: [],
      fields: {
        name: terms(token.id),
        alias: segments.flatMap((segment) => terms(tokenWords[segment])),
        summary: terms(token.description),
        use: [],
        text: [],
      },
    });
  }
  return documents;
}

const cache = new WeakMap();
function indexOf(manifest) {
  if (!cache.has(manifest)) {
    const documents = searchDocuments(manifest);
    const frequency = new Map();
    for (const document of documents)
      for (const term of new Set(Object.values(document.fields).flat()))
        frequency.set(term, (frequency.get(term) ?? 0) + 1);
    cache.set(manifest, { documents, frequency });
  }
  return cache.get(manifest);
}

/** Tokens rank below components and pages in a mixed search; there are many and they are terse. */
const kindFactor = {
  component: 1,
  pattern: 1,
  template: 1,
  foundation: 0.7,
  guide: 0.6,
  token: 0.5,
};

/**
 * Ranked matches for a query. Each query term scores the best field it appears in, weighted by
 * how rare it is; a query that names an export, a page or a whole alias scores far more. `strength`
 * is the weight of the strongest field matched, so a match on prose alone can be told apart.
 */
function rank(manifest, query, { kinds, limit = 10 } = {}) {
  const { documents, frequency } = indexOf(manifest);
  const queryTerms = [...new Set(terms(query))];
  const queryPhrase = ` ${phrase(query)} `;
  if (!queryTerms.length) return [];
  const total = documents.length;
  const results = [];
  for (const document of documents) {
    if (kinds && !kinds.includes(document.kind)) continue;
    let score = 0;
    let strength = 0;
    const matched = [];
    for (const term of queryTerms) {
      let best = 0;
      for (const [field, values] of Object.entries(document.fields))
        if (values.includes(term)) best = Math.max(best, weights[field]);
      if (!best) continue;
      score += best * Math.log(1 + total / (frequency.get(term) ?? 1));
      strength = Math.max(strength, best);
      matched.push(term);
    }
    if (!score) continue;
    let named = false;
    for (const name of document.names)
      if (name && queryPhrase.includes(` ${name} `)) {
        score += name.includes(' ') ? 30 : 20;
        named = true;
      }
    for (const alias of document.aliases)
      if (alias && queryPhrase.includes(` ${alias} `)) {
        score += alias.includes(' ') ? 30 : 8;
        named = true;
      }
    if (document.names.includes(queryPhrase.trim())) score += 50;
    score = Math.round(score * kindFactor[document.kind] * 10) / 10;
    results.push({ document, score, strength, matched, named, of: queryTerms.length });
  }
  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

/** Ranked matches for a query, in their short form with the score and the terms matched. */
export function search(manifest, query, options) {
  return rank(manifest, query, options).map(({ document, score, matched }) => ({
    kind: document.kind,
    ...summarize(document.kind, document.item),
    score,
    matched,
  }));
}

/** The short form of an item in lists and search results. */
export function summarize(kind, item) {
  if (kind === 'component')
    return {
      name: item.name,
      exports: topLevelExports(item).map((entry) => entry.name),
      import: topLevelExports(item)[0]?.import,
      summary: item.summary,
      status: item.status,
      doc: item.doc,
    };
  if (kind === 'token')
    return {
      name: item.id,
      cssVariable: item.cssVariable,
      type: item.type,
      ...(item.description && { summary: item.description }),
    };
  return { name: item.name, title: item.title, summary: item.summary, doc: item.doc };
}

/** A page's exports without the parts of its namespaces, which import through the namespace. */
export const topLevelExports = (component) =>
  component.exports.filter((entry) => !entry.name.includes('.'));

const normalize = (name) =>
  String(name ?? '')
    .toLowerCase()
    .replace(/[^a-z\d.]+/g, '');

/**
 * The component page for a name: a page title or file name, an export or part (`Menu.Item`), or
 * an alias. Returns the page and, when the name was an export, that export.
 */
export function findComponent(manifest, name) {
  const key = normalize(name);
  if (!key) return undefined;
  for (const component of manifest.components) {
    if (normalize(component.name) === key || normalize(component.page) === key)
      return { component, entry: component.exports.find((item) => item.name === component.name) };
    const entry = component.exports.find((item) => normalize(item.name) === key);
    if (entry) return { component, entry };
  }
  for (const component of manifest.components)
    if (component.aliases.some((alias) => normalize(alias) === key)) return { component };
  return undefined;
}

/** Close names for a miss, so a caller can correct itself. */
export function suggestions(manifest, name, limit = 5) {
  return search(manifest, name, { kinds: ['component'], limit }).map((hit) => hit.name);
}

/** Splits a description into the parts it asks for: sentences, list items and "with" clauses. */
function clauses(description) {
  return String(description)
    .split(/[\n.;:!?]+|,\s*|\s+(?:and|with|plus|then|also|including)\s+/i)
    .map((part) => part.replace(/^(?:and|with|or|plus|then)\s+/i, '').trim())
    .filter((part) => terms(part).length);
}

/** The export of a page that a part of a description names, or the page's own. */
function exportFor(component, part) {
  const wanted = new Set(terms(part));
  const candidates = topLevelExports(component).filter((entry) => entry.kind !== 'function');
  let best;
  let bestOverlap = 0;
  for (const entry of candidates) {
    const overlap = terms(entry.name).filter((term) => wanted.has(term)).length;
    if (overlap > bestOverlap) [best, bestOverlap] = [entry, overlap];
  }
  return best ?? candidates.find((entry) => entry.name === component.name) ?? candidates[0];
}

/**
 * A part counts as covered by a component that matched it on a name, an alias or a summary, and
 * either by a whole name or alias or on at least half of its terms: one shared word is not enough.
 */
const covers = (hit) =>
  hit &&
  hit.score >= 10 &&
  hit.strength >= weights.summary &&
  (hit.named || hit.matched.length * 2 >= hit.of);

/**
 * A plan for a UI description: the components that cover each part of it, the patterns and
 * templates that fit the whole, tokens it names, and the parts nothing in envUI matched.
 */
export function plan(manifest, description, { limit = 8 } = {}) {
  const chosen = new Map();
  const uncovered = [];
  const choose = (hit, part, score) => {
    const component = hit.document.item;
    const entry = chosen.get(component.name) ?? { component, score: 0, for: [], use: new Set() };
    entry.score += score;
    if (part) entry.for.push(part);
    const use = exportFor(component, part ?? '');
    if (use) entry.use.add(use.name);
    chosen.set(component.name, entry);
  };
  const parts = clauses(description);
  for (const part of parts) {
    const hits = rank(manifest, part, { kinds: ['component'], limit: 2 });
    if (!covers(hits[0])) {
      uncovered.push(part);
      continue;
    }
    choose(hits[0], part, hits[0].score);
    if (covers(hits[1]) && hits[1].score >= hits[0].score * 0.8)
      choose(hits[1], part, hits[1].score);
  }
  for (const hit of rank(manifest, description, { kinds: ['component'], limit: 3 }))
    if (!chosen.has(hit.document.item.name) && hit.score >= 40 && hit.strength >= weights.alias)
      choose(hit, undefined, hit.score);
  const components = [...chosen.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ component, for: covered, use }) => ({
      name: component.name,
      use: [...use],
      import: topLevelExports(component)[0]?.import,
      summary: component.summary,
      for: covered,
      avoidWhen: component.avoidWhen,
      examples: component.examples.map((example) => example.name),
      doc: component.doc,
    }));
  const byImport = new Map();
  for (const component of components)
    for (const name of component.use) {
      const from = manifest.exports[name]?.import ?? component.import;
      byImport.set(from, new Set([...(byImport.get(from) ?? []), name]));
    }
  const pages = (kind) =>
    search(manifest, description, { kinds: [kind], limit: 3 }).filter((hit) => hit.score >= 12);
  return {
    components,
    patterns: pages('pattern'),
    templates: pages('template'),
    tokens: styleTerms(description).length
      ? search(manifest, styleTerms(description).join(' '), { kinds: ['token'], limit: 12 })
          .filter((hit) => !/\.(?:hover|pressed)$/.test(hit.name))
          .slice(0, 6)
      : [],
    imports: [...byImport].map(
      ([from, names]) => `import { ${[...names].sort().join(', ')} } from '${from}';`,
    ),
    uncovered,
    next: [
      'Check each component with get_component, its props with get_props and the closest example with get_example before writing code.',
      'Read avoidWhen: it names the component to use instead when a situation does not fit.',
      uncovered.length
        ? 'For the uncovered parts, search again in other words, then compose envUI components (Stack, Surface, List, Card) and tokens; if something is still missing, propose an envUI addition instead of a local copy.'
        : 'Compose these components; do not hand-roll controls envUI has.',
    ],
  };
}
