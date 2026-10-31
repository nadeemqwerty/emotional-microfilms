import test from 'node:test';
import assert from 'node:assert/strict';
import {readdirSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {cameraInstruction, dialogueInstruction, packetDraft, productionRevision, readJson,
  recordReview, requireReview, validateCameraPlan, validateCreationDirection, validateDialoguePlan,
  validatePacket, validateSpend} from '../lib/workflow.mjs';
import {postCameraFilter} from '../lib/assembly.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const load = path => readJson(resolve(root, path));
const quiet = load('examples/the-quiet-crayon.json');
const {scenarios} = load('data/scenarios.json');
const brief = load('data/brief.json');
const scenario = scenarios.find(item => item.id === quiet.scenarioId);
const feedback = {schemaVersion: 1, reviews: [{scenarioId: scenario.id, decision: 'select',
  rating: null, note: 'Synthetic unit-test selection, not user feedback.', at: new Date().toISOString()}]};

test('all examples resolve explicit camera and intentional spoken/nonspoken dialogue', () => {
  for (const name of readdirSync(resolve(root, 'examples')).filter(name => name.endsWith('.json'))) {
    const packet = load(`examples/${name}`);
    assert.equal(validateCreationDirection(packet), true);
  }
  assert.match(dialogueInstruction(quiet, 'a'), /Eunji says in English/);
  assert.match(dialogueInstruction(quiet, 'a'), /We're sorry/);
});

test('camera moves, zoom, focus and prompt binding reject contradictions and wrong times', () => {
  for (const mutate of [
    p => { p.cameraPlan.shots[0].segments[0].from = 1; },
    p => { p.cameraPlan.shots[0].segments[0].to = 9; },
    p => { p.cameraPlan.shots[0].segments[0].direction = 'in'; },
    p => { p.cameraPlan.shots[0].segments[0].zoom.from = NaN; },
    p => { p.cameraPlan.shots[0].segments[0].focus.to = 'the crayon'; },
    p => { p.cameraPlan.shots[0].segments[0].parallax = 'expected'; },
    p => { p.shots[0].prompt = 'Unrelated motion prompt.'; },
    p => { p.cameraPlan.shots[0].executionRoute = 'post'; p.cameraPlan.shots[0].segments[0].zoom.mode = 'optical'; },
  ]) {
    const packet = structuredClone(quiet);
    mutate(packet);
    assert.throws(() => validateCameraPlan(packet), /[Cc]amera|[Ff]ixed|[Pp]ost|[Mm]otion/);
  }
  const packet = structuredClone(quiet);
  const segment = packet.cameraPlan.shots[0].segments[0];
  Object.assign(segment, {move: 'dolly', direction: 'in', speed: 'slow', parallax: 'expected'});
  packet.shots[0].prompt = cameraInstruction(packet, 'a');
  validateCameraPlan(packet);
  segment.zoom = {mode: 'optical', from: 1, to: 1.2};
  assert.throws(() => validateCameraPlan(packet), /compound/);
  segment.compoundIntent = 'Deliberate perspective-changing dolly zoom, separately benchmarked.';
  packet.shots[0].prompt = cameraInstruction(packet, 'a');
  validateCameraPlan(packet);
});

test('dialogue requires correct voice, emotional delivery, visibility, timing and explicit overlap', () => {
  for (const mutate of [
    p => { p.dialoguePlan.lines[0].speakerId = 'unknown'; },
    p => { p.dialoguePlan.lines[0].emotion = ''; },
    p => { p.dialoguePlan.lines[0].subtext = ''; },
    p => { p.dialoguePlan.lines[0].pauses = ''; },
    p => { p.dialoguePlan.lines[0].from = 11; },
    p => { p.dialoguePlan.lines[0].lipSync = 'offscreen'; },
    p => { p.dialoguePlan.voices[0].rights = ''; },
    p => { p.shots[0].params = {generateAudio: false}; },
    p => { p.shots[0].paramsToQuote.generateAudio = false; },
    p => { p.dialoguePlan.lines.push({...p.dialoguePlan.lines[0], id: 'overlapping-line'}); },
    p => { p.shots[0].prompt = 'No canonical words or delivery.'; },
  ]) {
    const packet = structuredClone(quiet);
    mutate(packet);
    assert.throws(() => validateDialoguePlan(packet), /[Dd]ialogue|[Dd]irection|[Cc]anonical|[Nn]ative|[Uu]nplanned/);
  }
});

test('legacy reads remain possible but new paid creation cannot omit camera/dialogue', () => {
  for (const key of ['cameraPlan', 'dialoguePlan']) {
    const packet = structuredClone(quiet);
    delete packet[key];
    validatePacket(packet, scenarios);
    const manifest = {...packetDraft(scenario, brief, feedback), stage: 'preproduction',
      productionDraft: packet, approvalRevision: 1, generationApproved: true, nextGenerationKind: 'character'};
    manifest.productionFingerprint = productionRevision(manifest);
    assert.throws(() => validateSpend(manifest, 1, null, Date.now(), {scenarios, brief, feedback}),
      /cameraPlan|dialoguePlan/);
  }
});

test('a dialogue pass requires actual listening and per-line word, speaker, emotion and lip-sync evidence', () => {
  const manifest = {...packetDraft(scenario, brief, feedback), productionDraft: quiet,
    stage: 'motion-approved', approvalRevision: 1, soundDecision: 'native', reviews: [], assets: []};
  manifest.productionFingerprint = productionRevision(manifest);
  const report = {picture: 'full-playback', audio: 'listened',
    listeningConditions: 'Synthetic unit-test attestation only; no real listening claimed.',
    lines: [{id: 'reassurance', from: 4, to: 8, wordsVerified: true, speakerVerified: true,
      intelligible: true, emotionalMatch: true, lipSync: 'pass', evidence: 'Synthetic line evidence.'}],
    unresolvedFailures: []};
  const record = value => recordReview(manifest, {area: 'dialogue-performance', result: 'pass',
    evidence: 'Synthetic fixture, not a media review.', report: value});
  for (const mutate of [
    value => { value.audio = 'metered'; },
    value => { value.picture = 'sampled-frames'; },
    value => { value.lines[0].speakerVerified = false; },
    value => { value.lines[0].emotionalMatch = false; },
    value => { value.lines[0].lipSync = 'offscreen'; },
    value => { value.unresolvedFailures.push('Wrong voice.'); },
  ]) {
    const changed = structuredClone(report);
    mutate(changed);
    assert.throws(() => record(changed), /[Dd]ialogue/);
  }
  const passed = record(report);
  requireReview(passed, 'dialogue-performance');
  passed.productionFingerprint = 'changed-production';
  assert.throws(() => requireReview(passed, 'dialogue-performance'), /stale/);
});

test('post camera generates smooth digital zoom/pan without claiming optical travel', () => {
  const segment = structuredClone(quiet.cameraPlan.shots[0].segments[0]);
  segment.zoom = {mode: 'digital', from: 1, to: 1.08};
  segment.easing = 'ease-in-out';
  const filter = postCameraFilter(segment, 180, 320, 30, 10);
  assert.match(filter, /zoompan=/);
  assert.match(filter, /on\/299/);
  for (const patch of [{move: 'dolly'}, {zoom: {mode: 'optical', from: 1, to: 2}},
    {cropPosition: {from: {x: 2, y: 0.5}, to: {x: 0.5, y: 0.5}}}]) {
    assert.throws(() => postCameraFilter({...segment, ...patch}, 180, 320, 30, 10), /[Pp]ost/);
  }
  const pan = {...segment, move: 'pan', direction: 'left', zoom: {mode: 'digital', from: 1.2, to: 1.2},
    cropPosition: {from: {x: 1, y: 0.5}, to: {x: 0, y: 0.5}}};
  assert.match(postCameraFilter(pan, 180, 320, 30, 10), /zoompan/);
  assert.throws(() => postCameraFilter({...pan, direction: 'right'}, 180, 320, 30, 10), /trajectory/);
});

test('camera execution acceptance requires full playback, not a few sampled frames', () => {
  const manifest = {...packetDraft(scenario, brief, feedback), productionDraft: quiet,
    stage: 'design-locked', approvalRevision: 1, reviews: [], assets: []};
  manifest.productionFingerprint = productionRevision(manifest);
  const report = {picture: 'full-playback', segments: [{shotId: 'a', id: 'a-camera', from: 0, to: 10,
    movementMatches: true, framingMaintained: true, focusMatches: true, continuityMaintained: true,
    evidence: 'Synthetic unit-test observation only.'}], unresolvedFailures: []};
  const record = value => recordReview(manifest, {area: 'camera-execution', result: 'pass',
    evidence: 'Synthetic fixture only, not a media review.', report: value});
  assert.throws(() => record({...report, picture: 'sampled-frames'}), /Camera/);
  const invalid = structuredClone(report);
  invalid.segments[0].framingMaintained = false;
  assert.throws(() => record(invalid), /Camera/);
  requireReview(record(report), 'camera-execution');
});
