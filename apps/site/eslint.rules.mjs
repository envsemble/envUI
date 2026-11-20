import envui from '@envsemble/eslint-plugin-envui';

const siteImports = {
  regex: String.raw`^(\.\./)+(packages/ui/src|scripts)(/|$)`,
  message:
    'Import the library from @envsemble/envui and its internals from @envui-internal/*; the site imports nothing of scripts/.',
};

const siteInternals = {
  'content/internal/codeHighlighting':
    'The highlighter that makes the code tokens a pre-rendered page hands the library.',
  'content/internal/givenCodeTokens':
    'The pre-rendered page’s code tokens, handed to the library’s components before they hydrate.',
  'content/internal/givenMarkdownTrees':
    'The pre-rendered page’s Markdown trees, handed to the library’s components before they hydrate.',
  'internal/provider/LinkComponentContext':
    'The link component an application gives the library, which the site’s own links follow.',
  'internal/dom/paints': 'What a box paints, which the fit centres a picture on.',
  'internal/motion/motionTokens':
    'How a motion token is read and eased, as the library’s own motion reads it.',
  'styles/SegmentedControl.css':
    'The look of the Design/Code switch, whose segments are links rather than the radios SegmentedControl renders.',
};
const siteInternalImports = {
  regex: String.raw`^@envui-internal/(?!(${Object.keys(siteInternals).join('|')})$)`,
  message:
    'The site imports only the library internals listed in apps/site/eslint.rules.mjs (siteInternals): keep a small helper of its own in apps/site/src/shared/, or list the module with its reason.',
};

const siteFolders = [
  'navigation',
  'pages',
  'frame',
  'search',
  'brand',
  'template',
  'specimens',
  'figures',
  'markdown',
  'tiles',
  'motion',
  'fit',
  'routes',
  'loading',
  'display',
  'examples',
  'shared',
  'generated',
  'documentation',
];
const folderDepths = [1, 2, 3];
const siteFolderOrder = siteFolders.slice(1).flatMap((folder, index) =>
  folderDepths.map((depth) => ({
    files: [`apps/site/src/${folder}/${'*/'.repeat(depth - 1)}*.{ts,tsx}`],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            siteImports,
            siteInternalImports,
            {
              regex: String.raw`^(\.\./){${depth}}(${siteFolders.slice(0, index + 1).join('|')})(/|$)`,
              message: `${folder}/ imports only the folders after it in siteFolders, in apps/site/eslint.rules.mjs: move what both use into ${folder}/ or below it.`,
            },
          ],
        },
      ],
    },
  })),
);

const siteResizeObserver = {
  selector: "NewExpression[callee.name='ResizeObserver']",
  message:
    'Measure through remeasure (apps/site/src/shared/Remeasure.ts), the site’s one measuring loop.',
};

const previewNames = [
  'VariableDeclarator > Identifier.id',
  'FunctionDeclaration > Identifier.id',
  'ClassDeclaration > Identifier.id',
  'TSTypeAliasDeclaration > Identifier.id',
  'TSInterfaceDeclaration > Identifier.id',
  'TSPropertySignature > Identifier.key',
  'MethodDefinition > Identifier.key',
  'PropertyDefinition > Identifier.key',
  'ObjectExpression > Property > Identifier.key',
  ':function > Identifier.params',
].map((declared) => ({
  selector: `${declared}[name=/preview/i]`,
  message:
    'Name it with the site’s words, example, specimen, tile, figure or stage: preview is an older name.',
}));

export const siteConfigs = [
  {
    files: ['apps/site/src/**/*.{ts,tsx}'],
    ignores: ['apps/site/src/examples/**'],
    rules: { 'no-restricted-syntax': ['error', ...previewNames, siteResizeObserver] },
  },
  {
    files: ['apps/site/src/shared/Remeasure.ts'],
    rules: { 'no-restricted-syntax': ['error', ...previewNames] },
  },
  {
    files: ['apps/site/src/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': ['error', { patterns: [siteImports, siteInternalImports] }] },
  },
  ...siteFolderOrder,
  {
    ...envui.configs.strict,
    files: ['apps/site/src/examples/**/*.{ts,tsx}'],
  },
];
