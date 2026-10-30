import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, mkdirSync, mkdtempSync, writeFileSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createProductionBundle, deliveryPath, validateDeliveryPath} from '../lib/production.mjs';
import {fileHash, fingerprint, packetDraft, readJson} from '../lib/workflow.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
function fixture() {
  mkdirSync(resolve(root, 'workspace'), {recursive: true});
  const dir = mkdtempSync(resolve(root, 'workspace', 'production-test-'));
  const packet = readJson(resolve(root, 'examples', 'the-dry-seat.json'));
  const scenario = readJson(resolve(root, 'data', 'scenarios.json')).scenarios.find(item =>
    item.id === packet.scenarioId);
  const brief = readJson(resolve(root, 'data', 'brief.json'));
  const feedback = {schemaVersion: 1, reviews: [{scenarioId: scenario.id, decision: 'select', rating: null}]};
  const source = (path, kind) => {
    mkdirSync(dirname(resolve(dir, path)), {recursive: true});
    writeFileSync(resolve(dir, path), `Synthetic ${kind} bytes, not real creative media.`);
    return {path, kind, sha256: fileHash(resolve(dir, path))};
  };
  const assets = [source(join('media', 'cast.png'), 'character'),
    source(join('media', 'frame.png'), 'keyframe'),
    source(join('media', 'source.mp4'), 'video'), source(join('media', 'mix.wav'), 'audio')];
  const preview = source(join('outputs', 'legacy-preview.mp4'), 'final');
  const manifest = {...packetDraft(scenario, brief, feedback), productionDraft: packet, assets,
    previews: [{...preview, seconds: packet.seconds}]};
  return {dir, manifest};
}

test('bundle exports coordinated scripts, hash-verified media and honest unapproved delivery without changing originals', () => {
  const {dir, manifest} = fixture();
  const original = fingerprint(manifest);
  const result = createProductionBundle(dir, manifest, 'v002');
  assert.equal(fingerprint(manifest), original);
  assert.equal(result.receipt.planningPacketChanged, false);
  assert.equal(result.receipt.finalUserApproval, false);
  assert.equal(result.receipt.publicationApproval, null);
  const receipt = readJson(join(result.path, 'metadata', 'bundle.json'));
  const scripts = receipt.files.filter(item => item.path.split(/[\\/]/)[0] === 'scripts');
  assert.equal(scripts.length, 10);
  for (const script of scripts) {
    const data = readJson(join(result.path, script.path));
    assert.equal(data.packetFingerprint, fingerprint(manifest.productionDraft));
    assert.equal(data.seconds, manifest.seconds);
    assert.equal(fileHash(join(result.path, script.path)), script.sha256);
  }
  for (const asset of receipt.assets) {
    assert.equal(fileHash(resolve(dir, asset.source)), asset.sha256);
    assert.equal(fileHash(join(result.path, asset.path)), asset.sha256);
  }
  assert.ok(existsSync(resolve(dir, deliveryPath(manifest.scenarioId, 'v002'))));
  assert.throws(() => createProductionBundle(dir, manifest, 'v002'), /version exists/);
});

test('proposed planning scripts cannot silently replace the packet that produced retained media', () => {
  const {dir, manifest} = fixture();
  const packet = structuredClone(manifest.productionDraft);
  packet.soundPlan.musicBrief = 'Synthetic unapproved next sound direction.';
  const {path, receipt} = createProductionBundle(dir, manifest, 'v003', {packet});
  assert.equal(receipt.planningPacketChanged, true);
  assert.deepEqual(readJson(join(path, 'metadata', 'produced-packet.json')), manifest.productionDraft);
  assert.deepEqual(readJson(join(path, 'metadata', 'planning-packet.json')), packet);
  assert.equal(receipt.finalUserApproval, false);
});

test('bundle preflight rejects stale bytes, wrong duration and unsafe versions before creating an output', () => {
  const {dir, manifest} = fixture();
  for (const version of ['../v001', 'v000', 'v1', 'v001\\outside']) {
    assert.throws(() => createProductionBundle(dir, manifest, version), /version/);
  }
  const changed = structuredClone(manifest);
  changed.previews[0].seconds -= 1;
  assert.throws(() => createProductionBundle(dir, changed, 'v001'), /duration/);
  writeFileSync(resolve(dir, manifest.assets[0].path), 'Changed source bytes.');
  assert.throws(() => createProductionBundle(dir, manifest, 'v001'), /Source hash mismatch/);
  assert.equal(existsSync(resolve(dir, 'outputs', manifest.scenarioId, 'v001')), false);
});

test('delivery paths bind topic/version/variant and reject flat, mismatched and escaping destinations', () => {
  const canonical = deliveryPath('the-dry-seat', 'v001');
  assert.equal(validateDeliveryPath(root, canonical, 'the-dry-seat'), resolve(root, canonical));
  assert.equal(validateDeliveryPath(root, canonical.replaceAll('\\', '/'), 'the-dry-seat'),
    resolve(root, canonical));
  for (const path of ['outputs/loose.mp4', 'outputs/../data/new.mp4',
    'outputs/the-dry-seat/v001/finalVid/the-dry-seat-v002-review.mp4',
    'outputs/another-topic/v001/finalVid/another-topic-v001-review.mp4']) {
    assert.throws(() => validateDeliveryPath(root, path, 'the-dry-seat'));
  }
});
