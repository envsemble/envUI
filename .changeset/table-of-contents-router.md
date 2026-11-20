---
'@envsemble/envui': major
---

TableOfContents leaves the address to the application's router: each entry is an `#id` link through LinkProvider's link component, which now handles the click, so the router, or else the browser, changes the address and decides whether a jump adds a history entry. envUI still scrolls the section into view, focuses it and marks it current. `onNavigate` is called with the section's id and the click before envUI's scroll; call `preventDefault` in it to make the jump yourself. See [TableOfContents](https://github.com/envsemble/envUI/blob/main/docs/components/table-of-contents.md).

Breaking changes:

- TableOfContents no longer calls `history.pushState` itself. A click on an entry reaches LinkProvider's link component, as a click on any other envUI link does: a router link that handles `#id` links changes the address its own way, and without one the browser follows the fragment. To keep the address as it is, call `event.preventDefault()` in `onNavigate` and scroll to the section yourself.
