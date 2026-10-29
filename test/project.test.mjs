import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync, readdirSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

test('all local documentation links resolve and workflow reviewer dependencies are discoverable', () => {
  const markdownFiles = [];
  function walk(dir) {
    for (const item of readdirSync(dir, {withFileTypes: true})) {
      if (['.git', 'workspace', 'outputs', 'media', 'node_modules'].includes(item.name)) continue;
      const path = resolve(dir, item.name);
      if (item.isDirectory()) walk(path);
      else if (item.name.endsWith('.md')) markdownFiles.push(path);
    }
  }
  walk(root);
  for (const path of markdownFiles) {
    const text = readFileSync(path, 'utf8');
    for (const match of text.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
      const link = match[1];
      if (/^(https?:|#)/.test(link)) continue;
      assert.ok(existsSync(resolve(dirname(path), link.split('#')[0])), `${path}: missing ${link}`);
    }
  }
  const {workflows} = JSON.parse(readFileSync(resolve(root, 'data/workflows.json'), 'utf8'));
  for (const workflow of workflows) {
    for (const reviewer of workflow.reviewers) {
      const path = resolve(root, '.github', 'agents', `${reviewer}.agent.md`);
      const text = readFileSync(path, 'utf8');
      assert.match(text, /^---\r?\nname: microfilm-/);
      assert.match(text, /tools: \["read", "search"(, "web")?\]/);
      assert.doesNotMatch(text, /tools:.*"(edit|execute|shell|agent|\*)"/);
    }
  }
});

test('read-only CLI entry points validate, rank, budget and resume project workflows', () => {
  for (const args of [['validate'], ['rank', '3'], ['shortlist', '6'], ['budgets'], ['roadmap'], ['workflow', 'previsualize']]) {
    const result = spawnSync(process.execPath, [resolve(root, 'scripts', 'film.mjs'), ...args],
      {encoding: 'utf8', windowsHide: true});
    assert.equal(result.status, 0, result.stderr);
    assert.ok(result.stdout.length > 0);
  }
  const failed = spawnSync(process.execPath, [resolve(root, 'scripts', 'film.mjs'), 'workflow', 'missing'],
    {encoding: 'utf8', windowsHide: true});
  assert.equal(failed.status, 1);
  assert.match(failed.stderr, /Unknown workflow/);
});
