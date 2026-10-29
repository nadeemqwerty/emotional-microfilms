import {createHash, randomUUID} from 'node:crypto';
import {createReadStream, createWriteStream, constants, existsSync, lstatSync, mkdirSync,
  readFileSync, realpathSync, statSync, writeFileSync} from 'node:fs';
import {copyFile} from 'node:fs/promises';
import {dirname, join, resolve} from 'node:path';
import {spawn} from 'node:child_process';
import {lookup} from 'node:dns/promises';
import https from 'node:https';
import {pipeline} from 'node:stream/promises';
import {Transform} from 'node:stream';
import {fingerprint, invariant} from './workflow.mjs';

export const LIMITS = Object.freeze({seconds: 600, bytes: 250 * 1024 * 1024,
  frames: 180, dimension: 8192, pixels: 34_000_000, processMs: 120_000,
  downloadMs: 30_000, transcriptBytes: 1024 * 1024});
const SHA = /^[a-f0-9]{64}$/;
const text = value => typeof value === 'string' && value.trim().length > 0 &&
  !/^(pending|unknown|tbd|todo|not reviewed|placeholder)$/i.test(value.trim());
const finite = value => typeof value === 'number' && Number.isFinite(value);
const assertText = (value, label) => invariant(text(value), `Missing actual ${label}.`);
const json = path => JSON.parse(readFileSync(path, 'utf8'));
const writeJson = (path, value) => writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, {flag: 'wx'});

export async function hashFile(path) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest('hex');
}

export function parseReferenceMetadata(stderr) {
  const duration = /Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/.exec(stderr);
  invariant(duration, 'Cannot establish finite duration from FFmpeg metadata.');
  const lines = stderr.split(/\r?\n/);
  const video = lines.find(line => /\bStream #0:\d+.*Video:/.test(line) &&
    !/\(attached pic\)/i.test(line));
  invariant(video, 'A real video stream, not just cover art, is required.');
  const dimensions = /(?:^|[,\s])(\d{2,5})x(\d{2,5})(?=[,\s[]|$)/.exec(video);
  const stream = /Stream #0:(\d+)/.exec(video);
  invariant(dimensions && stream, 'Cannot establish video dimensions/stream.');
  const audioStreams = lines.filter(line => /\bStream #0:\d+.*Audio:/.test(line))
    .map(line => Number(/Stream #0:(\d+)/.exec(line)[1]));
  const seconds = +duration[1] * 3600 + +duration[2] * 60 + +duration[3];
  const width = +dimensions[1], height = +dimensions[2];
  invariant(seconds > 0 && seconds <= LIMITS.seconds, `Duration must be >0 and <=${LIMITS.seconds}s.`);
  invariant(width <= LIMITS.dimension && height <= LIMITS.dimension &&
    width * height <= LIMITS.pixels, 'Source dimensions exceed bounded workbench limits.');
  invariant(audioStreams.length <= 8, 'At most eight audio tracks are supported.');
  const fps = /([\d.]+)\s+fps\b/.exec(video);
  return {seconds, width, height, fps: fps ? +fps[1] : null,
    videoStream: +stream[1], audioStreams, hasAudio: audioStreams.length > 0,
    rotationReported: /(?:rotate\s*:|rotation of)\s*(-?[\d.]+)/i.exec(stderr)?.[1] ?? null};
}

export function sampleTimes(seconds, interval = 2, maxFrames = 120, start = 0, end = seconds) {
  invariant(finite(seconds) && seconds > 0 && seconds <= LIMITS.seconds, 'Invalid source duration.');
  invariant(finite(start) && finite(end) && start >= 0 && end <= seconds && end > start,
    'Sampling range must be inside the complete source.');
  invariant(finite(interval) && interval >= 0.1 && interval <= 60, 'Interval must be 0.1-60 seconds.');
  invariant(Number.isInteger(maxFrames) && maxFrames >= 2 && maxFrames <= LIMITS.frames,
    `maxFrames must be 2-${LIMITS.frames}.`);
  // The final sample is just before EOF: an image at exactly duration usually cannot decode.
  const last = Math.max(start, end - Math.min(0.1, (end - start) / 10));
  const step = Math.max(interval, (last - start) / (maxFrames - 1));
  const times = [start];
  for (let t = start + step; t < last - 0.001 && times.length < maxFrames - 1; t += step) {
    times.push(Number(t.toFixed(6)));
  }
  if (last > start) times.push(Number(last.toFixed(6)));
  return {requestedInterval: interval, effectiveInterval: step, start, end,
    timestamps: times, tailUnsampledSeconds: end - last,
    timestampMeaning: 'Requested source seek time; decoder may choose the nearest available frame (not measured frame PTS).',
    meaning: 'Whole-span still sampling only; not full-motion or listening comprehension.'};
}

export function classifyInput(input, allowDownload = false) {
  assertText(input, 'input video path or URL');
  if (!/^https?:\/\//i.test(input)) return {kind: 'local', path: resolve(input)};
  const url = new URL(input);
  invariant(!url.username && !url.password, 'Credential-bearing URLs are not accepted.');
  const host = url.hostname.toLowerCase();
  if (host === 'instagram.com' || host.endsWith('.instagram.com') ||
    host === 'instagr.am' || host.endsWith('.instagr.am')) {
    return {kind: 'needs-local-export', code: 'NEEDS_LOCAL_EXPORT',
      message: 'Instagram pages are not direct media. No authorized resolver is configured. ' +
        'Use Instagram’s own download/export if available and permitted, or obtain the original ' +
        'file from its owner; then prepare that local file. No login, cookies, scraper or bypass is used.'};
  }
  invariant(url.protocol === 'https:', 'Direct downloads require HTTPS.');
  invariant(allowDownload === true,
    'Remote input requires explicit --download-public-video consent; otherwise use a local export.');
  invariant(!url.port || url.port === '443', 'Direct downloads use HTTPS port 443 only.');
  return {kind: 'direct-public-video', url};
}

export function isPublicIPv4(address) {
  const parts = address.split('.').map(Number);
  if (parts.length !== 4 || parts.some(p => !Number.isInteger(p) || p < 0 || p > 255)) return false;
  const [a, b, c] = parts;
  return !(a === 0 || a === 10 || a === 127 || a >= 224 ||
    (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) || (a === 192 && (b === 168 || b === 0 ||
      (b === 88 && c === 99) || (b === 2 && c === 0))) ||
    (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100))) ||
    (a === 203 && b === 0 && c === 113));
}

async function downloadVideo(url, output) {
  const addresses = await Promise.race([
    lookup(url.hostname, {all: true, family: 4}),
    new Promise((_, reject) => {
      const timer = setTimeout(() => reject(new Error('Public DNS lookup timed out.')), 5000);
      timer.unref();
    }),
  ]);
  invariant(addresses.length > 0 && addresses.every(a => isPublicIPv4(a.address)),
    'Only publicly routed IPv4 video hosts are supported; use a local export.');
  const address = addresses[0].address;
  await new Promise((done, reject) => {
    let response, file;
    const request = https.get(url, {headers: {'User-Agent': 'MicrofilmLocalWorkbench/1',
      Accept: 'video/*'}, lookup: (_host, _options, callback) => callback(null, address, 4)}, async res => {
      response = res;
      try {
        invariant(res.statusCode === 200,
          `Direct download returned HTTP ${res.statusCode}; redirects/login pages are not followed. Use a local export.`);
        invariant(/^video\//i.test(res.headers['content-type'] ?? ''),
          'URL did not return a video content type; use a local export.');
        const length = res.headers['content-length'];
        invariant(length === undefined || (Number.isFinite(+length) && +length <= LIMITS.bytes),
          'Download exceeds size limit.');
        let bytes = 0;
        const cap = new Transform({transform(chunk, _encoding, callback) {
          bytes += chunk.length;
          callback(bytes > LIMITS.bytes ? new Error('Download exceeds size limit.') : null, chunk);
        }});
        file = createWriteStream(output, {flags: 'wx'});
        await pipeline(res, cap, file);
        clearTimeout(timer);
        done();
      } catch (error) {
        clearTimeout(timer);
        res.destroy();
        file?.destroy();
        reject(error);
      }
    });
    const timer = setTimeout(() => {
      response?.destroy();
      file?.destroy();
      request.destroy(new Error('Direct download timed out.'));
    }, LIMITS.downloadMs);
    request.on('error', () => {
      clearTimeout(timer);
      reject(new Error('Direct video retrieval failed; use a permitted local export (no cookies/bypass).'));
    });
  });
}

export function runFFmpeg(ffmpeg, args, {allowNonzero = false} = {}) {
  invariant(typeof ffmpeg === 'string' && existsSync(ffmpeg) && statSync(ffmpeg).isFile(),
    'Supply an existing explicit --ffmpeg executable path or FFMPEG_PATH; ffprobe is not needed.');
  return new Promise((done, reject) => {
    const child = spawn(resolve(ffmpeg), args, {windowsHide: true, stdio: ['ignore', 'pipe', 'pipe']});
    let stderr = '', stdout = '', bytes = 0, failure;
    const timer = setTimeout(() => {
      failure = new Error('FFmpeg exceeded bounded 120-second operation timeout.');
      child.kill();
    }, LIMITS.processMs);
    const capture = channel => chunk => {
      bytes += chunk.length;
      if (bytes > 2 * 1024 * 1024) {
        failure = new Error('FFmpeg inspection output exceeded bound.');
        child.kill();
      } else if (channel === 'stderr') stderr += chunk.toString();
      else stdout += chunk.toString();
    };
    child.stdout.on('data', capture('stdout'));
    child.stderr.on('data', capture('stderr'));
    child.on('error', error => { clearTimeout(timer); reject(error); });
    child.on('close', code => {
      clearTimeout(timer);
      if (failure) return reject(failure);
      if (code !== 0 && !allowNonzero) {
        return reject(new Error(`FFmpeg failed (${code}): ${stderr.slice(-2500)}`));
      }
      done({code, stderr, stdout});
    });
  });
}

function workspaceBase(root) {
  const base = join(resolve(root), 'workspace');
  if (existsSync(base)) invariant(!lstatSync(base).isSymbolicLink() &&
    realpathSync(base) === join(realpathSync(root), 'workspace'), 'workspace must not be a link/junction.');
  return base;
}

export function workspacePath(root, name, mustExist = true) {
  invariant(typeof name === 'string' && /^[a-z0-9][a-z0-9-]{0,79}$/.test(name),
    'Use a workspace name (1-80 lowercase letters/digits/hyphens), not a path.');
  const base = workspaceBase(root), directory = join(base, name);
  if (mustExist) {
    invariant(existsSync(directory) && lstatSync(directory).isDirectory() &&
      !lstatSync(directory).isSymbolicLink() && realpathSync(directory) === join(realpathSync(base), name),
    'Workspace must be an existing real directory, not a link/junction.');
  } else invariant(!existsSync(directory), 'Workspace exists; choose a NEW name. Nothing was overwritten.');
  return directory;
}

function privateFile(directory, name) {
  invariant(typeof name === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(name),
    'Workspace files must be simple filenames.');
  const path = join(directory, name);
  if (existsSync(path)) invariant(!lstatSync(path).isSymbolicLink() &&
    realpathSync(path) === join(realpathSync(directory), name), 'Workspace file is a link/junction.');
  return path;
}

function ffmpegInput(path) {
  // Disable network protocols even for malicious local playlists/containers.
  return ['-protocol_whitelist', 'file,pipe', '-i', path];
}

async function extractSamples(directory, source, metadata, sampling, ffmpeg) {
  const frames = [];
  for (const [index, time] of sampling.timestamps.entries()) {
    const name = `frame-${String(index).padStart(3, '0')}-${time.toFixed(3)}s.jpg`;
    await runFFmpeg(ffmpeg, ['-hide_banner', '-nostdin', '-v', 'error', '-n',
      '-ss', String(time), ...ffmpegInput(source), '-map', `0:${metadata.videoStream}`,
      '-frames:v', '1', '-vf', 'scale=320:320:force_original_aspect_ratio=decrease',
      '-q:v', '3', join(directory, name)]);
    invariant(existsSync(join(directory, name)) && statSync(join(directory, name)).size > 0,
      `No decodable frame at ${time}s; incomplete preparation retained, not marked ready.`);
    frames.push({path: name, timestamp: time});
  }
  // HTML is offline, full-size clickable, and avoids optional FFmpeg font/filter dependencies.
  const cards = frames.map(frame => `<figure><a href="${frame.path}"><img src="${frame.path}" ` +
    `alt="Sample at ${frame.timestamp.toFixed(3)} seconds"></a><figcaption>` +
    `${frame.timestamp.toFixed(3)}s</figcaption></figure>`).join('\n');
  writeFileSync(join(directory, 'contact-sheet.html'), '<!doctype html><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width"><title>Timestamped samples — not playback review</title>' +
    '<style>body{background:#151515;color:white;font:16px sans-serif}main{display:flex;flex-wrap:wrap}' +
    'figure{margin:8px}img{max-width:240px;max-height:300px}</style>' +
    '<h1>Still samples only — open full-playback.html for motion and audio</h1><main>' + cards + '</main>',
  {flag: 'wx'});
  return frames;
}

export function createPendingAnalysis(manifest) {
  return {schemaVersion: 1, status: 'pending', jobId: manifest.jobId,
    source: {sha256: manifest.source.sha256, seconds: manifest.source.metadata.seconds},
    rights: {status: 'unknown', privateStudyOnly: true, holder: null, permission: null,
      scope: null, evidence: null, publicUrlIsNotPermission: true},
    coverage: {
      wholeSpanSampling: {status: 'prepared-not-reviewed', manifest: 'manifest.json'},
      fullPlayback: {status: 'pending', sourceSha256: manifest.source.sha256,
        artifact: 'source.mp4', reviewer: null, reviewedAt: null, ranges: [], notes: null},
      audioListening: manifest.source.metadata.hasAudio ?
        {status: 'pending', sourceSha256: manifest.source.sha256, reviewer: null,
          reviewedAt: null, tracks: [], notes: null} : {status: 'not-present', tracks: []},
      transcript: {status: manifest.transcript ? 'provided-not-verified' : 'not-provided',
        assetSha256: manifest.transcript?.sha256 ?? null,
        provenance: manifest.transcript ? 'user-provided' : null,
        note: 'No ASR or singing/music endpoint. Never invent words.'},
    },
    timeline: [], findings: {mechanisms: [], uncertainties: [], denseReviewNeeded: []},
    approvals: {...manifest.approvals},
    instructions: 'Describe EVERY shot/segment from 0 to full duration. Use the template/docs. ' +
      'Sampling is not full-motion or audio review. All observations and inferences must be separate.'};
}

export async function prepareReference(root, options) {
  const input = classifyInput(options.input, options.allowDownload);
  if (input.kind === 'needs-local-export') return input;
  const directory = workspacePath(root, options.workspace, false);
  const ffmpeg = options.ffmpeg;
  await runFFmpeg(ffmpeg, ['-version']);
  const interval = options.interval ?? 2, maxFrames = options.maxFrames ?? 120;
  // Validate all non-media options before allocating a workspace.
  sampleTimes(1, interval, maxFrames);
  if (input.kind === 'local') {
    invariant(existsSync(input.path) && statSync(input.path).isFile(), 'Local video does not exist.');
    invariant(statSync(input.path).size > 0 && statSync(input.path).size <= LIMITS.bytes,
      'Local source must be nonempty and <=250 MiB.');
  }
  let transcript;
  if (options.transcript) {
    invariant(statSync(options.transcript).isFile() &&
      statSync(options.transcript).size <= LIMITS.transcriptBytes, 'Transcript must be a <=1 MiB text file.');
    transcript = readFileSync(options.transcript, 'utf8');
    assertText(transcript, 'user-provided transcript');
  }
  mkdirSync(dirname(directory), {recursive: true});
  workspaceBase(root);
  mkdirSync(directory);
  writeJson(join(directory, 'preparation.json'), {status: 'preparing', jobId: randomUUID(),
    note: 'Only manifest.json proves preparation finished. Failed partial directories are retained; use a new name.'});
  const source = join(directory, 'source.mp4');
  if (input.kind === 'local') await copyFile(input.path, source, constants.COPYFILE_EXCL);
  else await downloadVideo(input.url, source);
  invariant(statSync(source).size > 0 && statSync(source).size <= LIMITS.bytes, 'Source size exceeds bound.');
  const inspected = await runFFmpeg(ffmpeg,
    ['-hide_banner', '-nostdin', ...ffmpegInput(source)], {allowNonzero: true});
  const metadata = parseReferenceMetadata(inspected.stderr);
  const sourceSha256 = await hashFile(source);
  const sampling = sampleTimes(metadata.seconds, interval, maxFrames);
  const frameDir = join(directory, 'frames');
  mkdirSync(frameDir);
  const frames = await extractSamples(frameDir, source, metadata, sampling, ffmpeg);
  const audio = [];
  for (const stream of metadata.audioStreams) {
    const name = `audio-track-${stream}.wav`;
    await runFFmpeg(ffmpeg, ['-hide_banner', '-nostdin', '-v', 'error', '-n',
      ...ffmpegInput(source), '-map', `0:${stream}`, '-vn', '-ac', '1', '-ar', '16000',
      '-c:a', 'pcm_s16le', join(directory, name)]);
    audio.push({path: name, stream, sha256: await hashFile(join(directory, name)),
      note: 'Full-duration mono listening aid, not original mix; review original playback as well.'});
  }
  const cuts = await runFFmpeg(ffmpeg, ['-hide_banner', '-nostdin',
    ...ffmpegInput(source), '-map', `0:${metadata.videoStream}`, '-an',
    '-vf', "scale=160:160:force_original_aspect_ratio=decrease,select='gt(scene,0.3)',showinfo",
    '-vsync', 'vfr', '-f', 'null', '-']);
  const sceneCutSuggestions = [...cuts.stderr.matchAll(/pts_time:([\d.]+)/g)]
    .map(match => +match[1]).filter(time => time > 0 && time < metadata.seconds);
  writeFileSync(join(directory, 'full-playback.html'), '<!doctype html><meta charset="utf-8">' +
    '<title>Exact original source playback</title><h1>Full original playback — manual review required</h1>' +
    '<p>The source is a byte-for-byte copy, not a proxy. Browser codec support varies; if playback fails, ' +
    'open source.mp4 in a trusted local player. Review every audio track separately. ' +
    'No automated claim of watching/listening is made.</p>' +
    '<video controls preload="metadata" style="max-width:100%;max-height:85vh" src="source.mp4"></video>',
  {flag: 'wx'});
  const manifest = {schemaVersion: 1, kind: 'reference-preparation', status: 'prepared',
    jobId: json(join(directory, 'preparation.json')).jobId, preparedAt: new Date().toISOString(),
    source: {path: 'source.mp4', sha256: sourceSha256, bytes: statSync(source).size, metadata,
      origin: input.kind === 'local' ? 'local-export' : 'explicit-public-video-download',
      host: input.url?.hostname ?? null,
      note: 'Private exact source. No source path, signed URL or query retained in tracked data.'},
    playback: {path: 'source.mp4', sha256: sourceSha256, html: 'full-playback.html', exactCopy: true},
    sampling: {...sampling, frames: frames.map(frame => ({...frame, path: `frames/${frame.path}`})),
      contactSheet: 'frames/contact-sheet.html'},
    sceneCuts: {threshold: 0.3, suggestions: sceneCutSuggestions,
      warning: 'Heuristic candidates only. Dissolves, flashes, hidden cuts and within-shot action need manual review.'},
    audio, transcript: null,
    review: {fullMotionReviewed: false, audioListened: false, transcriptVerified: false},
    approvals: {generationApproved: false, referenceUploadApproved: false,
      publicationApproved: false, scenarioSelected: false},
    productionJobs: []};
  if (transcript) {
    writeFileSync(join(directory, 'user-transcript.txt'), transcript, {flag: 'wx'});
    manifest.transcript = {path: 'user-transcript.txt', provenance: 'user-provided',
      sha256: await hashFile(join(directory, 'user-transcript.txt'))};
  }
  writeJson(join(directory, 'analysis.json'), createPendingAnalysis(manifest));
  // Commit marker is last. Never replace an existing workspace or completed manifest.
  writeJson(join(directory, 'manifest.json'), manifest);
  return {status: 'prepared', workspace: options.workspace, directory, sourceSha256,
    seconds: metadata.seconds, frames: frames.length, audioTracks: audio.length,
    reviewStatus: 'pending', generationApproved: false};
}

export function validateRanges(ranges, seconds, label = 'timeline') {
  invariant(Array.isArray(ranges) && ranges.length > 0 && ranges.length <= 1000,
    `${label}: complete time ranges required.`);
  let cursor = 0;
  for (const segment of ranges) {
    invariant(finite(segment.start) && finite(segment.end) && segment.start === cursor &&
      segment.end > segment.start && segment.end <= seconds,
    `${label}: must start at 0, cover full duration without gaps/overlaps, and use numeric times.`);
    cursor = segment.end;
  }
  invariant(cursor === seconds, `${label}: must end at full source duration (${seconds}).`);
}

function reviewRecord(record, seconds, hash, label) {
  invariant(record?.status === 'reviewed' && record.sourceSha256 === hash, `${label}: actual hash-bound review required.`);
  assertText(record.reviewer, `${label} reviewer`);
  invariant(typeof record.reviewedAt === 'string' && Number.isFinite(Date.parse(record.reviewedAt)),
    `${label}: review timestamp required.`);
  assertText(record.notes, `${label} actual review notes`);
  validateRanges(record.ranges, seconds, label);
  record.ranges.forEach(range => assertText(range.notes, `${label} range evidence`));
}

export function validateReview(analysis, manifest) {
  invariant(manifest?.schemaVersion === 1 && manifest.kind === 'reference-preparation' &&
    manifest.status === 'prepared' && SHA.test(manifest.source?.sha256), 'A completed reference manifest is required.');
  const {sha256, metadata} = manifest.source;
  invariant(finite(metadata?.seconds) && metadata.seconds > 0 && metadata.seconds <= LIMITS.seconds &&
    typeof metadata.hasAudio === 'boolean' && Array.isArray(metadata.audioStreams) &&
    metadata.hasAudio === (metadata.audioStreams.length > 0), 'Invalid source metadata.');
  invariant(analysis?.schemaVersion === 1 && analysis.status === 'reviewed' &&
    analysis.jobId === manifest.jobId && analysis.source?.sha256 === sha256 &&
    analysis.source?.seconds === metadata.seconds, 'Reviewed analysis must match source, duration and jobId.');
  for (const document of [manifest, analysis]) {
    invariant(document.approvals && ['generationApproved', 'referenceUploadApproved',
      'publicationApproved', 'scenarioSelected'].every(key => document.approvals[key] === false),
    'Reference study does not authorize selection, uploads, generation or publication.');
  }
  invariant(Array.isArray(manifest.productionJobs) && manifest.productionJobs.length === 0,
    'Reference workbench cannot create or authorize production jobs.');
  invariant(analysis.rights?.publicUrlIsNotPermission === true,
    'Acknowledge source rights; public availability is not permission.');
  invariant(['unknown', 'owned', 'licensed'].includes(analysis.rights?.status), 'Source rights status required.');
  if (analysis.rights.status !== 'unknown') {
    for (const key of ['holder', 'permission', 'scope', 'evidence']) assertText(analysis.rights[key], `rights ${key}`);
  }
  invariant(analysis.rights.privateStudyOnly === true, 'This workbench is private craft study, not source reuse clearance.');
  invariant(analysis.coverage?.wholeSpanSampling?.status === 'reviewed',
    'Whole-span sampling review must be recorded separately.');
  const playback = analysis.coverage.fullPlayback;
  reviewRecord(playback, metadata.seconds, sha256, 'full playback');
  invariant(playback.artifact === manifest.playback.path && manifest.playback.exactCopy === true &&
    manifest.playback.sha256 === sha256, 'Review the complete exact source, not a still sheet.');
  if (metadata.hasAudio) {
    const listening = analysis.coverage.audioListening;
    invariant(listening?.status === 'reviewed' && Array.isArray(listening.tracks) &&
      listening.tracks.length === metadata.audioStreams.length, 'Actual listening of every audio track is required.');
    const streams = new Set();
    for (const track of listening.tracks) {
      invariant(metadata.audioStreams.includes(track.stream) && !streams.has(track.stream),
        'Listening records must uniquely cover actual audio streams.');
      streams.add(track.stream);
      reviewRecord(track, metadata.seconds, sha256, `audio stream ${track.stream}`);
    }
  } else invariant(analysis.coverage.audioListening?.status === 'not-present',
    'Silent source must explicitly record no audio track.');
  validateRanges(analysis.timeline, metadata.seconds);
  const ids = new Set();
  let transcriptRequired = false;
  for (const shot of analysis.timeline) {
    assertText(shot.id, 'shot id');
    invariant(!ids.has(shot.id), 'Duplicate shot id.');
    ids.add(shot.id);
    for (const key of ['action', 'subjectRelationship', 'blockingContinuity']) assertText(shot[key], `${shot.id} ${key}`);
    for (const key of ['framing', 'movement']) assertText(shot.camera?.[key], `${shot.id} camera ${key}`);
    invariant(shot.camera?.optics?.claim === 'approximation', 'Optics must be labeled approximation, not exact gear facts.');
    assertText(shot.camera.optics.description, 'approximate optics and uncertainty');
    for (const key of ['motivatedSources', 'castShadows', 'contactShadows', 'temporalConsistency']) {
      assertText(shot.lighting?.[key], `${shot.id} lighting ${key}`);
    }
    for (const key of ['cutReason', 'beatRhythm', 'informationProgression', 'reveal', 'reactionHold']) {
      assertText(shot.editing?.[key], `${shot.id} editing ${key}`);
    }
    const audio = shot.audio;
    for (const key of ['music', 'foley', 'rights']) assertText(audio?.[key], `${shot.id} audio ${key}`);
    const speech = audio.speech;
    invariant(['none', 'spoken', 'sung', 'mixed', 'no-audio-track'].includes(speech?.status),
      `${shot.id}: speech/singing or no-speech evidence must be resolved, never invented.`);
    assertText(speech.evidence, `${shot.id} speech evidence`);
    invariant(metadata.hasAudio ? speech.status !== 'no-audio-track' : speech.status === 'no-audio-track',
      'Speech evidence must agree with real audio presence.');
    if (['spoken', 'sung', 'mixed'].includes(speech.status)) {
      transcriptRequired = true;
      assertText(speech.transcript?.text, `${shot.id} user-provided dialogue/lyrics`);
      invariant(speech.transcript.provenance === 'user-provided' &&
        speech.transcript.assetSha256 === manifest.transcript?.sha256 && manifest.transcript,
      'Words require a real user-provided transcript asset, not invented ASR.');
    }
    invariant(Array.isArray(shot.observations) && shot.observations.length > 0, `${shot.id}: observations required.`);
    for (const observation of shot.observations) {
      invariant(finite(observation.time) && observation.time >= shot.start && observation.time < shot.end &&
        ['full-playback', 'frame', 'audio-listening'].includes(observation.evidence),
      `${shot.id}: timestamped observation evidence is invalid.`);
      assertText(observation.detail, `${shot.id} observation detail`);
    }
    invariant(shot.observations.some(observation => observation.evidence === 'full-playback'),
      `${shot.id}: actual motion observation required, stills are insufficient.`);
    if (metadata.hasAudio) invariant(shot.observations.some(observation => observation.evidence === 'audio-listening'),
      `${shot.id}: actual listening observation required.`);
    invariant(Array.isArray(shot.inferences), `${shot.id}: separate inferences array required (may be empty).`);
    for (const inference of shot.inferences) {
      assertText(inference.claim, 'inference claim');
      assertText(inference.basis, 'inference basis');
      invariant(['low', 'medium', 'high'].includes(inference.confidence), 'Inference confidence required.');
    }
  }
  const transcript = analysis.coverage.transcript;
  if (transcriptRequired || transcript?.status === 'verified-user-provided') {
    invariant(transcript?.status === 'verified-user-provided' && manifest.transcript &&
      SHA.test(manifest.transcript.sha256) && transcript.assetSha256 === manifest.transcript.sha256 &&
      transcript.provenance === 'user-provided', 'Verify the actual user-provided transcript against listening.');
  } else invariant(transcript?.status === (metadata.hasAudio ? 'not-needed-no-speech' : 'not-present'),
    'Resolve transcript coverage explicitly; do not silently skip audio.');
  invariant(Array.isArray(analysis.findings?.mechanisms) && analysis.findings.mechanisms.length > 0,
    'Record observed craft mechanisms.');
  analysis.findings.mechanisms.forEach(value => assertText(value, 'craft mechanism'));
  invariant(Array.isArray(analysis.findings.uncertainties) && Array.isArray(analysis.findings.denseReviewNeeded) &&
    analysis.findings.denseReviewNeeded.length === 0,
  'Resolve dense-review requests before validation; preserve uncertainties separately.');
  return {valid: true, jobId: manifest.jobId, sourceSha256: sha256,
    analysisFingerprint: fingerprint(analysis), statement: 'Structure and human attestations validated; no automated perceptual proof.',
    generationApproved: false};
}

export async function loadReference(root, workspace) {
  const directory = workspacePath(root, workspace);
  const manifest = json(privateFile(directory, 'manifest.json'));
  invariant(manifest.source?.path === 'source.mp4' && manifest.playback?.path === 'source.mp4',
    'Manifest source/playback paths must be the private exact source.');
  invariant(await hashFile(privateFile(directory, manifest.source.path)) === manifest.source.sha256,
    'Source hash changed; existing reviews are invalid.');
  if (manifest.transcript) {
    invariant(manifest.transcript.path === 'user-transcript.txt' &&
      await hashFile(privateFile(directory, manifest.transcript.path)) === manifest.transcript.sha256,
    'Transcript hash changed; existing transcript review is invalid.');
  }
  return {directory, manifest};
}

export async function reviewWorkspace(root, workspace, analysisName = 'analysis.json') {
  const {directory, manifest} = await loadReference(root, workspace);
  const analysis = json(privateFile(directory, analysisName));
  const report = validateReview(analysis, manifest);
  if (manifest.transcript) {
    const supplied = readFileSync(privateFile(directory, manifest.transcript.path), 'utf8');
    for (const shot of analysis.timeline) {
      if (['spoken', 'sung', 'mixed'].includes(shot.audio.speech.status)) {
        invariant(supplied.includes(shot.audio.speech.transcript.text),
          `${shot.id}: quoted words must occur in the supplied transcript asset.`);
      }
    }
  }
  return {directory, manifest, analysis, report};
}

export function validateFeedback(feedback, sourceSha256) {
  invariant(feedback?.schemaVersion === 1 && feedback.sourceSha256 === sourceSha256 &&
    feedback.decision === 'adapt', 'Actual structured feedback must match this source and explicitly request adaptation.');
  assertText(feedback.reviewer, 'feedback author');
  invariant(typeof feedback.providedAt === 'string' && Number.isFinite(Date.parse(feedback.providedAt)),
    'Feedback timestamp required.');
  for (const key of ['goals', 'keepMechanisms', 'changeRequests', 'avoid']) {
    invariant(Array.isArray(feedback[key]) && (key === 'avoid' || feedback[key].length > 0),
      `Real feedback ${key} array required.`);
    feedback[key].forEach(value => assertText(value, `feedback ${key}`));
  }
  const constraints = feedback.constraints;
  invariant(finite(constraints?.seconds) && constraints.seconds >= 3 && constraints.seconds <= 60 &&
    Number.isInteger(constraints.maximumShots) && constraints.maximumShots >= 1 && constraints.maximumShots <= 6,
  'Feedback must set 3-60 target seconds and 1-6 maximum shots.');
  assertText(constraints.dialogue, 'dialogue constraint');
  const direction = feedback.originalDirection;
  invariant(direction?.isOriginal === true, 'Supply a genuinely original direction, not a copied reference screenplay.');
  for (const key of ['premise', 'setting', 'visualStyle', 'audioDirection']) assertText(direction[key], `original ${key}`);
  invariant(Array.isArray(direction.characters) && direction.characters.length > 0, 'Original identity descriptions required.');
  direction.characters.forEach(value => assertText(value, 'original character'));
  invariant(Array.isArray(direction.beats) && direction.beats.length > 0 &&
    direction.beats.length <= constraints.maximumShots, 'Provide original beats within the chosen shot cap.');
  direction.beats.forEach(value => assertText(value, 'original beat'));
  return true;
}

export function buildRemakeBrief(analysis, manifest, feedback) {
  const validation = validateReview(analysis, manifest);
  validateFeedback(feedback, manifest.source.sha256);
  const direction = feedback.originalDirection, seconds = feedback.constraints.seconds;
  const count = direction.beats.length;
  return {schemaVersion: 1, kind: 'original-adaptation-planning-handoff', status: 'draft-needs-creative-review',
    jobId: manifest.jobId, briefId: randomUUID(),
    sourceSha256: manifest.source.sha256, analysisFingerprint: validation.analysisFingerprint,
    feedbackFingerprint: fingerprint(feedback), feedback: structuredClone(feedback),
    rightsPolicy: {mode: 'learn-mechanisms-only',
      sourceRights: structuredClone(analysis.rights),
      mustNotCopy: ['protected screenplay/dialogue', 'distinctive reference frame sequence',
        'reference characters or performer identity', 'cloned voices', 'source recording or song'],
      downstreamClearanceRequired: true},
    blueprint: {premise: direction.premise, setting: direction.setting, originalBeats: direction.beats,
      retainedCraftMechanisms: feedback.keepMechanisms, changeRequests: feedback.changeRequests,
      avoid: feedback.avoid, constraints: structuredClone(feedback.constraints),
      identityAndStyle: {originalCharacters: direction.characters, visualStyle: direction.visualStyle,
        next: 'Create a new identity/prop bible and blocking map; do not upload source identities.'}},
    novelAlternatives: [
      {label: 'Continuous discovery', proposal: 'Stage the ORIGINAL beats as one continuous reveal through blocking/focus, not the reference cuts.',
        tradeoff: 'Stronger geography but harder timing/contact; test readable silent causality.'},
      {label: 'Consequence-first variation', proposal: 'For the ORIGINAL premise, propose a new consequence-first question and a different revealed cause; do not reverse-copy the source sequence.',
        tradeoff: 'Potential curiosity vs confusion; rewrite and test before selection.'},
    ],
    qualityHypotheses: feedback.goals.map(goal => ({goal, status: 'untested-editorial-hypothesis',
      test: 'Compare original animatic alternatives with cold viewers; ask what happened before suggesting a feeling.',
      successCriterion: 'Agree a measurable comprehension/pacing criterion and denominator before testing.',
      claim: 'No guaranteed improvement, reach, retention or emotional response.'})),
    shots: direction.beats.map((beat, i) => ({
      id: `original-${i + 1}`, start: seconds * i / count, end: seconds * (i + 1) / count,
      action: beat, keyframe: {description: `${direction.setting}. ${direction.characters.join('; ')}. ${beat}`,
        status: 'planning-only-not-generated', next: 'Choose literal initial/final states and a new composition.'},
      camera: {intent: 'Propose one framing/focus/movement intention for this original beat.',
        exactGear: 'Unspecified; no exact lens inferred from reference pixels.'},
      motion: {primaryAction: beat, next: 'Define contact points, eyelines, screen side and invariant identities.'},
      lighting: {status: 'pending-original-design',
        next: 'Choose motivated key/fill, exposure priority, caster/receiver, contact shadows and temporal invariants.'},
      pacing: {status: 'provisional-equal-beat-allocation',
        next: 'Test hook, information progression, reveal exposure and reaction hold; revise timing after animatic.'},
      audio: {direction: direction.audioDirection, rightsStatus: 'uncleared-new-assets-required',
        next: 'Plan synchronized foley/ambience and separately cleared music or silence. No ASR/music API assumed.'},
    })),
    handoff: {required: ['original script/storyboard review', 'identity and blocking bible',
      'motivated lighting/shadow map', 'keyframe side-by-side approval', 'beat/reveal/reaction timing',
      'current model forms and exact quote', 'audio cue sheet and rights', 'actual motion/audio/phone review'],
      jobBoundary: 'No provider jobs submitted. Preserve this jobId, briefId, source and feedback fingerprints in downstream manifests.',
      approvalsInvalidatedBy: 'Any changed source, analysis, feedback, prompts or assets requires affected reviews/approvals again.'},
    approvals: {...manifest.approvals}, generationApproved: false, referenceUploadsApproved: false,
    productionJobs: [], publicationApproved: false};
}

export async function expandReference(root, options) {
  const {directory, manifest} = await loadReference(root, options.workspace);
  const sampling = sampleTimes(manifest.source.metadata.seconds, options.interval ?? 0.25,
    options.maxFrames ?? 80, options.start, options.end);
  await runFFmpeg(options.ffmpeg, ['-version']);
  const expansion = join(directory, `expansion-${randomUUID()}`);
  mkdirSync(expansion);
  const frames = await extractSamples(expansion, join(directory, 'source.mp4'),
    manifest.source.metadata, sampling, options.ffmpeg);
  writeJson(join(expansion, 'sampling.json'), {sourceSha256: manifest.source.sha256, sampling, frames,
    note: 'Dense stills remain insufficient for full-motion/listening review. Original manifest is unchanged.'});
  return {directory: expansion, frames: frames.length, generationApproved: false};
}

export async function writeRemakeBrief(root, workspace, feedbackPath, analysisName, outputName) {
  const {directory, analysis, manifest} = await reviewWorkspace(root, workspace, analysisName);
  const brief = buildRemakeBrief(analysis, manifest, json(feedbackPath));
  const output = privateFile(directory, outputName ?? `remake-brief-${randomUUID()}.json`);
  invariant(!existsSync(output), 'Brief output exists; choose a new filename.');
  writeJson(output, brief);
  return {output, jobId: brief.jobId, generationApproved: false, status: brief.status};
}
