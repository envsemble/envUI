import { Fragment } from 'react';
import { Column, CopyButton, Row, Surface, Text, type TableOfContentsItem } from '@envsemble/envui';
import { AgentLogos } from '../../brand/AgentLogos';
import { markdownHeadings, PageMarkdown } from '../../markdown/PageMarkdown';
import { setupPrompt } from '../../shared/SetupPrompt';

const agentSetupHeading = { id: 'agent-setup', label: 'Set up with your agent' };

const keptNoteAddress = 'coding-agents';

export const agentSetupContents = (note?: string): TableOfContentsItem[] => [
  agentSetupHeading,
  ...markdownHeadings(note ?? '')
    .filter(({ level }) => level === 2)
    .map(({ id, text }) => ({ id, label: text })),
];

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
        render={<Row gap={2} align="center" />}
        className="docs-agent-prompt"
      >
        <AgentLogos className="docs-agent-logos" />
        <Text render={<code />} className="docs-agent-prompt-text">
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
        <div id={keptNoteAddress} className="docs-agent-note">
          <PageMarkdown markdown={note} path={path} />
        </div>
      )}
    </Column>
  );
}
