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
  /* Dev mode's own popups portal into the host, beside its UI, and take the pointer there. */
  [data-env-dev-host] > :not(.env-dev) {
    pointer-events: auto;
  }
  .env-dev-toggle {
    position: fixed;
    inset-block-end: var(--env-space-4);
    inset-inline-end: var(--env-space-4);
    pointer-events: auto;
    border-radius: var(--env-radius-full);
  }
  .env-dev-panel {
    position: fixed;
    inset: 0;
    display: flex;
    background: var(--env-color-bg-page);
    color: var(--env-color-fg-default);
    pointer-events: auto;
    contain: strict;
  }
  .env-dev-panel:focus {
    outline: none;
  }
  .env-dev-view {
    position: relative;
    flex: 1 1 auto;
    min-inline-size: 0;
    overflow: hidden;
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
  /* The responsive frame: the rectangle the page is laid out in, above the planes, a quiet outline
     at the page's real width and the focus color at a width it sets. Its line, handles and label
     keep their size on screen at any zoom. */
  .env-dev-frame {
    --env-dev-unzoom: calc(1 / var(--env-dev-zoom, 1));
    position: absolute;
    inset: 0;
    border: calc(1px * var(--env-dev-unzoom)) solid var(--env-color-border-default);
    border-radius: var(--env-radius-sm);
    pointer-events: none;
  }
  .env-dev-frame[data-set] {
    border: calc(1.5px * var(--env-dev-unzoom)) solid var(--env-color-border-focus);
  }
  .env-dev-frame-label {
    position: absolute;
    inset-block-end: 100%;
    inset-inline-start: 50%;
    translate: -50% 0;
    scale: var(--env-dev-unzoom);
    transform-origin: 50% 100%;
    padding-block-end: var(--env-space-2);
    white-space: nowrap;
    pointer-events: auto;
  }
  .env-dev-frame-handle {
    position: absolute;
    inset-block-start: 50%;
    inline-size: 0.5rem;
    block-size: 2.5rem;
    translate: -50% -50%;
    scale: var(--env-dev-unzoom);
    border-radius: var(--env-radius-full);
    background: var(--env-color-fg-muted);
    cursor: ew-resize;
    touch-action: none;
    pointer-events: auto;
  }
  .env-dev-frame-handle[data-edge='start'] {
    inset-inline-start: 0;
  }
  .env-dev-frame-handle[data-edge='end'] {
    inset-inline-start: 100%;
  }
  .env-dev-frame-handle[data-edge^='bottom'] {
    inset-block-start: 100%;
  }
  .env-dev-frame-handle[data-edge='bottom'] {
    inset-inline-start: 50%;
    inline-size: 2.5rem;
    block-size: 0.5rem;
    cursor: ns-resize;
  }
  /* A corner's handle is a small square, which moves both edges. */
  .env-dev-frame-handle:is([data-edge='bottom-start'], [data-edge='bottom-end']) {
    inline-size: 0.75rem;
    block-size: 0.75rem;
    border-radius: 0.1875rem;
  }
  .env-dev-frame-handle[data-edge='bottom-start'] {
    inset-inline-start: 0;
    cursor: nesw-resize;
  }
  .env-dev-frame-handle[data-edge='bottom-end'] {
    inset-inline-start: 100%;
    cursor: nwse-resize;
  }
  .env-dev-frame-handle:hover,
  .env-dev-frame[data-set] .env-dev-frame-handle {
    background: var(--env-color-border-focus);
  }
  .env-dev-frame-handle:focus-visible {
    outline: 0.125rem solid var(--env-color-border-focus);
    outline-offset: 0.125rem;
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
  .env-dev-card {
    position: absolute;
    z-index: 2;
    display: flex;
    flex-direction: column;
    gap: var(--env-space-1);
    max-inline-size: 24rem;
    padding: var(--env-space-2) var(--env-space-3);
    background: var(--env-color-bg-popup);
    border: var(--env-control-border-width) solid var(--env-elevation-2-border);
    border-radius: var(--env-radius-md);
    pointer-events: none;
    font: var(--env-type-body-small);
  }
  .env-dev-card strong,
  .env-dev-heading {
    font-weight: var(--env-font-weight-medium);
  }
  /* The view's floating controls: popup surfaces, set apart by their fill and edge, no shadow. */
  .env-dev-float {
    position: absolute;
    z-index: 1;
    box-sizing: border-box;
    max-inline-size: calc(100% - 2 * var(--env-space-3));
    padding: var(--env-space-1);
    background: var(--env-color-bg-popup);
    border: var(--env-control-border-width) solid var(--env-elevation-2-border);
    border-radius: var(--env-radius-surface);
    cursor: auto;
  }
  /* One row; a view too narrow for it wraps it rather than cutting it off. */
  .env-dev-toolbar {
    inset-block-start: var(--env-space-3);
    inset-inline-start: 50%;
    translate: -50% 0;
    inline-size: max-content;
    flex-wrap: wrap;
    justify-content: center;
  }
  /* The legend floats over the view with no pane: quiet small text in a corner, where the planes
     seldom reach. The frame's label is small text too. */
  .env-dev-legend,
  .env-dev-frame-label {
    font: var(--env-type-body-small);
    font-size: var(--env-font-size-caption);
  }
  /* Dev mode's popovers sit closer around their content than an application's. */
  .env-dev-popover {
    gap: var(--env-space-2);
    padding: var(--env-space-3);
  }
  .env-dev-legend {
    position: absolute;
    inset-block-end: var(--env-space-3);
    inset-inline-start: var(--env-space-4);
    inset-inline-end: var(--env-space-4);
    color: var(--env-color-fg-muted);
    pointer-events: none;
  }
  .env-dev-swatch {
    position: static;
    inline-size: 0.75rem;
    block-size: 0.75rem;
    outline-width: 1.5px;
    background: color-mix(in oklab, var(--env-dev-tint) 45%, transparent);
  }
  /* The outline entries show an outline alone: solid for a container, dotted for the rest. */
  .env-dev-swatch[data-window='none'] {
    background: none;
  }
  .env-dev-quiet {
    color: var(--env-color-fg-muted);
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
  /* Inline code in dev mode's own panels: the Code component lives in the content entry, whose
     optional peers an app may not have installed. */
  .env-dev-code {
    font-family: ui-monospace, 'Cascadia Code', Consolas, monospace;
    font-size: 0.9em;
  }
  /* The sidebars: flush, square panes on the navigation's color. Their heads line up with the
     tree's rows and the tabs' panel. */
  .env-dev-sidebar {
    flex: none;
    min-block-size: 0;
    padding-block: var(--env-space-3);
  }
  .env-dev-sidebar[data-side='tree'] {
    inline-size: min(15rem, 20vw);
  }
  .env-dev-sidebar[data-side='inspector'] {
    inline-size: min(21rem, 27vw);
    padding-block-start: var(--env-space-1);
  }
  .env-dev-hide {
    margin-inline-start: auto;
  }
  .env-dev-sidebar-head,
  .env-dev-sidebar-note {
    padding-inline: var(--env-space-3);
  }
  .env-dev-tree {
    flex: 1 1 auto;
    min-block-size: 0;
  }
  /* The inspector's column scrolls what its tab holds, the readout too, and keeps the wheel at its
     ends from scrolling the page under dev mode. */
  .env-dev-tab-panel {
    flex: 1 1 auto;
    min-block-size: 0;
    padding: var(--env-space-3);
    overflow: auto;
    overscroll-behavior: contain;
  }
  .env-dev-tokens {
    font: var(--env-type-body-small);
  }
  /* As tall as its text: a flex item that scrolls would shrink to nothing in a short column. It
     scrolls its long lines sideways. */
  .env-dev-readout {
    flex: none;
    margin: 0;
    padding: var(--env-space-2) var(--env-space-3);
    overflow: auto;
    white-space: pre;
    font: 0.75rem/1.125rem var(--env-font-family-mono, ui-monospace, monospace);
    background: var(--env-color-bg-muted);
    border-radius: var(--env-radius-md);
  }
  .env-dev-readout[data-wrap] {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
}
`;
