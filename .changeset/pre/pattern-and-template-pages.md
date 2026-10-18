---
'@envsemble/envui': minor
---

Pattern and template pages, and the tools that serve them to agents:

- Pattern pages (`docs/patterns/`) and template pages (`docs/templates/`) follow the page template, with frontmatter of their own: a pattern's `intent`, the exports a page `composes`, a template's `frame` (inside the app frame, or a whole screen) and `see` in `avoidWhen` for a page to read instead. A template's screens are source in `docs/examples/<template>/<Name>.tsx`, to copy into the application and edit; they are not exports. The loading pattern moves to the new format, with live examples.
- `manifest.json` lists patterns with their intent, status, `composes` and examples, templates with their frame, scales and screen files, the `intents`, and each component's `usedIn`, the patterns and templates that compose it. `llms.txt` lists patterns by intent.
- The MCP server gains `get_pattern` and `get_template`, which returns a screen's source with where it renders. `list_patterns` takes an `intent`, `get_example` takes a pattern or template, search matches their situations and what they compose, and `plan` points at a template that matches.
- The `npx --no envui agents` index says where template sources are, once there are templates.
