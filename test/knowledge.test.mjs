import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdirSync, mkdtempSync, readFileSync, symlinkSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {knowledgeIndex, searchKnowledge} from '../lib/knowledge.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
function fixture() {
  mkdirSync(resolve(root, 'workspace'), {recursive: true});
  const dir = mkdtempSync(resolve(root, 'workspace', 'knowledge-test-'));
  const put = (path, text) => {
    mkdirSync(dirname(resolve(dir, path)), {recursive: true});
    writeFileSync(resolve(dir, path), text);
  };
  return {dir, put};
}

test('real production questions retrieve their already researched finding first', () => {
  for (const [query, id] of [
    ['heavy music scene emotion', 'heavy-music-emotional-fit'],
    ['teenage love gaze subtext', 'gaze-subtext-context'],
    ['parents conflict child repair', 'adult-led-conflict-repair'],
    ['grandmother photograph nostalgia memory', 'photograph-nostalgia-cue'],
    ['camera locomotion tripod framing scale', 'motion-camera-and-locomotion-contract'],
    ['editorial conformance held cutaway derivative', 'postmotion-editorial-conformance'],
    ['ASR transcript dialogue speaker mouth', 'asr-does-not-verify-dialogue-speaker'],
  ]) {
    const result = searchKnowledge(root, query, 1);
    assert.equal(result.hits[0].id, id, query);
    assert.ok(result.hits[0].sources.every(source => source.scope));
    assert.match(result.policy, /Live model forms\/quotes/);
  }
  const blocked = searchKnowledge(root, 'parents conflict child repair');
  assert.equal(blocked.knownUnavailableSources.length, 2);
  assert.ok(blocked.knownUnavailableSources.every(source => source.status === 'cookie-challenge'));
});

test('content fingerprints reuse the index and invalidate it after source changes', () => {
  const {dir, put} = fixture();
  put('docs/light.md', '# Lighting\nCloud shadows soften the scene.');
  assert.equal(knowledgeIndex(dir).cacheHit, false);
  assert.equal(knowledgeIndex(dir).cacheHit, true);
  const first = searchKnowledge(dir, 'cloud shadows');
  assert.match(first.hits[0].citation, /light\.md:1-2$/);
  put('docs/light.md', '# Lighting\nA lantern supplies warm contact shadows.');
  const second = searchKnowledge(dir, 'lantern');
  assert.equal(second.cacheHit, false);
  assert.notEqual(second.sourceFingerprint, first.sourceFingerprint);
  assert.match(second.hits[0].text, /lantern/);
  put('.cache/knowledge-index.json', '{interrupted');
  assert.equal(searchKnowledge(dir, 'lantern').cacheHit, false);
});

test('private folders, unallowlisted data and symlinked public directories are not indexed', () => {
  const {dir, put} = fixture();
  put('docs/light.md', '# Lighting\nOrdinary public shadows.');
  for (const path of ['workspace/manifest.json', 'media/notes.md', 'outputs/review.md',
    'data/private.json', '.env', '.github/private.md']) put(path, 'NEVERINDEX_PRIVATE_ACCOUNT_TOKEN');
  mkdirSync(resolve(dir, '.github', 'skills'), {recursive: true});
  symlinkSync(resolve(dir, 'workspace'), resolve(dir, '.github', 'skills', 'private-link'), 'junction');
  assert.equal(searchKnowledge(dir, 'NEVERINDEX PRIVATE ACCOUNT TOKEN').hits.length, 0);
  const raw = readFileSync(resolve(dir, '.cache', 'knowledge-index.json'), 'utf8');
  assert.doesNotMatch(raw, /NEVERINDEX_PRIVATE_ACCOUNT_TOKEN/);
  const second = fixture();
  second.put('workspace/private.md', 'NEVERINDEX_PRIVATE_ACCOUNT_TOKEN');
  symlinkSync(resolve(second.dir, 'workspace'), resolve(second.dir, 'docs'), 'junction');
  assert.equal(searchKnowledge(second.dir, 'NEVERINDEX').hits.length, 0);
});

test('vendor snapshots retain live-required status, citation and inspected scope', () => {
  const result = searchKnowledge(root, 'PixVerse price credits model limits', 1);
  assert.equal(result.hits[0].id, 'pixverse-reference-pricing');
  assert.equal(result.hits[0].freshness, 'live-required');
  assert.match(result.hits[0].text, /not spending quotes/);
  assert.match(result.hits[0].reviewedAt, /^\d{4}-\d{2}-\d{2}$/);
});

test('malformed/duplicate knowledge and empty queries fail instead of inventing research', () => {
  const {dir, put} = fixture();
  assert.throws(() => searchKnowledge(dir, '  '), /focused knowledge query/);
  assert.throws(() => searchKnowledge(dir, 'the and of'), /meaningful search terms/);
  const entry = {id: 'same', title: 'Rain', summary: 'Rain', rules: ['Observe rain.'],
    sources: [{path: 'docs/rain.md', scope: 'Test fixture.'}], freshness: 'stable', reviewedAt: '2026-10-30'};
  put('data/knowledge.json', JSON.stringify({schemaVersion: 1, entries: [entry, entry]}));
  assert.throws(() => knowledgeIndex(dir), /unique IDs/);
});
