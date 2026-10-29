import test from 'node:test';
import assert from 'node:assert/strict';
import {copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {packetDraft, productionRevision} from '../lib/workflow.mjs';

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
  for (const args of [['validate'], ['rank', '3'], ['shortlist', '6'], ['budgets'], ['roadmap'],
    ['workflow', 'previsualize'], ['workflow', 'critic-loop'], ['workflow', 'reverse-engineer']]) {
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

test('real CLI validates custom packets, rejects stale resumes and rolls failed reviews back', () => {
  const fixture = resolve(root, 'workspace', `cli-regression-${Date.now()}`);
  const json = file => JSON.parse(readFileSync(resolve(root, file), 'utf8'));
  const {scenarios} = json('data/scenarios.json');
  const brief = json('data/brief.json');
  const scenario = scenarios.find(item => item.id === 'the-dry-seat');
  const feedback = {schemaVersion: 1, reviews: [{scenarioId: scenario.id, rating: 5,
    decision: 'select', note: 'Synthetic CLI fixture.', at: new Date().toISOString()}]};
  const write = (file, value) => {
    mkdirSync(dirname(resolve(fixture, file)), {recursive: true});
    writeFileSync(resolve(fixture, file), JSON.stringify(value));
  };
  const read = file => JSON.parse(readFileSync(resolve(fixture, file), 'utf8'));
  const copy = file => {
    mkdirSync(dirname(resolve(fixture, file)), {recursive: true});
    copyFileSync(resolve(root, file), resolve(fixture, file));
  };
  for (const file of ['scripts/film.mjs', 'lib/workflow.mjs', 'lib/music.mjs',
    'data/brief.json', 'data/rubric.json', 'data/scenarios.json', 'data/model-quotes.json',
    'data/roadmap.json', 'data/workflows.json', 'data/creative-lanes.json',
    'examples/the-dry-seat.json', 'examples/same-old-handshake.json', 'examples/the-last-light.json']) copy(file);
  for (const reviewer of readdirSync(resolve(root, '.github', 'agents'))) copy(`.github/agents/${reviewer}`);
  write('data/feedback.json', feedback);
  const unrated = spawnSync(process.execPath, [resolve(fixture, 'scripts', 'film.mjs'),
    'feedback', scenario.id, 'unrated', 'select', 'Actual selection without a numeric rating.'],
  {encoding: 'utf8', windowsHide: true});
  assert.equal(unrated.status, 0, unrated.stderr);
  assert.equal(read('data/feedback.json').reviews[0].rating, null);
  const path = 'workspace/test/manifest.json';
  const draft = {...packetDraft(scenario, brief, feedback), storyboardApproved: true,
    storyboardApprovalEvidence: 'Synthetic actual-user field for testing only.'};
  write(path, draft);
  const run = (...args) => spawnSync(process.execPath, [resolve(fixture, 'scripts', 'film.mjs'), ...args],
    {encoding: 'utf8', windowsHide: true});
  let result = run('advance', path, 'preproduction');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /missing production packet/);
  draft.productionDraft = json('examples/the-dry-seat.json');
  write(path, draft);
  result = run('advance', path, 'preproduction');
  assert.equal(result.status, 0, result.stderr);
  let manifest = read(path);
  assert.equal(manifest.productionFingerprint, productionRevision(manifest));
  manifest.productionDraft.shots[0].prompt = 'Synthetic changed direction.';
  write(path, manifest);
  assert.match(run('status', path).stderr, /approval is stale/);
  assert.match(run('validate', path).stderr, /approval is stale/);
  result = run('refresh', path);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(read(path).storyboardApproved, false);
  manifest = {...read(path), stage: 'final-approved', approvalRevision: 2,
    finalUserApproval: true, generationApproved: true};
  manifest.productionFingerprint = productionRevision(manifest);
  write(path, manifest);
  result = run('review', path, 'phone-and-export', 'fail', 'Synthetic observed failure.');
  assert.equal(result.status, 0, result.stderr);
  assert.equal(read(path).stage, 'sound-approved');
  assert.equal(read(path).finalUserApproval, false);
  write('data/feedback.json', {...feedback, reviews: [{...feedback.reviews[0], decision: 'rewrite'}]});
  assert.match(run('status', path).stderr, /withdrawn/);
});
