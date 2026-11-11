import { Fragment } from 'react';
import { Column, CopyButton, Row, Surface, Text, type TableOfContentsItem } from '@envsemble/envui';
import { AgentLogos } from '../brand/AgentLogos';
import { markdownHeadings, PageMarkdown } from '../markdown/PageMarkdown';

/** What people paste into a coding agent to set envUI up: the skill the site serves at /SKILL.md. */
const setupPrompt = 'Set up envUI in my app: envui.envsemble.com/SKILL.md';

/** The heading of the prompt's section: its id and words. */
const agentSetupHeading = { id: 'agent-setup', label: 'Set up with your agent' };

/** The sections AgentSetup shows, given its note: its own and the note's h2 headings. */
export const agentSetupContents = (note?: string): TableOfContentsItem[] => [
  agentSetupHeading,
  ...markdownHeadings(note ?? '')
    .filter(({ level }) => level === 2)
    .map(({ id, text }) => ({ id, label: text })),
];

/**
 * The prompt that sets envUI up with a coding agent, centred at the top of the Docs' home, the setup
 * guide, whose sections set it up by hand; under it, the guide's note on what the agent does, which
 * keeps its old address (`coding-agents`) for the links and search results that lead to it.
 */
export function AgentSetup({ note, path = '' }: { note?: string; path?: string }) {
  return (
    <Column
      render={<section aria-labelledby={agentSetupHeading.id} />}
      gap={3}
      align="center"
      className="docs-agent-setup"
    >
      <Text
        render={<h2 id={agentSetupHeading.id} />}
        variant="title"
        className="site-section-title"
      >
        {agentSetupHeading.label}
      </Text>
      <Text render={<p />} className="docs-agent-setup-text">
        Paste this into your coding agent, or follow the steps below by hand.
      </Text>
      <Surface
        background="muted"
        padding={1}
        render={<Row gap={3} align="center" />}
        className="docs-agent-prompt"
      >
        <AgentLogos className="docs-agent-logos" />
        <Text render={<code />} className="docs-agent-prompt-text">
          {/* Where it wraps, as on a phone, the address breaks after a slash. */}
          {setupPrompt.split('/').map((piece, index) => (
            <Fragment key={index}>
              {index > 0 && (
                <>
                  /<wbr />
                </>
              )}
              {piece}
            </Fragment>
          ))}
        </Text>
        <CopyButton value={setupPrompt} variant="ghost" size="sm" aria-label="Copy prompt" />
      </Surface>
      {note && (
        <div id="coding-agents" className="docs-agent-note">
          <PageMarkdown markdown={note} path={path} />
        </div>
      )}
    </Column>
  );
}
