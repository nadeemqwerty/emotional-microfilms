import {existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {inside, invariant, verifyAssets} from './workflow.mjs';

export function assemblyArgs(root, edit, manifest) {
  invariant(edit.schemaVersion === 1 && edit.seconds >= 8 && edit.seconds <= 15,
    'Assembly requires a version-1, 8-15 second edit.');
  invariant(manifest.stage === 'sound-approved', 'Approve motion and sound before assembly.');
  invariant(Number.isInteger(edit.width) && Number.isInteger(edit.height) &&
    edit.width >= 90 && edit.width <= 2160 && edit.height <= 3840 &&
    edit.width * 16 === edit.height * 9 && edit.width % 2 === 0 && edit.height % 2 === 0,
  'Use even 9:16 delivery dimensions up to 2160x3840.');
  invariant(Number.isInteger(edit.fps) && edit.fps >= 10 && edit.fps <= 60, 'Invalid output FPS.');
  invariant(Array.isArray(edit.clips) && edit.clips.length > 0 && edit.clips.length <= 6,
    'Use one to six accepted clips.');
  verifyAssets(root, manifest);
  const registered = (path, kind) => invariant(manifest.assets.some(asset =>
    resolve(inside(root, asset.path)) === resolve(inside(root, path)) && asset.kind === kind),
  `Unregistered ${kind} asset: ${path}`);
  const args = ['-hide_banner', '-nostdin', '-n'];
  let total = 0;
  for (const clip of edit.clips) {
    registered(clip.path, 'video');
    invariant(Number.isFinite(clip.in) && clip.in >= 0 &&
      Number.isFinite(clip.seconds) && clip.seconds > 0, 'Invalid clip trim.');
    total += clip.seconds;
    args.push('-i', inside(root, clip.path));
  }
  invariant(Math.abs(total - edit.seconds) < 0.000001, 'Clip durations must sum to film duration.');
  const audio = edit.audio;
  invariant(audio && ['silent', 'native', 'separate'].includes(audio.route), 'Invalid audio route.');
  invariant(audio.route === manifest.soundDecision, 'Edit audio route differs from approved sound decision.');
  if (audio.route !== 'silent') invariant(audio.rightsStatus === 'cleared', 'Audio rights are not cleared.');
  if (audio.route === 'native') invariant(manifest.nativeAudioInspected === true, 'Inspect native audio first.');
  if (audio.route === 'separate') {
    registered(audio.path, 'audio');
    args.push('-i', inside(root, audio.path));
  }
  const filters = edit.clips.map((clip, i) =>
    `[${i}:v:0]trim=start=${clip.in}:duration=${clip.seconds},setpts=PTS-STARTPTS,` +
    `scale=${edit.width}:${edit.height}:force_original_aspect_ratio=decrease,` +
    `pad=${edit.width}:${edit.height}:(ow-iw)/2:(oh-ih)/2:color=black,` +
    `setsar=1,fps=${edit.fps},format=yuv420p[v${i}]`);
  filters.push(edit.clips.map((_, i) => `[v${i}]`).join('') +
    `concat=n=${edit.clips.length}:v=1:a=0[v]`);
  if (audio.route !== 'silent') {
    const gain = audio.gain ?? 1;
    invariant(Number.isFinite(gain) && gain >= 0 && gain <= 2, 'Audio gain must be 0-2.');
    if (audio.route === 'native') {
      edit.clips.forEach((clip, i) => {
        filters.push(`[${i}:a:0]atrim=start=${clip.in}:duration=${clip.seconds},` +
          `asetpts=PTS-STARTPTS,aresample=48000,` +
          `aformat=sample_fmts=fltp:channel_layouts=stereo[a${i}]`);
      });
      filters.push(edit.clips.map((_, i) => `[a${i}]`).join('') +
        `concat=n=${edit.clips.length}:v=0:a=1[amix]`);
    } else {
      filters.push(`[${edit.clips.length}:a:0]atrim=duration=${edit.seconds},` +
        `asetpts=PTS-STARTPTS,aresample=48000,` +
        `aformat=sample_fmts=fltp:channel_layouts=stereo,apad=whole_dur=${edit.seconds}[amix]`);
    }
    filters.push(`[amix]volume=${gain},afade=t=in:st=0:d=0.02,` +
      `afade=t=out:st=${edit.seconds - 0.08}:d=0.08[a]`);
  }
  args.push('-filter_complex', filters.join(';'), '-map', '[v]');
  if (audio.route === 'silent') args.push('-an');
  else args.push('-map', '[a]', '-c:a', 'aac', '-b:a', '192k');
  invariant(typeof edit.output === 'string' && /^outputs[/\\].+\.mp4$/i.test(edit.output),
    'Write an MP4 inside outputs only.');
  const output = inside(root, edit.output);
  invariant(!existsSync(output), 'Output exists; choose a new version, do not overwrite.');
  args.push('-t', String(edit.seconds), '-c:v', 'libx264', '-preset', 'fast',
    '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', output);
  return {args, output};
}

export function parseMediaInfo(stderr) {
  const match = /Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/.exec(stderr);
  invariant(match, 'Cannot establish media duration from encoder inspection.');
  return {
    seconds: Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]),
    hasAudio: /\bStream\s+#.*Audio:/.test(stderr),
    hasVideo: /\bStream\s+#.*Video:/.test(stderr),
  };
}
