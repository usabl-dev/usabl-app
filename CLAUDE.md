# Accessibility workflow

This repository is the usabl team fixture. Its deliberate barriers are test
scenarios, not product patterns to copy.

When changing user interface code:

- Run `/usabl-check` after a meaningful accessibility change (Claude Code skill or Cursor command).
- In Cursor, `usabl install --cursor` wires `.cursor/commands/usabl-check.md` and a UI rule under `.cursor/rules/`.
- Treat the broken and repaired previews as teaching aids, not source proof.
- Use the Result from usabl to explain what is broken, not covered, or verified.
- Let the configured Stop hook run before claiming the work is complete.
- Do not disable the hook or replace a source repair with a query parameter.
