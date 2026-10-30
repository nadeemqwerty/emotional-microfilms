import test from 'node:test';
import assert from 'node:assert/strict';
import {copyFileSync, mkdirSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {claimWorkspace, handoffSnapshot, saveWorkspace, transferWorkspace,
  withWorkspaceLock, workspaceOwner} from '../lib/handoff.mjs';
import {ensureNoDuplicateJob, fileHash, fingerprint, readJson} from '../lib/workflow.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
test('exclusive owner, compare-and-swap and pending-job transfer survive relocation without duplicate submission', () => {
  const fixture = resolve(root, 'workspace', `handoff-test-${Date.now()}`);
  mkdirSync(fixture, {recursive: true});
  const path = resolve(fixture, 'manifest.json');
  const state = {scenarioId: 'synthetic', stage: 'selected', assets: [],
    jobs: [], reservedCredits: 0, approvedBudgetCredits: 100, spentCredits: 0,
    generationApproved: false, finalUserApproval: false,
    characterReferences: {private: {url: 'https://example.test/?signed=secret'}}};
  writeFileSync(path, JSON.stringify(state));
  claimWorkspace(path, 'copilot-test');
  assert.throws(() => claimWorkspace(path, 'other'), /already has/);
  let hash = fileHash(path);
  assert.throws(() => saveWorkspace(path, state, 'wrong-owner', hash), /current owner/);
  withWorkspaceLock(path, () => {
    assert.throws(() => saveWorkspace(path, state, 'copilot-test', hash), /write locked/);
  });
  const pending = {historyId: 'synthetic-existing-id', status: 'running', chargedCredits: 0,
    requestFingerprint: fingerprint({synthetic: true})};
  const running = {...state, jobs: [pending], reservedCredits: 18};
  saveWorkspace(path, running, 'copilot-test', hash);
  assert.throws(() => saveWorkspace(path, state, 'copilot-test', hash), /changed concurrently/);
  const snapshot = handoffSnapshot(path, running);
  assert.doesNotMatch(JSON.stringify(snapshot), /signed=secret/);
  const receipt = {manifestSha256: snapshot.manifestSha256, reservedCredits: 18,
    at: new Date().toISOString(), resumeHistoryIds: [pending.historyId],
    providerReconciliationEvidence: 'Synthetic provider check; not a real account.'};
  assert.throws(() => transferWorkspace(path, 'copilot-test', 'next-host', {
    ...receipt, resumeHistoryIds: []}), /reconciliation/);
  transferWorkspace(path, 'copilot-test', 'next-host', receipt);
  assert.equal(workspaceOwner(path).owner, 'next-host');
  assert.throws(() => saveWorkspace(path, running, 'copilot-test', fileHash(path)), /current owner/);
  const relocated = resolve(fixture, 'relocated', 'manifest.json');
  mkdirSync(dirname(relocated), {recursive: true});
  copyFileSync(path, relocated);
  copyFileSync(`${path}.owner.json`, `${relocated}.owner.json`);
  assert.equal(handoffSnapshot(relocated, readJson(relocated)).manifestSha256, snapshot.manifestSha256);
  assert.throws(() => ensureNoDuplicateJob(readJson(relocated).jobs, pending.requestFingerprint), /Resume/);
  hash = fileHash(relocated);
  saveWorkspace(relocated, {...running, reviews: [{area: 'motion', result: 'fail',
    evidence: 'Synthetic failed review retained across host boundary.'}]}, 'next-host', hash);
  assert.equal(readJson(relocated).reviews[0].result, 'fail');
});
