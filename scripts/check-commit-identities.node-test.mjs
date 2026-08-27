import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { promisify } from 'node:util';
import { afterEach, beforeEach, test } from 'node:test';

const execFileAsync = promisify(execFile);
const scriptPath = resolve('scripts/check-commit-identities.mjs');
let repoPath = '';

async function git(args) {
  const { stdout } = await execFileAsync('git', args, { cwd: repoPath, encoding: 'utf8' });
  return stdout.trim();
}

async function runPolicy(args) {
  return execFileAsync(process.execPath, [scriptPath, ...args], { cwd: repoPath, encoding: 'utf8' });
}

beforeEach(async () => {
  repoPath = await mkdtemp(join(tmpdir(), 'usabl-app-identity-test-'));
  await git(['init', '--initial-branch=main']);
  await git(['config', 'user.name', 'Test User']);
  await git(['config', 'user.email', 'test.user@redhat.com']);
  await git(['config', 'user.useConfigOnly', 'true']);
});

afterEach(async () => {
  await rm(repoPath, { recursive: true, force: true });
});

test('accepts an approved local identity', async () => {
  const result = await runPolicy(['--local']);
  assert.equal(result.stdout, 'Commit identities approved.\n');
});

test('rejects an unapproved local identity', async () => {
  await git(['config', 'user.email', 'test.user@example.com']);
  await assert.rejects(runPolicy(['--local']), /approved Red Hat address/);
});

test('rejects an unapproved co-author in a commit range', async () => {
  await writeFile(join(repoPath, 'first.txt'), 'first\n', 'utf8');
  await git(['add', 'first.txt']);
  await git(['commit', '-m', 'test: first']);
  const base = await git(['rev-parse', 'HEAD']);
  await writeFile(join(repoPath, 'second.txt'), 'second\n', 'utf8');
  await git(['add', 'second.txt']);
  await git(['commit', '-m', 'test: second', '-m', 'Co-authored-by: Other User <other@example.com>']);
  const head = await git(['rev-parse', 'HEAD']);
  await assert.rejects(runPolicy(['--range', base, head]), /unapproved co-author email/);
});
