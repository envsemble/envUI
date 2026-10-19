import styled, { createGlobalStyle, css } from 'styled-components';

export const Toolbar = styled.div`
  min-height: var(--control-height-small);
  .env-tree-row {
    padding-inline: var(--space-4);
  }
`;

export const Raised = styled(Card).attrs({ role: 'region' })`
  background: var(--color-surface-base);
`;

export const quiet = css`
  .env-button-quiet {
    inline-size: var(--icon-button-size);
  }
`;

export const Global = createGlobalStyle`
  .env-notice[data-tone='error'] {
    --scale: 0.9;
  }
`;

export const notCss = html`<div class="env-notice"></div>`;
