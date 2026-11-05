import { Fragment } from 'react';
import { CopyButton, Row, Surface, Text } from '@envsemble/envui';
import { AgentLogos } from '../brand/AgentLogos';

/** What people paste into a coding agent to set envUI up: the skill the site serves at /SKILL.md. */
export const setupPrompt = 'Set up envUI in my app: envui.envsemble.com/SKILL.md';

/**
 * The prompt that sets envUI up with a coding agent, to copy, which the setup guide places in its
 * Coding agents section (docs/setup.md).
 */
export function AgentPrompt() {
  return (
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
  );
}
