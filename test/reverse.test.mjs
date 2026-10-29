import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdirSync, writeFileSync, readFileSync, existsSync} from 'node:fs';
import {resolve, dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomUUID} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {parseReferenceMetadata, sampleTimes, classifyInput, isPublicIPv4, createPendingAnalysis,
  validateRanges, validateReview, validateFeedback, buildRemakeBrief, hashFile, workspacePath,
  reviewWorkspace} from '../lib/reverse.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const fixtureName = `reverse-test-${randomUUID()}`;
const fixtureDir = join(root, 'workspace', fixtureName);
mkdirSync(fixtureDir, {recursive: true});
const sourceHash = 'a'.repeat(64), transcriptHash = 'b'.repeat(64);
const approvals = {generationApproved: false, referenceUploadApproved: false,
  publicationApproved: false, scenarioSelected: false};

function fixture(hasAudio = true, speech = 'none') {
  const manifest = {schemaVersion: 1, kind: 'reference-preparation', status: 'prepared',
    jobId: 'synthetic-unit-fixture-not-a-real-reference',
    source: {path: 'source.mp4', sha256: sourceHash,
      metadata: {seconds: 4, width: 180, height: 320, hasAudio, audioStreams: hasAudio ? [1] : []}},
    playback: {path: 'source.mp4', sha256: sourceHash, exactCopy: true},
    approvals: {...approvals}, productionJobs: []};
  if (speech !== 'none') manifest.transcript = {path: 'user-transcript.txt', sha256: transcriptHash};
  const analysis = createPendingAnalysis(manifest);
  const record = {status: 'reviewed', sourceSha256: sourceHash, reviewer: 'synthetic-test-reviewer',
    reviewedAt: '2026-10-29T20:00:00Z', notes: 'Synthetic unit attestation, not actual media evidence.',
    ranges: [{start: 0, end: 4, notes: 'Synthetic unit range evidence.'}]};
  analysis.status = 'reviewed';
  analysis.coverage.wholeSpanSampling.status = 'reviewed';
  analysis.coverage.fullPlayback = {...structuredClone(record), artifact: 'source.mp4'};
  analysis.coverage.audioListening = hasAudio ?
    {status: 'reviewed', tracks: [{...structuredClone(record), stream: 1}]} :
    {status: 'not-present', tracks: []};
  analysis.coverage.transcript = speech !== 'none' ?
    {status: 'verified-user-provided', provenance: 'user-provided', assetSha256: transcriptHash} :
    {status: hasAudio ? 'not-needed-no-speech' : 'not-present'};
  analysis.timeline = [0, 2].map((start, index) => ({
    id: `segment-${index}`, start, end: start + 2,
    action: 'Synthetic test subject pauses.', subjectRelationship: 'One synthetic test subject.',
    camera: {framing: 'Medium-wide test view.', movement: 'Locked in this fixture.',
      optics: {claim: 'approximation', description: 'Moderate perspective; exact lens unknown.'}},
    blockingContinuity: 'Static test center placement; no contact change.',
    lighting: {motivatedSources: 'Flat synthetic field; no real source inferred.',
      castShadows: 'No cast shadow observable in synthetic fixture.',
      contactShadows: 'No ground contact rendered.', temporalConsistency: 'Synthetic field remains constant.'},
    editing: {cutReason: 'Test segmentation only.', beatRhythm: 'Even synthetic hold.',
      informationProgression: 'No new information in fixture.',
      reveal: 'No reveal in test fixture.', reactionHold: 'Synthetic two-second hold.'},
    audio: {speech: {status: hasAudio ? speech : 'no-audio-track',
      evidence: 'Synthetic test fixture evidence, not actual inspection.',
      ...(speech !== 'none' ? {transcript: {text: 'Hello', provenance: 'user-provided', assetSha256: transcriptHash}} : {})},
    music: 'No music in synthetic fixture.', foley: 'No foley in synthetic fixture.',
    rights: 'Synthetic test only, no source reuse.'},
    observations: [{time: start, evidence: 'full-playback', detail: 'Synthetic test motion observation.'},
      ...(hasAudio ? [{time: start, evidence: 'audio-listening', detail: 'Synthetic test listening observation.'}] : [])],
    inferences: [],
  }));
  analysis.findings.mechanisms = ['Synthetic hold demonstrates a unit test only.'];
  return {analysis, manifest};
}

function feedback() {
  return {schemaVersion: 1, sourceSha256: sourceHash, reviewer: 'synthetic-feedback-fixture',
    providedAt: '2026-10-29T20:00:00Z', decision: 'adapt', goals: ['Clear original action.'],
    keepMechanisms: ['A pause gives time to recognize a choice.'],
    changeRequests: ['Use a new setting and new action.'], avoid: ['Borrowed lyrics.'],
    constraints: {seconds: 10, maximumShots: 3, dialogue: 'none'},
    originalDirection: {isOriginal: true, premise: 'An original test premise.',
      characters: ['New invented test character.'], setting: 'Invented test workshop.',
      visualStyle: 'Stylized paper test scene.', audioDirection: 'New self-recorded foley; no song.',
      beats: ['The character finds an unused blank card.', 'The character folds a new paper bridge.']}};
}

test('FFmpeg metadata inspects full duration, dimensions, video stream and actual audio tracks', () => {
  const stderr = 'Duration: 00:01:02.40, start: 0\n' +
    ' Stream #0:0: Video: mjpeg, yuvj420p, 500x500 (attached pic)\n' +
    ' Stream #0:1: Video: h264 (High), yuv420p, 1080x1920 [SAR 1:1 DAR 9:16], 30 fps\n' +
    ' Stream #0:2(eng): Audio: aac, 48000 Hz\n Stream #0:3: Audio: aac, 48000 Hz';
  const info = parseReferenceMetadata(stderr);
  assert.equal(info.seconds, 62.4);
  assert.equal(info.width, 1080);
  assert.equal(info.height, 1920);
  assert.equal(info.fps, 30);
  assert.equal(info.videoStream, 1);
  assert.deepEqual(info.audioStreams, [2, 3]);
  assert.equal(info.hasAudio, true);
  assert.equal(parseReferenceMetadata('Duration: 00:00:01.00\nStream #0:0: Video: h264, 90x160').hasAudio, false);
  assert.throws(() => parseReferenceMetadata('no duration'), /duration/);
  assert.throws(() => parseReferenceMetadata('Duration: 00:20:00.0\nStream #0:0: Video: h264, 90x160'), /Duration/);
  assert.throws(() => parseReferenceMetadata('Duration: 00:00:01.0\nStream #0:0: Video: mjpeg, 90x160 (attached pic)'), /real video/);
});

test('bounded sampling reaches the final span, coarsens transparently, and expands valid subranges', () => {
  const samples = sampleTimes(600, 0.1, 25);
  assert.equal(samples.timestamps.length, 25);
  assert.equal(samples.timestamps[0], 0);
  assert.equal(samples.timestamps.at(-1), 599.9);
  assert.ok(samples.effectiveInterval > samples.requestedInterval);
  assert.match(samples.meaning, /not full-motion/);
  const dense = sampleTimes(10, 0.25, 30, 2, 4);
  assert.equal(dense.timestamps[0], 2);
  assert.equal(dense.timestamps.at(-1), 3.9);
  assert.throws(() => sampleTimes(10, 0), /Interval/);
  assert.throws(() => sampleTimes(10, 1, 1000), /maxFrames/);
  assert.throws(() => sampleTimes(10, 1, 10, 4, 3), /range/);
});

test('Instagram is honest local-export state; public downloads are explicit and private networks excluded', () => {
  const result = classifyInput('https://www.instagram.com/reel/example/');
  assert.equal(result.code, 'NEEDS_LOCAL_EXPORT');
  assert.match(result.message, /original file/);
  assert.equal(classifyInput('C:\\local\\input.mp4').kind, 'local');
  assert.throws(() => classifyInput('https://example.com/v.mp4'), /consent/);
  assert.throws(() => classifyInput('http://example.com/v.mp4', true), /HTTPS/);
  assert.throws(() => classifyInput('https://user:pass@example.com/v.mp4', true), /Credential/);
  assert.equal(classifyInput('https://example.com/v.mp4', true).kind, 'direct-public-video');
  for (const address of ['127.0.0.1', '10.0.0.1', '172.20.1.1', '192.168.1.1',
    '169.254.169.254', '100.64.0.1', '192.0.2.1', '198.51.100.1', '203.0.113.1', '::1']) {
    assert.equal(isPublicIPv4(address), false, address);
  }
  assert.equal(isPublicIPv4('8.8.8.8'), true);
});

test('coverage rejects gaps, overlap, missing tail, string times and pending review', () => {
  validateRanges([{start: 0, end: 2}, {start: 2, end: 4}], 4);
  for (const ranges of [
    [{start: 1, end: 4}], [{start: 0, end: 3}],
    [{start: 0, end: 2}, {start: 2.001, end: 4}],
    [{start: 0, end: 3}, {start: 2, end: 4}], [{start: '0', end: 4}],
  ]) assert.throws(() => validateRanges(ranges, 4), /full|numeric/);
  const {manifest} = fixture();
  assert.throws(() => validateReview(createPendingAnalysis(manifest), manifest), /Reviewed analysis/);
  const template = JSON.parse(readFileSync(join(root, 'data', 'reverse-analysis-template.json')));
  assert.equal(template.status, 'pending');
  assert.throws(() => validateReview(template, manifest), /Reviewed analysis/);
});

test('full playback, per-segment motion/audio observations and every audio track are required', () => {
  const {analysis, manifest} = fixture();
  assert.equal(validateReview(analysis, manifest).valid, true);
  const missing = structuredClone(analysis);
  missing.coverage.fullPlayback.status = 'pending';
  assert.throws(() => validateReview(missing, manifest), /full playback/);
  const audio = structuredClone(analysis);
  audio.coverage.audioListening.tracks = [];
  assert.throws(() => validateReview(audio, manifest), /listening/);
  const stills = structuredClone(analysis);
  stills.timeline[0].observations = [{time: 0, evidence: 'frame', detail: 'Still alone.'}];
  assert.throws(() => validateReview(stills, manifest), /motion observation/);
  const noListen = structuredClone(analysis);
  noListen.timeline[0].observations = noListen.timeline[0].observations.filter(o => o.evidence !== 'audio-listening');
  assert.throws(() => validateReview(noListen, manifest), /listening observation/);
  const additionalAudio = structuredClone(manifest);
  additionalAudio.source.metadata.audioStreams.push(2);
  assert.throws(() => validateReview(analysis, additionalAudio), /every audio/);
  assert.equal(validateReview(fixture(false).analysis, fixture(false).manifest).valid, true);
});

test('speech and singing require real provided transcript; no invented words or skipped transcript coverage', () => {
  for (const mode of ['spoken', 'sung', 'mixed']) {
    const {analysis, manifest} = fixture(true, mode);
    assert.equal(validateReview(analysis, manifest).valid, true);
    delete manifest.transcript;
    assert.throws(() => validateReview(analysis, manifest), /real user-provided transcript/);
  }
  const {analysis, manifest} = fixture();
  analysis.coverage.transcript.status = 'not-provided';
  assert.throws(() => validateReview(analysis, manifest), /Resolve transcript/);
  analysis.coverage.transcript.status = 'not-present';
  assert.throws(() => validateReview(analysis, manifest), /Resolve transcript/);
  analysis.coverage.transcript.status = 'verified-user-provided';
  assert.throws(() => validateReview(analysis, manifest), /actual user-provided transcript/);
});

test('review rejects changed hashes/job IDs, missing craft fields, exact optics claims and approval escalation', () => {
  const {analysis, manifest} = fixture();
  for (const key of Object.keys(approvals)) {
    const changed = structuredClone(analysis);
    changed.approvals[key] = true;
    assert.throws(() => validateReview(changed, manifest), /does not authorize/);
  }
  const hash = structuredClone(analysis);
  hash.source.sha256 = 'c'.repeat(64);
  assert.throws(() => validateReview(hash, manifest), /match source/);
  const job = structuredClone(analysis);
  job.jobId = 'different';
  assert.throws(() => validateReview(job, manifest), /jobId/);
  const light = structuredClone(analysis);
  light.timeline[0].lighting.contactShadows = null;
  assert.throws(() => validateReview(light, manifest), /contactShadows/);
  const optics = structuredClone(analysis);
  optics.timeline[0].camera.optics.claim = 'exact';
  assert.throws(() => validateReview(optics, manifest), /approximation/);
  const dense = structuredClone(analysis);
  dense.findings.denseReviewNeeded = ['Inspect the hidden cut.'];
  assert.throws(() => validateReview(dense, manifest), /dense-review/);
  const licensed = structuredClone(analysis);
  licensed.rights.status = 'licensed';
  assert.throws(() => validateReview(licensed, manifest), /rights holder/);
});

test('real structured feedback and validated review gate original-only planning, with approvals preserved', () => {
  const {analysis, manifest} = fixture();
  assert.throws(() => validateFeedback(undefined, sourceHash), /Actual structured feedback/);
  const fake = feedback();
  fake.goals = [];
  assert.throws(() => validateFeedback(fake, sourceHash), /goals/);
  const copied = feedback();
  copied.originalDirection.isOriginal = false;
  assert.throws(() => buildRemakeBrief(analysis, manifest, copied), /genuinely original/);
  const draft = buildRemakeBrief(analysis, manifest, feedback());
  assert.equal(draft.generationApproved, false);
  assert.deepEqual(draft.approvals, approvals);
  assert.equal(draft.jobId, manifest.jobId);
  assert.equal(draft.rightsPolicy.mode, 'learn-mechanisms-only');
  assert.equal(draft.shots.length, 2);
  assert.equal(draft.shots.at(-1).end, 10);
  assert.equal(draft.novelAlternatives.length, 2);
  assert.ok(draft.qualityHypotheses.every(h => h.status === 'untested-editorial-hypothesis'));
  assert.ok(!JSON.stringify(draft).includes(analysis.timeline[0].action), 'No reference screenplay copied.');
  assert.throws(() => buildRemakeBrief(createPendingAnalysis(manifest), manifest, feedback()), /Reviewed analysis/);
});

test('workspace confines names and completed directories; source hash changes invalidate reviews', async () => {
  assert.throws(() => workspacePath(root, '..\\escape'), /workspace name/);
  assert.throws(() => workspacePath(root, fixtureName, false), /Workspace exists/);
  const {analysis, manifest} = fixture(false);
  writeFileSync(join(fixtureDir, 'source.mp4'), 'Not a video: hash-check fixture only.', {flag: 'wx'});
  manifest.source.sha256 = await hashFile(join(fixtureDir, 'source.mp4'));
  manifest.playback.sha256 = manifest.source.sha256;
  writeFileSync(join(fixtureDir, 'manifest.json'), JSON.stringify(manifest), {flag: 'wx'});
  writeFileSync(join(fixtureDir, 'analysis.json'), JSON.stringify(analysis), {flag: 'wx'});
  writeFileSync(join(fixtureDir, 'source.mp4'), 'Changed hash fixture.');
  await assert.rejects(reviewWorkspace(root, fixtureName), /Source hash changed/);
});

test('supplied transcript asset integrity and quoted words are checked against the real private text file', async () => {
  const name = `reverse-test-${randomUUID()}`, directory = join(root, 'workspace', name);
  mkdirSync(directory);
  writeFileSync(join(directory, 'source.mp4'), 'Synthetic structural speech fixture, not real reviewed video.', {flag: 'wx'});
  writeFileSync(join(directory, 'user-transcript.txt'), 'Hello from a synthetic text fixture.', {flag: 'wx'});
  const {analysis, manifest} = fixture(true, 'spoken');
  manifest.source.sha256 = manifest.playback.sha256 = await hashFile(join(directory, 'source.mp4'));
  manifest.transcript.sha256 = await hashFile(join(directory, 'user-transcript.txt'));
  analysis.source.sha256 = analysis.coverage.fullPlayback.sourceSha256 = manifest.source.sha256;
  analysis.coverage.audioListening.tracks[0].sourceSha256 = manifest.source.sha256;
  analysis.coverage.transcript.assetSha256 = manifest.transcript.sha256;
  analysis.timeline.forEach(shot => { shot.audio.speech.transcript.assetSha256 = manifest.transcript.sha256; });
  writeFileSync(join(directory, 'manifest.json'), JSON.stringify(manifest), {flag: 'wx'});
  writeFileSync(join(directory, 'analysis.json'), JSON.stringify(analysis), {flag: 'wx'});
  assert.equal((await reviewWorkspace(root, name)).report.valid, true);
  analysis.timeline[0].audio.speech.transcript.text = 'Invented words not in the supplied text.';
  writeFileSync(join(directory, 'invented-analysis.json'), JSON.stringify(analysis), {flag: 'wx'});
  await assert.rejects(reviewWorkspace(root, name, 'invented-analysis.json'), /words must occur/);
  writeFileSync(join(directory, 'user-transcript.txt'), 'Changed transcript fixture.');
  await assert.rejects(reviewWorkspace(root, name), /Transcript hash changed/);
});

test('CLI argument errors and Instagram requests do not allocate a completed workspace', () => {
  const name = `reverse-test-${randomUUID()}`;
  const cli = args => spawnSync(process.execPath, [join(root, 'scripts', 'reverse.mjs'), ...args],
    {encoding: 'utf8', windowsHide: true});
  const instagram = cli(['prepare', '--input', 'https://instagram.com/reel/example/', '--workspace', name]);
  assert.equal(instagram.status, 2);
  assert.equal(JSON.parse(instagram.stdout).code, 'NEEDS_LOCAL_EXPORT');
  assert.equal(existsSync(join(root, 'workspace', name)), false);
  const malformed = cli(['prepare', '--input', 'missing', '--workspace', name, '--max-frames', 'NaN']);
  assert.equal(malformed.status, 1);
  assert.match(malformed.stderr, /finite/);
  const remote = cli(['prepare', '--input', 'https://example.com/video.mp4', '--workspace', name]);
  assert.equal(remote.status, 1);
  assert.match(remote.stderr, /consent/);
});

test('CLI validates synthetic attestations and persists gated brief without overwriting existing output', async () => {
  const name = `reverse-test-${randomUUID()}`, directory = join(root, 'workspace', name);
  mkdirSync(directory);
  writeFileSync(join(directory, 'source.mp4'), 'Synthetic structural unit fixture, not real reviewed video.', {flag: 'wx'});
  const sha256 = await hashFile(join(directory, 'source.mp4'));
  const {analysis, manifest} = fixture(false);
  manifest.source.sha256 = manifest.playback.sha256 = sha256;
  analysis.source.sha256 = analysis.coverage.fullPlayback.sourceSha256 = sha256;
  writeFileSync(join(directory, 'manifest.json'), JSON.stringify(manifest), {flag: 'wx'});
  writeFileSync(join(directory, 'analysis.json'), JSON.stringify(analysis), {flag: 'wx'});
  const actualFeedback = feedback();
  actualFeedback.sourceSha256 = sha256;
  writeFileSync(join(directory, 'feedback.json'), JSON.stringify(actualFeedback), {flag: 'wx'});
  const cli = args => spawnSync(process.execPath, [join(root, 'scripts', 'reverse.mjs'), ...args],
    {encoding: 'utf8', windowsHide: true});
  const reviewed = cli(['validate-review', '--workspace', name]);
  assert.equal(reviewed.status, 0, reviewed.stderr);
  assert.match(JSON.parse(reviewed.stdout).statement, /human attestations/);
  const args = ['remake-brief', '--workspace', name, '--feedback', join(directory, 'feedback.json'),
    '--out', 'original-brief.json'];
  const remade = cli(args);
  assert.equal(remade.status, 0, remade.stderr);
  const output = join(directory, 'original-brief.json'), before = await hashFile(output);
  assert.equal(JSON.parse(readFileSync(output)).generationApproved, false);
  assert.equal(cli(args).status, 1);
  assert.equal(await hashFile(output), before);
  const invalidFeedback = cli(['remake-brief', '--workspace', name, '--feedback',
    join(directory, 'missing-feedback.json'), '--out', 'must-not-exist.json']);
  assert.equal(invalidFeedback.status, 1);
  assert.equal(existsSync(join(directory, 'must-not-exist.json')), false);
});

test('optional real FFmpeg CLI smoke: full-span stills, exact playback, audio, pending gates, expansion, no overwrite',
  {skip: !process.env.FFMPEG_PATH}, async () => {
    const ffmpeg = process.env.FFMPEG_PATH;
    const source = join(fixtureDir, 'synthetic-source.mp4');
    const encode = spawnSync(ffmpeg, ['-hide_banner', '-nostdin', '-v', 'error', '-n',
      '-f', 'lavfi', '-i', 'testsrc2=s=90x160:r=10:d=3',
      '-f', 'lavfi', '-i', 'sine=frequency=440:sample_rate=16000:duration=3',
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-shortest', source],
    {encoding: 'utf8', windowsHide: true, timeout: 30_000});
    assert.equal(encode.status, 0, encode.stderr || encode.error?.message);
    const name = `reverse-test-${randomUUID()}`;
    const cli = args => spawnSync(process.execPath, [join(root, 'scripts', 'reverse.mjs'), ...args],
      {encoding: 'utf8', windowsHide: true, timeout: 60_000});
    const args = ['prepare', '--input', source, '--workspace', name, '--ffmpeg', ffmpeg,
      '--interval', '1', '--max-frames', '6'];
    const prepared = cli(args);
    assert.equal(prepared.status, 0, prepared.stderr || prepared.error?.message);
    const dir = join(root, 'workspace', name);
    const manifest = JSON.parse(readFileSync(join(dir, 'manifest.json')));
    assert.equal(manifest.status, 'prepared');
    assert.equal(manifest.source.sha256, await hashFile(source));
    assert.equal(await hashFile(join(dir, 'source.mp4')), manifest.source.sha256);
    assert.equal(manifest.source.metadata.seconds, 3);
    assert.equal(manifest.source.metadata.hasAudio, true);
    assert.equal(manifest.sampling.frames[0].timestamp, 0);
    assert.ok(manifest.sampling.frames.at(-1).timestamp >= 2.8);
    assert.ok(manifest.sampling.frames.every(frame => existsSync(join(dir, frame.path))));
    assert.ok(existsSync(join(dir, manifest.sampling.contactSheet)));
    assert.ok(existsSync(join(dir, manifest.audio[0].path)));
    assert.equal(manifest.review.fullMotionReviewed, false);
    const review = cli(['validate-review', '--workspace', name]);
    assert.equal(review.status, 1);
    assert.match(review.stderr, /Reviewed analysis/);
    const before = await hashFile(join(dir, 'manifest.json'));
    const duplicate = cli(args);
    assert.equal(duplicate.status, 1);
    assert.match(duplicate.stderr, /Workspace exists/);
    assert.equal(await hashFile(join(dir, 'manifest.json')), before);
    const dense = cli(['expand', '--workspace', name, '--start', '1', '--end', '2',
      '--interval', '0.25', '--max-frames', '10', '--ffmpeg', ffmpeg]);
    assert.equal(dense.status, 0, dense.stderr || dense.error?.message);
    assert.ok(existsSync(join(JSON.parse(dense.stdout).directory, 'sampling.json')));
    assert.equal(await hashFile(join(dir, 'manifest.json')), before);
  });
