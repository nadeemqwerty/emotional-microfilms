import {constants, copyFileSync, existsSync, mkdirSync, writeFileSync} from 'node:fs';
import {basename, dirname, join, relative, resolve} from 'node:path';
import {fileHash, fingerprint, inside, invariant, validateDirection, validatePacket} from './workflow.mjs';

function validateIdentity(topic, version) {
  invariant(typeof topic === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(topic), 'Use a topic slug.');
  invariant(typeof version === 'string' && /^v\d{3,15}$/.test(version) &&
    Number(version.slice(1)) > 0, 'Use a positive version such as v001.');
}

export function deliveryPath(topic, version, variant = 'review') {
  validateIdentity(topic, version);
  invariant(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(variant), 'Use a delivery variant slug.');
  return join('outputs', topic, version, 'finalVid', `${topic}-${version}-${variant}.mp4`);
}

export function validateDeliveryPath(root, path, topic) {
  invariant(typeof path === 'string' && /^outputs[/\\]/.test(path), 'Write an MP4 inside outputs only.');
  const normalized = path.replaceAll('\\', '/');
  const output = inside(resolve(root, 'outputs'), normalized.slice('outputs/'.length));
  const parts = normalized.split('/');
  validateIdentity(topic, parts[2]);
  invariant(parts.length === 5 && parts[1] === topic && parts[3] === 'finalVid' &&
    new RegExp(`^${topic}-${parts[2]}-[a-z0-9]+(?:-[a-z0-9]+)*\\.mp4$`).test(parts[4]),
  'Use outputs/<topic>/vNNN/finalVid/<topic>-vNNN-<variant>.mp4.');
  return output;
}

export function productionScripts(packet) {
  validateDirection(packet);
  const timing = packet.shots.map(({id, start, end, startFrameId, endFrameId}) =>
    ({id, start, end, startFrameId, endFrameId}));
  const header = {schemaVersion: 1, topic: packet.scenarioId, seconds: packet.seconds,
    packetFingerprint: fingerprint(packet), status: 'Planning instructions, not proof of generated-media acceptance.'};
  const script = content => ({...header, ...content});
  return {
    story: script({intendedInterpretation: packet.intendedInterpretation, pacing: packet.pacing}),
    'character-emotion': script({identityBible: packet.identityBible, characterPlan: packet.characterPlan,
      beats: packet.direction.beats}),
    scene: script({timing, continuity: packet.continuity, hook: packet.hookPlan, changes: packet.sceneChanges}),
    'frame-plan': script({timing, keyframes: packet.keyframes}),
    motion: script({shots: packet.shots, singlePassAlternative: packet.singlePassPrompt}),
    lighting: script({timing, lightingPlan: packet.lightingPlan, sceneChanges: packet.sceneChanges}),
    'camera-edit': script({shots: packet.shots, pacing: packet.pacing, transitions: packet.sceneChanges}),
    'audio-music': script({soundPlan: packet.soundPlan, palette: packet.direction.soundPalette,
      beats: packet.direction.beats.map(({shotId, from, to, audioRole, intensity}) =>
        ({shotId, from, to, audioRole, intensity}))}),
    'atmosphere-effects': script({atmospherePlan: packet.atmospherePlan, lightingPlan: packet.lightingPlan}),
    delivery: script({aspectRatio: packet.aspectRatio, reviewChecks: packet.reviewChecks,
      retryPlan: packet.retryPlan, requiredReviews: ['audio-scene-fit', 'entertainment-wow-enjoyment',
        'phone-and-export', 'final-user'], publicationApproved: false}),
  };
}

export function createProductionBundle(root, manifest, version, {packet = manifest.productionDraft,
  manifestPath} = {}) {
  const topic = manifest.scenarioId;
  validateIdentity(topic, version);
  invariant(packet?.scenarioId === topic, 'Planning packet belongs to another topic.');
  validatePacket(packet, [manifest.scenario]);
  const scripts = productionScripts(packet);
  const base = inside(root, join('outputs', topic, version));
  invariant(!existsSync(base), 'Bundle version exists; use a new version, never overwrite.');
  const copies = [];
  for (const [index, asset] of manifest.assets.entries()) {
    const folder = {character: join('frames', 'characters'), keyframe: join('frames', 'scenes'),
      effect: join('frames', 'effects'), video: 'tmpVids', audio: 'audio'}[asset.kind];
    if (!folder) continue;
    copies.push({...asset, destination: join(folder,
      `${String(index + 1).padStart(3, '0')}-${basename(asset.path)}`)});
  }
  const preview = manifest.previews?.at(-1) ??
    (manifest.stage === 'final-approved' ? manifest.assets.findLast(asset => asset.kind === 'final') : null);
  if (preview) {
    invariant(preview.seconds === undefined || preview.seconds === packet.seconds,
      'Delivery duration differs from the planning packet; do not attach unrelated media.');
    copies.push({path: preview.path, sha256: preview.sha256, kind: 'review-delivery',
      destination: relative(base, inside(root, deliveryPath(topic, version)))});
  }
  for (const asset of copies) {
    invariant(fileHash(inside(root, asset.path)) === asset.sha256, `Source hash mismatch: ${asset.path}`);
  }
  const sourceManifestSha256 = manifestPath ? fileHash(inside(root, manifestPath)) : fingerprint(manifest);
  mkdirSync(dirname(base), {recursive: true});
  mkdirSync(base);
  for (const folder of ['scripts', 'frames', 'metadata', 'tmpVids', 'audio', 'finalVid', 'reviews']) {
    mkdirSync(join(base, folder));
  }
  const files = [];
  const json = (path, value) => {
    const target = inside(base, path);
    writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`, {flag: 'wx'});
    files.push({path, sha256: fileHash(target)});
  };
  for (const [name, content] of Object.entries(scripts)) json(join('scripts', `${name}.json`), content);
  json(join('metadata', 'planning-packet.json'), packet);
  json(join('metadata', 'produced-packet.json'), manifest.productionDraft);
  json(join('reviews', 'source-reviews.json'), {
    status: 'Historical source records; this snapshot grants no approval.',
    records: manifest.reviews.map(({area, result, evidence, at, report}) => ({area, result, evidence, at, report})),
  });
  const assets = [];
  for (const asset of copies) {
    const target = inside(base, asset.destination);
    mkdirSync(dirname(target), {recursive: true});
    copyFileSync(inside(root, asset.path), target, constants.COPYFILE_EXCL);
    invariant(fileHash(target) === asset.sha256, `Copied asset hash mismatch: ${asset.path}`);
    assets.push({source: asset.path, path: asset.destination, sha256: asset.sha256, kind: asset.kind,
      ...(asset.keyframeId ? {keyframeId: asset.keyframeId} : {}),
      ...(asset.characterId ? {characterId: asset.characterId} : {})});
  }
  const receipt = {schemaVersion: 1, topic, version, createdAt: new Date().toISOString(),
    sourceManifestSha256, sourceProductionFingerprint: manifest.productionFingerprint,
    planningPacketFingerprint: fingerprint(packet),
    planningPacketChanged: fingerprint(packet) !== fingerprint(manifest.productionDraft),
    status: 'Review/planning bundle; finalVid is a candidate folder, not final approval.',
    sourceStage: manifest.stage, finalUserApproval: false, publicationApproval: null,
    legacyDeliveriesRetainedAtSource: manifest.assets.filter(asset => asset.kind === 'final')
      .map(({path, sha256}) => ({path, sha256})),
    files: [...files], assets,
    limitations: ['Source files retained; no paid generation, encoding, upload or deletion.',
      'New planning instructions do not retroactively describe how existing media was generated.',
      'Copies and historical reviews do not grant current sound, entertainment or personal approval.']};
  json(join('metadata', 'bundle.json'), {...receipt, files: [...files]});
  return {path: base, receipt};
}
