import test from 'node:test';
import assert from 'node:assert/strict';
import {planSongCue} from '../lib/music.mjs';

const cue = {schemaVersion: 1, method: 'pitch-preserving', sourceBpm: 80, targetBpm: 96,
  sourceIn: 20, sourceOut: 32, filmSeconds: 10, rights: {}, listeningReview: 'pending',
  generationOrRecordingApproved: false};

test('song plan separates BPM, phrase duration and approval without editing audio', () => {
  const plan = planSongCue(cue);
  assert.equal(plan.speedFactor, 1.2);
  assert.equal(plan.durationAfterChange, 10);
  assert.equal(plan.durationMatchesFilm, true);
  assert.ok(plan.blockers.some(item => item.includes('rights')));
  assert.ok(plan.blockers.some(item => item.includes('approval')));
});

test('song plan rejects invalid timing/BPM and reports a phrase that does not fit', () => {
  assert.throws(() => planSongCue({...cue, sourceBpm: 0}), /BPM/);
  assert.throws(() => planSongCue({...cue, sourceOut: 19}), /complete source phrase/);
  assert.equal(planSongCue({...cue, targetBpm: 80}).durationMatchesFilm, false);
  assert.equal(planSongCue({...cue, method: 'trim-only', sourceBpm: null}).speedFactor, 1);
});

test('new arrangement cannot inherit a calculated duration or invent listening acceptance', () => {
  const plan = planSongCue({...cue, method: 'new-performance'});
  assert.equal(plan.durationAfterChange, null);
  assert.equal(plan.durationMatchesFilm, false);
  assert.ok(plan.blockers.some(item => item.includes('actual audio')));
  assert.ok(plan.blockers.some(item => item.includes('listening')));
});
