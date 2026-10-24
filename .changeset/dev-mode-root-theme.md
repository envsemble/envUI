---
'@envsemble/envui': patch
---

Dev mode takes the theme of the page it measures as it opens: the theme boundary around its `root`, rather than the document's first. A page in a nested `Theme` of another theme than the document's, such as an example shown in a light theme on a dark page, has dev mode's toolbar, side columns, popovers and view in its theme too. Dev mode theme in the toolbar still sets another.
