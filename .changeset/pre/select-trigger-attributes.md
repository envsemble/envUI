---
'@envsemble/envui': major
---

Select's trigger is no Button any more, so it carries neither `data-variant` (`[data-variant='outline']`, `[data-variant='secondary']`) nor `data-size` (`[data-size='sm']`): select the field by `.env-select`, its size by `.env-select[data-size]` and its look by `.env-select-control[data-variant]`, as on a TextField.
