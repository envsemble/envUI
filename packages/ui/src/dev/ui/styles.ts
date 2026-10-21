// Dev mode's own style sheet, added to the document while dev mode is installed: it ships in the
// dev entry alone, never in styles.css. The look comes from envUI's components and tokens; these
// rules arrange dev mode's panels and draw the 3D view.

export const devStyles = /* css */ `
@layer env.dev {
  [data-env-dev-host] {
    position: fixed;
    inset: 0;
    z-index: calc(var(--env-z-tooltip, 1000) + 100);
    pointer-events: none;
  }
  .env-dev {
    display: contents;
  }
  .env-dev-toggle {
    position: fixed;
    inset-block-end: var(--env-space-4);
    inset-inline-end: var(--env-space-4);
    pointer-events: auto;
    box-shadow: var(--env-shadow-raised, 0 0.25rem 1rem rgb(0 0 0 / 0.2));
    border-radius: var(--env-radius-full);
  }
  .env-dev-panel {
    position: fixed;
    inset: 0;
    display: grid;
    grid-template-columns: minmax(0, 1fr) min(28rem, 42vw);
    background: var(--env-color-bg-page);
    color: var(--env-color-fg-default);
    pointer-events: auto;
    contain: strict;
  }
  .env-dev-view {
    position: relative;
    overflow: hidden;
    background: var(--env-color-bg-muted);
    perspective: 125rem;
    cursor: grab;
    touch-action: none;
    user-select: none;
  }
  .env-dev-view[data-dragging] {
    cursor: grabbing;
  }
  .env-dev-scene {
    position: absolute;
    left: 50%;
    top: 50%;
    transform-style: preserve-3d;
    transform-origin: 50% 50%;
  }
  .env-dev-scene[data-dragging] .env-dev-plane {
    transition: none;
  }
  .env-dev-floor {
    position: absolute;
    inset: 0;
    border: 1px dashed var(--env-color-border-default);
    border-radius: var(--env-radius-sm);
  }
  .env-dev-plane {
    --env-dev-tint: var(--env-color-avatar-bg-slate);
    position: absolute;
    left: 0;
    top: 0;
    overflow: hidden;
    transform-style: flat;
    background: color-mix(in oklab, var(--env-dev-tint) 10%, transparent);
    outline: 1px solid color-mix(in oklab, var(--env-dev-tint) 85%, transparent);
    outline-offset: -1px;
    border-radius: 2px;
  }
  .env-dev-plane[data-kind='row'] { --env-dev-tint: var(--env-color-avatar-bg-teal); }
  .env-dev-plane[data-kind='column'] { --env-dev-tint: var(--env-color-avatar-bg-green); }
  .env-dev-plane[data-kind='grid'] { --env-dev-tint: var(--env-color-avatar-bg-violet); }
  .env-dev-plane:is([data-kind='scaffold'], [data-kind='panes']) { --env-dev-tint: var(--env-color-avatar-bg-amber); }
  .env-dev-plane[data-kind='page'] { --env-dev-tint: var(--env-color-avatar-bg-red); }
  .env-dev-plane[data-overlay] { --env-dev-tint: var(--env-color-avatar-bg-purple); }
  .env-dev-view[data-color='window'] .env-dev-plane[data-window='compact'] { --env-dev-tint: var(--env-color-avatar-bg-red); }
  .env-dev-view[data-color='window'] .env-dev-plane[data-window='medium'] { --env-dev-tint: var(--env-color-avatar-bg-amber); }
  .env-dev-view[data-color='window'] .env-dev-plane[data-window='expanded'] { --env-dev-tint: var(--env-color-avatar-bg-green); }
  .env-dev-view[data-color='window'] .env-dev-plane[data-window='large'] { --env-dev-tint: var(--env-color-avatar-bg-teal); }
  .env-dev-view[data-color='window'] .env-dev-plane:not([data-container]) { outline-style: dotted; }
  .env-dev-plane[data-problems] {
    outline: 2px solid var(--env-color-border-danger-emphasis);
  }
  .env-dev-plane[data-hovered] {
    background: color-mix(in oklab, var(--env-dev-tint) 22%, transparent);
    outline-width: 2px;
  }
  .env-dev-plane[data-selected] {
    outline: 3px solid var(--env-color-border-focus);
  }
  .env-dev-content {
    position: absolute;
    left: 0;
    top: 0;
    pointer-events: none;
  }
  .env-dev-surface {
    position: absolute;
    left: 0;
    top: 0;
    overflow: hidden;
    opacity: 0.9;
    pointer-events: none;
  }
  .env-dev-spacing {
    position: absolute;
    left: 0;
    top: 0;
    pointer-events: none;
    overflow: visible;
  }
  .env-dev-spacing [data-padding] { fill: url(#env-dev-padding); }
  .env-dev-spacing [data-gap] { fill: url(#env-dev-gap); }
  .env-dev-spacing [data-child] {
    fill: none;
    stroke: var(--env-color-fg-muted);
    stroke-dasharray: 2 3;
    stroke-opacity: 0.6;
  }
  .env-dev-name {
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: 0;
    max-inline-size: 100%;
    padding: 0 0.25rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font: var(--env-type-caption, 600 0.6875rem/1rem sans-serif);
    color: var(--env-color-fg-on-strong);
    background: color-mix(in oklab, var(--env-dev-tint) 90%, black);
    border-end-end-radius: 2px;
    pointer-events: none;
  }
  .env-dev-controls {
    position: absolute;
    inset-block-start: var(--env-space-3);
    inset-inline-start: var(--env-space-3);
    display: flex;
    flex-direction: column;
    gap: var(--env-space-3);
    inline-size: min(22rem, calc(100% - 1.5rem));
    max-block-size: calc(100% - 1.5rem);
    overflow: auto;
    padding: var(--env-space-4);
    background: var(--env-color-bg-raised);
    border: 1px solid var(--env-color-border-muted);
    border-radius: var(--env-radius-lg);
    cursor: auto;
  }
  .env-dev-controls[data-collapsed] > :not(.env-dev-controls-head) {
    display: none;
  }
  .env-dev-controls-head,
  .env-dev-presets,
  .env-dev-switches,
  .env-dev-legend {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--env-space-2);
  }
  .env-dev-controls-head {
    justify-content: space-between;
  }
  .env-dev-legend span {
    display: inline-flex;
    align-items: center;
    gap: var(--env-space-1);
    font: var(--env-type-caption, 0.75rem/1rem sans-serif);
  }
  .env-dev-legend i {
    inline-size: 0.75rem;
    block-size: 0.75rem;
    border-radius: 2px;
    background: var(--env-dev-tint);
  }
  .env-dev-card {
    position: absolute;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: var(--env-space-1);
    max-inline-size: 24rem;
    padding: var(--env-space-3);
    background: var(--env-color-bg-popup);
    border: 1px solid var(--env-color-border-muted);
    border-radius: var(--env-radius-md);
    pointer-events: none;
    font: var(--env-type-body-small, 0.8125rem/1.25rem sans-serif);
  }
  .env-dev-problem {
    color: var(--env-color-fg-danger);
  }
  .env-dev-ruler {
    position: absolute;
    left: 0;
    top: 0;
    pointer-events: none;
    transform-style: flat;
  }
  .env-dev-ruler-band {
    position: absolute;
    inset-block-start: -1.5rem;
    block-size: 1.25rem;
    padding-inline: 0.25rem;
    overflow: hidden;
    white-space: nowrap;
    font: var(--env-type-caption, 0.6875rem/1.25rem sans-serif);
    line-height: 1.25rem;
    background: color-mix(in oklab, var(--env-dev-tint) 35%, transparent);
    border-inline-start: 1px solid var(--env-dev-tint);
  }
  .env-dev-ruler-band[data-current] {
    background: color-mix(in oklab, var(--env-dev-tint) 70%, transparent);
  }
  .env-dev-ruler-band[data-window='compact'] { --env-dev-tint: var(--env-color-avatar-bg-red); }
  .env-dev-ruler-band[data-window='medium'] { --env-dev-tint: var(--env-color-avatar-bg-amber); }
  .env-dev-ruler-band[data-window='expanded'] { --env-dev-tint: var(--env-color-avatar-bg-green); }
  .env-dev-ruler-band[data-window='large'] { --env-dev-tint: var(--env-color-avatar-bg-teal); }
  .env-dev-ruler-line {
    position: absolute;
    inset-block-start: -1.5rem;
    border-inline-start: 2px dashed var(--env-color-fg-default);
  }
  .env-dev-ruler-line span,
  .env-dev-ruler-now span {
    position: absolute;
    inset-block-start: -1.25rem;
    inset-inline-start: 0.25rem;
    white-space: nowrap;
    font: var(--env-type-caption, 0.6875rem/1rem sans-serif);
    background: var(--env-color-bg-raised);
    padding-inline: 0.25rem;
  }
  .env-dev-ruler-now {
    position: absolute;
    inset-block-start: -1.5rem;
    border-inline-start: 2px solid var(--env-color-border-focus);
  }
  .env-dev-inspector {
    display: grid;
    grid-template-rows: minmax(0, 1fr);
    min-block-size: 0;
    background: var(--env-color-bg-page);
    border-inline-start: 1px solid var(--env-color-border-muted);
  }
  .env-dev-inspector > * {
    min-block-size: 0;
  }
  .env-dev-inspector-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--env-space-2);
    padding: var(--env-space-3) var(--env-space-4) 0;
  }
  .env-dev-tabs {
    display: flex;
    flex-direction: column;
    min-block-size: 0;
    block-size: 100%;
  }
  .env-dev-tab-panel {
    display: flex;
    flex-direction: column;
    gap: var(--env-space-3);
    min-block-size: 0;
    block-size: 100%;
    padding: var(--env-space-3) var(--env-space-4) var(--env-space-4);
    overflow: auto;
  }
  .env-dev-tree {
    flex: 0 0 auto;
    block-size: min(40vh, 22rem);
    border: 1px solid var(--env-color-border-muted);
    border-radius: var(--env-radius-md);
  }
  .env-dev-details {
    display: flex;
    flex-direction: column;
    gap: var(--env-space-2);
  }
  .env-dev-details dl {
    display: grid;
    grid-template-columns: max-content minmax(0, 1fr);
    gap: var(--env-space-1) var(--env-space-3);
    margin: 0;
  }
  .env-dev-details dd {
    margin: 0;
    overflow-wrap: anywhere;
  }
  .env-dev-details ul {
    margin: 0;
    padding-inline-start: 1.25rem;
  }
  .env-dev-tokens {
    display: grid;
    grid-template-columns: minmax(0, 1fr) max-content;
    gap: var(--env-space-1) var(--env-space-3);
    font: var(--env-type-body-small, 0.8125rem/1.25rem sans-serif);
  }
  .env-dev-readout {
    margin: 0;
    padding: var(--env-space-3);
    overflow: auto;
    white-space: pre;
    font: 0.75rem/1.125rem var(--env-font-family-mono, ui-monospace, monospace);
    background: var(--env-color-bg-muted);
    border-radius: var(--env-radius-md);
  }
}
`;
