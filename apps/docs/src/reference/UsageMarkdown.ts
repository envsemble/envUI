import { setupCode, registryCode, installCode } from './Setup';
import { componentGroups } from './Types';
import { foundations } from './Foundations';
import { references } from './Components';

export function renderUsageMarkdown(): string {
  const head = `# @envsemble/envui usage

React 19 components for current browsers. Import the public package API and one stylesheet. Theme preference, routing, validation and product data belong to the application.

## Install

Configure private GitHub Packages access using an environment token with read:packages and package access. Keep credentials outside committed files.

\`\`\`ini
${registryCode}
\`\`\`

\`\`\`sh
${installCode}
\`\`\`

## First component

${'```tsx'}
${setupCode}
${'```'}

Use Theme theme="light" or theme="dark". Inter, tokens and assets are included. Prefer explicit per-icon imports such as @envsemble/envui/icons/Add to keep development tooling from loading the complete catalogue; the @envsemble/envui/icons barrel remains supported. Icons accept filled, width, height and accessible SVG attributes. Components accept custom React icon content.
`;
  return (
    head +
    [
      { title: 'Foundations', items: foundations },
      ...componentGroups.map((title) => ({
        title,
        items: references.filter((ref) => ref.group === title),
      })),
    ]
      .map(
        ({ title, items }) =>
          `\n## ${title}\n` +
          items
            .map((ref) => {
              const related = (ref.related ?? []).flatMap((id) => {
                const item = [...foundations, ...references].find((entry) => entry.id === id);
                if (!item) return [];
                const anchor = item.title
                  .toLowerCase()
                  .replace(/[^\p{L}\p{N} -]/gu, '')
                  .replace(/ /g, '-');
                return [`[${item.title}](#${anchor})`];
              });
              return `\n### ${ref.title}\n\n${ref.summary ? `${ref.summary}\n\n` : ''}${'```tsx'}\n${ref.example}\n${'```'}\n\n#### Props & contracts\n\n${ref.props.map(([name, value]) => `- ${name}: ${value}`).join('\n')}\n\n#### Guidelines\n\n${ref.guidelines.map((text) => `- ${text}`).join('\n')}\n${related.length ? `\nRelated: ${related.join(', ')}.\n` : ''}`;
            })
            .join(''),
      )
      .join('') +
    '\n## Local edits and upgrades\n\nIn the design-system repository, run npm install and npm run dev. The documentation workspace consumes the public package through the local workspace. Changes appear during development without publishing or changing the package version. A future product can use the same workspace connection; product integration is separate work. Adopt a published version intentionally with npm install @envsemble/envui@<version>, review CHANGELOG.md, and validate the consumer before release. Every release has a matching offline documentation HTML.\n'
  );
}
