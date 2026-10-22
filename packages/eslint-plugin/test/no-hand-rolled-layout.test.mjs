import rule from '../src/rules/no-hand-rolled-layout.js';
import { ruleTester, typeScriptRuleTester } from './RuleTester.mjs';

const layout = (messageId, display) => ({ messageId, data: { display } });

ruleTester.run('no-hand-rolled-layout', rule, {
  valid: [
    // Displays that don't lay out a row, a column or a grid.
    '<div style={{ display: "none" }} />',
    '<div style={{ display: "block", gap: "var(--env-space-3)" }} />',
    '<span style={{ display: "inline-block" }} />',
    '<div style={{ display: "contents" }} />',
    `<div style={{ display: open ? 'block' : 'none' }} />`,
    // Flex and grid properties without a display of their own, as on a child of a Row.
    '<div style={{ flex: 1, gridColumn: "span 2", minInlineSize: 0 }} />',
    // A computed display, a style from elsewhere, and the word outside the display property.
    '<div style={{ display }} />',
    '<div style={{ display: mode }} />',
    '<div style={styles.toolbar} />',
    '<div style={{ fontFamily: "grid", content: "\'flex\'" }} />',
    // Not a style attribute.
    '<div data-display="flex" title={{ display: "grid" }} />',
    "const style = { display: 'flex' };",
    // A constant whose object sets no layout display, one that isn't an object or isn't a
    // constant, and a key that only shares a variable's name.
    "const card = { padding: '1rem' }; <div style={card} />",
    "let row = { display: 'flex' }; row = {}; <div style={row} />",
    'function Item({ row }) { return <div style={row} />; }',
    "const display = { display: 'grid' }; <div style={{ display: 'block', [key]: 1 }} />",
    'const styles = { toolbar: base }; <div style={styles.toolbar} />',
    // A constant passed to a call is an argument the call may change, not the style itself.
    "const config = { display: 'flex' }; <div style={css(config)} />",
    "const styles = { bar: { display: 'grid' } }; <div style={css(styles.bar)} />",
    "const config = { display: 'flex' }; <div style={useMemo(() => build(config), [])} />",
    // A string that isn't a constant, or a constant that isn't a layout display.
    "let d = 'flex'; d = 'block'; <div style={{ display: d }} />",
    "const d = 'block'; <div style={{ display: d }} />",
  ],
  invalid: [
    {
      code: '<div style={{ display: "flex" }} />',
      errors: [
        {
          message:
            "Inline `display: flex` lays out a row by hand: use envUI's Row instead, import { Row } from '@envsemble/envui', with its gap, padding and alignment props and `wrap` to wrap. Keep plain CSS only where Row can't do what you need.",
          line: 1,
          column: 24,
        },
      ],
    },
    {
      code: '<div style={{ display: "flex", flexDirection: "column", gap: "var(--env-space-2)" }} />',
      errors: [
        {
          message:
            "Inline `display: flex` lays out a column by hand: use envUI's Column instead, import { Column } from '@envsemble/envui', with its gap, padding and alignment props. Keep plain CSS only where Column can't do what you need.",
        },
      ],
    },
    {
      code: '<div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }} />',
      errors: [
        {
          message:
            "Inline `display: grid` lays out a grid by hand: use envUI's Grid instead, import { Grid } from '@envsemble/envui', with its columns, gap, padding and alignment props. Keep plain CSS only where Grid can't do what you need.",
        },
      ],
    },
    {
      code: '<div style={{ display: "inline-flex", flexDirection: "row-reverse" }} />',
      errors: [layout('row', 'inline-flex')],
    },
    {
      code: '<div style={{ display: "inline-grid" }} />',
      errors: [layout('grid', 'inline-grid')],
    },
    {
      code: "<div style={{ 'display': `flex`, 'flex-direction': 'column-reverse' }} />",
      errors: [layout('column', 'flex')],
    },
    // A computed or mixed direction could be either.
    {
      code: '<div style={{ display: "flex", flexDirection: direction }} />',
      errors: [layout('rowOrColumn', 'flex')],
    },
    {
      code: `<div style={{ display: 'flex', flexDirection: narrow ? 'column' : 'row' }} />`,
      errors: [layout('rowOrColumn', 'flex')],
    },
    // Each branch of a condition, and both sides of a logical expression.
    {
      code: `<div style={{ display: wide ? 'grid' : 'flex' }} />`,
      errors: [layout('grid', 'grid'), layout('row', 'flex')],
    },
    {
      code: `<div style={{ display: open && 'flex' }} />`,
      errors: [layout('row', 'flex')],
    },
    // Objects anywhere in the style value: spread, merged, memoized or nested.
    {
      code: `<div style={{ ...base, ...(stacked ? { display: 'flex', flexDirection: 'column' } : {}) }} />`,
      errors: [layout('column', 'flex')],
    },
    {
      code: `<div style={useMemo(() => ({ display: 'grid' }), [])} />`,
      errors: [layout('grid', 'grid')],
    },
    {
      code: `<Card style={{ display: "flex" }} />`,
      errors: [layout('row', 'flex')],
    },
    // A constant of the same file, reported once where it sets the display.
    {
      code: `const row = { display: 'flex', alignItems: 'center', gap: '0.5rem' };
<div style={row} />;
<p style={row} />;`,
      errors: [{ ...layout('row', 'flex'), line: 1, column: 24 }],
    },
    {
      code: `const styles = { list: { display: 'flex', flexDirection: 'column' }, title: {} };
<div style={styles.list} />;
<div style={styles.title} />;`,
      errors: [layout('column', 'flex')],
    },
    {
      code: `const bar = { inlineSize: '100%', display: 'grid' };
<div style={{ ...bar, padding: 0 }} />;`,
      errors: [layout('grid', 'grid')],
    },
    {
      code: `const row = { display: 'flex' };
<div style={open ? row : undefined} />;`,
      errors: [layout('row', 'flex')],
    },
    // A constant string, reported where the style names it, also for the direction.
    {
      code: `const d = 'flex';
const direction = 'column';
<div style={{ display: d, flexDirection: direction }} />;`,
      errors: [{ ...layout('column', 'flex'), line: 3, column: 24 }],
    },
    {
      code: `const display = wide ? 'grid' : 'block';
<div style={{ display }} />;`,
      errors: [layout('grid', 'grid')],
    },
  ],
});

typeScriptRuleTester.run('no-hand-rolled-layout in TypeScript', rule, {
  valid: ['<div style={{ display: "block" } as const} />'],
  invalid: [
    {
      code: `const heading = { display: 'flex', alignItems: 'center' } as const;
<div style={heading} />;`,
      errors: [layout('row', 'flex')],
    },
    {
      code: `<div style={{ display: 'grid' as const } satisfies CSSProperties} />`,
      errors: [layout('grid', 'grid')],
    },
    {
      code: `<div style={{ display: 'flex', flexDirection: 'column' as const }} />`,
      errors: [layout('column', 'flex')],
    },
  ],
});
