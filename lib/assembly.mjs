import {existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {assertNoCurrentFailures, fingerprint, inside, invariant, readJson, requireReview, requiresCameraReview,
  scenarioFormat, validateCameraPlan, validateWorkspace, verifyAssets} from './workflow.mjs';
import {validateDeliveryPath} from './production.mjs';

export function assemblyArgs(root, edit, manifest, context = {
  scenarios: readJson(resolve(root, 'data', 'scenarios.json')).scenarios,
  brief: readJson(resolve(root, 'data', 'brief.json')),
  feedback: readJson(resolve(root, 'data', 'feedback.json')),
}) {
  const format = scenarioFormat(manifest.scenario, context.brief);
  invariant(edit.schemaVersion === 1 && edit.seconds >= format.minimumSeconds &&
    edit.seconds <= format.maximumSeconds,
    'Assembly requires a version-1 edit within the selected narrative format.');
  const preview = edit.purpose === 'review';
  invariant(edit.purpose === undefined || ['review', 'master'].includes(edit.purpose), 'Unknown assembly purpose.');
  invariant(preview ? ['design-locked', 'motion-approved', 'sound-approved', 'final-approved'].includes(manifest.stage)
    : manifest.stage === 'sound-approved', 'Approve motion and sound before assembly; rough review previews require locked design.');
  validateWorkspace(manifest, context);
  if (!preview) {
    assertNoCurrentFailures(manifest);
    requireReview(manifest, 'sound');
    requireReview(manifest, 'audio-scene-fit');
    if (manifest.productionDraft.dialoguePlan?.mode === 'spoken') requireReview(manifest, 'dialogue-performance');
    if (requiresCameraReview(manifest.productionDraft)) requireReview(manifest, 'camera-execution');
  }
  const cameraPlan = edit.cameraPlan ?? manifest.productionDraft.cameraPlan;
  if (edit.cameraPlan) {
    invariant(preview || fingerprint(edit.cameraPlan) === fingerprint(manifest.productionDraft.cameraPlan),
      'A new camera plan requires an unapproved review preview or renewed production approval.');
    validateCameraPlan({...manifest.productionDraft, cameraPlan: edit.cameraPlan});
  }
  if (!preview) for (const camera of cameraPlan?.shots.filter(item => item.executionRoute === 'post') ?? []) {
    invariant(edit.clips.some(clip => clip.cameraShotId === camera.shotId),
      'Master edit omits a planned post camera shot.');
  }
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
  const filters = edit.clips.map((clip, i) => {
    let cameraFilter = '';
    if (clip.cameraShotId) {
      const camera = cameraPlan?.shots.find(item => item.shotId === clip.cameraShotId);
      invariant(camera?.executionRoute === 'post' && camera.segments.length === 1,
        'Post camera requires one canonical continuous crop segment per clip.');
      const source = manifest.assets.find(asset => asset.kind === 'video' &&
        resolve(inside(root, asset.path)) === resolve(inside(root, clip.path)));
      invariant(source.shotId === clip.cameraShotId ||
        (preview && typeof clip.cameraMappingEvidence === 'string' && clip.cameraMappingEvidence.trim()),
      'Post camera must bind its actual source shot; review-only legacy mappings need explicit evidence.');
      const segment = camera.segments[0];
      invariant(Math.abs(segment.to - segment.from - clip.seconds) < 0.000001,
        'Post camera timing differs from its clip.');
      cameraFilter = postCameraFilter(segment, edit.width, edit.height, edit.fps, clip.seconds) + ',';
      if (!preview) requireReview(manifest, 'camera-execution');
    }
    return (
    `[${i}:v:0]trim=start=${clip.in}:duration=${clip.seconds},setpts=PTS-STARTPTS,` +
    `scale=${edit.width}:${edit.height}:force_original_aspect_ratio=decrease,` +
    `pad=${edit.width}:${edit.height}:(ow-iw)/2:(oh-ih)/2:color=black,` +
    `setsar=1,fps=${edit.fps},${cameraFilter}format=yuv420p[v${i}]`);
  });
  filters.push(edit.clips.map((_, i) => `[v${i}]`).join('') +
    `concat=n=${edit.clips.length}:v=1:a=0[v]`);
  if (audio.route !== 'silent') {
    const gain = audio.gain ?? 1;
    invariant(Number.isFinite(gain) && gain >= 0 && gain <= 2, 'Audio gain must be 0-2.');
    if (audio.route === 'native') {
      edit.clips.forEach((clip, i) => {
        filters.push(`[${i}:a:0]atrim=start=${clip.in}:duration=${clip.seconds},` +
          `asetpts=PTS-STARTPTS,aresample=48000,` +
          `aformat=sample_fmts=fltp:channel_layouts=stereo,` +
          `apad=whole_dur=${clip.seconds},atrim=duration=${clip.seconds}[a${i}]`);
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
  const output = validateDeliveryPath(root, edit.output, manifest.scenarioId);
  if (preview) invariant(/-(review|comparison)\.mp4$/i.test(output),
    'Unapproved preview filenames must end in -review.mp4 or -comparison.mp4.');
  invariant(!existsSync(output), 'Output exists; choose a new version, do not overwrite.');
  args.push('-t', String(edit.seconds), '-c:v', 'libx264', '-preset', 'fast',
    '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', output);
  return {args, output, purpose: preview ? 'review' : 'master'};
}

export function postCameraFilter(segment, width, height, fps, seconds) {
  invariant(Number.isInteger(width) && width > 0 && Number.isInteger(height) && height > 0 &&
    Number.isInteger(fps) && fps >= 10 && fps <= 60 && Number.isFinite(seconds) && seconds > 0,
  'Invalid post camera canvas/timing.');
  invariant(['locked', 'pan', 'tilt'].includes(segment.move) &&
    {locked: ['none'], pan: ['left', 'right'], tilt: ['up', 'down']}[segment.move].includes(segment.direction) &&
    ['none', 'digital'].includes(segment.zoom?.mode) && segment.focus?.mode === 'fixed' &&
    segment.parallax === 'none', 'Post crop cannot synthesize physical camera travel, optical zoom or rack focus.');
  const zoom = segment.zoom;
  invariant([zoom.from, zoom.to].every(value => Number.isFinite(value) && value >= 1) &&
    (zoom.mode !== 'none' || (zoom.from === 1 && zoom.to === 1)), 'Invalid post zoom.');
  const position = segment.cropPosition ?? {from: {x: 0.5, y: 0.5}, to: {x: 0.5, y: 0.5}};
  invariant(['from', 'to'].every(key => ['x', 'y'].every(axis =>
    Number.isFinite(position[key]?.[axis]) && position[key][axis] >= 0 && position[key][axis] <= 1)),
  'Post crop positions must remain inside normalized available crop space.');
  if (segment.move !== 'locked') {
    invariant(zoom.from > 1 && zoom.to > 1, 'Post pan/tilt needs overscan/crop margin.');
    const horizontal = segment.move === 'pan';
    const axis = horizontal ? 'x' : 'y';
    const other = horizontal ? 'y' : 'x';
    invariant(position.from[other] === position.to[other] &&
      (['left', 'up'].includes(segment.direction)
        ? position.to[axis] < position.from[axis] : position.to[axis] > position.from[axis]),
    'Post crop trajectory contradicts pan/tilt direction.');
  } else invariant(segment.direction === 'none' &&
    position.from.x === position.to.x && position.from.y === position.to.y,
  'Locked post camera cannot secretly pan/tilt.');
  const t = `(on/${Math.max(1, Math.round(seconds * fps) - 1)})`;
  const easing = {none: t, linear: t, 'ease-in': `(${t}*${t})`,
    'ease-out': `(1-(1-${t})*(1-${t}))`, 'ease-in-out': `(${t}*${t}*(3-2*${t}))`}[segment.easing];
  invariant(easing, 'Unknown post camera easing.');
  const interpolate = (from, to) => `${from}+(${to - from})*${easing}`;
  const z = interpolate(zoom.from, zoom.to);
  const x = `(iw-iw/zoom)*(${interpolate(position.from.x, position.to.x)})`;
  const y = `(ih-ih/zoom)*(${interpolate(position.from.y, position.to.y)})`;
  return `zoompan=z='${z}':x='${x}':y='${y}':d=1:s=${width}x${height}:fps=${fps}`;
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
