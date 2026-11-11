// A page's figures: each example placed once, its fence's attributes, its specimen and its legend.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pageFixture, switchBody, switchFrontmatter } from './DocumentationFixtures.ts';

test('every example the frontmatter lists is placed once, but the overview, which nothing places', async () => {
  await pageFixture(async ({ rejects }) => {
    const [frontmatter, body] = [switchFrontmatter, switchBody];
    // Examples: each listed once and placed once, but the overview's, which nothing places.
    await rejects(
      frontmatter + body.replace('```tsx figure=Instant\n', '```tsx figure=Narrow\n'),
      /figure Narrow is placed twice[\s\S]*example Instant is listed in the frontmatter but placed nowhere/,
    );
    await rejects(
      frontmatter + body.replace('figure=Instant', 'figure=Extra'),
      /figure Extra is not listed under examples in the frontmatter/,
    );
    await rejects(
      frontmatter + body.replace('### Labels', '```tsx figure=Basic\n\n```\n\n### Labels'),
      /figure Basic is an overview example, which the Overview shows from the frontmatter/,
    );
    await rejects(
      frontmatter.replace('  Basic: overview\n', '  Basic: example\n') + body,
      /example Basic is listed in the frontmatter but placed nowhere[\s\S]*lists no overview example/,
    );
    await rejects(
      frontmatter + body.replace('figure=Instant', 'do=Instant caption="Use it."'),
      /`tsx do=Instant caption="Use it\."`: place a figure as `tsx figure=Name`/,
    );
    await rejects(
      frontmatter.replace('  Narrow: example\n', '  Narrow: example\n  Missing: example\n') +
        body.replace('### Labels', '```tsx figure=Missing\n\n```\n\n### Labels'),
      /figure Missing has no file/,
    );
    await rejects(
      frontmatter + body.replace('figure=Parts\n\n```', 'figure=Parts\n<Switch />\n```'),
      /the fence of figure Parts must be empty/,
    );
  });
});

test('an example the catalogue plays, or an anatomy held in a moment, needs its specimen', async () => {
  await pageFixture(async ({ page, read, rejects, specimens }) => {
    const [frontmatter, body] = [switchFrontmatter, switchBody];
    // An example the catalogue plays needs its specimen of the same name.
    await rejects(
      frontmatter.replace('  Basic: overview', '  Basic:\n    role: overview\n    motion: true') +
        body,
      /example Basic has motion but no playback apps\/site\/src\/specimens\/switch\/Basic\.tsx/,
    );
    await rejects(
      frontmatter +
        body.replace('figure=Narrow widths="16 30"', 'figure=Narrow motion widths="16 30"'),
      /example Narrow has motion but no playback/,
    );
    // An anatomy figure held in a moment needs its specimen of the same name too.
    await rejects(
      frontmatter + body.replace('figure=Parts\n', 'figure=Parts specimen\n'),
      /anatomy Parts has specimen but no playback apps\/site\/src\/specimens\/switch\/Parts\.tsx/,
    );
    // With its specimen, an example the catalogue plays says so, in the Overview and on its fence.
    await writeFile(join(specimens, 'switch', 'Basic.tsx'), 'export default function Basic() {}\n');
    await writeFile(
      join(specimens, 'switch', 'Narrow.tsx'),
      'export default function Narrow() {}\n',
    );
    await writeFile(
      page,
      frontmatter.replace('  Basic: overview', '  Basic:\n    role: overview\n    motion: true') +
        body.replace('figure=Narrow widths="16 30"', 'figure=Narrow motion widths="16 30"'),
    );
    const motions = read()[1]
      .sections.flatMap((section) => section.blocks)
      .filter((block) => block.motion)
      .map((block) => block.name);
    assert.deepEqual(motions, ['Basic', 'Narrow']);
  });
});

test("a figure's fence takes the attributes its role takes, as values and flags", async () => {
  await pageFixture(async ({ page, read, rejects }) => {
    const [frontmatter, body] = [switchFrontmatter, switchBody];
    // A figure's fence: the attributes its role takes, as name="value", and flags alone.
    await rejects(frontmatter + body.replace('widths="16 30"', 'widths="wide"'), /widths="wide"/);
    // sweep shows one frame sweeping between at least two widths; classes needs a sweep.
    await rejects(
      frontmatter + body.replace('widths="16 30"', 'widths="16" sweep'),
      /example Narrow has sweep; give the widths it sweeps between/,
    );
    await rejects(
      frontmatter + body.replace('widths="16 30"', 'widths="16 30" classes'),
      /example Narrow has classes without sweep/,
    );
    await rejects(
      frontmatter + body.replace('widths="16 30"', 'widths="16 30" fit'),
      /example Narrow has fit without sweep/,
    );
    // A frame of each width shows the example closed: a live example is shown one way.
    await rejects(
      frontmatter + body.replace('widths="16 30"', 'widths="16 30" open'),
      /example Narrow has widths and open/,
    );
    await writeFile(
      page,
      frontmatter + body.replace('widths="16 30"', 'widths="30 16" sweep classes fit'),
    );
    assert.deepEqual(
      (({ widths, sweep, classes, fit }) => ({ widths, sweep, classes, fit }))(
        read()[1]
          .sections.flatMap((section) => section.blocks)
          .find((block) => block.name === 'Narrow'),
      ),
      { widths: [30, 16], sweep: true, classes: true, fit: true },
    );
    await rejects(
      frontmatter + body.replace('figure=Parts', 'figure=Parts size=lg'),
      /anatomy Parts takes no size/,
    );
    await rejects(
      frontmatter + body.replace('figure=OnSubmit open', 'figure=OnSubmit open=yes'),
      /write the flag open alone/,
    );
    await rejects(
      frontmatter + body.replace('figure=Parts', 'figure=Parts of'),
      /has of without a value/,
    );
    await rejects(
      frontmatter + body.replace('open stage=shaded', 'open stage=dark'),
      /has stage="dark"/,
    );
    await rejects(
      frontmatter + body.replace('figure=Instant', 'figure=Instant caption="Use it."'),
      /figure Instant has a caption on its fence; it goes under examples/,
    );
    // A double quote inside a value, escaped or not, leaves the fence malformed.
    await rejects(
      frontmatter + body.replace('figure=Narrow widths="16 30"', 'figure=Narrow widths="16 "30""'),
      /the fence `tsx figure=Narrow widths="16 "30"" stage=shaded` is malformed/,
    );
  });
});

test("a figure's legend names parts that exist, each by its name in bold", async () => {
  await pageFixture(async ({ rejects }) => {
    const [frontmatter, body] = [switchFrontmatter, switchBody];
    // A legend names parts that exist, each starting with its name in bold.
    await rejects(
      frontmatter + body.replace('2. **Thumb** (`env-switch-input`)', '2. The thumb.'),
      /item 2 of the legend of anatomy Parts names no part/,
    );
    await rejects(
      frontmatter + body.replace('2. **Thumb** (`env-switch-input`)', '2. `env-switch-input`'),
      /must start with the part's name in bold/,
    );
    await rejects(
      frontmatter +
        body.replace('2. **Thumb** (`env-switch-input`)', '2. **Knob** (`env-switch-knob`)'),
      /names env-switch-knob, which neither packages\/ui's CSS nor docs\/generated\/parts\.json has/,
    );
    // A variants figure names each variant in bold, in a legend it can't do without.
    const variants = frontmatter.replace('  Parts: anatomy', '  Parts: variants');
    await rejects(
      variants + body.replace('1. **Track** (`env-switch`): the pill.', '1. Track'),
      /in bold/,
    );
    await rejects(
      variants + body.replace(/1\. \*\*Track\*\*.*\n2\. \*\*Thumb\*\*.*\n/, ''),
      /variants Parts has no legend/,
    );
    await rejects(
      frontmatter + body.replace(/1\. \*\*Track\*\*.*\n2\. \*\*Thumb\*\*.*\n/, ''),
      /anatomy Parts has no legend, and docs\/generated\/parts\.json lists no parts of Switch/,
    );
  });
});
