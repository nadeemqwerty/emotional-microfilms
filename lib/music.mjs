import {invariant} from './workflow.mjs';

export function planSongCue(cue) {
  invariant(cue.schemaVersion === 1, 'Unsupported song cue schema.');
  invariant(['trim-only', 'pitch-preserving', 'rearrange', 'new-performance'].includes(cue.method),
    'Unknown song adaptation method.');
  invariant(Number.isFinite(cue.sourceIn) && cue.sourceIn >= 0 &&
    Number.isFinite(cue.sourceOut) && cue.sourceOut > cue.sourceIn,
  'Select a real complete source phrase.');
  invariant(Number.isFinite(cue.filmSeconds) && cue.filmSeconds >= 8 && cue.filmSeconds <= 15,
    'Song cue needs an 8-15 second film target.');
  const sourceSeconds = cue.sourceOut - cue.sourceIn;
  let speedFactor = 1;
  if (cue.method === 'pitch-preserving') {
    invariant(Number.isFinite(cue.sourceBpm) && cue.sourceBpm > 0 &&
      Number.isFinite(cue.targetBpm) && cue.targetBpm > 0, 'Positive source and target BPM required.');
    speedFactor = cue.targetBpm / cue.sourceBpm;
  }
  const needsPerformance = ['rearrange', 'new-performance'].includes(cue.method);
  const durationAfterChange = needsPerformance ? null : sourceSeconds / speedFactor;
  const blockers = [];
  for (const key of ['compositionLyrics', 'recording', 'arrangement', 'voice', 'platformCommercialUse']) {
    if (!['cleared', 'not-applicable-with-evidence'].includes(cue.rights?.[key])) {
      blockers.push(`Resolve rights: ${key}`);
    }
  }
  if (cue.listeningReview !== 'pass') blockers.push('Actual listening/phrase/pacing review required.');
  if (cue.generationOrRecordingApproved !== true) blockers.push('No recording/generation approval.');
  if (needsPerformance) blockers.push('Arrangement/performance duration must be established from actual audio.');
  return {
    method: cue.method, sourceSeconds, speedFactor,
    durationAfterChange,
    durationMatchesFilm: durationAfterChange !== null &&
      Math.abs(durationAfterChange - cue.filmSeconds) < 0.001,
    blockers,
    note: 'Timing plan only; no audio edited, sung, uploaded, generated or licensed. BPM does not measure emotion or dopamine.',
  };
}
