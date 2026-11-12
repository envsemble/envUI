---
'@envsemble/envui': patch
---

`ThemePreferenceProvider` hydrates a page rendered on the server without a mismatch or a flash: on the server and as the page hydrates, it renders the default preference, writes nothing on the document root, and its boundary takes the look of the theme the [bootstrap script](https://github.com/envsemble/envUI/blob/main/docs/setup.md) gave the root before the first paint; once hydrated, it renders the stored preference and the system's theme. Before, the server's boundary was light, so a saved or system dark theme showed light until the page had hydrated.
