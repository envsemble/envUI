---
'@envsemble/envui': major
---

Page is invisible structure: `data-env-layout="page"`, `name` as `data-env-name`, and the `env-page` container for its content. Its gutter follows the window class of the region it sits in, 1 rem in a compact one and 1.5 rem from medium, where it grew with the viewport from 1 to 2 rem.

PageHeader is built from Row and Column. A sticky one sticks at the top of the area that scrolls, under a Scaffold's top bar where the document scrolls (`--env-scaffold-sticky-top`), and no longer reads `--env-frame-sticky-top`. What scrolls into view in its Page's content keeps clear of it by a scroll margin: it still publishes its height as `--env-page-header-block-size` on its Page, and until script runs CSS reckons the height from its rows; put content that should stay in view under it in its `toolbar`.

Migration guide: [The app frame](https://github.com/envsemble/envUI/blob/main/docs/migration.md#the-app-frame).
