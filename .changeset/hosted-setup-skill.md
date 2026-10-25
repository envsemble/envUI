---
'@envsemble/envui': major
---

One prompt sets envUI up with a coding agent, and the package's own agent tooling is gone. Agents read the documentation the package ships, which a few lines in the project's `AGENTS.md` lead them to.

- The prompt `Set up envUI in my app: envui.envsemble.com/SKILL.md`, on the Docs' home with a copy button, leads an agent to the setup skill the site hosts. After a short checklist that waits for a yes, it installs envUI at an exact version from GitHub Packages with its styles and theme, adds the `AGENTS.md` pointer, and turns on the ESLint plugin and the Stylelint config at the same version; the pointer and the lint rules are recommended, and any step can be skipped. In an application with UI of its own, it changes none of it and offers to plan a migration. The site also serves `llms.txt`, an index of the Docs.
- Removed: the `envui` command (`bin`) with `envui agents` and the `envui mcp` server; the envui-use, envui-migrate and envui-contribute skills under `skills/`; the `envui` agent plugin and its marketplaces; and `manifest.json`, `llms.txt` and `llms-full.txt` at the package root. The Docs' Agent skills page opens For agents.
- Migration: remove an `envui` MCP server from the project's or client's configuration, copied skill folders, the plugin and its marketplace, and `npx --no envui agents --check` from CI; replace the index between `<!-- BEGIN envui -->` and `<!-- END envui -->` with the pointer; and read `docs/index.md`, `docs/generated/props.json` and `docs/generated/parts.json` where code read the manifest. Running the setup prompt does most of this. The [migration guide](https://github.com/envsemble/envUI/blob/main/docs/migration.md#templates-and-agent-tools) lists each step.
