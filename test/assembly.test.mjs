import test from 'node:test';
import assert from 'node:assert/strict';
import {copyFileSync, mkdirSync, writeFileSync, existsSync} from 'node:fs';
import {dirname, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {assemblyArgs, parseMediaInfo, postCameraFilter} from '../lib/assembly.mjs';
import {AUDIO_FIT_DIMENSIONS, assetSetFingerprint, fileHash, packetDraft, productionRevision, readJson,
  recordReview, verifyAssets} from '../lib/workflow.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const fixtureDir = resolve(root, 'workspace', `test-fixtures-${Date.now()}`);
mkdirSync(fixtureDir, {recursive: true});
const assetPath = relative(root, resolve(fixtureDir, 'synthetic.bin'));
writeFileSync(resolve(root, assetPath), 'synthetic-unit-fixture-not-a-video');
const asset = {path: assetPath, kind: 'video', sha256: fileHash(resolve(root, assetPath))};
const brief = readJson(resolve(root, 'data', 'brief.json'));
const {scenarios} = readJson(resolve(root, 'data', 'scenarios.json'));
const scenario = scenarios.find(item => item.id === 'the-dry-seat');
const feedback = {schemaVersion: 1, reviews: [{scenarioId: scenario.id, rating: 5,
  decision: 'select', note: 'Synthetic fixture only.', at: new Date().toISOString()}]};
const context = {scenarios, brief, feedback};
function approvedManifest(assets, route = 'silent',
  packet = readJson(resolve(root, 'examples', 'the-dry-seat.json'))) {
  const result = {...packetDraft(scenario, brief, feedback), stage: 'sound-approved',
    productionDraft: packet,
    approvalRevision: 1, soundDecision: route, nativeAudioInspected: true, assets};
  result.productionFingerprint = productionRevision(result);
  result.reviews = [{area: 'sound', result: 'pass', evidence: 'Synthetic fixture review.',
    assetSetFingerprint: assetSetFingerprint(assets), productionFingerprint: result.productionFingerprint}];
  return recordReview(result, {area: 'audio-scene-fit', result: 'pass', evidence: 'Synthetic fit fixture.',
    report: {picture: 'full-playback', audio: route === 'silent' ? 'no-audio-streams' : 'listened',
      listeningConditions: 'Synthetic test attestation, not a real creative review.',
      comparison: {samePicture: true, listened: true, baseline: 'silent', observation: 'Synthetic baseline.'},
      dimensions: AUDIO_FIT_DIMENSIONS.map(id => ({id, verdict: 'pass',
        evidence: [{from: 0, to: 10, observation: 'Synthetic fit fixture.'}]})),
      segments: [{from: 0, to: 10, intendedFeeling: 'Synthetic', heardFeeling: 'Synthetic',
        weight: 'appropriate', relationship: 'supports', observation: 'Synthetic fixture.'}],
      unresolvedFailures: []}});
}
const manifest = approvedManifest([asset]);
const assemble = (editPlan, state = manifest) => assemblyArgs(root, editPlan, state, context);
const testVersion = `v${Date.now()}`;
const edit = {schemaVersion: 1, seconds: 8, width: 180, height: 320, fps: 10,
  clips: [{path: assetPath, in: 0, seconds: 8}], audio: {route: 'silent'},
  output: `outputs/the-dry-seat/${testVersion}/finalVid/the-dry-seat-${testVersion}-test.mp4`};

test('assembly compiles portrait trim/concat, silent export and no-overwrite arguments', () => {
  const {args} = assemble(edit);
  assert.ok(args.includes('-n'));
  assert.ok(args.includes('-an'));
  assert.match(args[args.indexOf('-filter_complex') + 1], /trim=start=0:duration=8/);
  assert.match(args[args.indexOf('-filter_complex') + 1], /concat=n=1:v=1:a=0/);
});

test('assembly blocks unapproved stage, unregistered media, mismatched duration and wrong audio route', () => {
  assert.throws(() => assemble(edit, {...manifest, stage: 'motion-approved'}), /Approve/);
  assert.throws(() => assemble({...edit, seconds: 10}, manifest), /sum/);
  assert.throws(() => assemble({...edit, clips: [{path: 'media/missing.mp4', in: 0, seconds: 8}]},
    manifest), /Unregistered/);
  assert.throws(() => assemble({...edit, audio: {route: 'native'}}, manifest), /differs/);
  const failed = recordReview(manifest, {area: 'sound', result: 'fail', evidence: 'Later fixture failure.'});
  assert.equal(failed.stage, 'motion-approved');
  assert.throws(() => assemble(edit, failed), /Approve/);
  assert.throws(() => assemble(edit, {...failed, stage: 'sound-approved'}), /failed review/);
  assert.throws(() => assemble(edit, {...manifest, reviews: []}), /Missing or stale review/);
  assert.throws(() => assemble(edit, {...manifest, reviews: manifest.reviews.filter(item =>
    item.area !== 'audio-scene-fit')}), /audio-scene-fit/);
  assert.throws(() => assemble({...edit, output: 'outputs/loose.mp4'}), /version/);
  assert.throws(() => assemble({...edit,
    output: 'outputs/another-topic/v001/finalVid/another-topic-v001-review.mp4'}), /topic/);
});

test('assembly requires cleared audio and confines output; hash change fails', () => {
  assert.throws(() => assemble({...edit, audio: {route: 'native'}},
    approvedManifest([asset], 'native')), /rights/);
  assert.throws(() => assemble({...edit, output: 'data/overwritten.mp4'}, manifest), /outputs/);
  for (const output of ['outputs/../data/new.mp4', 'outputs\\..\\data\\new.mp4']) {
    assert.throws(() => assemble({...edit, output}), /escapes/);
  }
  writeFileSync(resolve(root, assetPath), 'changed');
  assert.throws(() => verifyAssets(root, manifest), /hash mismatch/);
  writeFileSync(resolve(root, assetPath), 'synthetic-unit-fixture-not-a-video');
});

test('explicit rough previews permit failed/pending sound inspection without granting approval', () => {
  const failed = recordReview({...manifest, stage: 'sound-approved', finalUserApproval: true},
    {area: 'audio-scene-fit', result: 'fail', evidence: 'Synthetic heavy soundtrack finding.'});
  const before = JSON.stringify(failed);
  const preview = {...edit, purpose: 'review',
    output: 'outputs/the-dry-seat/v001/finalVid/the-dry-seat-v001-review.mp4'};
  assert.equal(assemble(preview, failed).purpose, 'review');
  assert.equal(JSON.stringify(failed), before);
  assert.throws(() => assemble({...preview,
    output: 'outputs/the-dry-seat/v001/finalVid/the-dry-seat-v001-master.mp4'}, failed), /Unapproved preview/);
  assert.throws(() => assemble({...preview, purpose: 'master'}, failed), /Approve/);
});

test('post camera binds the actual shot, needs explicit legacy preview mapping and cannot vanish from a master', () => {
  const packet = structuredClone(manifest.productionDraft);
  const camera = packet.cameraPlan.shots[0];
  camera.executionRoute = 'post';
  camera.segments[0].zoom = {mode: 'digital', from: 1, to: 1.08};
  const state = approvedManifest([{...asset, shotId: camera.shotId}], 'silent', packet);
  const reviewed = recordReview(state, {area: 'camera-execution', result: 'pass',
    evidence: 'Synthetic unit-test attestation, not media acceptance.',
    report: {picture: 'full-playback', unresolvedFailures: [],
      segments: packet.cameraPlan.shots.flatMap(item => item.segments.map(segment => ({
        shotId: item.shotId, id: segment.id, from: segment.from, to: segment.to,
        movementMatches: true, framingMaintained: true, focusMatches: true,
        continuityMaintained: true, evidence: 'Synthetic test evidence.',
      })))},
  });
  const seconds = camera.segments[0].to - camera.segments[0].from;
  const plan = {...edit, clips: [
    {path: assetPath, in: 0, seconds, cameraShotId: camera.shotId},
    {path: assetPath, in: seconds, seconds: edit.seconds - seconds},
  ]};
  assert.match(assemble(plan, reviewed).args.join(' '), /zoompan=/);
  assert.throws(() => assemble(edit, reviewed), /omits a planned post camera/);
  const mismapped = {...reviewed, assets: [{...asset, shotId: 'wrong-shot'}]};
  assert.throws(() => assemble(plan, mismapped), /actual source shot/);
  const preview = {...plan, purpose: 'review',
    output: `outputs/the-dry-seat/${testVersion}/finalVid/the-dry-seat-${testVersion}-review.mp4`};
  assert.throws(() => assemble(preview, mismapped), /actual source shot/);
  const mapped = {...preview, clips: preview.clips.map((clip, index) => index ? clip : {
    ...clip, cameraMappingEvidence: 'Synthetic legacy-source mapping, review only.',
  })};
  assert.match(assemble(mapped, mismapped).args.join(' '), /zoompan=/);
  assert.throws(() => assemble({...mapped, purpose: 'master'}, mismapped), /actual source shot/);
  const override = structuredClone(packet.cameraPlan);
  override.shots[0].segments[0].zoom.to = 1.12;
  assert.throws(() => assemble({...plan, cameraPlan: override}, reviewed), /new camera plan/);
  assert.equal(assemble({...mapped, cameraPlan: override}, mismapped).purpose, 'review');
});

test('media inspection parses duration and distinguishes audio presence', () => {
  const info = parseMediaInfo('Duration: 00:00:08.05, start: 0\n Stream #0:0: Video: h264\n Stream #0:1: Audio: aac');
  assert.equal(info.seconds, 8.05);
  assert.equal(info.hasAudio, true);
  assert.equal(info.hasVideo, true);
  assert.equal(parseMediaInfo('Duration: 00:00:08.00\n Stream #0:0: Video: h264').hasAudio, false);
  assert.throws(() => parseMediaInfo('invalid input'), /duration/);
});

test('real post-camera zoom changes image geometry and preserves duration/frame count',
  {skip: !process.env.FFMPEG_PATH}, () => {
    const output = resolve(fixtureDir, 'camera-zoom.mp4');
    const segment = {move: 'locked', direction: 'none', parallax: 'none', easing: 'ease-in-out',
      zoom: {mode: 'digital', from: 1, to: 1.5}, focus: {mode: 'fixed'}};
    const run = args => {
      const result = spawnSync(process.env.FFMPEG_PATH, args, {windowsHide: true});
      assert.equal(result.status, 0, String(result.stderr));
      return result;
    };
    const filter = postCameraFilter(segment, 180, 320, 10, 1);
    run(['-hide_banner', '-nostdin', '-n', '-f', 'lavfi', '-i',
      'color=black:s=180x320:r=10:d=1,drawbox=x=70:y=130:w=40:h=40:color=white:t=fill',
      '-vf', filter, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', output]);
    const full = run(['-hide_banner', '-nostdin', '-i', output, '-f', 'null', '-']);
    assert.match(String(full.stderr), /frame=\s*10\b/);
    assert.equal(parseMediaInfo(String(full.stderr)).seconds, 1);
    const brightPixels = at => {
      const frame = run(['-hide_banner', '-nostdin', '-ss', at, '-i', output,
        '-frames:v', '1', '-pix_fmt', 'gray', '-f', 'rawvideo', 'pipe:1']).stdout;
      assert.equal(frame.length, 180 * 320);
      return frame.reduce((count, value) => count + (value > 220 ? 1 : 0), 0);
    };
    assert.ok(brightPixels('0.9') > brightPixels('0') * 1.7,
      'The subject must actually enlarge; a successful encode alone is insufficient.');
  });

test('optional FFmpeg smoke encodes 8s synthetic clips through silent, native and separate routes',
  {skip: !process.env.FFMPEG_PATH}, () => {
    const ffmpeg = process.env.FFMPEG_PATH;
    const run = args => {
      const result = spawnSync(ffmpeg, args, {encoding: 'utf8', windowsHide: true});
      assert.equal(result.status, 0, result.stderr || result.error?.message);
      return result;
    };
    for (const file of ['scripts/assemble.mjs', 'lib/assembly.mjs', 'lib/workflow.mjs', 'lib/production.mjs']) {
      mkdirSync(dirname(resolve(fixtureDir, file)), {recursive: true});
      copyFileSync(resolve(root, file), resolve(fixtureDir, file));
    }
    mkdirSync(resolve(fixtureDir, 'data'), {recursive: true});
    for (const [file, value] of Object.entries({brief, scenarios: {scenarios}, feedback})) {
      writeFileSync(resolve(fixtureDir, 'data', `${file}.json`), JSON.stringify(value));
    }
    const path = resolve(fixtureDir, 'color-tone.mp4');
    run(['-hide_banner', '-nostdin', '-n', '-f', 'lavfi', '-i', 'color=c=navy:s=180x320:r=10:d=4',
      '-f', 'lavfi', '-i', 'sine=frequency=330:sample_rate=48000:duration=4',
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-shortest', path]);
    const audioPath = resolve(fixtureDir, 'tone.wav');
    run(['-hide_banner', '-nostdin', '-n', '-f', 'lavfi', '-i',
      'sine=frequency=440:sample_rate=48000:duration=8', audioPath]);
    const shortPath = resolve(fixtureDir, 'short-native-track.mp4');
    run(['-hide_banner', '-nostdin', '-n', '-f', 'lavfi', '-i', 'color=c=navy:s=180x320:r=10:d=4',
      '-f', 'lavfi', '-i', 'sine=frequency=660:sample_rate=48000:duration=1',
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', shortPath]);
    const clipAsset = {path: relative(fixtureDir, path), kind: 'video', sha256: fileHash(path)};
    const shortAsset = {path: relative(fixtureDir, shortPath), kind: 'video', sha256: fileHash(shortPath)};
    const audioAsset = {path: relative(fixtureDir, audioPath), kind: 'audio', sha256: fileHash(audioPath)};
    for (const route of ['silent', 'native', 'separate', 'review']) {
      const audioRoute = route === 'review' ? 'separate' : route;
      const syntheticManifest = approvedManifest([clipAsset, shortAsset, audioAsset], audioRoute);
      if (route === 'review') {
        syntheticManifest.stage = 'motion-approved';
        syntheticManifest.reviews = [];
      }
      const syntheticEdit = {...edit,
        ...(route === 'review' ? {purpose: 'review'} : {}),
        clips: [{path: route === 'native' ? shortAsset.path : clipAsset.path, in: 0, seconds: 4},
          {path: clipAsset.path, in: 0, seconds: 4}],
        audio: {route: audioRoute, path: audioAsset.path, gain: 0.5, rightsStatus: 'cleared'},
        output: `outputs/the-dry-seat/v001/finalVid/the-dry-seat-v001-${route}.mp4`};
      const {output} = assemblyArgs(fixtureDir, syntheticEdit, syntheticManifest, context);
      mkdirSync(dirname(output), {recursive: true});
      const manifestPath = resolve(fixtureDir, `${route}.manifest.json`);
      const editPath = resolve(fixtureDir, `${route}.edit.json`);
      writeFileSync(manifestPath, JSON.stringify(syntheticManifest));
      writeFileSync(editPath, JSON.stringify({...syntheticEdit, manifest: relative(fixtureDir, manifestPath)}));
      const assembled = spawnSync(process.execPath, [resolve(fixtureDir, 'scripts', 'assemble.mjs'),
        relative(fixtureDir, editPath), '--ffmpeg', ffmpeg], {encoding: 'utf8', windowsHide: true});
      assert.equal(assembled.status, 0, assembled.stderr);
      assert.ok(existsSync(output));
      const inspected = spawnSync(ffmpeg, ['-hide_banner', '-i', output], {encoding: 'utf8'});
      const info = parseMediaInfo(inspected.stderr);
      assert.ok(Math.abs(info.seconds - 8) <= 0.1);
      assert.equal(info.hasAudio, audioRoute !== 'silent');
      assert.throws(() => assemblyArgs(fixtureDir, syntheticEdit, syntheticManifest, context), /exists/);
      if (route === 'native') {
        const rms = at => {
          const decoded = spawnSync(ffmpeg, ['-hide_banner', '-ss', String(at), '-i', output,
            '-t', '0.5', '-vn', '-f', 's16le', '-ac', '1', '-ar', '8000', 'pipe:1'],
          {windowsHide: true});
          assert.equal(decoded.status, 0, decoded.stderr.toString());
          assert.ok(decoded.stdout.length > 0);
          let sum = 0;
          for (let i = 0; i + 1 < decoded.stdout.length; i += 2) sum += decoded.stdout.readInt16LE(i) ** 2;
          return Math.sqrt(sum / (decoded.stdout.length / 2));
        };
        assert.ok(rms(2) < 15, 'First clip must remain silent after its short native track.');
        assert.ok(rms(4.5) > 100, 'Second clip audio must start at its video boundary, not early.');
      }
    }
  });
