// Dev mode's own style sheet, added to the document while dev mode is installed: it ships in the
// dev entry alone, never in styles.css. dev mode is built of envUI's components and layout
// primitives, which style themselves; these rules place its panes and floating controls and draw
// the 3D view, from envUI's tokens.
//
// The rules are in envUI's components layer, after the components' own: a selector of dev mode's
// own parts is :where(), of no specificity, as the layout primitives' are, so it wins only by
// coming later; one that adjusts a part of an envUI component it renders, such as a resize
// handle's place, takes a second class, as the component's own rule does. The first line repeats
// envUI's layer order, so the components' layer keeps its place whichever style sheet loads first.

export const devStyles = /* css */ `
@layer env.reset, env.tokens, env.base, env.components, env.utilities;
@layer env.components {
  :where([data-env-dev-host]) {
    position: fixed;
    inset: 0;
    z-index: calc(var(--env-z-tooltip, 1000) + 100);
    pointer-events: none;
  }
  :where(.env-dev) {
    display: contents;
  }
  /* Dev mode's own popups portal into the host, beside its UI, and take the pointer there. */
  :where([data-env-dev-host] > :not(.env-dev)) {
    pointer-events: auto;
  }
  :where(.env-dev-toggle) {
    position: fixed;
    inset-block-end: var(--env-space-4);
    inset-inline-end: var(--env-space-4);
    pointer-events: auto;
  }
  /* The panel covers the whole window: the sidebars on the navigation's background, the view on
     the page's between them, set apart by their fills with no line between. */
  :where(.env-dev-panel) {
    position: fixed;
    inset: 0;
    overflow: hidden;
    overscroll-behavior: contain;
    background: var(--env-color-bg-page);
    color: var(--env-color-fg-default);
    pointer-events: auto;
    contain: strict;
  }
  :where(.env-dev-panel:focus) {
    outline: none;
  }

  /* The sidebars: flush, square panes as wide as people drag them, each with the grip of a
     resizable NavigationDrawer on its inner edge, inside it. */
  :where(.env-dev-sidebar) {
    position: relative;
    flex: none;
    inline-size: var(--env-dev-sidebar-width);
    min-block-size: 0;
  }
  .env-dev-sidebar > .env-dev-sidebar-resize {
    --env-resize-handle-size: var(--env-space-3);
    position: absolute;
    inset-block: 0;
  }
  .env-dev-sidebar[data-side='tree'] > .env-dev-sidebar-resize {
    inset-inline-end: 0;
  }
  .env-dev-sidebar[data-side='inspector'] > .env-dev-sidebar-resize {
    inset-inline-start: 0;
  }
  @media (pointer: coarse) {
    .env-dev-sidebar > .env-dev-sidebar-resize {
      --env-resize-handle-size: var(--env-space-5);
    }
  }
  /* The header's toggle sits in the window's top corner on the sidebar's side, where it stays
     floating over the view while the sidebar is hidden. */
  :where(.env-dev-sidebar-head) {
    flex: none;
    padding: var(--env-space-2) var(--env-space-3);
  }
  :where(.env-dev-sidebar[data-side='inspector'] .env-dev-sidebar-head) {
    padding-inline-start: var(--env-space-4);
  }
  :where(.env-dev-sidebar-foot) {
    flex: none;
    margin-block-start: auto;
    padding: var(--env-space-2) var(--env-space-3);
  }
  :where(.env-dev-sidebar-note) {
    padding-inline: var(--env-space-3);
  }
  /* The tree scrolls itself; it keeps clear of the resize handle on its end edge. */
  :where(.env-dev-tree) {
    flex: 1 1 auto;
    min-block-size: 0;
    padding-inline-end: var(--env-space-2);
  }
  :where(.env-dev-tabs) {
    flex: 1 1 auto;
    min-block-size: 0;
  }
  /* The inspector's panel scrolls what its tab holds, the readout too, and keeps the wheel at its
     ends from scrolling the page under dev mode. */
  :where(.env-dev-tab-panel) {
    overflow: auto;
    overscroll-behavior: contain;
    padding: 0 var(--env-space-3) var(--env-space-3) var(--env-space-4);
  }
  :where(.env-dev-wrap) {
    overflow-wrap: anywhere;
  }
  /* Code in dev mode's own panels, in the code type: the Code component lives in the content entry,
     whose optional peers an app may not have installed. */
  :where(.env-dev-code) {
    font-family: var(--env-code-font-family, ui-monospace, monospace);
    font-size: 0.9em;
    overflow-wrap: anywhere;
  }
  /* The readout, on the muted fill code blocks take, as wide as the sidebar: each line wraps within
     it, its continuation hanging two characters in from the line's own indent. As tall as its
     text: a flex item that scrolls would shrink to nothing in a short column. */
  :where(.env-dev-readout) {
    flex: none;
    min-inline-size: 0;
    max-inline-size: 100%;
    box-sizing: border-box;
    margin: 0;
    padding: var(--env-space-2) var(--env-space-3);
    white-space: normal;
    font-family: var(--env-code-font-family, ui-monospace, monospace);
    font-size: var(--env-code-font-size, 0.8125rem);
    line-height: 1.5;
    background: var(--env-color-bg-muted);
    border-radius: var(--env-radius-md);
  }
  :where(.env-dev-readout-line) {
    display: block;
    padding-inline-start: calc((var(--env-dev-indent, 0) + 2) * 1ch);
    text-indent: -2ch;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  :where(.env-dev-problem) {
    color: var(--env-color-fg-danger);
  }

  /* The 3D view, a size container its floating controls follow. */
  :where(.env-dev-view) {
    container: env-dev-view / inline-size;
    position: relative;
    flex: 1 1 auto;
    min-inline-size: 0;
    overflow: hidden;
    perspective: 125rem;
    cursor: grab;
    touch-action: none;
    -webkit-user-select: none;
    user-select: none;
  }
  :where(.env-dev-view[data-dragging]) {
    cursor: grabbing;
  }
  :where(.env-dev-scene) {
    position: absolute;
    left: 50%;
    top: 50%;
    transform-style: preserve-3d;
    transform-origin: 50% 50%;
  }
  :where(.env-dev-floor) {
    position: absolute;
    inset: 0;
    border: var(--env-control-border-width) dashed var(--env-color-border-default);
    border-radius: var(--env-radius-xs);
  }

  /* The view's floating controls: surfaces with the edge of a floating layer and no shadow, the
     toolbar at the top's middle, the corners' buttons in the top corners. */
  .env-dev-float {
    --env-surface-outline: var(--env-elevation-2-border);
    position: absolute;
    z-index: 1;
    inset-block-start: var(--env-space-2);
    max-inline-size: calc(100% - 2 * var(--env-space-2));
    cursor: auto;
  }
  :where(.env-dev-toolbar) {
    inset-inline-start: 50%;
    translate: -50% 0;
    inline-size: max-content;
  }
  :where(.env-dev-corner[data-side='start']) {
    inset-inline-start: var(--env-space-2);
  }
  :where(.env-dev-corner[data-side='end']) {
    inset-inline-end: var(--env-space-2);
  }
  /* The performance panel, which View settings turns on, in the bottom end corner, above the
     legend. */
  .env-dev-performance {
    inset-block: auto var(--env-space-8);
    inset-inline-end: var(--env-space-2);
    pointer-events: none;
  }

  /* The responsive frame: the rectangle the page is laid out in, above the planes, outlined in the
     focus color. Its line, handles and label keep their size on screen at any zoom. */
  :where(.env-dev-frame) {
    --env-dev-unzoom: calc(1 / var(--env-dev-zoom, 1));
    position: absolute;
    inset: 0;
    border: calc(1.5px * var(--env-dev-unzoom)) solid var(--env-color-border-focus);
    border-radius: var(--env-radius-xs);
    pointer-events: none;
  }
  :where(.env-dev-frame-label) {
    position: absolute;
    inset-block-end: 100%;
    inset-inline-start: 50%;
    margin: 0;
    translate: -50% 0;
    scale: var(--env-dev-unzoom);
    transform-origin: 50% 100%;
    padding-block-end: var(--env-space-2);
    white-space: nowrap;
  }
  :where(.env-dev-frame-handle) {
    position: absolute;
    inset-block-start: 50%;
    inline-size: var(--env-space-2);
    block-size: var(--env-space-7);
    translate: -50% -50%;
    scale: var(--env-dev-unzoom);
    border-radius: var(--env-radius-full);
    background: var(--env-color-border-focus);
    cursor: ew-resize;
    touch-action: none;
    pointer-events: auto;
  }
  :where(.env-dev-frame-handle[data-edge='start']) {
    inset-inline-start: 0;
  }
  :where(.env-dev-frame-handle[data-edge='end']) {
    inset-inline-start: 100%;
  }
  :where(.env-dev-frame-handle[data-edge^='bottom']) {
    inset-block-start: 100%;
  }
  :where(.env-dev-frame-handle[data-edge='bottom']) {
    inset-inline-start: 50%;
    inline-size: var(--env-space-7);
    block-size: var(--env-space-2);
    cursor: ns-resize;
  }
  /* A corner's handle is a small square, which moves both edges. */
  :where(.env-dev-frame-handle:is([data-edge='bottom-start'], [data-edge='bottom-end'])) {
    inline-size: var(--env-space-3);
    block-size: var(--env-space-3);
    border-radius: var(--env-radius-xs);
  }
  :where(.env-dev-frame-handle[data-edge='bottom-start']) {
    inset-inline-start: 0;
    cursor: nesw-resize;
  }
  :where(.env-dev-frame-handle[data-edge='bottom-end']) {
    inset-inline-start: 100%;
    cursor: nwse-resize;
  }
  :where(.env-dev-frame-handle:focus-visible) {
    outline: 0.125rem solid var(--env-color-border-focus);
    outline-offset: 0.125rem;
  }

  /* Dev mode's own tints, a soft pastel set for the planes of the 3D view and its padding and gap
     patterns, lighter in the light theme. They are its own, so no public token they once borrowed
     can change them. */
  :where(.env-dev-view) {
    --env-dev-tint-oat: #e7dbce;
    --env-dev-tint-seafoam: #b8e7de;
    --env-dev-tint-sage: #cee4c3;
    --env-dev-tint-periwinkle: #dadaff;
    --env-dev-tint-butter: #efdca4;
    --env-dev-tint-blush: #ffd3d4;
    --env-dev-tint-orchid: #fad2ec;
  }
  :where(.env-theme[data-env-theme='dark'] .env-dev-view) {
    --env-dev-tint-oat: #d8ccbf;
    --env-dev-tint-seafoam: #a7d7cf;
    --env-dev-tint-sage: #bed4b3;
    --env-dev-tint-periwinkle: #cacaf3;
    --env-dev-tint-butter: #e1cc95;
    --env-dev-tint-blush: #f3c2c4;
    --env-dev-tint-orchid: #ecc2dd;
  }
  :where(.env-dev-plane) {
    --env-dev-tint: var(--env-dev-tint-oat);
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
  :where(.env-dev-plane[data-kind='row']) { --env-dev-tint: var(--env-dev-tint-seafoam); }
  :where(.env-dev-plane[data-kind='column']) { --env-dev-tint: var(--env-dev-tint-sage); }
  :where(.env-dev-plane[data-kind='grid']) { --env-dev-tint: var(--env-dev-tint-periwinkle); }
  :where(.env-dev-plane:is([data-kind='scaffold'], [data-kind='panes'])) { --env-dev-tint: var(--env-dev-tint-butter); }
  :where(.env-dev-plane[data-kind='page']) { --env-dev-tint: var(--env-dev-tint-blush); }
  :where(.env-dev-plane[data-overlay]) { --env-dev-tint: var(--env-dev-tint-orchid); }
  :where(.env-dev-view[data-color='window'] .env-dev-plane[data-window='compact']) { --env-dev-tint: var(--env-dev-tint-blush); }
  :where(.env-dev-view[data-color='window'] .env-dev-plane[data-window='medium']) { --env-dev-tint: var(--env-dev-tint-butter); }
  :where(.env-dev-view[data-color='window'] .env-dev-plane[data-window='expanded']) { --env-dev-tint: var(--env-dev-tint-sage); }
  :where(.env-dev-view[data-color='window'] .env-dev-plane[data-window='large']) { --env-dev-tint: var(--env-dev-tint-seafoam); }
  :where(.env-dev-view[data-color='window'] .env-dev-plane:not([data-container])) { outline-style: dotted; }
  :where(.env-dev-plane[data-problems]) {
    outline: 2px solid var(--env-color-border-danger-emphasis);
  }
  :where(.env-dev-plane[data-hovered]) {
    background: color-mix(in oklab, var(--env-dev-tint) 22%, transparent);
    outline-width: 2px;
  }
  :where(.env-dev-plane[data-selected]) {
    outline: 3px solid var(--env-color-border-focus);
  }
  :where(.env-dev-content, .env-dev-surface, .env-dev-spacing) {
    position: absolute;
    left: 0;
    top: 0;
    pointer-events: none;
  }
  :where(.env-dev-surface) {
    overflow: hidden;
    opacity: 0.9;
  }
  :where(.env-dev-spacing) {
    overflow: visible;
  }
  :where(.env-dev-spacing [data-padding]) { fill: url(#env-dev-padding); }
  :where(.env-dev-spacing [data-gap]) { fill: url(#env-dev-gap); }
  :where(.env-dev-spacing [data-child]) {
    fill: none;
    stroke: var(--env-color-fg-muted);
    stroke-dasharray: 2 3;
    stroke-opacity: 0.6;
  }
  :where(.env-dev-name) {
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: 0;
    max-inline-size: 100%;
    padding: 0 var(--env-space-1);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font: var(--env-type-body-sm);
    font-size: var(--env-font-size-caption);
    font-weight: var(--env-font-weight-medium);
    color: var(--env-color-fg-on-strong);
    background: color-mix(in oklab, var(--env-dev-tint) 90%, black);
    border-end-end-radius: 2px;
    pointer-events: none;
  }
  /* The hovered plane's card follows the pointer, on a popup's fill and edge. */
  :where(.env-dev-card) {
    position: absolute;
    z-index: 2;
    max-inline-size: 24rem;
    padding: var(--env-space-2) var(--env-space-3);
    background: var(--env-color-bg-popup);
    border: var(--env-control-border-width) solid var(--env-elevation-2-border);
    border-radius: var(--env-radius-md);
    pointer-events: none;
  }
  /* The legend floats over the view with no pane: quiet small text in a corner, where the planes
     seldom reach, and none in a narrow view, which needs the room. The frame's label is small text
     too. */
  :where(.env-dev-legend, .env-dev-frame-label) {
    font: var(--env-type-body-sm);
    font-size: var(--env-font-size-caption);
  }
  :where(.env-dev-legend) {
    position: absolute;
    inset-block-end: var(--env-space-3);
    inset-inline: var(--env-space-4);
    color: var(--env-color-fg-muted);
    pointer-events: none;
  }
  @container env-dev-view (inline-size < 30rem) {
    :where(.env-dev-legend) {
      display: none;
    }
  }
  :where(.env-dev-swatch) {
    position: static;
    inline-size: var(--env-space-3);
    block-size: var(--env-space-3);
    outline-width: 1.5px;
    background: color-mix(in oklab, var(--env-dev-tint) 45%, transparent);
  }
  /* The outline entries show an outline alone: solid for a container, dotted for the rest. */
  :where(.env-dev-swatch[data-window='none']) {
    background: none;
  }
  :where(.env-dev-ruler) {
    position: absolute;
    left: 0;
    top: 0;
    pointer-events: none;
    transform-style: flat;
  }
  :where(.env-dev-ruler-band) {
    position: absolute;
    inset-block-start: -1.5rem;
    block-size: 1.25rem;
    padding-inline: var(--env-space-1);
    overflow: hidden;
    white-space: nowrap;
    font: var(--env-type-body-sm);
    font-size: var(--env-font-size-caption);
    line-height: 1.25rem;
    background: color-mix(in oklab, var(--env-dev-tint) 35%, transparent);
    border-inline-start: 1px solid var(--env-dev-tint);
  }
  :where(.env-dev-ruler-band[data-current]) {
    background: color-mix(in oklab, var(--env-dev-tint) 70%, transparent);
  }
  :where(.env-dev-ruler-band[data-window='compact']) { --env-dev-tint: var(--env-dev-tint-blush); }
  :where(.env-dev-ruler-band[data-window='medium']) { --env-dev-tint: var(--env-dev-tint-butter); }
  :where(.env-dev-ruler-band[data-window='expanded']) { --env-dev-tint: var(--env-dev-tint-sage); }
  :where(.env-dev-ruler-band[data-window='large']) { --env-dev-tint: var(--env-dev-tint-seafoam); }
  :where(.env-dev-ruler-line) {
    position: absolute;
    inset-block-start: -1.5rem;
    border-inline-start: 2px dashed var(--env-color-fg-default);
  }
  :where(.env-dev-ruler-line span, .env-dev-ruler-now span) {
    position: absolute;
    inset-block-start: -1.25rem;
    inset-inline-start: var(--env-space-1);
    padding-inline: var(--env-space-1);
    white-space: nowrap;
    font: var(--env-type-body-sm);
    font-size: var(--env-font-size-caption);
    background: var(--env-color-bg-raised);
  }
  :where(.env-dev-ruler-now) {
    position: absolute;
    inset-block-start: -1.5rem;
    border-inline-start: 2px solid var(--env-color-border-focus);
  }
}
`;
