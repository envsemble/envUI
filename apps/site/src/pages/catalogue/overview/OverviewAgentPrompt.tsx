import { CopyButton, Text } from '@envsemble/envui';
import { AgentLogos } from '../../../brand/AgentLogos';
import { setupPrompt } from '../../../shared/SetupPrompt';

export function OverviewAgentPrompt() {
  return (
    <div className="catalogue-overview-agent">
      <AgentLogos className="catalogue-overview-agent-logos" />
      <Text render={<code />} className="catalogue-overview-agent-prompt">
        {setupPrompt}
      </Text>
      <CopyButton
        value={setupPrompt}
        variant="secondary"
        size="sm"
        className="catalogue-overview-agent-copy"
      >
        Copy <span className="catalogue-overview-agent-setup">setup </span>prompt
      </CopyButton>
    </div>
  );
}
