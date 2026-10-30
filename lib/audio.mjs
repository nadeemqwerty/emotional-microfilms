import {existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileHash, inside, invariant} from './workflow.mjs';

export function audioArgs(root, cue) {
  invariant(cue.schemaVersion === 1, 'Use a version-1 audio preparation cue.');
  const source = inside(root, cue.source);
  invariant(fileHash(source) === cue.sourceSha256, 'Audio source hash changed.');
  invariant(cue.rights?.status === 'cleared' && cue.rights.evidence?.trim() &&
    cue.rights.scope?.trim(), 'Record actual recording/composition/voice rights and intended-use scope.');
  invariant(cue.phraseBoundariesVerified === true,
    'Verify complete phrase boundaries; this tool cannot hear words or repair singing.');
  invariant(Number.isFinite(cue.in) && Number.isFinite(cue.out) &&
    cue.in >= 0 && cue.out > cue.in && cue.out - cue.in <= 60, 'Use a bounded excerpt up to 60 seconds.');
  invariant(Number.isFinite(cue.tempo) && cue.tempo >= 0.8 && cue.tempo <= 1.25,
    'Supported pitch-preserving tempo is 0.8-1.25; reject impossible phrase fits.');
  const seconds = (cue.out - cue.in) / cue.tempo;
  invariant(seconds <= 30, 'Prepared cue must be at most 30 seconds.');
  for (const fade of [cue.fadeIn, cue.fadeOut]) {
    invariant(Number.isFinite(fade) && fade >= 0 && fade <= seconds / 2,
      'Fades must be nonnegative and at most half the prepared cue.');
  }
  const gain = cue.gain ?? 1;
  invariant(Number.isFinite(gain) && gain >= 0 && gain <= 1, 'Audio gain must be 0-1.');
  invariant(typeof cue.output === 'string' && /^outputs[/\\].+\.wav$/i.test(cue.output),
    'Write a WAV under outputs only.');
  const output = inside(resolve(root, 'outputs'), cue.output.replaceAll('\\', '/').slice(8));
  invariant(!existsSync(output) && !existsSync(`${output}.receipt.json`),
    'Audio output/receipt exists; never overwrite accepted media.');
  const filters = [
    `atrim=start=${cue.in}:end=${cue.out}`, 'asetpts=PTS-STARTPTS',
    `atempo=${cue.tempo}`, 'aresample=48000', `volume=${gain}`,
    `afade=t=in:st=0:d=${cue.fadeIn}`,
    `afade=t=out:st=${seconds - cue.fadeOut}:d=${cue.fadeOut}`,
    'alimiter=limit=0.891251:level=false:latency=true',
  ];
  return {source, output, seconds, args: ['-hide_banner', '-nostdin', '-n', '-i', source,
    '-map', '0:a:0', '-vn', '-af', filters.join(','), '-t', String(seconds),
    '-ar', '48000', '-ac', '2', '-c:a', 'pcm_s16le', output]};
}

export function audioPeak(stderr) {
  const match = /max_volume:\s*(-inf|-?\d+(?:\.\d+)?) dB/.exec(stderr);
  invariant(match, 'Cannot establish prepared audio peak.');
  return match[1] === '-inf' ? -Infinity : Number(match[1]);
}
