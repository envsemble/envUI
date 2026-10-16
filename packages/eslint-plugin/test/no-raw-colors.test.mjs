import rule from '../src/rules/no-raw-colors.js';
import { colorTokenSuggestion } from '../src/tokens.js';
import { ruleTester, typeScriptRuleTester } from './RuleTester.mjs';

/** A raw color in a property; the property decides which tokens the message suggests. */
const raw = (color, property) => ({
  messageId: 'rawColor',
  data: { color, tokens: colorTokenSuggestion(property) },
});

ruleTester.run('no-raw-colors', rule, {
  valid: [
    '<div style={{ color: "var(--color-fg-muted)" }} />',
    '<div style={{ background: "color-mix(in srgb, var(--color-bg-default) 80%, transparent)" }} />',
    // A relative color derived from a token keeps following it.
    '<div style={{ color: "hsl(from var(--color-fg-link) h s calc(l - 10))" }} />',
    '<div style={{ color: "currentColor", borderColor: "transparent", fill: "inherit" }} />',
    // Words that are not colors, and named colors where a property does not take one.
    '<div style={{ border: "1px solid", fontFamily: "Tan Pearl", animationName: "red" }} />',
    '<div style={{ "--accent": "red", gridArea: "navy" }} />',
    '<div style={{ backgroundImage: "url(#gradient)", maskImage: "url(images/teal.svg)" }} />',
    '<div style={{ width: 120, padding: "0.5rem" }} />',
    // Colors outside inline styles are other rules' concern.
    '<path fill="#ff0000" />',
    "const theme = { primary: '#0b57d0' };",
    '<div title="#fff" />',
    '<div style={styles} />',
  ],
  invalid: [
    {
      code: '<div style={{ color: "#fff" }} />',
      errors: [
        {
          message:
            'Raw color #fff in an inline style: use an envUI color token instead, such as var(--color-fg-default) or another var(--color-fg-…) role, so the color follows the theme and keeps its contrast.',
          line: 1,
          column: 22,
        },
      ],
    },
    {
      code: '<div style={{ background: "#0B57D0CC" }} />',
      errors: [raw('#0B57D0CC', 'background')],
    },
    {
      code: '<div style={{ color: "rgb(0 0 0 / 50%)" }} />',
      errors: [raw('rgb(0 0 0 / 50%)', 'color')],
    },
    {
      code: '<div style={{ color: "rgba(0, 0, 0, 0.5)" }} />',
      errors: [raw('rgba(0, 0, 0, 0.5)', 'color')],
    },
    {
      code: '<div style={{ color: "hsl(210 50% 40%)" }} />',
      errors: [raw('hsl(210 50% 40%)', 'color')],
    },
    {
      code: '<div style={{ color: "oklch(0.6 0.15 250)" }} />',
      errors: [raw('oklch(0.6 0.15 250)', 'color')],
    },
    {
      code: '<div style={{ color: "color(display-p3 1 0 0)" }} />',
      errors: [raw('color(display-p3 1 0 0)', 'color')],
    },
    {
      code: '<div style={{ border: "1px solid red" }} />',
      errors: [
        {
          message:
            'Raw color red in an inline style: use an envUI color token instead, such as var(--color-border-default) or another var(--color-border-…) role, so the color follows the theme and keeps its contrast.',
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
            'Raw color #ddd in an inline style: use an envUI color token instead, one of the var(--color-fg-…), var(--color-bg-…) or var(--color-border-…) roles, so the color follows the theme and keeps its contrast.',
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
      code: '<div style={{ "--color-bg-default": "#101010" }} />',
      errors: [raw('#101010', '--color-bg-default')],
    },
    // Values that depend on state, and spread style objects.
    {
      code: '<div style={{ color: danger ? "#b3261e" : "var(--color-fg-default)" }} />',
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
