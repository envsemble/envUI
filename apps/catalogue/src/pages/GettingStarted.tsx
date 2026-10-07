import { Button, Link, Stack, Tabs, Text } from '@envsemble/envui';
import { CodeBlock, Markdown, type MarkdownLinkProps } from '@envsemble/envui/content';
import { setupCode, registryCode, installCode } from '../Reference';
import { referencePages } from '../navigation/DocumentationRoutes';
import usageSkill from '../../../../.agents/skills/envui-use/SKILL.md?raw';
import migrationSkill from '../../../../.agents/skills/envui-migrate/SKILL.md?raw';

const referenceTopics: Record<string, string> = {
  Foundations: 'colors',
  Layout: 'layout',
  Actions: 'buttons',
  Forms: 'fields',
  Navigation: 'navigation',
  Content: 'code',
  RichText: 'rich-text',
  Feedback: 'dialogs',
  Composition: 'composition',
};

function skillBody(source: string) {
  return source.replace(/^---\r?\n[\s\S]*?\r?\n---\s*/, '');
}

function renderSkillLink({ href, ...props }: MarkdownLinkProps) {
  let destination = href;
  if (href === '../envui-use/SKILL.md') {
    destination = '#/overview/get-started?skill=use';
  } else if (href === 'references/Setup.ts') {
    destination = '#/overview/get-started?section=setup';
  } else {
    const resource = href.match(/^references\/(\w+)\.ts$/)?.[1];
    const topic =
      resource && referencePages.find((page) => page.reference.id === referenceTopics[resource]);
    if (topic) destination = `#/${topic.path}/usage`;
  }
  return <Link {...props} href={destination} />;
}

/** Render the maintained skills directly; setup examples come from their shared reference. */
export function GettingStarted() {
  const query = new URLSearchParams(location.hash.split('?')[1] ?? '');
  const selectedSkill =
    query.get('skill') ?? (query.get('section') === 'local-development' ? 'migrate' : 'use');
  return (
    <Stack gap={7} className="docs-article">
      <Stack as="section" id="setup">
        <Text as="h2" variant="page-heading">
          Install the private package
        </Text>
        <CodeBlock language="ini" copyable>
          {registryCode}
        </CodeBlock>
        <CodeBlock language="sh" copyable>
          {installCode}
        </CodeBlock>
        <CodeBlock language="tsx" copyable>
          {setupCode}
        </CodeBlock>
      </Stack>
      <Stack as="section" id="local-development">
        <Text as="h2" variant="page-heading">
          Agent guidance
        </Text>
        <Tabs
          aria-label="Agent guidance"
          value={selectedSkill}
          onValueChange={(value) => {
            if (value) location.hash = `/overview/get-started?skill=${value}`;
          }}
          items={[
            {
              value: 'use',
              button: <Button>Use envUI</Button>,
              content: (
                <Markdown headingOffset={1} codeCopyable renderLink={renderSkillLink}>
                  {skillBody(usageSkill)}
                </Markdown>
              ),
            },
            {
              value: 'migrate',
              button: <Button>Migrate to envUI</Button>,
              content: (
                <Markdown headingOffset={1} codeCopyable renderLink={renderSkillLink}>
                  {skillBody(migrationSkill)}
                </Markdown>
              ),
            },
          ]}
        />
      </Stack>
    </Stack>
  );
}
