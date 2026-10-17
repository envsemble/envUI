import styled, { createGlobalStyle, css } from 'styled-components';

export const Toolbar = styled.div`
  min-height: var(--env-control-height);
  .env-tree-item {
    padding-inline: var(--env-space-4);
  }
`;

export const Raised = styled(Card).attrs({ role: 'region' })`
  background: var(--env-color-bg-raised);
`;

export const quiet = css`
  .env-button:where([data-variant='ghost']) {
    inline-size: var(--env-control-height);
  }
`;

export const Global = createGlobalStyle`
  .env-alert[data-tone='error'] {
    --scale: 0.9;
  }
`;

export const notCss = html`<div class="env-notice"></div>`;
