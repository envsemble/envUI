import assert from 'node:assert/strict';
import { Linter } from 'eslint';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import rule from '../src/rules/no-raw-graphics.js';
import { named, ruleTester, typeScriptRuleTester } from './RuleTester.mjs';

const img = { messageId: 'img' };
const alt = { messageId: 'alt' };
const margin = { messageId: 'margin' };
const svg = (attributes, what = 'size') => ({ messageId: 'svg', data: { attributes, what } });
const fixes = {
  size: 'write width="1em" height="1em", or leave them out, so it follows its slot or the text',
  color: 'write fill="currentColor", so it takes the text color',
  'size and color':
    'write width="1em" height="1em" fill="currentColor", so it follows its slot or the text and takes the text color',
};
const definition = (attributes, what = 'size') => ({
  messageId: 'definition',
  data: { attributes, what, fix: fixes[what] },
});
const icons = (name, source) => ({ messageId: 'iconPackage', data: { name, source } });
const svgInSlot = (attributes, slot, what = 'size') => ({
  messageId: 'svgInContentSlot',
  data: { attributes, slot, what },
});
const iconsInSlot = (name, source, slot) => ({
  messageId: 'iconPackageInContentSlot',
  data: { name, source, slot },
});

const graphic = "import { Graphic } from '@envsemble/envui';\n";

ruleTester.run('no-raw-graphics', rule, {
  valid: [
    ...named(
      "The application's own images, such as a brand logo: a local path or an imported image file",
      [
        '<img src="/brand/logo.svg" alt="Acme" />',
        '<img src="./logo.png" alt="" />',
        'import logo from \'./assets/logo.svg\'; <img src={logo} alt="Acme" />;',
      ],
    ),
    ...named("envUI's Graphic and icons", [
      `${graphic}<Graphic src={logo} alt="Acme" size="md" />`,
      `${graphic}<Graphic alt=""><AcmeMark /></Graphic>`,
      `${graphic}<Graphic {...logoProps} />`,
      "import { IconSearch } from '@envsemble/envui/icons/Search'; <IconSearch />",
      "import { IconAdd } from '@envsemble/envui/icons/Add'; <Button start={<IconAdd />} end={<IconAdd />}>Add</Button>;",
    ]),
    ...named("A Graphic of another library's, or of the application's own, needs no alt", [
      "import { Graphic } from './charts'; <Graphic data={data} />",
      'function Graphic() { return null; } <Graphic />',
    ]),
    ...named(
      "An svg whose size follows the text or its container, whose fill is the text color or none, or whose attributes are computed: a custom icon component, as envUI's own Icon writes it",
      [
        '<svg width="1em" height="1em" fill="currentColor" viewBox="0 0 24 24"><path d={d} /></svg>',
        '<svg width="1.5em" height="100%" fill="none" stroke="currentColor" />',
        '<svg fill="CurrentColor" viewBox="0 0 24 24" />',
        '<svg width={size} height={size} fill={color} />',
        '<svg viewBox="0 0 24 24" aria-hidden="true" />',
        '<svg className="mark" />',
      ],
    ),
    ...named('An svg that only holds definitions draws nothing', [
      '<svg width="0" height="0" aria-hidden="true"><defs /></svg>',
    ]),
    ...named('An svg in an icon slot, or in a Graphic, takes its size from there', [
      '<IconButton icon={<svg width="16" height="16" fill="#1a73e8" />} />',
      '<Alert icon={open ? <svg width="12" /> : null} />',
      '<Thing statusIcon={<svg width="12" />} />',
      `${graphic}<Graphic alt=""><svg width="24" height="24" fill="#000" /></Graphic>`,
    ]),
    ...named(
      'An svg in a Graphic through an expression container, a condition or a logical expression',
      [
        `${graphic}<Graphic alt="">{dark ? <svg width="24" fill="#fff" /> : <svg width="24" fill="#000" />}</Graphic>`,
        `${graphic}<Graphic alt="">{show && <svg width="24" height="24" />}</Graphic>`,
      ],
    ),
    ...named('An svg or an icon in a Graphic in start or end', [
      `${graphic}<List.Item start={<Graphic alt=""><svg width="20" height="20" /></Graphic>}>Inbox</List.Item>`,
      `${graphic}import { Github } from 'lucide-react'; <Button end={<Graphic alt=""><Github /></Graphic>}>Sign in</Button>;`,
    ]),
    ...named("An icon slot as an object's property, as in an array of destinations", [
      'const destinations = [{ label: \'Pipelines\', icon: <svg width="24" height="24" /> }];',
      "const items = [{ id: 'a', 'statusIcon': <svg width=\"16\" /> }];",
    ]),
    ...named('What a part renders in place of its own element', [
      '<Avatar.Image render={<img src={photo} alt="" />} />',
    ]),
    ...named(
      "A margin set elsewhere, or on another element; a style that isn't an object literal",
      [
        `${graphic}<Graphic alt="" style={{ padding: 0, inlineSize: '100%' }} />`,
        `${graphic}<Graphic alt="" style={styles.logo} />`,
        '<Card style={{ margin: 0 }} />',
      ],
    ),
    ...named('A margin of zero, or one that spaces the Graphic, removes no edge', [
      `${graphic}<Graphic alt="" style={{ margin: 0, marginInline: '0', marginBlockStart: '0px', 'margin-left': '0 -0' }} />`,
      `${graphic}<Graphic alt="" style={{ marginInlineEnd: 'var(--env-space-2)', marginBlock: 4, margin: '0.5rem 0' }} />`,
    ]),
    ...named('Modules that only share a prefix with an icon package, and other packages', [
      "import { Search } from 'lucide-react-native-shim'; <Search />;",
      "import Icons from 'react-iconset'; <Icons.Star />;",
      "import { Box } from '@mui/material'; <Box />;",
      "const icons = require(name); const m = import(name); require('lodash', 1);",
    ]),
    ...named("Another icon package's icon in an icon slot or a Graphic, which sizes it", [
      'import { Github } from \'lucide-react\'; <IconButton icon={<Github />} aria-label="Sign in" />;',
      `${graphic}import { SiFigma } from 'react-icons/si'; <Graphic alt="Figma"><SiFigma /></Graphic>;`,
      "import * as Icons from '@tabler/icons-react'; const items = [{ id: 'a', icon: <Icons.IconBrandSlack /> }];",
      'const { Heart } = require(\'phosphor-react\'); <IconButton icon={<Heart />} aria-label="Like" />;',
    ]),
    ...named('Importing or re-exporting an icon package renders nothing', [
      "import { Search } from 'lucide-react';",
      "export { IconSearch } from '@tabler/icons-react';",
      "export * from '@phosphor-icons/react';",
    ]),
    ...named('Allowed by option', [
      {
        code: "import { SiGithub } from 'react-icons/si'; <SiGithub />;",
        options: [{ allow: ['react-icons'] }],
      },
    ]),
  ],
  invalid: [
    { code: '<img src="https://cdn.example.com/logo.svg" alt="" />', errors: [img] },
    { code: '<img src="//cdn.example.com/logo.svg" alt="" />', errors: [img] },
    { code: 'import { avatar } from \'./user\'; <img src={avatar} alt="" />;', errors: [img] },
    {
      code: '<img src={logo} alt="Acme" />',
      errors: [
        {
          message:
            'Use envUI\'s Graphic instead of a raw <img>: import { Graphic } from \'@envsemble/envui\'. Its size comes from envUI\'s steps, not the file\'s: <Graphic src={logo} alt="Acme" size="md" />, or for a photo <Graphic src={photo} alt="…" size="fill" aspect="16/9" fit="cover" />.',
          line: 1,
          column: 2,
          endColumn: 5,
        },
      ],
    },
    { code: '<Card><img {...props} /></Card>', errors: [img] },
    {
      code: '<svg width="24" height="24" viewBox="0 0 24 24"><path d={d} /></svg>',
      errors: [
        {
          message:
            'A raw <svg width="24" height="24"> takes its size from the file: pass it to an icon slot, such as IconButton\'s icon, or wrap it in envUI\'s <Graphic alt="">: import { Graphic } from \'@envsemble/envui\'.',
          line: 1,
          column: 2,
        },
      ],
    },
    { code: '<svg width={32} height="2rem" />', errors: [svg('width={32} height="2rem"')] },
    { code: '<svg height="16px" fill="currentColor" />', errors: [svg('height="16px"')] },
    { code: '<svg fill="#1a73e8" />', errors: [svg('fill="#1a73e8"', 'color')] },
    ...named(
      "A component's own svg: one that takes the props it is given, or the root a component returns, is told to follow its slot or the text",
      [
        {
          code: 'const Mark = (props) => <svg width="24" height="24" {...props} />;',
          errors: [
            {
              message:
                'A component\'s <svg width="24" height="24"> takes its size from the file: write width="1em" height="1em", or leave them out, so it follows its slot or the text.',
            },
          ],
        },
        {
          code: '<svg width="48" fill="black" {...props} />',
          errors: [definition('width="48" fill="black"', 'size and color')],
        },
        {
          code: 'function Mark() { return <svg fill="#1a73e8" viewBox="0 0 24 24" />; }',
          errors: [
            {
              message:
                'A component\'s <svg fill="#1a73e8"> takes its color from the file: write fill="currentColor", so it takes the text color.',
            },
          ],
        },
        {
          code: 'const Mark = forwardRef((props, ref) => (dark ? <svg ref={ref} width="24" /> : null));',
          errors: [definition('width="24"')],
        },
      ],
    ),
    ...named("A function that isn't a component, and a child of another component, are not slots", [
      {
        code: 'items.map((item) => <svg key={item} width="24" />);',
        errors: [svg('width="24"')],
      },
      { code: '<Tooltip><svg width="24" /></Tooltip>', errors: [svg('width="24"')] },
    ]),
    ...named("An svg inside another element of a Graphic is not the Graphic's child", [
      {
        code: `${graphic}<Graphic alt=""><span><svg width="24" /></span></Graphic>`,
        errors: [svg('width="24"')],
      },
    ]),
    ...named(
      "start and end size only envUI's icons and a Graphic, so a raw svg or another package's icon there is told to go in a Graphic",
      [
        {
          code: "import { Github } from 'lucide-react';\n<Button start={<Github />}>Sign in</Button>;",
          errors: [
            {
              message:
                "A <Github> from lucide-react keeps the package's size in start, which sizes only envUI's icons and a Graphic: wrap it in envUI's <Graphic alt=\"\">: import { Graphic } from '@envsemble/envui'. envUI's own icons fit it: import { IconSearch } from '@envsemble/envui/icons/Search'.",
              line: 2,
              column: 17,
            },
          ],
        },
        {
          code: "import { ChevronRight } from 'lucide-react'; <Button end={open ? <ChevronRight /> : null}>Next</Button>;",
          errors: [iconsInSlot('ChevronRight', 'lucide-react', 'end')],
        },
        {
          code: '<List.Item start={<svg width="20" height="20" />}>Inbox</List.Item>',
          errors: [
            {
              message:
                'A raw <svg width="20" height="20"> keeps the file\'s size in start, which sizes only envUI\'s icons and a Graphic: wrap it in envUI\'s <Graphic alt="">: import { Graphic } from \'@envsemble/envui\'.',
            },
          ],
        },
        {
          code: "import { Folder } from 'lucide-react'; const items = [{ value: 'a', start: <Folder /> }];",
          errors: [iconsInSlot('Folder', 'lucide-react', 'start')],
        },
        {
          code: 'const items = [{ value: \'a\', end: <span><svg fill="#000" /></span> }];',
          errors: [svgInSlot('fill="#000"', 'end', 'color')],
        },
      ],
    ),
    ...named("A property that isn't an icon slot", [
      {
        code: 'const items = [{ label: \'Pipelines\', badge: <svg width="24" /> }];',
        errors: [svg('width="24"')],
      },
    ]),
    ...named('A Graphic without alt, imported, renamed, through a namespace, or by name alone', [
      {
        code: `${graphic}<Graphic src={logo} size="md" />`,
        errors: [
          {
            message:
              'Graphic needs alt: what the picture says, such as the company\'s name, or alt="" when the text beside it says it already.',
            line: 2,
            column: 2,
          },
        ],
      },
      {
        code: "import { Graphic as Picture } from '@envsemble/envui'; <Picture src={logo} />",
        errors: [alt],
      },
      { code: "import * as ui from '@envsemble/envui'; <ui.Graphic src={logo} />", errors: [alt] },
      { code: '<Graphic src={logo} />', errors: [alt] },
    ]),
    ...named('A negative margin on a Graphic, by each of its properties', [
      {
        code: `${graphic}<Graphic src={logo} alt="Acme" style={{ marginInlineStart: '-0.25rem', color: 'red' }} />`,
        errors: [
          {
            message:
              "A negative margin on a Graphic makes up for the file's empty edges: trim the file once with npx envui-graphic <file>, and drop the margin.",
            line: 2,
            column: 41,
          },
        ],
      },
      {
        code: `${graphic}<Graphic alt="" style={{ margin: -4, marginLeft: 2, 'margin-block-end': '-1px', marginBlock: 0, marginInline: '0 -2px', marginTop: 'calc(-1 * var(--env-space-1))' }} />`,
        errors: [margin, margin, margin, margin],
      },
      { code: '<Graphic style={{ margin: -4 }} />', errors: [alt, margin] },
    ]),
    ...named(
      "Another icon package's icon outside an icon slot or Graphic, from every kind of import",
      [
        {
          code: "import { Search } from 'lucide-react';\n<Search />;",
          errors: [
            {
              message:
                "A <Search> from lucide-react takes its size from the package: pass it to an icon slot, such as IconButton's icon, or wrap it in envUI's <Graphic alt=\"\">: import { Graphic } from '@envsemble/envui'. envUI's own icons fit its slots and text: import { IconSearch } from '@envsemble/envui/icons/Search'.",
              line: 2,
              column: 2,
            },
          ],
        },
        {
          code: "import { FaGithub } from 'react-icons/fa'; <Link href={repo}><FaGithub /> GitHub</Link>;",
          errors: [icons('FaGithub', 'react-icons/fa')],
        },
        {
          code: 'import { MagnifyingGlassIcon } from \'@heroicons/react/24/outline\'; <MagnifyingGlassIcon className="size-6" />;',
          errors: [icons('MagnifyingGlassIcon', '@heroicons/react/24/outline')],
        },
        {
          code: "import SearchIcon from '@mui/icons-material/Search'; <SearchIcon />;",
          errors: [icons('SearchIcon', '@mui/icons-material/Search')],
        },
        {
          code: "import * as Tabler from '@tabler/icons-react'; <Tabler.IconSearch size={24} />;",
          errors: [icons('Tabler.IconSearch', '@tabler/icons-react')],
        },
        {
          code: "const { Heart } = require('phosphor-react'); <Heart />;",
          errors: [icons('Heart', 'phosphor-react')],
        },
        {
          code: "import { Search as Find } from 'lucide-react'; <><IconButton icon={<Find />} /><Find /></>;",
          errors: [icons('Find', 'lucide-react')],
        },
      ],
    ),
    ...named('Allowing one package leaves the others reported', [
      {
        code: "import { SiGithub } from 'react-icons/si'; import { Search } from 'lucide-react'; <><SiGithub /><Search /></>;",
        options: [{ allow: ['react-icons'] }],
        errors: [icons('Search', 'lucide-react')],
      },
    ]),
  ],
});

typeScriptRuleTester.run('no-raw-graphics with TypeScript', rule, {
  valid: [
    ...named('Types render nothing', [
      "import type { LucideProps } from 'lucide-react';",
      "import { type IconProps } from '@tabler/icons-react';",
      "export type { IconProps } from '@phosphor-icons/react';",
      `${graphic}const Logo = (props: GraphicProps) => <Graphic {...props} />;`,
      '<svg width="1em" height="1em" fill="currentColor" {...(props as SVGProps<SVGSVGElement>)} />',
    ]),
  ],
  invalid: [
    {
      code: "import Lucide = require('lucide-react'); <Lucide.Search />;",
      errors: [icons('Lucide.Search', 'lucide-react')],
    },
    {
      code: "import { type LucideProps, Search } from 'lucide-react'; <Search />;",
      errors: [icons('Search', 'lucide-react')],
    },
    {
      code: `${graphic}const Logo = ({ size }: { size: 'md' }) => <Graphic src={logo} size={size} />;`,
      errors: [alt],
    },
    {
      code: 'const Mark = (): JSX.Element => <svg width="20" height="20" />;',
      errors: [definition('width="20" height="20"')],
    },
    { code: '<img src={logo as string} alt="" />', errors: [img] },
  ],
});

test('an unknown allow entry is a configuration error that lists the packages', () => {
  assert.throws(
    () =>
      new Linter().verify(
        '',
        {
          plugins: { envui: { rules: { 'no-raw-graphics': rule } } },
          rules: { 'envui/no-raw-graphics': ['error', { allow: ['feather-icons'] }] },
        },
        'App.js',
      ),
    /unknown allow entry "feather-icons"\. Known packages: lucide-react, react-icons/,
  );
});

test('a Graphic from a module listed in reexportModules needs alt', () => {
  const fixture = fileURLToPath(new URL('fixtures/app/', import.meta.url));
  const lint = (source) =>
    new Linter({ cwd: fixture })
      .verify(
        `import { Graphic } from '${source}';\nconst logo = <Graphic src={src} />;`,
        {
          plugins: { envui: { rules: { 'no-raw-graphics': rule } } },
          languageOptions: { sourceType: 'module', parserOptions: { ecmaFeatures: { jsx: true } } },
          settings: { envui: { reexportModules: ['./src/ui', '@/components/ui'] } },
          rules: { 'envui/no-raw-graphics': 'error' },
        },
        resolve(fixture, 'src/App.js'),
      )
      .map((message) => message.ruleId ?? message.message);
  assert.deepEqual(lint('./ui'), ['envui/no-raw-graphics']);
  assert.deepEqual(lint('@/components/ui'), ['envui/no-raw-graphics']);
  assert.deepEqual(lint('./graphics'), []);
});
