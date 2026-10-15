/**
 * Baseline: the fixture as apps have it today. Its AGENTS.md says only that the UI uses
 * @envsemble/envui; the package's own docs, skills and types are installed but not pointed to.
 */
export default {
  name: 'baseline',
  description: 'Fixture AGENTS.md says only that the UI uses @envsemble/envui.',
  /** Changes the fresh app copy before the agent starts; nothing for the baseline. */
  async setup() {},
  /** Extra CLI arguments per agent, such as an MCP config; none for the baseline. */
  agentArgs() {
    return [];
  },
};
