---
'@envsemble/envui': minor
'@envsemble/eslint-plugin-envui': minor
'@envsemble/stylelint-config-envui': minor
---

**DocumentTabs looks like an editor's tabs.** The tabs sit on a strip a step from the panel's fill, on whatever surface DocumentTabs lies on, 35 px tall, each the size of its icon, label and close button, between 5 and 14 rem; an inactive tab has no box, only its icon and muted label; under the pointer it takes the default text color and a faint neutral fill with the active tab's rounded top corners, and a stronger one while pressed. The active tab takes the panel's fill with rounded top corners and curves into the panel below, with no line between them. DocumentTabs takes `children`, the active document, which it places as given in a panel under the strip, `env-document-tabs-panel`, around the slot `env-document-tabs-panel-content`, controlled and named by the active tab with square corners: the root, the strip and the panel fill their region, and only the active tab rounds. The root marks a first active tab with `data-first-active`, whose start side then has no fillet. The strip itself is the new part `env-document-tabs-strip`, inside the root. The behavior is unchanged.
