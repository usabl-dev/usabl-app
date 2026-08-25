# usabl-app

`usabl-app` is the PatternFly 6 fixture used by the usabl team preview.

## Access and sibling layout

Both repositories are private:

- [usabl](https://github.com/usabl-dev/usabl)
- [usabl-app](https://github.com/usabl-dev/usabl-app)

Ask a maintainer for access, then clone them as siblings:

```text
<workspace>/
  usabl/
  usabl-app/
```

This fixture links the local engine through a file dependency (`file:../usabl`).

## Prerequisites

- Node.js 22
- npm

Build the sibling engine first so `../usabl/dist` exists:

```bash
cd ../usabl
npm run build
```

Then install in this repo:

```bash
cd ../usabl-app
npm install
```

## Run the fixture

Start dev mode:

```bash
npm run dev
```

Open `http://127.0.0.1:5173`, go to `/clusters`, select **View cluster details**, then press `Escape`.
Current behavior on the broken path is that focus is lost.

## Run an engine check

From the `usabl-app` working directory:

```bash
npx usabl check
```

Until the modal is fixed in code, expect a `regression` verdict with `pf-modal-focus-return`.
Do not treat query-string variants as the team ratchet. Fix the modal behavior in code.

## Overlay behavior

The overlay badge is advisory only. It does not mint verdicts.
Use `?usabl=off` to hide the badge.

The stop hook runner is already configured in `.claude/settings.json`:

```text
node ../usabl/dist/stop-hook-runner.js
```

## Runbook and feedback

- Engine runbook (local): `../usabl/docs/team-preview.md`
- Engine runbook (GitHub): [usabl docs/team-preview.md](https://github.com/usabl-dev/usabl/blob/main/docs/team-preview.md)
- Feedback template: [open a usabl feedback issue](https://github.com/usabl-dev/usabl/issues/new?template=feedback.yml)

## CI gate

PRs to `main` run `usabl check --ci --trusted-ref` and the gate verdict is the source of truth.

The workflow checks out the trusted engine tag `v0.1.0` into gitignored `.usabl-engine/` before running checks.

The repo secret `USABL_ENGINE_CHECKOUT_TOKEN` must exist with read-only access to `usabl-dev/usabl`. Founder creates the secret in repository settings. Do not put token values in workflow YAML or docs.

Until the modal is fixed in code, PRs that touch UI are expected to return `regression`. Docs-only PRs can be `idle`.
