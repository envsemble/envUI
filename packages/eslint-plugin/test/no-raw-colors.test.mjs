import { readFileSync } from 'node:fs';
import rule from '../src/rules/no-raw-colors.js';
import { colorTokenAdvice } from '../src/tokens.js';
import { ruleTester, typeScriptRuleTester } from './RuleTester.mjs';

/** A raw color in a property; the property decides which tokens the message suggests. */
const raw = (color, property) => ({
  messageId: 'rawColor',
  data: { color, advice: colorTokenAdvice(property) },
});

/** The color values the Stylelint config's tests read too, which both packages read alike. */
const colorValues = JSON.parse(
  readFileSync(new URL('../../../tests/lint/ColorValues.json', import.meta.url), 'utf8'),
);
const inlineColor = (value) => `<div style={{ color: ${JSON.stringify(value)} }} />`;

ruleTester.run('no-raw-colors reads color values as the Stylelint config does', rule, {
  valid: colorValues.accepted.map(inlineColor),
  invalid: colorValues.rejected.map((entry) => {
    const [value, color] = Array.isArray(entry) ? entry : [entry, entry];
    return { code: inlineColor(value), errors: [raw(color, 'color')] };
  }),
});

ruleTester.run('no-raw-colors', rule, {
  valid: [
    // A template whose expressions sit outside any color.
    `<div style={{ color: \`var(--env-color-fg-\${tone})\`, background: \`rgb(var(--rgb) / \${alpha})\` }} />`,
    // Colors inside CSS strings.
    `<div style={{ content: '"rgb(1 2 3) #fff"', quotes: "'red' 'blue'" }} />`,
    '<div style={{ color: "currentColor", borderColor: "transparent", fill: "inherit" }} />',
    // Words that are not colors, and named colors where a property does not take one.
    '<div style={{ border: "1px solid", fontFamily: "Tan Pearl", animationName: "red" }} />',
    '<div style={{ "--accent": "red", gridArea: "navy" }} />',
    '<div style={{ backgroundImage: "url(#gradient)", maskImage: "url(images/teal.svg)" }} />',
    // A fragment reference built from an expression, in url() or a CSS string, is not a color.
    `<div style={{ clipPath: \`url(#\${id})\`, content: \`"#\${count}"\`, fill: \`url('#\${id}')\` }} />`,
    '<div style={{ width: 120, padding: "0.5rem" }} />',
    // Colors outside inline styles are other rules' concern.
    '<path fill="#ff0000" />',
    "const theme = { primary: '#0b57d0' };",
    '<div title="#fff" />',
    '<div style={styles} />',
    // Strings that choose a style are not its value: a member's key, and the selector given to a
    // DOM lookup.
    `<div style={styles[\`#\${id}\`]} />`,
    `<div style={{ color: theme[\`#\${id}\`], background: theme['#fff'] }} />`,
    `<div style={pick(document.querySelector(\`#\${id} .x\`))} />`,
    `<div style={pick(root.querySelectorAll('#fff, .red'))} />`,
    `<div style={{ color: read(element.closest('#fff')), background: read(node?.matches('#000')) }} />`,
    `<div style={read(document.getElementById('fff'), document.getElementById(\`#\${id}\`))} />`,
    // Adding numbers, and concatenated strings without a color.
    `<div style={{ width: base + 4, color: 'var(--env-color-fg-' + tone + ')' }} />`,
  ],
  invalid: [
    {
      code: '<div style={{ color: "#fff" }} />',
      errors: [
        {
          message:
            'Raw color #fff in an inline style: use an envUI color token instead, such as var(--env-color-fg-default) or another var(--env-color-fg-…) role, so the color follows the theme and keeps its contrast.',
          line: 1,
          column: 22,
        },
      ],
    },
    {
      code: `<div style={{ content: '"a"', color: 'RGB(1 2 3)' }} />`,
      errors: [raw('RGB(1 2 3)', 'color')],
    },
    {
      code: '<div style={{ border: "1px solid red" }} />',
      errors: [
        {
          message:
            'Raw color red in an inline style: use an envUI color token instead, such as var(--env-color-border-default) or another var(--env-color-border-…) role, so the color follows the theme and keeps its contrast.',
        },
      ],
    },
    {
      code: '<div style={{ backgroundColor: "White" }} />',
      errors: [raw('White', 'backgroundColor')],
    },
    {
      code: '<div style={{ boxShadow: "0 1px 2px rgb(0 0 0 / 20%), 0 0 0 1px #ddd" }} />',
      errors: [
        {
          message:
            'Raw color #ddd in an inline style: use an envUI color token instead, one of the var(--env-color-fg-…), var(--env-color-bg-…) or var(--env-color-border-…) roles, so the color follows the theme and keeps its contrast.',
        },
        raw('rgb(0 0 0 / 20%)', 'boxShadow'),
      ],
    },
    {
      code: '<div style={{ backgroundImage: "linear-gradient(white, hsl(0 0% 90%))" }} />',
      errors: [raw('hsl(0 0% 90%)', 'backgroundImage'), raw('white', 'backgroundImage')],
    },
    // Custom properties set inline, including envUI's own tokens.
    {
      code: '<div style={{ "--env-color-bg-default": "#101010" }} />',
      errors: [raw('#101010', '--env-color-bg-default')],
    },
    // Values that depend on state, and spread style objects.
    {
      code: '<div style={{ color: danger ? "#b3261e" : "var(--env-color-fg-default)" }} />',
      errors: [raw('#b3261e', 'color')],
    },
    {
      code: `<div style={{ ...base, outlineColor: \`\${ring}\`, color: \`#000\` }} />`,
      errors: [raw('#000', 'color')],
    },
    {
      code: '<div style={open ? { background: "black" } : undefined} />',
      errors: [raw('black', 'background')],
    },
    { code: '<Card style={{ ["borderColor"]: "#ccc" }} />', errors: [raw('#ccc', 'borderColor')] },
    // A template literal is read whole, its expressions standing for literal channels.
    {
      code: `<div style={{ color: \`rgb(\${r} 0 0)\` }} />`,
      errors: [{ ...raw(`rgb(\${…} 0 0)`, 'color'), column: 22, endColumn: 37 }],
    },
    {
      code: `<div style={{ color: \`rgba(\${r}, \${g}, \${b}, 0.5)\` }} />`,
      errors: [raw(`rgba(\${…}, \${…}, \${…}, 0.5)`, 'color')],
    },
    // A # followed by an expression is a hex color built from it, outside url() and strings.
    {
      code: `<div style={{ color: \`#\${hex}\` }} />`,
      errors: [raw(`#\${…}`, 'color')],
    },
    {
      code: `<div style={{ '--accent': \`#\${hex}\` }} />`,
      errors: [raw(`#\${…}`, '--accent')],
    },
    {
      code: `<div style={{ border: \`1px solid #\${r}\${g}\${b}\`, background: \`#fff\${alpha}\` }} />`,
      errors: [raw(`#\${…}\${…}\${…}`, 'border'), raw(`#fff\${…}`, 'background')],
    },
    // So is one concatenated from strings, read whole, with its other operands on their own.
    {
      code: `<div style={{ color: '#' + hex, background: '#fff' + alpha, fill: \`#\${r}\` + g + 'cc' }} />`,
      errors: [
        raw(`#\${…}`, 'color'),
        raw(`#fff\${…}`, 'background'),
        raw(`#\${…}\${…}cc`, 'fill'),
      ],
    },
    {
      code: `<div style={{ border: '1px solid #' + (dark ? '000' : 'fff'), color: x + '#' + y }} />`,
      errors: [raw(`#\${…}`, 'border'), raw(`#\${…}`, 'color')],
    },
    // Strings and url() spanning expressions don't hide a color between them.
    {
      code: `<div style={{ background: \`url('\${a}') #fff url('\${b}')\` }} />`,
      errors: [raw('#fff', 'background')],
    },
    {
      code: `<div style={{ fontFamily: \`'\${a}' #fff '\${b}'\` }} />`,
      errors: [raw('#fff', 'fontFamily')],
    },
    // Colors in an expression of a template are checked too.
    {
      code: `<div style={{ border: \`1px solid \${on ? "#000" : "var(--env-color-border-default)"}\` }} />`,
      errors: [raw('#000', 'border')],
    },
    // A call's callee and arguments are part of the value: a color passed to a helper, a style
    // object built by one, and a string whose method is called.
    {
      code: `<div style={{ color: darken('#123456', 0.1), background: alpha('#000', .5) }} />`,
      errors: [raw('#123456', 'color'), raw('#000', 'background')],
    },
    {
      code: `<div style={{ color: lighten('#fff', 0.2), background: new Color('#000').css }} />`,
      errors: [raw('#fff', 'color'), raw('#000', 'background')],
    },
    {
      code: `<div style={useMemo(() => ({ color: '#fff' }), [])} />`,
      errors: [raw('#fff', 'color')],
    },
    {
      code: `<div style={mergeStyles(base, { color: 'red' })} />`,
      errors: [raw('red', 'color')],
    },
    {
      code: `<div style={Object.assign({}, a, { color: '#fff' })} />`,
      errors: [raw('#fff', 'color')],
    },
    {
      code: `<div style={{ color: '#fff'.toUpperCase() }} />`,
      errors: [raw('#fff', 'color')],
    },
    {
      // A lookup's selector passes, but the rest of the call around it does not.
      code: `<div style={{ color: pick(document.querySelector('#fff'), '#000') }} />`,
      errors: [raw('#000', 'color')],
    },
  ],
});

typeScriptRuleTester.run('no-raw-colors in TypeScript', rule, {
  valid: ['const style: CSSProperties = { color: "#fff" };'],
  invalid: [
    {
      code: 'export const Dot = ({ on }: { on: boolean }) => <span style={{ background: on ? "lime" : "gray" }} />;',
      errors: [raw('lime', 'background'), raw('gray', 'background')],
    },
  ],
});
