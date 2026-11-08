// Placing a figure a `tsx figure=Name` fence names: its attributes, each checked against its role
// and the others, and the block the page shows it as.
import type { Tokens } from 'marked';
import type { ExampleEntry } from '../PageStructure.ts';
import type { ExampleBlock, FigureBlock, PageReading, ReadSection } from './PageReading.ts';

/**
 * A figure, placed by name: ```tsx figure=Name```, with optional attributes, written
 * name="value", and flags, such as `open`, written as their name alone. Its role and caption come
 * from the frontmatter.
 */
export const figurePattern =
  /^tsx\s+figure=([A-Za-z]\w*)((?:\s+[a-z]+(?:=(?:"[^"]*"|[^\s"]+))?)*)\s*$/;
/** A fence that names an example by its kind, as pages wrote figures before: a figure= fence now. */
export const kindFencePattern = /^tsx\s+(?:example|do|dont|anatomy|variants)=/;
/** The attributes each role's figure takes, and those it needs. */
const figureAttributes: Record<string, { allowed: string[]; required: string[] }> = {
  example: {
    allowed: ['widths', 'sweep', 'classes', 'fit', 'open', 'stage', 'wide', 'motion', 'device'],
    required: [],
  },
  do: { allowed: ['open', 'stage', 'wide', 'motion'], required: ['caption'] },
  dont: { allowed: ['open', 'stage', 'wide', 'motion'], required: ['caption'] },
  caution: { allowed: ['open', 'stage', 'wide', 'motion'], required: ['caption'] },
  anatomy: { allowed: ['of', 'open', 'stage', 'enlarge', 'width', 'specimen'], required: [] },
  variants: { allowed: ['stage'], required: [] },
};
/**
 * The fills a figure's stage takes besides the default, the canvas recessed from what it sits on:
 * `stage="shaded"`, a canvas deeper than both the page's and the navigation's backgrounds, where
 * the subject is a whole window that shows both, such as a Scaffold.
 */
export const stageFills = ['shaded'];
/**
 * The devices an example is drawn in on its page, at the device's real width and filling its
 * screen (`device="phone"` or `device="window"`): a whole screen of an application, such as a
 * Scaffold, rather than a box standing in for one. The catalogue's cards never draw one.
 */
export const deviceKinds = ['phone', 'window'];
/**
 * The attributes that are flags, written without a value: `open` shows the example's overlays
 * open on its stage, contained; `enlarge` shows an anatomy figure's subject half as large again
 * where its stage has room, so the callouts on its close-set parts don't crowd; and `wide` keeps an
 * example across the whole column, alone in its row, rather than beside the text before it, where
 * it needs the room, such as a popup open beside its trigger, or a do and a don't one above the
 * other. With `widths`, `sweep` shows one
 * frame whose width sweeps between them and back, `classes` names the window class on its ruler,
 * and `fit` draws the frame smaller where it must to reach its widest width on the stage; `motion`
 * plays the example in the catalogue: its playback, the specimen of the same name, takes its place; and
 * `specimen` numbers an anatomy figure's parts on its playback, the specimen of the same name, held in
 * a moment its parts show apart, such as a value caught as it rolls in.
 */
const figureFlags = new Set([
  'open',
  'enlarge',
  'wide',
  'sweep',
  'classes',
  'fit',
  'motion',
  'specimen',
]);
/** A file name as words: ConnectedButtons is "Connected buttons". */
export const fileWords = (name: string) =>
  name
    .replace(/(?<=[a-z\d])(?=[A-Z])/g, ' ')
    .replace(/ [A-Z](?=[a-z])/g, (word) => word.toLowerCase());

/** Places the figure a `tsx figure=Name` fence names, with the attributes `rest` gives it. */
export function placeFigure(
  page: PageReading,
  current: ReadSection,
  token: Tokens.Code,
  name: string,
  rest: string,
) {
  const { problems } = page;
  const listed = page.context.catalog[name];
  if (page.placed.has(name)) problems.push(`figure ${name} is placed twice; place it once`);
  page.placed.add(name);
  if (!listed) {
    problems.push(`figure ${name} is not listed under examples in the frontmatter`);
    return;
  }
  if (listed.role === 'overview') {
    problems.push(
      `figure ${name} is an overview example, which the Overview shows from the frontmatter; don't place it`,
    );
    return;
  }
  if (token.text.trim())
    problems.push(`the fence of figure ${name} must be empty; the build fills in its file`);
  if (current.id === 'changelog')
    problems.push(`figure ${name} belongs in a section before the changelog`);
  if (page.foundation) {
    // A foundation's figure is the catalogue's own, from its page's preview, with the legend
    // that follows it; an example file of its name, where it has one, is its code.
    if (rest.trim()) problems.push(`figure ${name} takes no attributes on a foundation page`);
    const block: FigureBlock = {
      kind: 'figure',
      name,
      heading: page.subheading ?? fileWords(name),
      role: listed.role,
      ...(listed.caption && { caption: listed.caption }),
      ...(page.context.examples.has(name) && { code: true }),
    };
    current.blocks.push(block);
    page.legendOf = block;
    return;
  }
  const block = exampleFigure(page, name, listed, figureAttributesOf(page, name, listed, rest));
  current.blocks.push(block);
  if (listed.role === 'anatomy' || listed.role === 'variants') page.legendOf = block;
}

/**
 * The attributes on an example's figure fence, each checked against those its role takes: a value,
 * or true for a flag. The caption is the frontmatter's.
 */
function figureAttributesOf(page: PageReading, name: string, listed: ExampleEntry, rest: string) {
  const { problems } = page;
  const { role } = listed;
  const attributes: Record<string, string | true> = {};
  for (const [, key, value, quoted, plain] of rest.matchAll(
    /\s+([a-z]+)(=(?:"([^"]*)"|([^\s"]+)))?/g,
  )) {
    if (key === 'caption')
      problems.push(`figure ${name} has a caption on its fence; it goes under examples`);
    else if (!figureAttributes[role].allowed.includes(key))
      problems.push(
        `${role} ${name} takes no ${key}${figureAttributes[role].allowed.length ? `; it takes ${figureAttributes[role].allowed.join(', ')}` : ''}`,
      );
    else if (figureFlags.has(key) && value)
      problems.push(`${role} ${name} has ${key}${value}; write the flag ${key} alone`);
    else if (!figureFlags.has(key) && !value)
      problems.push(`${role} ${name} has ${key} without a value; write ${key}="…"`);
    if (key in attributes) problems.push(`${role} ${name} repeats ${key}`);
    attributes[key] = value ? (quoted ?? plain).trim() : true;
  }
  delete attributes.caption;
  if (listed.caption) attributes.caption = listed.caption;
  for (const key of figureAttributes[role].required)
    if (!attributes[key]) problems.push(`${role} ${name} needs a ${key}, one sentence`);
  return attributes;
}

/** The block of an example's figure, from its attributes, each checked against the others. */
function exampleFigure(
  page: PageReading,
  name: string,
  listed: ExampleEntry,
  attributes: Record<string, string | true>,
): ExampleBlock {
  const { problems, document } = page;
  const { examples, specimens } = page.context;
  const { role } = listed;
  if (!examples.has(name))
    problems.push(`figure ${name} has no file apps/site/src/examples/${document.id}/${name}.tsx`);
  const caption = typeof attributes.caption === 'string' ? attributes.caption : undefined;
  const block: ExampleBlock = {
    kind: 'example',
    name,
    heading:
      role === 'do'
        ? `Do: ${caption}`
        : role === 'dont'
          ? `Don't: ${caption}`
          : role === 'caution'
            ? `Caution: ${caption}`
            : role === 'anatomy'
              ? `${document.title} anatomy`
              : role === 'variants'
                ? `${document.title} variants`
                : (page.subheading ?? fileWords(name)),
    ...(role !== 'example' && { role: role as ExampleBlock['role'] }),
    ...(caption && { caption }),
  };
  if (attributes.widths !== undefined) {
    const widths = String(attributes.widths)
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(Number);
    if (!widths.length || widths.some((width) => !(width >= 10 && width <= 120)))
      problems.push(
        `example ${name} has widths="${attributes.widths}"; give widths in rem, from 10 to 120`,
      );
    block.widths = widths;
  }
  if (attributes.sweep === true) {
    if (!block.widths || block.widths.length < 2)
      problems.push(`example ${name} has sweep; give the widths it sweeps between, widths="30 16"`);
    else if (attributes.open === true)
      problems.push(`example ${name} has sweep and open; a sweeping frame shows no overlays open`);
    else block.sweep = true;
  }
  if (attributes.classes === true) {
    if (attributes.sweep !== true)
      problems.push(`example ${name} has classes without sweep; only a sweeping frame names them`);
    else block.classes = true;
  }
  if (attributes.fit === true) {
    if (attributes.sweep !== true)
      problems.push(
        `example ${name} has fit without sweep; only a sweeping frame is drawn smaller`,
      );
    else block.fit = true;
  }
  if (attributes.width !== undefined) {
    const width = Number(attributes.width);
    if (!(width >= 10 && width <= 120))
      problems.push(
        `${role} ${name} has width="${attributes.width}"; give one width in rem, from 10 to 120`,
      );
    block.width = width;
  }
  if (attributes.of !== undefined) block.of = String(attributes.of);
  if (typeof attributes.stage === 'string') {
    if (stageFills.includes(attributes.stage))
      block.stage = attributes.stage as ExampleBlock['stage'];
    else
      problems.push(
        `${role} ${name} has stage="${attributes.stage}"; a stage takes ${stageFills.map((fill) => `"${fill}"`).join(', ')}, or nothing for the stage in the page's color`,
      );
  }
  if (attributes.open === true) {
    if (attributes.widths !== undefined && attributes.sweep !== true)
      problems.push(
        `example ${name} has widths and open; a frame of each width shows no overlays open`,
      );
    else block.open = true;
  }
  if (attributes.device !== undefined) {
    if (!deviceKinds.includes(String(attributes.device)))
      problems.push(
        `example ${name} has device="${attributes.device}"; a device is ${deviceKinds.map((kind) => `"${kind}"`).join(' or ')}`,
      );
    else if (attributes.widths !== undefined || attributes.open === true)
      problems.push(
        `example ${name} has device with widths or open; a device is one window of its own width, closed`,
      );
    else block.device = attributes.device as ExampleBlock['device'];
  }
  if (attributes.enlarge === true) block.enlarge = true;
  if (attributes.wide === true) block.wide = true;
  if (attributes.motion === true) block.motion = true;
  if (block.motion && !specimens.has(name))
    problems.push(
      `example ${name} has motion but no playback apps/site/src/specimens/${document.id}/${name}.tsx, named after it, to play it`,
    );
  if (attributes.specimen === true) block.specimen = true;
  if (block.specimen && !specimens.has(name))
    problems.push(
      `anatomy ${name} has specimen but no playback apps/site/src/specimens/${document.id}/${name}.tsx, named after it, to number`,
    );
  return block;
}
