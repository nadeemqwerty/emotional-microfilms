import {closeSync, existsSync, mkdirSync, openSync, unlinkSync, writeFileSync} from 'node:fs';
import {dirname} from 'node:path';
import {assetSetFingerprint, fileHash, invariant, readJson, validateJob} from './workflow.mjs';

export function withWorkspaceLock(path, action) {
  mkdirSync(dirname(path), {recursive: true});
  const lock = `${path}.write-lock`;
  let descriptor;
  try {
    descriptor = openSync(lock, 'wx');
  } catch (error) {
    if (error.code === 'EEXIST') throw new Error('Workspace write locked. Reconcile owner/jobs before recovering a crashed writer; never use timeout takeover.');
    throw error;
  }
  try {
    writeFileSync(descriptor, JSON.stringify({pid: process.pid, at: new Date().toISOString()}));
    return action();
  } finally {
    closeSync(descriptor);
    unlinkSync(lock);
  }
}

export function workspaceOwner(path) {
  return existsSync(`${path}.owner.json`) ? readJson(`${path}.owner.json`) : null;
}

export function claimWorkspace(path, owner) {
  invariant(typeof owner === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,100}$/.test(owner),
    'Use a non-secret owner ID (letters, digits, dot, underscore or hyphen).');
  return withWorkspaceLock(path, () => {
    invariant(!workspaceOwner(path), 'Workspace already has an owner; transfer it explicitly.');
    const manifest = readJson(path);
    manifest.jobs.forEach(validateJob);
    invariant(manifest.jobs.every(job => ['completed', 'failed'].includes(job.status)) &&
      manifest.reservedCredits === 0, 'Initial claim needs reconciled terminal jobs and zero reservations.');
    const record = {owner, manifestSha256: fileHash(path), at: new Date().toISOString()};
    writeFileSync(`${path}.owner.json`, JSON.stringify(record, null, 2), {flag: 'wx'});
    return record;
  });
}

export function saveWorkspace(path, manifest, owner, expectedHash) {
  return withWorkspaceLock(path, () => {
    invariant(owner && workspaceOwner(path)?.owner === owner,
      'Claim the workspace first and set FILM_OWNER to its current owner ID.');
    invariant(fileHash(path) === expectedHash, 'Workspace changed concurrently; reload and reconcile, do not overwrite.');
    writeFileSync(path, `${JSON.stringify(manifest, null, 2)}\n`);
  });
}

export function handoffSnapshot(path, manifest) {
  manifest.jobs.forEach(validateJob);
  return {
    schemaVersion: 1, manifestSha256: fileHash(path),
    owner: workspaceOwner(path)?.owner ?? null,
    scenarioId: manifest.scenarioId, stage: manifest.stage,
    productionFingerprint: manifest.productionFingerprint ?? null,
    assetSetFingerprint: assetSetFingerprint(manifest.assets),
    assets: manifest.assets.map(({path, sha256, kind}) => ({path, sha256, kind})),
    jobs: manifest.jobs.map(({historyId, requestFingerprint, status, chargedCredits}) =>
      ({historyId, requestFingerprint, status, chargedCredits})),
    approvedBudgetCredits: manifest.approvedBudgetCredits,
    spentCredits: manifest.spentCredits, reservedCredits: manifest.reservedCredits,
    generationApproved: manifest.generationApproved,
    acceptance: {finalUserApproval: manifest.finalUserApproval === true,
      delegatedScopes: manifest.delegations?.filter(item => item.status === 'active')
        .map(({id, scope, expiresAt}) => ({id, scope, expiresAt})) ?? []},
    pending: ['Revalidate source and file hashes on destination.',
      'Resume existing active historyIds; never resubmit on handoff.',
      'Read private delegation instructions/limits in the manifest.',
      'Check actual playback/listening capability; absent evidence stays blocked.',
      'Final personal acceptance and publication remain separate.'],
    privacy: 'Private handoff, not a public artifact. No credentials or signed reference URLs included.',
  };
}

export function transferWorkspace(path, owner, nextOwner, receipt) {
  invariant(typeof nextOwner === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,100}$/.test(nextOwner),
    'Use a non-secret next-owner ID.');
  return withWorkspaceLock(path, () => {
    invariant(owner && workspaceOwner(path)?.owner === owner, 'Only the current owner can transfer.');
    const manifest = readJson(path);
    manifest.jobs.forEach(validateJob);
    const pending = manifest.jobs.filter(job => ['pending', 'running'].includes(job.status))
      .map(job => job.historyId).sort();
    invariant(receipt?.manifestSha256 === fileHash(path) &&
      typeof receipt.providerReconciliationEvidence === 'string' && receipt.providerReconciliationEvidence.trim() &&
      Number.isFinite(Date.parse(receipt.at)) && Date.parse(receipt.at) <= Date.now() &&
      Date.now() - Date.parse(receipt.at) < 60 * 60 * 1000 &&
      receipt.reservedCredits === manifest.reservedCredits &&
      Array.isArray(receipt.resumeHistoryIds) &&
      JSON.stringify([...receipt.resumeHistoryIds].sort()) === JSON.stringify(pending),
    'Transfer needs a fresh hash-bound provider/job/reservation reconciliation and every active historyId.');
    const previous = workspaceOwner(path);
    const record = {owner: nextOwner, previousOwner: owner, previous,
      manifestSha256: fileHash(path), at: new Date().toISOString(), receipt};
    writeFileSync(`${path}.owner.json`, JSON.stringify(record, null, 2));
    return record;
  });
}
