import { Button, Link, Stack, Tabs, Text } from '@envsemble/envui';
import { Markdown, type MarkdownLinkProps } from '@envsemble/envui/content';
import { documents } from '../Reference';
import { currentRouteQuery, useViewTabs } from '../navigation/useDocumentationRoute';
import { routeHref } from '../navigation/Address';
import { Documentation } from './Documentation';
import usageSkill from '../../../../.agents/skills/envui-use/SKILL.md?raw';
import migrationSkill from '../../../../.agents/skills/envui-migrate/SKILL.md?raw';

function skillBody(source: string) {
  return source.replace(/^---\r?\n[\s\S]*?\r?\n---\s*/, '');
}

function renderSkillLink({ href, ...props }: MarkdownLinkProps) {
  const skill = href === '../envui-use/SKILL.md' ? 'use' : 'migrate';
  return (
    <Link
      {...props}
      href={routeHref(`overview/get-started?skill=${skill}&section=local-development`)}
    />
  );
}

/** Skills stay small; setup and references are rendered from the same Markdown agents read. */
export function GettingStarted() {
  const query = currentRouteQuery();
  const selectedSkill =
    query.get('skill') ?? (query.get('section') === 'local-development' ? 'migrate' : 'use');
  // The guidance tabs keep focus as the page's views do, rather than moving it to the page.
  const skillTabs = useViewTabs(
    (value) => `overview/get-started?skill=${value}&section=local-development`,
  );
  const setup = documents.find((document) => document.id === 'setup')!;
  const selectedDocument =
    documents.find((document) => document.id === query.get('document')) ??
    documents.find((document) => document.id === 'index')!;
  return (
    <Stack gap={7} className="docs-article">
      <Stack as="section" id="setup">
        <Text as="h2" variant="page-heading">
          {setup.title}
        </Text>
        <Documentation document={setup} />
      </Stack>
      <Stack as="section" id="local-development">
        <Text as="h2" variant="page-heading">
          Agent guidance
        </Text>
        <Tabs
          aria-label="Agent guidance"
          value={selectedSkill}
          {...skillTabs}
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
      <Stack as="section" id="documentation">
        <Text as="h2" variant="page-heading">
          {selectedDocument.title}
        </Text>
        <Documentation document={selectedDocument} />
      </Stack>
    </Stack>
  );
}
