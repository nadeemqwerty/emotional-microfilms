import {mkdirSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {assemblyArgs, parseMediaInfo} from '../lib/assembly.mjs';
import {inside, invariant, readJson} from '../lib/workflow.mjs';

try {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const [editPath, flag, binary] = process.argv.slice(2);
  invariant(editPath && (!flag || flag === '--ffmpeg'), 'Usage: assemble.mjs <edit.json> [--ffmpeg <ffmpeg.exe>]');
  invariant(!flag || binary, '--ffmpeg requires an executable path.');
  const ffmpeg = binary || process.env.FFMPEG_PATH || 'ffmpeg';
  const edit = readJson(inside(root, editPath));
  const manifest = readJson(inside(root, edit.manifest));
  const {args, output} = assemblyArgs(root, edit, manifest);
  const inspect = path => {
    const result = spawnSync(ffmpeg, ['-hide_banner', '-nostdin', '-i', inside(root, path)],
      {encoding: 'utf8', windowsHide: true});
    invariant(!result.error, `Cannot run encoder: ${result.error?.message}`);
    return parseMediaInfo(result.stderr);
  };
  for (const clip of edit.clips) {
    const info = inspect(clip.path);
    invariant(info.hasVideo && info.seconds + 0.05 >= clip.in + clip.seconds,
      `Source too short or missing video: ${clip.path}`);
    if (edit.audio.route === 'native') invariant(info.hasAudio, `No native audio: ${clip.path}`);
  }
  if (edit.audio.route === 'separate') {
    invariant(inspect(edit.audio.path).hasAudio, 'Separate soundtrack has no audio stream.');
  }
  mkdirSync(dirname(output), {recursive: true});
  const result = spawnSync(ffmpeg, args, {stdio: 'inherit', windowsHide: true});
  invariant(!result.error && result.status === 0, `Encoder failed: ${result.error?.message || result.status}`);
  console.log(`Created ${output}. Register its hash and complete actual phone/audio/final review; nothing was published.`);
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
}
