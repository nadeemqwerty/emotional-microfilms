import test from 'node:test';
import assert from 'node:assert/strict';
import {copyFileSync, existsSync, mkdirSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {audioArgs} from '../lib/audio.mjs';
import {fileHash, readJson} from '../lib/workflow.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const fixture = resolve(root, 'workspace', `audio-test-${Date.now()}`);
mkdirSync(fixture, {recursive: true});
writeFileSync(resolve(fixture, 'source.wav'), 'synthetic-not-audio');
const cue = {schemaVersion: 1, source: 'source.wav', sourceSha256: fileHash(resolve(fixture, 'source.wav')),
  in: 1, out: 7, tempo: 1.2, fadeIn: 0.02, fadeOut: 0.08, phraseBoundariesVerified: true,
  rights: {status: 'cleared', evidence: 'Synthetic test fixture', scope: 'Local software test'},
  output: 'outputs/prepared.wav'};
test('audio rejects stale sources, uncleared rights, unsupported tempo, bad boundaries and output traversal', () => {
  assert.equal(audioArgs(fixture, cue).seconds, 5);
  for (const patch of [{sourceSha256: 'stale'}, {rights: {status: 'unknown'}},
    {tempo: 1.5}, {phraseBoundariesVerified: false}, {in: -1}, {out: 0},
    {fadeOut: 4}, {output: 'outputs\\..\\source.wav'}]) {
    assert.throws(() => audioArgs(fixture, {...cue, ...patch}));
  }
});

test('real audio CLI trims and tempo-fits a tone, checks peak/duration, refuses overwrite and missing encoder',
  {skip: !process.env.FFMPEG_PATH}, () => {
    for (const file of ['scripts/audio.mjs', 'lib/audio.mjs', 'lib/assembly.mjs', 'lib/workflow.mjs']) {
      mkdirSync(dirname(resolve(fixture, file)), {recursive: true});
      copyFileSync(resolve(root, file), resolve(fixture, file));
    }
    const source = resolve(fixture, 'tone.wav');
    const created = spawnSync(process.env.FFMPEG_PATH, ['-hide_banner', '-nostdin', '-n',
      '-f', 'lavfi', '-i', 'sine=frequency=440:sample_rate=48000:duration=8',
      '-af', 'volume=12', source],
    {encoding: 'utf8', windowsHide: true});
    assert.equal(created.status, 0, created.stderr);
    const actualCue = {...cue, source: 'tone.wav', sourceSha256: fileHash(source)};
    writeFileSync(resolve(fixture, 'cue.json'), JSON.stringify(actualCue));
    const run = binary => spawnSync(process.execPath, [resolve(fixture, 'scripts', 'audio.mjs'),
      'cue.json', '--ffmpeg', binary], {encoding: 'utf8', windowsHide: true});
    assert.match(run('missing-encoder-for-test').stderr, /Cannot run FFmpeg/);
    const result = run(process.env.FFMPEG_PATH);
    assert.equal(result.status, 0, result.stderr);
    const receipt = readJson(resolve(fixture, 'outputs', 'prepared.wav.receipt.json'));
    assert.ok(Math.abs(receipt.seconds - 5) <= 0.05);
    assert.ok(receipt.samplePeakDb <= -0.9);
    assert.ok(existsSync(resolve(fixture, 'outputs', 'prepared.wav')));
    assert.match(run(process.env.FFMPEG_PATH).stderr, /never overwrite/);
    const decoded = spawnSync(process.env.FFMPEG_PATH, ['-hide_banner', '-nostdin',
      '-i', resolve(fixture, 'outputs', 'prepared.wav'),
      '-ac', '1', '-ar', '8000', '-f', 's16le', 'pipe:1'], {windowsHide: true});
    assert.equal(decoded.status, 0, decoded.stderr.toString());
    let crossings = 0;
    for (let i = 8002; i < 24000; i += 2) {
      if (decoded.stdout.readInt16LE(i - 2) < 0 && decoded.stdout.readInt16LE(i) >= 0) crossings++;
    }
    assert.ok(Math.abs(crossings - 440) < 4, `Tempo processing shifted tone pitch: ${crossings}`);
    const rms = (start, end) => {
      let sum = 0;
      for (let i = start; i < end; i += 2) sum += decoded.stdout.readInt16LE(i) ** 2;
      return Math.sqrt(sum / ((end - start) / 2));
    };
    const middle = rms(8000, 16000);
    assert.ok(rms(0, 80) < middle / 2, 'Fade-in must soften the actual opening samples.');
    assert.ok(rms(decoded.stdout.length - 80, decoded.stdout.length) < middle / 2,
      'Fade-out must soften the actual ending samples.');
  });
