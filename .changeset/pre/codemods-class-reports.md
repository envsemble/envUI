---
'@envsemble/envui-codemods': minor
---

The rename map's new `classReports` section lists the classes 1.0 neither keeps nor renames, and the selectors 1.0's markup no longer matches. `v1-classes` leaves them and reports each one with what to use instead: OrganizationSwitcher's `env-organization-menu-radio` and `-radio-dot`, which a shorter entry no longer renames to classes that don't exist, and a selector that puts `.env-document-tabs-close` inside `.env-document-tabs-tab`. `env-menu-theme` becomes `env-popup-theme`.
