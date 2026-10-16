import rule from '../src/rules/no-private-classes.js';
import { ruleTester, typeScriptRuleTester } from './RuleTester.mjs';

const className = (name) => ({ messageId: 'className', data: { name } });
const selector = (name) => ({ messageId: 'selector', data: { name } });
const stylesheet = (name) => ({ messageId: 'stylesheet', data: { name } });

ruleTester.run('no-private-classes', rule, {
  valid: [
    '<div className="toolbar" />',
    '<div className="my-env-banner" />',
    '<div className={clsx("toolbar", active && "toolbar-active")} />',
    // The theme boundary is documented: applications set envUI's tokens on it.
    '<div className="env-theme" />',
    "document.querySelector('.env-theme')",
    // A CSS module's own class, looked up by name.
    "<div className={styles['env-panel']} />",
    // Strings that are not class names or selectors.
    '<div title="env-button" data-variant="env-button" />',
    "const label = 'env-button';",
    "document.getElementById('env-button')",
    "page.getByRole('button', { name: 'Save' })",
    'const styles = css`.toolbar { gap: 1rem; }`;',
    { code: '<div className="env-button" />', options: [{ allow: ['env-button'] }] },
    { code: '<div class="env-button" />', options: [{ attributes: ['className'] }] },
    { code: "merge('env-button')", options: [{ functions: ['clsx'] }] },
  ],
  invalid: [
    {
      code: '<button className="env-button env-button-primary" />',
      errors: [
        {
          message:
            'env-button is a private envUI class: its name and styles can change in any envUI release. Use the component and its props instead, and put your own class on your own element for anything else.',
          line: 1,
          column: 19,
        },
        className('env-button-primary'),
      ],
    },
    { code: '<div class="env-card" />', errors: [className('env-card')] },
    { code: '<div className={"env-card"} />', errors: [className('env-card')] },
    { code: `<div className={\`env-card \${extra}\`} />`, errors: [className('env-card')] },
    {
      code: `<div className={\`env-button-\${variant}\`} />`,
      errors: [className('env-button-…')],
    },
    {
      code: '<div className={active ? "env-row-selected" : "row"} />',
      errors: [className('env-row-selected')],
    },
    {
      code: '<div className={clsx("row", { "env-row-selected": selected }, [open && "env-row-open"])} />',
      errors: [className('env-row-selected'), className('env-row-open')],
    },
    { code: '<div className={cn(base, "env-surface")} />', errors: [className('env-surface')] },
    // A utility class's arbitrary variant that reaches into envUI's markup.
    { code: '<div className="[&_.env-button]:px-2" />', errors: [className('env-button')] },
    // Class-name helpers outside JSX.
    {
      code: "const classes = classNames('env-text-caption', extra);",
      errors: [className('env-text-caption')],
    },
    { code: "element.classList.add('env-dialog-open');", errors: [className('env-dialog-open')] },
    { code: "element.classList.toggle('env-hidden', hidden);", errors: [className('env-hidden')] },
    // Selectors that find envUI's markup, in the DOM and in browser tests.
    {
      code: "document.querySelector('.env-app-topbar').offsetHeight",
      errors: [
        {
          message:
            "env-app-topbar selects envUI's private markup, which can change in any envUI release. Find the element by its role or label, or through a ref or a data attribute you own.",
        },
      ],
    },
    {
      code: "root.querySelectorAll('nav .env-navigation-item')",
      errors: [selector('env-navigation-item')],
    },
    { code: "target.closest('.env-menu-popup, .menu')", errors: [selector('env-menu-popup')] },
    {
      code: "page.locator('.env-dialog .env-button').click()",
      errors: [selector('env-dialog'), selector('env-button')],
    },
    { code: 'element.matches(\'[class*="env-button"]\')', errors: [selector('env-button')] },
    { code: "document.getElementsByClassName('env-toast')", errors: [selector('env-toast')] },
    // Style sheets in JavaScript.
    {
      code: 'const Header = styled.header`& .env-app-topbar { height: 3rem; }`;',
      errors: [stylesheet('env-app-topbar')],
    },
    {
      code: 'const Wrapped = styled(Card)`.env-card-title { margin: 0; }`;',
      errors: [stylesheet('env-card-title')],
    },
    {
      code: 'const rules = css`.env-button:hover { opacity: 0.8; }`;',
      errors: [stylesheet('env-button')],
    },
    {
      code: 'const Global = createGlobalStyle`.env-theme .env-dialog { inset: 0; }`;',
      errors: [stylesheet('env-dialog')],
    },
    {
      code: '<style>{`.env-surface { padding: 0; }`}</style>',
      errors: [stylesheet('env-surface')],
    },
    {
      code: '<style>.env-surface {"{"} padding: 0 {"}"}</style>',
      errors: [stylesheet('env-surface')],
    },
  ],
});

typeScriptRuleTester.run('no-private-classes in TypeScript', rule, {
  valid: ['const ok: string = clsx("toolbar");'],
  invalid: [
    {
      code: 'export const Row = ({ selected }: { selected: boolean }) => <li className={cx("env-row", selected && "env-row-selected")} />;',
      errors: [className('env-row'), className('env-row-selected')],
    },
  ],
});
