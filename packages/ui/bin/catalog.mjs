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
  use uses using want wants we when where which while who will with without would you your
  add put let make build give show display allow`.split(/\s+/),
);

/** A word reduced to a rough stem, so "rows", "toggles", "sorting" and "sortable" meet "row", "toggle" and "sort". */
function stem(word) {
  if (word.length > 4 && word.endsWith('ies')) return `${word.slice(0, -3)}y`;
  if (word.length > 5 && /(?:ches|shes|sses|xes)$/.test(word)) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith('s') && !/(?:ss|us|is)$/.test(word))
    return word.slice(0, -1);
  if (word.length > 7 && word.endsWith('able')) return word.slice(0, -4);
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

/** An export by name, or undefined; names such as `constructor` are not exports. */
export const exportOf = (manifest, name) =>
  typeof name === 'string' && Object.hasOwn(manifest.exports, name)
    ? { name, ...manifest.exports[name] }
    : undefined;

/** A component page's exports, with their import path, props and the rest. */
export const exportsOf = (manifest, component) =>
  component.exports.map((name) => exportOf(manifest, name)).filter(Boolean);

/** A page's exports without the parts of its namespaces, which import through the namespace. */
export const topLevelExports = (manifest, component) =>
  exportsOf(manifest, component).filter((entry) => !entry.name.includes('.'));

/** Exports that no component page lists, such as Theme or Text; search finds them by name. */
const pagelessExports = (manifest) => {
  const onPages = new Set(manifest.components.flatMap((component) => component.exports));
  return Object.keys(manifest.exports)
    .filter((name) => !onPages.has(name))
    .map((name) => exportOf(manifest, name));
};

function searchDocuments(manifest) {
  const documents = [];
  const avoidFor = new Map();
  for (const component of manifest.components)
    for (const avoid of component.avoidWhen)
      if (avoid.use) avoidFor.set(avoid.use, [...(avoidFor.get(avoid.use) ?? []), avoid.text]);
  for (const component of manifest.components) {
    const names = [component.name, ...component.exports];
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
        text: exportsOf(manifest, component).flatMap((entry) => terms(entry.description)),
      },
    });
  }
  for (const entry of pagelessExports(manifest))
    documents.push({
      kind: 'export',
      item: entry,
      names: [phrase(entry.name)],
      aliases: (entry.aliases ?? []).map(phrase),
      fields: {
        // The words of a name such as ThemeToggle weigh as an alias's: "toggle" alone is Switch.
        name: [],
        alias: [...terms(entry.name), ...(entry.aliases ?? []).flatMap(terms)],
        summary: terms(entry.description),
        use: avoidFor.get(entry.name)?.flatMap(terms) ?? [],
        text: [],
      },
    });
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
          // A pattern or template is for the situations of its useWhen, and is found by what it
          // composes and the intent it serves.
          use: (page.useWhen ?? []).flatMap(terms),
          text: [
            ...(page.exports ?? []).flatMap(terms),
            ...(page.composes ?? []).flatMap(terms),
            ...terms(page.intent),
          ],
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
        alias: segments.flatMap((segment) =>
          Object.hasOwn(tokenWords, segment) ? terms(tokenWords[segment]) : [],
        ),
        summary: terms(token.description),
        use: [],
        text: [],
      },
    });
  }
  return documents;
}

/** The name a document is known by, as written: an export's, a page's or a token's. */
const exactName = (document) => String(document.item.name ?? document.item.id ?? '').toLowerCase();

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

/** How many documents may share a word for it to count as rare. */
const rareFrequency = 3;

/** Tokens rank below components and pages in a mixed search; there are many and they are terse. */
const kindFactor = {
  component: 1,
  export: 1,
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
    let rare = false;
    const matched = [];
    const fieldOf = new Map();
    for (const term of queryTerms) {
      let best = 0;
      for (const [field, values] of Object.entries(document.fields))
        if (values.includes(term) && weights[field] > best) {
          best = weights[field];
          fieldOf.set(term, field);
        }
      if (!best) continue;
      const frequencyOfTerm = frequency.get(term) ?? 1;
      score += best * Math.log(1 + total / frequencyOfTerm);
      strength = Math.max(strength, best);
      // A word few documents know, matched on a name or an alias, is telling on its own.
      if (best >= weights.alias && frequencyOfTerm <= rareFrequency) rare = true;
      matched.push(term);
    }
    if (!score) continue;
    let named = false;
    let phrased = false;
    // The words of every name and alias the query holds whole.
    const whole = new Set();
    for (const name of document.names)
      if (name && queryPhrase.includes(` ${name} `)) {
        score += name.includes(' ') ? 30 : 20;
        named = true;
        phrased ||= name.includes(' ');
        for (const word of name.split(' ')) whole.add(word);
      }
    for (const alias of document.aliases)
      if (alias && queryPhrase.includes(` ${alias} `)) {
        score += alias.includes(' ') ? 30 : 8;
        named = true;
        phrased ||= alias.includes(' ');
        for (const word of alias.split(' ')) whole.add(word);
      }
    // Solid words: of a name, a whole alias, a summary or when to use it, but not one word of a
    // longer alias.
    const solid = matched.filter(
      (term) =>
        whole.has(term) ||
        (fieldOf.get(term) !== 'alias' && weights[fieldOf.get(term)] >= weights.use),
    );
    if (document.names.includes(queryPhrase.trim())) score += 50;
    // The name exactly as written, so useTheme ranks above Theme, whose words are the same.
    if (exactName(document) === query.trim().toLowerCase()) score += 60;
    score = Math.round(score * kindFactor[document.kind] * 10) / 10;
    results.push({
      document,
      score,
      strength,
      matched,
      solid,
      whole: [...whole],
      named,
      phrased,
      rare,
      of: queryTerms.length,
    });
  }
  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

/** Ranked matches for a query, in their short form with the score and the terms matched. */
export function search(manifest, query, options) {
  return rank(manifest, query, options).map(({ document, score, matched }) => ({
    kind: document.kind,
    ...summarize(manifest, document.kind, document.item),
    score,
    matched,
  }));
}

/** The short form of an item in lists and search results. */
export function summarize(manifest, kind, item) {
  if (kind === 'component') {
    const exported = topLevelExports(manifest, item);
    return {
      name: item.name,
      exports: exported.map((entry) => entry.name),
      import: exported[0]?.import,
      summary: item.summary,
      status: item.status,
      // An export whose status differs from its page's, such as a beta editor on a stable page.
      ...(item.statuses && { statuses: item.statuses }),
      doc: item.doc,
    };
  }
  if (kind === 'export')
    return {
      name: item.name,
      exportKind: item.kind,
      import: item.import,
      summary: item.description,
      page: item.page,
      doc: item.doc,
    };
  if (kind === 'token')
    return {
      name: item.id,
      cssVariable: item.cssVariable,
      type: item.type,
      ...(item.description && { summary: item.description }),
    };
  if (kind === 'pattern')
    return {
      name: item.name,
      title: item.title,
      intent: item.intent,
      summary: item.summary,
      status: item.status,
      composes: item.composes,
      doc: item.doc,
    };
  if (kind === 'template')
    return {
      name: item.name,
      title: item.title,
      summary: item.summary,
      status: item.status,
      frame: item.frame,
      composes: item.composes,
      files: (item.files ?? []).map((file) => file.name),
      doc: item.doc,
    };
  return { name: item.name, title: item.title, summary: item.summary, doc: item.doc };
}

/**
 * A pattern or template page by its name, title or alias; `requested` is the alias it was found
 * by, when it was.
 */
export function findPage(manifest, kind, name) {
  const key = normalize(name);
  if (!key) return undefined;
  const pages = manifest[`${kind}s`] ?? [];
  const page = pages.find((item) => normalize(item.name) === key || normalize(item.title) === key);
  if (page) return { page };
  const aliased = pages.find((item) =>
    (item.aliases ?? []).some((alias) => normalize(alias) === key),
  );
  return aliased && { page: aliased, requested: name };
}

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
      return { component, entry: exportOf(manifest, component.name) };
    const exported = component.exports.find((item) => normalize(item) === key);
    if (exported) return { component, entry: exportOf(manifest, exported) };
  }
  for (const component of manifest.components)
    if (component.aliases.some((alias) => normalize(alias) === key)) return { component };
  return undefined;
}

/** Close names for a miss, so a caller can correct itself. */
export function suggestions(manifest, name, limit = 5) {
  return search(manifest, name, { kinds: ['component', 'export'], limit }).map((hit) => hit.name);
}

/**
 * The phrases envUI knows things by: the words of every name and alias of its components and
 * exports, such as "date picker", "search box" or "modal".
 */
const knownPhrases = (manifest) =>
  new Set(
    [
      ...Object.keys(manifest.exports),
      ...Object.values(manifest.exports).flatMap((entry) => entry.aliases ?? []),
      ...manifest.components.flatMap((component) => [component.name, ...component.aliases]),
    ]
      .map(phrase)
      .filter(Boolean),
  );

/**
 * The sentences of a description, without what names the application's content rather than its
 * interface, which is returned as ignored: code and file names, such as `saveSettings` or
 * src/pages/SettingsPage.tsx; quoted labels, such as 'Export'; and runs of capitalized words
 * inside a sentence, such as the Projects, Members and Settings of a list of links. A run stays
 * when envUI knows it: a whole name or alias, such as Modal or Date Picker, or, for a run of
 * several words, part of one, such as the Dark Mode of "dark mode toggle".
 */
function sentences(manifest, description) {
  const known = knownPhrases(manifest);
  const knownWithin = [...known].map((item) => ` ${item} `);
  const ignored = [];
  const drop = (text) => {
    const clean = text.replace(/\s+/g, ' ').trim();
    if (clean) ignored.push(clean);
    return ' ';
  };
  const result = String(description)
    .replace(/`[^`]*`/g, drop)
    .replace(/(?:\.{0,2}\/)?(?:[\w.-]+\/)+[\w.-]+\.\w+/g, drop)
    .replace(/\b[\w-]+\.(?:[cm]?[jt]sx?|css|json|md|html)\b/g, drop)
    .replace(
      /(^|[\s(])(['"‘“][^'"’”]+['"’”])(?=[\s,.;:!?)]|$)/g,
      (match, before, quoted) => `${before}${drop(quoted)}`,
    )
    .split(/[\n.;:!?()]+/)
    .map((sentence) => {
      // The first word of a sentence is capitalized as any word is; the runs after it are names.
      const start = sentence.search(/[A-Za-z]/);
      if (start === -1) return sentence;
      const firstEnd = start + sentence.slice(start).search(/[^\w+-]|$/);
      const rest = sentence
        .slice(firstEnd)
        .replace(/\b[A-Z][\w+-]*(?:\s+[A-Z][\w+-]*)*/g, (run) => {
          const words = phrase(run);
          const keep =
            !words ||
            known.has(words) ||
            (words.includes(' ') && knownWithin.some((item) => item.includes(` ${words} `)));
          return keep ? run.toLowerCase() : drop(run);
        });
      return `${sentence.slice(0, firstEnd)}${rest}`;
    })
    .map((sentence) => sentence.replace(/\s+/g, ' ').trim())
    .filter((sentence) => terms(sentence).length);
  return { sentences: result, ignored };
}

/** Splits a sentence into the parts it asks for: list items and "with" clauses. */
function clauses(sentence) {
  return sentence
    .split(/,\s*|\s+(?:and|with|plus|then|also|including)\s+/i)
    .map((part) =>
      part
        .replace(/^(?:and|with|or|plus|then)\s+/i, '')
        .replace(/\s+/g, ' ')
        .trim(),
    )
    .filter((part) => terms(part).length);
}

/**
 * Words that name the structure of a screen rather than an element on it. A part such as "a
 * sign-in page" leads to templates and patterns; its other words still pick components.
 */
const structuralTerms = new Set(['page', 'screen', 'view', 'flow']);

/**
 * The words of a part that ask for something, in order, and whether they stand together as one
 * compound, as "postal code", "date range" or "postal code field" do, rather than apart, as in "a
 * toggle for the newsletter". The last word of a compound is its head: a postal code field is a
 * field.
 */
function shapeOf(part) {
  const content = terms(part).filter((term) => !structuralTerms.has(term));
  const words = part
    .toLowerCase()
    .split(/[^a-z\d]+/)
    .filter(Boolean)
    .map(stem);
  const positions = content.map((term) => words.indexOf(term));
  // Words such as "filterable" or "collapsible" say what the thing can do, not what it is: a
  // filterable table is a table, whether or not Table's page speaks of filters.
  const qualities = new Set(
    part
      .toLowerCase()
      .split(/[^a-z\d]+/)
      .filter((word) => /(?:able|ible)$/.test(word))
      .map(stem),
  );
  return {
    terms: content,
    qualities,
    compound:
      content.length >= 2 &&
      positions.every((position, index) => !index || position - positions[index - 1] === 1),
  };
}

/** The export of a page that a part of a description names, or the page's own. */
function exportFor(manifest, component, part) {
  const wanted = new Set(terms(part));
  const candidates = topLevelExports(manifest, component).filter(
    (entry) => entry.kind !== 'function',
  );
  let best;
  let bestOverlap = 0;
  for (const entry of candidates) {
    const overlap = terms(entry.name).filter((term) => wanted.has(term)).length;
    if (overlap > bestOverlap) [best, bestOverlap] = [entry, overlap];
  }
  return best ?? candidates.find((entry) => entry.name === component.name) ?? candidates[0];
}

/**
 * Whether a hit answers a part. Solid words are those of a name, of a whole alias, of a summary
 * or of when to use it; one word of a longer alias, such as the "top" of "top menu", is not.
 *
 * - One word: a name or an alias that is that word, as "modal" is Dialog's.
 * - Two words: a name or alias of several words; or, for a compound such as "postal code" or
 *   "date range", both words, though a quality such as "filterable" may go unmatched; or, for
 *   words apart, the first, as the toggle of "a toggle for the newsletter".
 * - More: a name or alias of several words, more than half of the words, two of them, or a whole
 *   one-word name or alias; `pick` prefers the hits that hold the most of the words.
 */
const covers = (hit, shape) => {
  if (!hit || hit.score < 10 || hit.strength < weights.summary) return false;
  const solid = new Set(hit.solid);
  const count = shape.terms.length;
  if (count <= 1) return hit.named;
  if (hit.phrased) return true;
  if (count === 2)
    return shape.compound
      ? shape.terms.every((term) => solid.has(term) || shape.qualities.has(term)) &&
          solid.has(shape.terms.at(-1))
      : solid.has(shape.terms[0]);
  const held = shape.terms.filter((term) => solid.has(term)).length;
  if (shape.compound && !solid.has(shape.terms.at(-1))) return false;
  return held * 2 > count || held >= 2 || hit.named;
};

/**
 * The hit that answers a part best: for a part of one or two words, the first that covers it;
 * for a longer one, a phrase it names, else the hit that holds the most of its words, a named one
 * first. "a time zone picked from a short list" names List, but Select matches more of its words; in
 * "open a modal to edit the user", the one word Dialog is known by is enough.
 */
function pick(hits, shape) {
  const usable = hits.filter((hit) => covers(hit, shape));
  if (shape.terms.length < 3 || !usable.length) return usable[0];
  const phrased = usable.find((hit) => hit.phrased);
  if (phrased) return phrased;
  const held = (hit) => shape.terms.filter((term) => hit.solid.includes(term)).length;
  const most = Math.max(...usable.map(held));
  // Among those, the one that matches the most words in any way, then a named one.
  const best = usable
    .filter((hit) => held(hit) === most)
    .sort((x, y) => y.matched.length - x.matched.length || Number(y.named) - Number(x.named));
  return best[0];
}

/**
 * Whether plan may suggest a hit. An export without a component page, such as ThemeToggle, only
 * when the part names it or matches it in every word; the building blocks the foundations
 * document, such as Text and Icon, never: the pages that use them show how.
 */
const plannable = (manifest, hit) => {
  if (hit.document.kind === 'component') return true;
  const { item } = hit.document;
  if (manifest.foundations.some((page) => page.name === item.page)) return false;
  return hit.named || hit.matched.length === hit.of;
};

/**
 * Candidates for a UI description: for each part of it, the component whose names, aliases or
 * description match it, with the words that matched; the patterns and templates that fit the
 * whole; tokens it names; the parts nothing matched; and what was left out as content. They are
 * matches on words, not an import list: each is to be confirmed with get_component and get_props.
 *
 * The parts are read in the context of the whole: the strongest matches are chosen first, and a
 * later part that a chosen component also matches well is credited to it rather than adding
 * another, so the toggle of "a collapsible sidebar with a toggle" stays the sidebar's.
 */
export function plan(manifest, description, { limit = 12 } = {}) {
  const chosen = new Map();
  const uncovered = [];
  const structure = [];
  const structureOnly = [];
  const choose = (hit, part) => {
    const { document } = hit;
    const key = document.item.name;
    const entry = chosen.get(key) ?? {
      document,
      score: 0,
      parts: [],
      matched: new Set(),
      use: new Set(),
    };
    entry.score += hit.score;
    if (!entry.parts.includes(part)) entry.parts.push(part);
    for (const term of hit.matched) entry.matched.add(term);
    const use =
      document.kind === 'component'
        ? exportFor(manifest, document.item, part)?.name
        : document.item.name;
    if (use) entry.use.add(use);
    chosen.set(key, entry);
  };
  const found = (query, limit = 6) =>
    rank(manifest, query, { kinds: ['component', 'export'], limit: limit * 2 })
      .filter((hit) => plannable(manifest, hit))
      .slice(0, limit);
  const { sentences: described, ignored } = sentences(manifest, description);
  // A whole phrase that spans the parts, such as "switch between light and dark", names what it
  // names before the sentence is split.
  const claims = [];
  for (const sentence of described)
    for (const hit of found(sentence, 4))
      if (hit.phrased && covers(hit, shapeOf(sentence))) {
        choose(hit, sentence);
        claims.push({ sentence, hit, terms: new Set(hit.whole) });
      }
  const parts = described
    .flatMap((sentence) => clauses(sentence).map((part) => ({ part, sentence })))
    .map(({ part, sentence }, index) => {
      const shape = shapeOf(part);
      return {
        part,
        sentence,
        index,
        shape,
        structural: terms(part).some((term) => structuralTerms.has(term)),
        hits: shape.terms.length ? found(shape.terms.join(' ')) : [],
      };
    });
  for (const { part, sentence, shape, structural, hits } of [...parts].sort(
    (a, b) => (b.hits[0]?.score ?? 0) - (a.hits[0]?.score ?? 0) || a.index - b.index,
  )) {
    if (structural) structure.push(part);
    const first = pick(hits, shape);
    // A part whose words are at least half in a phrase its sentence already named belongs to that, as
    // "links" in "a sidebar with links" belongs to the navigation. Only the phrase's own words count, so
    // the button of "a Delete button and a confirm dialog" stays a Button.
    const claim = claims.find(
      (item) =>
        item.sentence === sentence &&
        shape.terms.filter((term) => item.terms.has(term)).length * 2 >= shape.terms.length,
    );
    if (claim) {
      choose(claim.hit, part);
      continue;
    }
    // In a part about structure, such as "a settings page", only a component named outright
    // counts; the rest of it is for templates and patterns.
    if (!first || (structural && !first.named)) {
      (structural ? structureOnly : uncovered).push(part);
      continue;
    }
    const already = hits.find(
      (hit) =>
        chosen.has(hit.document.item.name) &&
        shape.terms.every((term) => hit.matched.includes(term)) &&
        hit.score >= first.score * 0.5,
    );
    // One component per part: a second guess costs more in wrong suggestions than it finds.
    choose(already ?? first, part);
  }
  const candidates = [...chosen.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ document, parts: covered, matched, use }) => {
      const { item } = document;
      if (document.kind === 'export')
        return {
          component: item.name,
          use: [item.name],
          import: item.import,
          matched: [...matched],
          parts: covered,
          summary: item.description,
          avoidWhen: [],
          examples: [],
          doc: item.doc,
        };
      const names = [...use];
      return {
        component: item.name,
        use: names,
        import: exportOf(manifest, names[0])?.import ?? topLevelExports(manifest, item)[0]?.import,
        matched: [...matched],
        parts: covered,
        summary: item.summary,
        avoidWhen: item.avoidWhen,
        examples: item.examples.map((example) => example.name),
        doc: item.doc,
      };
    });
  const pages = (kind) =>
    search(manifest, description, { kinds: [kind], limit: 3 }).filter((hit) => hit.score >= 12);
  const templates = pages('template');
  const patterns = pages('pattern');
  // A part that names only a structure is covered by a template or pattern, or not at all.
  if (!templates.length && !patterns.length) uncovered.push(...structureOnly);
  return {
    candidates,
    patterns,
    templates,
    tokens: styleTerms(description).length
      ? search(manifest, styleTerms(description).join(' '), { kinds: ['token'], limit: 12 })
          .filter((hit) => !/\.(?:hover|pressed)$/.test(hit.name))
          .slice(0, 6)
      : [],
    uncovered,
    ignored,
    next: [
      'These are candidates matched on words, not an import list: confirm each with get_component (when to use it, and what to use instead) and get_props before writing code, and use only exports these tools confirm exist.',
      uncovered.length
        ? 'For the uncovered parts, search in other words, then compose envUI components (Row, Column, Grid, Surface, List, Card) and tokens; if something is still missing, propose an envUI addition instead of a local copy.'
        : undefined,
      ignored.length
        ? 'The ignored words read as content, such as labels or code; search them if they name an element.'
        : undefined,
      templates.length
        ? `Start from get_template ${templates[0].name}: copy its screen and edit it, rather than laying the page out from scratch.`
        : undefined,
      structure.length && !templates.length
        ? `No template matches ${structure.map((part) => `"${part}"`).join(', ')}: lay the page out with AppShell.Root, Page, Row, Column and Grid around the components.`
        : undefined,
    ].filter(Boolean),
  };
}
