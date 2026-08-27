# usabl-app

`usabl-app` is the PatternFly 6 fixture used by the usabl team preview.

## Access and sibling layout

For now, until usabl is published as an npm package, both repositories are private and you clone them next to each other:

- [usabl](https://github.com/usabl-dev/usabl)
- [usabl-app](https://github.com/usabl-dev/usabl-app)

Ask a maintainer for access, then clone them as siblings:

```text
<workspace>/
  usabl/
  usabl-app/
```

This fixture depends on `"usabl": "file:../usabl"`.

Later, this will be `npm install usabl` like any other package. You will not need the usabl repo on disk unless you are changing usabl itself.

## Prerequisites

- Node.js 22
- npm

For now, build the sibling usabl first so `../usabl/dist` exists:

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

The overlay badge is a hint. It does not fail the build.
Use `?usabl=off` to hide the badge.

For now, the stop hook in `.claude/settings.json` points at the folder next door:

```text
node ../usabl/dist/stop-hook-runner.js
```

Later the hook will come from the installed package.

## Runbook and feedback

- Engine runbook (local): `../usabl/docs/team-preview.md`
- Engine runbook (GitHub): [usabl docs/team-preview.md](https://github.com/usabl-dev/usabl/blob/main/docs/team-preview.md)
- Feedback template: [open a usabl feedback issue](https://github.com/usabl-dev/usabl/issues/new?template=feedback.yml)

## CI gate

PRs to `main` run `usabl check --ci --trusted-ref`. That answer is the one that counts.

For now, until usabl is an npm package, the job clones `usabl-dev/usabl` at an approved, immutable v0.1.0 commit into gitignored `.usabl-engine/`. It builds the engine and copies it to `/opt` so the pull request cannot replace the checker. That clone needs the repo secret `USABL_ENGINE_CHECKOUT_TOKEN` with read-only access to `usabl-dev/usabl`. Create the secret in repository settings. Do not put token values in workflow YAML or docs.

Later, CI will `npm install usabl@0.1.0` from the registry. No extra git clone. No PAT. The check will still run from a copy the PR cannot overwrite, and still use `--ci --trusted-ref`.

Until the modal is fixed in code, PRs that touch UI are expected to return `regression`. Docs-only PRs can be `idle`.
