# Private releases

## Prepare

Update `packages/ui/package.json`, the documentation's exact dependency version in `apps/docs/package.json`, their lockfile, and `packages/ui/CHANGELOG.md`. The displayed documentation version is derived from the package metadata. Run `npm run verify` and review the PR before merging.

The package is scoped to envsemble's private GitHub Packages registry. Configure package read permissions for the organization/products that will consume it. Developers use a classic token with `read:packages`; product CI uses an allowed repository's `GITHUB_TOKEN` or a narrowly scoped secret. Authentication remains outside source files.

## Publish intentionally

After human review and merge, create and push the matching version tag, for example `v0.1.0`. The Release workflow verifies tag/package/docs agreement and all acceptance gates before publishing with `GITHUB_TOKEN` (`packages:write`) and creating the matching offline HTML release download.

Normal versions use `latest`; versions such as `0.2.0-beta.1` use `next` and a prerelease GitHub release. Published versions are immutable. If publishing succeeds but creating the release download fails, recover the HTML from the same tag and create/upload that release manually; do not republish or change the version's contents.

This implementation prepares publishing; it does not automatically tag, merge or publish the initial package.

## Adopt changes

Consumers update intentionally with `npm install @envsemble/envui@<version>`. Include compatible additions/fixes in release notes. Document migration steps for breaking prop, behavior or theme changes; treat breaking changes during `0.x` as a new minor version. After `1.0`, use a new major version for breaking changes. Use prereleases for experiments that should not become the default install.

Every package release has a reference HTML built from the same commit and version. Documentation has no hosting requirement.
