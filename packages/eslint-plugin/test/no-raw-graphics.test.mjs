import assert from 'node:assert/strict';
import { Linter } from 'eslint';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import rule from '../src/rules/no-raw-graphics.js';
import { ruleTester, typeScriptRuleTester } from './RuleTester.mjs';

const img = { messageId: 'img' };
const alt = { messageId: 'alt' };
const margin = { messageId: 'margin' };
const svg = (attributes, what = 'size') => ({ messageId: 'svg', data: { attributes, what } });
const icons = (source) => ({ messageId: 'iconPackage', data: { source } });

const graphic = "import { Graphic } from '@envsemble/envui';\n";

ruleTester.run('no-raw-graphics', rule, {
  valid: [
    // envUI's Graphic and icons.
    `${graphic}<Graphic src={logo} alt="Acme" size="md" />`,
    `${graphic}<Graphic alt=""><AcmeMark /></Graphic>`,
    `${graphic}<Graphic {...logoProps} />`,
    "import { IconSearch } from '@envsemble/envui/icons/Search'; <IconSearch />",
    // A Graphic of another library's, or of the application's own, needs no alt.
    "import { Graphic } from './charts'; <Graphic data={data} />",
    'function Graphic() { return null; } <Graphic />',
    // An svg whose size follows the text or its container, whose fill is the text color or none,
    // or whose attributes are computed: a custom icon component, as envUI's own Icon writes it.
    '<svg width="1em" height="1em" fill="currentColor" viewBox="0 0 24 24"><path d={d} /></svg>',
    '<svg width="1.5em" height="100%" fill="none" stroke="currentColor" />',
    '<svg fill="CurrentColor" viewBox="0 0 24 24" />',
    '<svg width={size} height={size} fill={color} />',
    '<svg viewBox="0 0 24 24" aria-hidden="true" />',
    '<svg className="mark" />',
    // An svg that only holds definitions draws nothing.
    '<svg width="0" height="0" aria-hidden="true"><defs /></svg>',
    // An svg in an icon slot, or in a Graphic, takes its size from there.
    '<Button startIcon={<svg width="24" height="24" />}>Save</Button>',
    '<IconButton icon={<svg width="16" height="16" fill="#1a73e8" />} />',
    '<Badge endIcon={open ? <svg width="12" /> : null} />',
    `${graphic}<Graphic alt=""><svg width="24" height="24" fill="#000" /></Graphic>`,
    // What a part renders in place of its own element.
    '<Avatar.Image render={<img src={photo} alt="" />} />',
    // A margin set elsewhere, or on another element; a style that isn't an object literal.
    `${graphic}<Graphic alt="" style={{ padding: 0, inlineSize: '100%' }} />`,
    `${graphic}<Graphic alt="" style={styles.logo} />`,
    '<Card style={{ margin: 0 }} />',
    // Modules that only share a prefix with an icon package, and other packages.
    "import { Search } from 'lucide-react-native-shim';",
    "import Icons from 'react-iconset';",
    "import { Box } from '@mui/material';",
    "const icons = require(name); const m = import(name); require('lodash', 1);",
    // Allowed by option.
    {
      code: "import { SiGithub } from 'react-icons/si';",
      options: [{ allow: ['react-icons'] }],
    },
  ],
  invalid: [
    {
      code: '<img src={logo} alt="Acme" />',
      errors: [
        {
          message:
            "Use envUI's Graphic instead of a raw <img>: import { Graphic } from '@envsemble/envui'. Its size comes from envUI's steps, not the file's: <Graphic src={logo} alt=\"Acme\" size=\"md\" />.",
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
            'A raw <svg width="24" height="24"> takes its size from the file: pass it to an icon slot, such as Button\'s startIcon, or wrap it in envUI\'s <Graphic alt="">: import { Graphic } from \'@envsemble/envui\'.',
          line: 1,
          column: 2,
        },
      ],
    },
    { code: '<svg width={32} height="2rem" />', errors: [svg('width={32} height="2rem"')] },
    { code: '<svg height="16px" fill="currentColor" />', errors: [svg('height="16px"')] },
    { code: '<svg fill="#1a73e8" />', errors: [svg('fill="#1a73e8"', 'color')] },
    {
      code: '<svg width="48" fill="black" {...props} />',
      errors: [svg('width="48" fill="black"', 'size and color')],
    },
    // A custom icon component with a fixed size of its own.
    {
      code: 'const Mark = (props) => <svg width="24" height="24" {...props} />;',
      errors: [svg('width="24" height="24"')],
    },
    // A child of another component is not in a slot.
    { code: '<Tooltip><svg width="24" /></Tooltip>', errors: [svg('width="24"')] },
    // A Graphic without alt, imported, renamed, through a namespace, or by name alone.
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
    // A margin on a Graphic, by each of its properties.
    {
      code: `${graphic}<Graphic src={logo} alt="Acme" style={{ marginInlineStart: '-0.25rem', color: 'red' }} />`,
      errors: [
        {
          message:
            "A margin on a Graphic makes up for the file's empty edges: trim the file once with npx envui-graphic <file>, and drop the margin.",
          line: 2,
          column: 41,
        },
      ],
    },
    {
      code: `${graphic}<Graphic alt="" style={{ margin: 4, marginLeft: -2, 'margin-block-end': '1px', marginBlock: 0 }} />`,
      errors: [margin, margin, margin, margin],
    },
    { code: '<Graphic style={{ margin: 4 }} />', errors: [alt, margin] },
    // Imports from other icon packages, in every form.
    {
      code: "import { Search } from 'lucide-react';",
      errors: [
        {
          message:
            "Use envUI's icons instead of lucide-react: import { IconSearch } from '@envsemble/envui/icons/Search'. For the app's own icons and logos, use Graphic: import { Graphic } from '@envsemble/envui'.",
          line: 1,
          column: 24,
        },
      ],
    },
    { code: "import { FaGithub } from 'react-icons/fa';", errors: [icons('react-icons/fa')] },
    {
      code: "import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';",
      errors: [icons('@heroicons/react/24/outline')],
    },
    {
      code: "import SearchIcon from '@mui/icons-material/Search';",
      errors: [icons('@mui/icons-material/Search')],
    },
    {
      code: "export { IconSearch } from '@tabler/icons-react';",
      errors: [icons('@tabler/icons-react')],
    },
    { code: "export * from '@phosphor-icons/react';", errors: [icons('@phosphor-icons/react')] },
    { code: "const { Heart } = require('phosphor-react');", errors: [icons('phosphor-react')] },
    {
      code: 'const icons = import(`lucide-react`);',
      languageOptions: { ecmaVersion: 2022 },
      errors: [icons('lucide-react')],
    },
    // Allowing one package leaves the others reported.
    {
      code: "import { SiGithub } from 'react-icons/si'; import { Search } from 'lucide-react';",
      options: [{ allow: ['react-icons'] }],
      errors: [icons('lucide-react')],
    },
  ],
});

typeScriptRuleTester.run('no-raw-graphics with TypeScript', rule, {
  valid: [
    // Types render nothing.
    "import type { LucideProps } from 'lucide-react';",
    "import { type IconProps } from '@tabler/icons-react';",
    "export type { IconProps } from '@phosphor-icons/react';",
    `${graphic}const Logo = (props: GraphicProps) => <Graphic {...props} />;`,
    '<svg width="1em" height="1em" fill="currentColor" {...(props as SVGProps<SVGSVGElement>)} />',
  ],
  invalid: [
    {
      code: "import Search = require('lucide-react');",
      errors: [icons('lucide-react')],
    },
    {
      code: "import { type LucideProps, Search } from 'lucide-react';",
      errors: [icons('lucide-react')],
    },
    {
      code: `${graphic}const Logo = ({ size }: { size: 'md' }) => <Graphic src={logo} size={size} />;`,
      errors: [alt],
    },
    {
      code: 'const Mark = (): JSX.Element => <svg width="20" height="20" />;',
      errors: [svg('width="20" height="20"')],
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
