import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {audioArgs, audioPeak} from '../lib/audio.mjs';
import {parseMediaInfo} from '../lib/assembly.mjs';
import {fileHash, inside, invariant, readJson} from '../lib/workflow.mjs';

try {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const [cuePath, flag, binary] = process.argv.slice(2);
  invariant(cuePath && (!flag || flag === '--ffmpeg') && (!flag || binary),
    'Usage: audio.mjs <private-cue.json> [--ffmpeg <executable>]');
  const ffmpeg = binary || process.env.FFMPEG_PATH || 'ffmpeg';
  const run = args => {
    const result = spawnSync(ffmpeg, args, {encoding: 'utf8', windowsHide: true, maxBuffer: 8 * 1024 * 1024});
    invariant(!result.error, `Cannot run FFmpeg: ${result.error?.message}`);
    return result;
  };
  const cue = readJson(inside(root, cuePath));
  const plan = audioArgs(root, cue);
  const info = parseMediaInfo(run(['-hide_banner', '-nostdin', '-i', plan.source]).stderr);
  invariant(info.hasAudio && cue.out <= info.seconds + 0.001, 'Excerpt exceeds actual source audio.');
  mkdirSync(dirname(plan.output), {recursive: true});
  const rendered = run(plan.args);
  invariant(rendered.status === 0, `Audio preparation failed: ${rendered.stderr}`);
  const inspected = run(['-hide_banner', '-nostdin', '-i', plan.output,
    '-af', 'volumedetect', '-vn', '-f', 'null', '-']);
  invariant(inspected.status === 0, `Audio decode failed: ${inspected.stderr}`);
  const actual = parseMediaInfo(inspected.stderr);
  const peakDb = audioPeak(inspected.stderr);
  invariant(actual.hasAudio && Math.abs(actual.seconds - plan.seconds) <= 0.05 && peakDb <= -0.9,
    'Prepared audio failed duration or sample-peak check.');
  const receipt = {schemaVersion: 1, source: cue.source, sourceSha256: cue.sourceSha256,
    output: cue.output, sha256: fileHash(plan.output), seconds: actual.seconds,
    samplePeakDb: Number.isFinite(peakDb) ? peakDb : '-inf', cue, at: new Date().toISOString(),
    perceptualStatus: 'PENDING actual listening, diction/pitch/phrase/sync and film review. Not a singing generator or a rights verifier.'};
  writeFileSync(`${plan.output}.receipt.json`, `${JSON.stringify(receipt, null, 2)}\n`, {flag: 'wx'});
  console.log(JSON.stringify(receipt, null, 2));
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
}
