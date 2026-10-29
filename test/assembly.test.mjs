import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdirSync, writeFileSync, existsSync} from 'node:fs';
import {dirname, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {assemblyArgs, parseMediaInfo} from '../lib/assembly.mjs';
import {fileHash, verifyAssets} from '../lib/workflow.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const fixtureDir = resolve(root, 'workspace', `test-fixtures-${Date.now()}`);
mkdirSync(fixtureDir, {recursive: true});
const assetPath = relative(root, resolve(fixtureDir, 'synthetic.bin'));
writeFileSync(resolve(root, assetPath), 'synthetic-unit-fixture-not-a-video');
const asset = {path: assetPath, kind: 'video', sha256: fileHash(resolve(root, assetPath))};
const manifest = {stage: 'sound-approved', soundDecision: 'silent', assets: [asset]};
const edit = {schemaVersion: 1, seconds: 8, width: 180, height: 320, fps: 10,
  clips: [{path: assetPath, in: 0, seconds: 8}], audio: {route: 'silent'},
  output: `outputs/test-fixture-${Date.now()}.mp4`};

test('assembly compiles portrait trim/concat, silent export and no-overwrite arguments', () => {
  const {args} = assemblyArgs(root, edit, manifest);
  assert.ok(args.includes('-n'));
  assert.ok(args.includes('-an'));
  assert.match(args[args.indexOf('-filter_complex') + 1], /trim=start=0:duration=8/);
  assert.match(args[args.indexOf('-filter_complex') + 1], /concat=n=1:v=1:a=0/);
});

test('assembly blocks unapproved stage, unregistered media, mismatched duration and wrong audio route', () => {
  assert.throws(() => assemblyArgs(root, edit, {...manifest, stage: 'motion-approved'}), /Approve/);
  assert.throws(() => assemblyArgs(root, {...edit, seconds: 10}, manifest), /sum/);
  assert.throws(() => assemblyArgs(root, {...edit, clips: [{path: 'media/missing.mp4', in: 0, seconds: 8}]},
    manifest), /Unregistered/);
  assert.throws(() => assemblyArgs(root, {...edit, audio: {route: 'native'}}, manifest), /differs/);
});

test('assembly requires cleared audio and confines output; hash change fails', () => {
  assert.throws(() => assemblyArgs(root, {...edit, audio: {route: 'native'}},
    {...manifest, soundDecision: 'native', nativeAudioInspected: true}), /rights/);
  assert.throws(() => assemblyArgs(root, {...edit, output: 'data/overwritten.mp4'}, manifest), /outputs/);
  writeFileSync(resolve(root, assetPath), 'changed');
  assert.throws(() => verifyAssets(root, manifest), /hash mismatch/);
  writeFileSync(resolve(root, assetPath), 'synthetic-unit-fixture-not-a-video');
});

test('media inspection parses duration and distinguishes audio presence', () => {
  const info = parseMediaInfo('Duration: 00:00:08.05, start: 0\n Stream #0:0: Video: h264\n Stream #0:1: Audio: aac');
  assert.equal(info.seconds, 8.05);
  assert.equal(info.hasAudio, true);
  assert.equal(info.hasVideo, true);
  assert.equal(parseMediaInfo('Duration: 00:00:08.00\n Stream #0:0: Video: h264').hasAudio, false);
  assert.throws(() => parseMediaInfo('invalid input'), /duration/);
});

test('optional FFmpeg smoke encodes 8s synthetic clips through silent, native and separate routes',
  {skip: !process.env.FFMPEG_PATH}, () => {
    const ffmpeg = process.env.FFMPEG_PATH;
    const run = args => {
      const result = spawnSync(ffmpeg, args, {encoding: 'utf8', windowsHide: true});
      assert.equal(result.status, 0, result.stderr || result.error?.message);
      return result;
    };
    const path = resolve(fixtureDir, 'color-tone.mp4');
    run(['-hide_banner', '-nostdin', '-n', '-f', 'lavfi', '-i', 'color=c=navy:s=180x320:r=10:d=4',
      '-f', 'lavfi', '-i', 'sine=frequency=330:sample_rate=48000:duration=4',
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-shortest', path]);
    const audioPath = resolve(fixtureDir, 'tone.wav');
    run(['-hide_banner', '-nostdin', '-n', '-f', 'lavfi', '-i',
      'sine=frequency=440:sample_rate=48000:duration=8', audioPath]);
    const clipAsset = {path: relative(root, path), kind: 'video', sha256: fileHash(path)};
    const audioAsset = {path: relative(root, audioPath), kind: 'audio', sha256: fileHash(audioPath)};
    for (const route of ['silent', 'native', 'separate']) {
      const syntheticManifest = {stage: 'sound-approved', soundDecision: route,
        nativeAudioInspected: true, assets: [clipAsset, audioAsset]};
      const syntheticEdit = {...edit,
        clips: [{path: clipAsset.path, in: 0, seconds: 4}, {path: clipAsset.path, in: 0, seconds: 4}],
        audio: {route, path: audioAsset.path, gain: 0.5, rightsStatus: 'cleared'},
        output: `outputs/test-smoke-${Date.now()}-${route}.mp4`};
      const {args, output} = assemblyArgs(root, syntheticEdit, syntheticManifest);
      mkdirSync(dirname(output), {recursive: true});
      const manifestPath = resolve(fixtureDir, `${route}.manifest.json`);
      const editPath = resolve(fixtureDir, `${route}.edit.json`);
      writeFileSync(manifestPath, JSON.stringify(syntheticManifest));
      writeFileSync(editPath, JSON.stringify({...syntheticEdit, manifest: relative(root, manifestPath)}));
      const assembled = spawnSync(process.execPath, [resolve(root, 'scripts', 'assemble.mjs'),
        relative(root, editPath), '--ffmpeg', ffmpeg], {encoding: 'utf8', windowsHide: true});
      assert.equal(assembled.status, 0, assembled.stderr);
      assert.ok(existsSync(output));
      const inspected = spawnSync(ffmpeg, ['-hide_banner', '-i', output], {encoding: 'utf8'});
      const info = parseMediaInfo(inspected.stderr);
      assert.ok(Math.abs(info.seconds - 8) <= 0.1);
      assert.equal(info.hasAudio, route !== 'silent');
      assert.throws(() => assemblyArgs(root, syntheticEdit, syntheticManifest), /exists/);
    }
  });
