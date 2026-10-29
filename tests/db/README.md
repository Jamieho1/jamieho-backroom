# Database tests

New data tables follow one pattern: enable RLS and guard reads with `rls.can_view_app('<app id>')`.
Never put a function in `public` unless the app must call it over the API: a test enforces that only `record_signin` is callable.
