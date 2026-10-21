---
'@envsemble/envui': major
---

The templates are gone from the documentation: the app frame, index, details, settings, dashboard, sign-in and error pages, their screens in `docs/examples/`, and the manifest's `templates`. The MCP server's `list_templates` and `get_template` tools go with them; `plan` points to the patterns, and `list_patterns`, `get_pattern` and `get_example` serve their examples. The app frame is a pattern now, `docs/patterns/app-frame.md`: a Scaffold with a TopBar and the same destinations as a Bar, a Rail or a Drawer.

Migration guide: [Templates and agent tools](https://github.com/envsemble/envUI/blob/main/docs/migration.md#templates-and-agent-tools).
