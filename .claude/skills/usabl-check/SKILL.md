---
name: usabl-check
description: Run the advisory usabl accessibility check during implementation and explain the current result.
allowed-tools: Bash(npx usabl check --self-check)
---

Run `npx usabl check --self-check` from the repository root.

Report:

1. The verdict.
2. The affected accessibility behavior.
3. The first finding and suggested repair, when present.
4. Any missing coverage.

This is an on-demand self-check the assistant runs during implementation. It is
advisory. Do not call the work verified from this command alone. The usabl Stop hook
decides whether Claude can finish.
