---
'@envsemble/envui': minor
'@envsemble/eslint-plugin-envui': minor
'@envsemble/stylelint-config-envui': minor
---

Tabs is gone: views of the same content switch with a [SegmentedControl](https://github.com/envsemble/envUI/blob/main/docs/components/segmented-control.md), and places to go are a NavigationDrawer or a NavigationRail. MarkdownEditor's Write and Preview are a small SegmentedControl above the source, in the new parts `env-markdown-editor-views` and `env-markdown-editor-view`. ESLint's `envui/no-html-elements` suggests SegmentedControl for an element with the role `tablist`, or DocumentTabs for documents people open and close.

Breaking changes:

- **Tabs is removed**, with `TabsProps` and `TabsItem`, its parts `env-tabs`, `env-tabs-list`, `env-tabs-tab`, `env-tabs-indicator`, `env-tabs-panels` and `env-tabs-panel`, its states `data-active`, `data-placed`, `data-starting-style` and `data-ending-style`, `data-variant` (`data-variant='text'`), `data-size` (`data-size='sm'`, `data-size='md'`, `data-size='lg'`) and `data-fill` (`data-fill=''`, with `data-placed=''`), and its color properties `--env-tabs-container`, `--env-tabs-content`, `--env-tabs-selected-content` and `--env-tabs-indicator`. Write a SegmentedControl for the views and show the chosen one's content under it: `<SegmentedControl aria-label="Project views" value={view} onValueChange={setView} items={[{ value: 'summary', label: 'Summary' }, { value: 'activity', label: 'Activity' }]} />`, then `{view === 'summary' ? <Summary /> : <Activity />}`. A side list of sections is a NavigationDrawer.
- MarkdownEditor's Write and Preview are radios in a SegmentedControl rather than tabs, so a test that finds them by the role `tab` finds them by `radio`, and the source and the preview are no longer `tabpanel`s.
