import {createHash} from 'node:crypto';
import {readFileSync, statSync} from 'node:fs';
import {isAbsolute, resolve, relative, sep} from 'node:path';

export const STAGES = [
  'concept', 'selected', 'preproduction', 'characters-approved', 'keyframes-approved', 'design-locked',
  'motion-approved', 'sound-approved', 'final-approved', 'published',
];

export const REVIEW_AREAS = [
  'silent-comprehension', 'intended-payoff', 'continuity',
  'pacing-hook-reveal-hold', 'lighting-shadow-continuity', 'motion-contact', 'audio-rights-and-mix',
  'opening-hook', 'atmosphere-effects', 'research-claims', 'phone-and-export',
  'entertainment-wow-enjoyment', 'audio-scene-fit',
];

export const ACCEPTANCE_AREAS = ['characters', 'keyframes', 'design'];
export const ENTERTAINMENT_DIMENSIONS = ['wow-freshness', 'enjoyment', 'anticipation',
  'earned-payoff', 'pacing-boredom', 'replay-appeal'];
export const AUDIO_FIT_DIMENSIONS = ['emotional-congruence', 'perceived-weight',
  'timbre-register', 'rhythm-space', 'sync-perspective', 'mix-hierarchy', 'ending-continuity'];

export function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

export function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

export function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map(key =>
      `${JSON.stringify(key)}:${stableJson(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

export function fingerprint(value) {
  return createHash('sha256').update(stableJson(value)).digest('hex');
}

export function fileHash(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

export function inside(root, path) {
  invariant(typeof path === 'string' && path.length > 0, 'A relative project path is required.');
  invariant(!isAbsolute(path) && !/^[A-Za-z]:|^[/\\]/.test(path),
    'Absolute paths are not allowed in project manifests.');
  const target = resolve(root, path);
  const rel = relative(resolve(root), target);
  invariant(rel !== '..' && !rel.startsWith(`..${sep}`) && !isAbsolute(rel),
    `Path escapes project: ${path}`);
  return target;
}

export function validateRubric(rubric) {
  invariant(rubric.schemaVersion === 1 && Array.isArray(rubric.criteria), 'Unsupported rubric.');
  invariant(rubric.criteria.reduce((sum, item) => sum + item.weight, 0) === 100,
    'Rubric weights must total 100.');
  const ids = rubric.criteria.map(item => item.id);
  invariant(new Set(ids).size === ids.length, 'Duplicate rubric criterion.');
  for (const item of rubric.criteria) {
    invariant(Number.isFinite(item.weight) && item.weight > 0, 'Invalid rubric weight.');
    invariant(item.one && item.three && item.five, `Missing score anchors: ${item.id}`);
  }
}

export function validateScenario(scenario, rubric, brief) {
  invariant(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(scenario.id), 'Invalid scenario ID.');
  for (const key of ['title', 'theme', 'domain', 'relationship', 'logline', 'setup', 'turn',
    'landing', 'feasibilityNote', 'scoreRationale']) {
    invariant(typeof scenario[key] === 'string' && scenario[key].trim().length > 0,
      `${scenario.id}: missing ${key}.`);
  }
  invariant(scenario.seconds >= brief.format.minimumSeconds &&
    scenario.seconds <= brief.format.maximumSeconds, `${scenario.id}: duration outside brief.`);
  invariant(Number.isInteger(scenario.shots) && scenario.shots >= 1 &&
    scenario.shots <= brief.defaults.maximumShots, `${scenario.id}: invalid shot count.`);
  invariant(Array.isArray(scenario.risks), `${scenario.id}: risks must be an array.`);
  invariant(Array.isArray(scenario.failedGates), `${scenario.id}: failed gates must be explicit.`);
  invariant(scenario.failedGates.every(gate => rubric.hardGates.includes(gate)),
    `${scenario.id}: unknown hard gate.`);
  invariant(Object.keys(scenario.scores).length === rubric.criteria.length,
    `${scenario.id}: incorrect score criteria.`);
  for (const {id} of rubric.criteria) {
    invariant(Number.isInteger(scenario.scores[id]) && scenario.scores[id] >= 1 &&
      scenario.scores[id] <= 5, `${scenario.id}: ${id} must be an integer from 1 to 5.`);
  }
  invariant(['visual-first', 'text-led'].includes(scenario.comprehensionMode ?? 'visual-first'),
    'Unknown comprehension format.');
  if (scenario.comprehensionMode === 'text-led') validateTextPlan(scenario.textPlan);
}

export function editorialScore(scenario, rubric) {
  return Math.round(rubric.criteria.reduce((total, item) =>
    total + scenario.scores[item.id] / 5 * item.weight, 0) * 10) / 10;
}

export function validateFeedback(feedback, scenarios) {
  invariant(feedback.schemaVersion === 1 && Array.isArray(feedback.reviews), 'Invalid feedback file.');
  const ids = new Set(scenarios.map(item => item.id));
  const seen = new Set();
  for (const item of feedback.reviews) {
    invariant(ids.has(item.scenarioId), `Unknown feedback scenario: ${item.scenarioId}`);
    invariant(!seen.has(item.scenarioId), `Duplicate feedback: ${item.scenarioId}`);
    seen.add(item.scenarioId);
    invariant(item.rating === null || (Number.isInteger(item.rating) &&
      item.rating >= 1 && item.rating <= 5), 'User rating must be null (unrated) or an integer from 1 to 5.');
    invariant(['shortlist', 'select', 'reject', 'rewrite'].includes(item.decision),
      'Invalid user decision.');
    invariant(typeof item.note === 'string', 'Feedback note must be a string.');
    invariant(Number.isFinite(Date.parse(item.at)), 'Feedback timestamp is required.');
  }
}

export function rankScenarios(scenarios, rubric, feedback = {schemaVersion: 1, reviews: []}) {
  validateRubric(rubric);
  validateFeedback(feedback, scenarios);
  const byId = new Map(feedback.reviews.map(item => [item.scenarioId, item]));
  return scenarios.map(item => ({
    id: item.id, title: item.title, theme: item.theme, domain: item.domain,
    lane: item.lane ?? 'emotion-led',
    editorialScore: editorialScore(item, rubric),
    eligible: item.failedGates.length === 0,
    failedGates: item.failedGates,
    userRating: byId.get(item.id)?.rating ?? null,
    userDecision: byId.get(item.id)?.decision ?? 'unreviewed',
  })).sort((a, b) => Number(b.eligible) - Number(a.eligible) ||
    b.editorialScore - a.editorialScore || a.id.localeCompare(b.id));
}

export function diverseShortlist(scenarios, rubric, feedback, count = 6) {
  invariant(Number.isInteger(count) && count > 0, 'Shortlist count must be positive.');
  const ranked = rankScenarios(scenarios, rubric, feedback).filter(item =>
    item.eligible && !['reject', 'rewrite'].includes(item.userDecision));
  const groups = new Map();
  for (const item of ranked) {
    if (!groups.has(item.lane)) groups.set(item.lane, []);
    groups.get(item.lane).push(item);
  }
  const result = [];
  while (result.length < count) {
    let added = false;
    for (const group of groups.values()) {
      if (group.length > 0 && result.length < count) {
        result.push(group.shift());
        added = true;
      }
    }
    if (!added) break;
  }
  return result;
}

export function discountedCredits(unitCredits, quantity, discountPercent = 0) {
  invariant(Number.isInteger(unitCredits) && unitCredits >= 0, 'Invalid unit credits.');
  invariant(Number.isInteger(quantity) && quantity > 0, 'Invalid quantity.');
  invariant(Number.isFinite(discountPercent) && discountPercent >= 0 &&
    discountPercent <= 100, 'Invalid discount.');
  return Math.floor(unitCredits * (100 - discountPercent) / 100 + 0.5) * quantity;
}

export function estimatePlan(lines, quotes) {
  invariant(Array.isArray(lines) && lines.length > 0, 'At least one budget line is required.');
  return lines.reduce((total, line) => {
    const quote = quotes.find(item => item.id === line.quoteId);
    invariant(quote, `Unknown quote: ${line.quoteId}`);
    invariant(Number.isInteger(line.jobs) && line.jobs > 0, 'Invalid job count.');
    return total + discountedCredits(quote.unitCredits, quote.quantity,
      quote.discountPercent) * line.jobs;
  }, 0);
}

export function validateTimeline(shots, seconds) {
  invariant(Array.isArray(shots) && shots.length > 0, 'Storyboard shots are required.');
  let end = 0;
  const ids = new Set();
  for (const shot of shots) {
    invariant(typeof shot.id === 'string' && !ids.has(shot.id), 'Duplicate/missing shot ID.');
    ids.add(shot.id);
    invariant(Number.isFinite(shot.start) && Number.isFinite(shot.end) &&
      shot.start === end && shot.end > shot.start, `${shot.id}: timeline has a gap or overlap.`);
    invariant(typeof shot.prompt === 'string' && shot.prompt.trim(), `${shot.id}: motion prompt required.`);
    invariant(shot.startFrameId && shot.endFrameId, `${shot.id}: keyframe endpoints required.`);
    end = shot.end;
  }
  invariant(end === seconds, 'Shot timeline must cover the exact film duration.');
}

export function validatePacket(packet, scenarios) {
  invariant(packet?.schemaVersion === 1, 'Unsupported or missing production packet.');
  const scenario = scenarios.find(item => item.id === packet.scenarioId);
  invariant(scenario, 'Packet references unknown scenario.');
  invariant(packet.aspectRatio === '9:16' && packet.seconds >= 8 && packet.seconds <= 15,
    'Packet format outside current scope.');
  invariant(packet.seconds === scenario.seconds, 'Packet duration differs from selected scenario.');
  invariant(packet.identityBible && !Array.isArray(packet.identityBible) &&
    Object.values(packet.identityBible).length > 0 &&
    Object.values(packet.identityBible).every(value => typeof value === 'string' && value.trim()) &&
    packet.identityBible.anchorPrompt?.trim(), 'Complete identity bible and anchor prompt required.');
  for (const key of ['geography', 'propOwnership', 'light', 'match']) {
    invariant(typeof packet.continuity?.[key] === 'string' && packet.continuity[key].trim(),
      `Continuity plan requires ${key}.`);
  }
  invariant(Array.isArray(packet.continuity.mustNotChange) &&
    packet.continuity.mustNotChange.length > 0 &&
    packet.continuity.mustNotChange.every(value => typeof value === 'string' && value.trim()) &&
    Array.isArray(packet.continuity.intentionalChanges), 'Declare continuity invariants and changes.');
  const sound = packet.soundPlan;
  invariant(['silent', 'native', 'separate'].includes(sound?.routeHypothesis),
    'Declare a valid sound route hypothesis.');
  for (const key of ['musicBrief', 'rights', 'test']) {
    invariant(typeof sound[key] === 'string' && sound[key].trim(), `Sound plan requires ${key}.`);
  }
  invariant(Array.isArray(sound.cues) && (sound.cues.length > 0 || sound.routeHypothesis === 'silent'),
    'Sound cue timeline required.');
  for (const cue of sound.cues) {
    invariant(Number.isFinite(cue.from) && Number.isFinite(cue.to) && cue.from >= 0 &&
      cue.to > cue.from && cue.to <= packet.seconds &&
      typeof cue.sound === 'string' && cue.sound.trim(), 'Invalid sound cue.');
  }
  const mode = scenario.comprehensionMode ?? 'visual-first';
  invariant((packet.comprehensionMode ?? 'visual-first') === mode,
    'Packet comprehension format differs from the selected scenario.');
  if (mode === 'text-led') validateTextPlan(packet.textPlan);
  for (const key of ['intendedInterpretation', 'retryPlan']) {
    invariant(typeof packet[key] === 'string' && packet[key].trim(), `Packet requires ${key}.`);
  }
  invariant(Array.isArray(packet.reviewChecks) && packet.reviewChecks.length > 0 &&
    packet.reviewChecks.every(value => typeof value === 'string' && value.trim()),
  'Packet review checks required.');
  invariant(Array.isArray(packet.keyframes) && packet.keyframes.length > 0,
    'Keyframe prompts are required.');
  const frameIds = new Set();
  for (const frame of packet.keyframes) {
    invariant(frame.id && !frameIds.has(frame.id), 'Duplicate/missing keyframe ID.');
    frameIds.add(frame.id);
    invariant(typeof frame.prompt === 'string' && frame.prompt.trim(), 'Full keyframe prompt required.');
  }
  validateTimeline(packet.shots, packet.seconds);
  validatePacing(packet.pacing, packet.seconds, scenario.lane ?? 'emotion-led');
  validateLightingPlan(packet.lightingPlan);
  for (const shot of packet.shots) {
    invariant(frameIds.has(shot.startFrameId) && frameIds.has(shot.endFrameId),
      `${shot.id}: keyframe reference does not exist.`);
  }
  validateVisualDevelopment(packet);
  if (packet.direction) validateDirection(packet);
  if (packet.framePlan) validateFramePlan(packet);
  invariant(packet.singlePassPrompt?.trim(), 'Single-pass video prompt is required.');
  invariant(packet.generationApproved === false, 'Example packets cannot pre-approve spending.');
}

export function validateDirection(packet) {
  const direction = packet.direction;
  const palette = direction?.soundPalette;
  for (const key of ['targetFeeling', 'texture', 'density', 'register', 'pulse',
    'foregroundPriority', 'silence', 'ending', 'comparison']) {
    invariant(typeof palette?.[key] === 'string' && palette[key].trim(),
      `Coordinated direction requires soundPalette.${key}.`);
  }
  invariant(Array.isArray(palette.avoidFeelings) && palette.avoidFeelings.length > 0 &&
    palette.avoidFeelings.every(value => typeof value === 'string' && value.trim()),
  'Declare unwanted emotional readings, not just a genre or BPM.');
  invariant(Array.isArray(direction.beats) && direction.beats.length > 0,
    'Coordinated character/emotion/audio beats required.');
  let end = 0;
  for (const beat of direction.beats) {
    const shot = packet.shots.find(item => item.id === beat.shotId);
    invariant(shot && Number.isFinite(beat.from) && Number.isFinite(beat.to) &&
      beat.from === end && beat.to > beat.from && beat.from >= shot.start && beat.to <= shot.end,
    'Direction beats must cover every shot without gaps, overlap or crossing shot boundaries.');
    for (const key of ['characterIntent', 'visibleEmotion', 'performanceRestraint', 'audioRole']) {
      invariant(typeof beat[key] === 'string' && beat[key].trim(), `Direction beat requires ${key}.`);
    }
    invariant(['low', 'medium', 'high'].includes(beat.intensity), 'Declare intended intensity per beat.');
    end = beat.to;
  }
  invariant(end === packet.seconds, 'Direction beats must cover the exact film duration.');
}

export function deliveryFrame(seconds, fps) {
  invariant(Number.isFinite(seconds) && seconds >= 0 &&
    Number.isInteger(fps) && fps >= 10 && fps <= 60, 'Invalid delivery-frame conversion.');
  return Math.round(seconds * fps);
}

export const CAMERA_MOVES = {
  locked: ['none'], pan: ['left', 'right'], tilt: ['up', 'down'],
  dolly: ['in', 'out'], truck: ['left', 'right'], pedestal: ['up', 'down'],
  orbit: ['clockwise', 'counterclockwise'], crane: ['up', 'down'],
  handheld: ['follow'], gimbal: ['follow', 'in', 'out', 'left', 'right'],
};

function directionText(value, label) {
  invariant(typeof value === 'string' && value.trim(), `Direction requires ${label}.`);
}

export function cameraInstruction(packet, shotId) {
  const shot = packet.shots.find(item => item.id === shotId);
  const camera = packet.cameraPlan.shots.find(item => item.shotId === shotId);
  return 'Camera direction: ' + camera.segments.map(segment =>
    `${segment.from - shot.start}-${segment.to - shot.start}s ${segment.move} ${segment.direction}, ` +
    `${segment.speed}, ${segment.easing}; zoom ${segment.zoom.mode} ${segment.zoom.from} to ${segment.zoom.to}; ` +
    `focus ${segment.focus.mode} from ${segment.focus.from} to ${segment.focus.to}; anchor ${segment.subjectAnchor}`
  ).join('. ') + '.';
}

export function dialogueInstruction(packet, shotId) {
  const shot = packet.shots.find(item => item.id === shotId);
  const lines = packet.dialoguePlan.lines.filter(line => line.shotId === shotId);
  if (!lines.length) return 'Dialogue direction: no intelligible speech in this shot.';
  return 'Dialogue direction: ' + lines.map(line => {
    const voice = packet.dialoguePlan.voices.find(item => item.identityId === line.speakerId);
    return `${line.from - shot.start}-${line.to - shot.start}s ${line.speakerId} says in ${voice.language}: ` +
      `${JSON.stringify(line.text)}; ${line.emotion}; ${line.delivery}; ${line.pace}; ${line.pauses}`;
  }).join('. ') + '. No extra words or speakers.';
}

export function validateCameraPlan(packet) {
  const plan = packet.cameraPlan;
  invariant(plan?.schemaVersion === 1 && Array.isArray(plan.shots) &&
    plan.shots.length === packet.shots.length &&
    new Set(plan.shots.map(item => item.shotId)).size === packet.shots.length,
  'Complete cameraPlan required before creation.');
  for (const camera of plan.shots) {
    const shot = packet.shots.find(item => item.id === camera.shotId);
    invariant(shot, 'Camera references an unknown shot.');
    for (const key of ['purpose', 'axis', 'height', 'angle', 'lensIntent', 'controlMapping', 'fallback']) {
      directionText(camera[key], `camera.${key}`);
    }
    invariant(['in-generation', 'post'].includes(camera.executionRoute), 'Unknown camera execution route.');
    for (const key of ['acceptance', 'forbiddenArtifacts']) {
      invariant(Array.isArray(camera[key]) && camera[key].length, `Camera requires ${key}.`);
      camera[key].forEach(value => directionText(value, `camera.${key}`));
    }
    invariant(Array.isArray(camera.segments) && camera.segments.length, 'Timed camera segments required.');
    let end = shot.start;
    const ids = new Set();
    for (const segment of camera.segments) {
      directionText(segment.id, 'camera segment ID');
      invariant(!ids.has(segment.id), 'Duplicate camera segment ID.');
      ids.add(segment.id);
      invariant(segment.from === end && segment.to > segment.from && segment.to <= shot.end,
        'Camera segments must cover their actual shot without gaps or overlap.');
      frameWindow(packet, segment.from, segment.to);
      invariant(Object.hasOwn(CAMERA_MOVES, segment.move) &&
        CAMERA_MOVES[segment.move].includes(segment.direction), 'Invalid camera move/direction.');
      invariant(['still', 'slow', 'moderate', 'fast'].includes(segment.speed) &&
        (segment.speed === 'still') === (segment.move === 'locked') &&
        ['none', 'linear', 'ease-in', 'ease-out', 'ease-in-out'].includes(segment.easing),
      'Camera speed/easing contradicts its physical movement.');
      for (const key of ['startFraming', 'endFraming', 'subjectAnchor', 'motivation']) {
        directionText(segment[key], `camera segment.${key}`);
      }
      const zoom = segment.zoom;
      invariant(['none', 'optical', 'digital'].includes(zoom?.mode) &&
        Number.isFinite(zoom.from) && Number.isFinite(zoom.to) && zoom.from > 0 && zoom.to > 0 &&
        (zoom.mode !== 'none' || (zoom.from === 1 && zoom.to === 1)) &&
        (zoom.mode !== 'digital' || (zoom.from >= 1 && zoom.to >= 1)),
      'Invalid camera zoom; optical zoom, dolly and digital crop are distinct.');
      const focus = segment.focus;
      invariant(['fixed', 'tracking', 'rack'].includes(focus?.mode), 'Declare camera focus mode.');
      directionText(focus.from, 'camera focus.from');
      directionText(focus.to, 'camera focus.to');
      invariant(focus.mode !== 'fixed' || focus.from === focus.to, 'Fixed focus cannot change target.');
      invariant(focus.mode !== 'rack' || focus.from !== focus.to, 'Rack focus needs different targets.');
      const translated = ['dolly', 'truck', 'pedestal', 'orbit', 'crane', 'gimbal', 'handheld'].includes(segment.move);
      invariant(segment.parallax === (translated ? 'expected' : 'none'), 'Camera parallax contradicts movement.');
      if (translated && zoom.mode !== 'none') directionText(segment.compoundIntent, 'deliberate compound move');
      if (camera.executionRoute === 'post') invariant(
        ['locked', 'pan', 'tilt'].includes(segment.move) && zoom.mode !== 'optical' && focus.mode === 'fixed',
      'A post crop cannot create physical dolly/parallax, optical zoom or rack focus.');
      end = segment.to;
    }
    invariant(end === shot.end, 'Camera plan omits the end of its shot.');
    if (camera.executionRoute === 'in-generation') invariant(shot.prompt.includes(cameraInstruction(packet, shot.id)),
      'Motion prompt must contain the canonical camera instruction.');
  }
  return true;
}

export function validateDialoguePlan(packet) {
  const plan = packet.dialoguePlan;
  invariant(plan?.schemaVersion === 1 && ['none', 'spoken'].includes(plan.mode) &&
    Array.isArray(plan.voices) && Array.isArray(plan.lines), 'Complete dialoguePlan required before creation.');
  directionText(plan.rationale, 'dialogue rationale');
  if (plan.mode === 'none') {
    invariant(plan.route === 'none' && !plan.lines.length && !plan.voices.length,
      'Dialogue-free plan cannot contain voices or lines.');
    return true;
  }
  invariant(['native', 'separate'].includes(plan.route) && plan.lines.length > 0,
    'Spoken dialogue requires a real native or separate voice route.');
  invariant(packet.soundPlan.routeHypothesis === plan.route,
    'Dialogue voice route contradicts the canonical sound plan.');
  invariant(new Set(plan.voices.map(voice => voice.identityId)).size === plan.voices.length,
    'Duplicate dialogue voice identity.');
  for (const voice of plan.voices) {
    invariant(packet.characterPlan.requiredIdentities.includes(voice.identityId), 'Unknown dialogue voice identity.');
    for (const key of ['language', 'characterVoice', 'rights', 'avoid']) directionText(voice[key], `voice.${key}`);
  }
  const ids = new Set();
  for (const line of plan.lines) {
    directionText(line.id, 'dialogue line ID');
    invariant(!ids.has(line.id), 'Duplicate dialogue line ID.');
    ids.add(line.id);
    const shot = packet.shots.find(item => item.id === line.shotId);
    invariant(shot && line.from >= shot.start && line.to <= shot.end &&
      plan.voices.some(voice => voice.identityId === line.speakerId), 'Unknown or mistimed dialogue speaker/shot.');
    frameWindow(packet, line.from, line.to);
    for (const key of ['text', 'emotion', 'intent', 'subtext', 'delivery', 'pace', 'pauses',
      'breath', 'pronunciation', 'performance']) directionText(line[key], `dialogue.${key}`);
    invariant(['low', 'medium', 'high'].includes(line.intensity) &&
      ['visible', 'offscreen'].includes(line.lipSync) && typeof line.overlapAllowed === 'boolean',
    'Declare dialogue intensity, lip-sync and overlap policy.');
    const bounds = frameWindow(packet, line.from, line.to);
    const intervals = packet.framePlan.intervals.filter(interval =>
      interval.fromFrame < bounds.toFrame && interval.toFrame > bounds.fromFrame);
    invariant(intervals.length && intervals.every(interval => interval.characters.some(character =>
      character.identityId === line.speakerId && character.visibility === line.lipSync)),
    'Dialogue visibility/lip-sync contradicts the actual frame performance.');
    for (const other of plan.lines.filter(other => other !== line &&
      other.from < line.to && other.to > line.from)) {
      invariant(line.speakerId !== other.speakerId && line.overlapAllowed && other.overlapAllowed,
        'Unplanned dialogue overlap or simultaneous lines for one voice.');
    }
  }
  if (plan.route === 'native') for (const shot of packet.shots.filter(shot =>
    plan.lines.some(line => line.shotId === shot.id))) {
    for (const params of [shot.params, shot.paramsToQuote]) {
      if (Object.hasOwn(params ?? {}, 'generateAudio')) invariant(params.generateAudio === true,
        'Native dialogue cannot disable the exposed generateAudio control.');
    }
    invariant(shot.prompt.includes(dialogueInstruction(packet, shot.id)),
      'Native motion prompt must contain canonical emotional dialogue.');
  }
  return true;
}

export function validateCreationDirection(packet) {
  validateFramePlan(packet);
  validateCameraPlan(packet);
  validateDialoguePlan(packet);
  return true;
}

export function requiresCameraReview(packet) {
  return packet.cameraPlan?.shots.some(camera => camera.segments.some(segment =>
    segment.move !== 'locked' || segment.zoom.mode !== 'none' || segment.focus.mode !== 'fixed')) ?? false;
}

function frameWindow(packet, from, to) {
  const fps = packet.framePlan.fps;
  invariant(Number.isFinite(from) && Number.isFinite(to) && from >= 0 &&
    to > from && to <= packet.seconds, 'Canonical cue timing is outside the film.');
  const start = deliveryFrame(from, fps);
  const end = deliveryFrame(to, fps);
  invariant(end > start, 'Canonical interval collapses after delivery-frame quantization.');
  return {fromFrame: start, toFrame: end};
}

function activeFrameCues(packet, cues, interval) {
  return cues.map((cue, index) => ({...cue, cueIndex: index,
    ...frameWindow(packet, cue.from, cue.to)}))
    .filter(cue => cue.fromFrame < interval.toFrame && cue.toFrame > interval.fromFrame)
    .map(cue => ({...cue, fromFrame: Math.max(cue.fromFrame, interval.fromFrame),
      toFrame: Math.min(cue.toFrame, interval.toFrame)}));
}

export function validateFramePlan(packet) {
  const plan = packet.framePlan;
  invariant(plan?.schemaVersion === 1, 'Complete framePlan required before creation.');
  const total = deliveryFrame(packet.seconds, plan.fps);
  validateTimeline(packet.shots, packet.seconds);
  validateDirection(packet);
  validateLightingPlan(packet.lightingPlan);
  validateVisualDevelopment(packet);
  const text = (value, label) => invariant(typeof value === 'string' && value.trim(), `Frame plan requires ${label}.`);
  const list = (value, label) => {
    invariant(Array.isArray(value) && value.length > 0, `Frame plan requires ${label}.`);
    value.forEach(item => text(item, label));
  };
  const identities = packet.characterPlan.requiredIdentities;
  invariant(Array.isArray(plan.characterDesigns) &&
    plan.characterDesigns.length === identities.length &&
    new Set(plan.characterDesigns.map(item => item.identityId)).size === identities.length,
  'Frame plan requires one beautiful/original character design per required identity.');
  for (const design of plan.characterDesigns) {
    invariant(identities.includes(design.identityId), 'Unknown character design identity.');
    for (const key of ['appeal', 'agePresentation', 'distinctiveFeatures',
      'wardrobeGrooming', 'naturalDetail']) text(design[key], `characterDesigns.${key}`);
    list(design.avoid, 'characterDesigns.avoid');
    list(design.acceptance, 'characterDesigns.acceptance');
  }
  const beatIds = packet.direction.beats.map(beat => beat.id);
  invariant(beatIds.every(id => typeof id === 'string' && id.trim()) &&
    new Set(beatIds).size === beatIds.length, 'Frame plan requires unique stable direction beat IDs.');
  packet.direction.beats.forEach(beat => frameWindow(packet, beat.from, beat.to));
  for (const effect of packet.atmospherePlan.effects) {
    frameWindow(packet, effect.from, effect.to);
    for (const key of ['appearance', 'density', 'intensity', 'scale', 'lightMode']) {
      text(effect[key], `effect.${key}`);
    }
  }
  invariant(['silent', 'native', 'separate'].includes(packet.soundPlan?.routeHypothesis) &&
    Array.isArray(packet.soundPlan.cues) &&
    (packet.soundPlan.cues.length > 0 || packet.soundPlan.routeHypothesis === 'silent'),
  'Frame plan requires a canonical sound route and cue sheet.');
  for (const key of ['rights', 'musicBrief', 'test']) text(packet.soundPlan[key], `soundPlan.${key}`);
  packet.soundPlan.cues.forEach(cue => {
    text(cue.sound, 'sound cue description');
    frameWindow(packet, cue.from, cue.to);
  });
  invariant(Array.isArray(plan.intervals) && plan.intervals.length > 0,
    'Complete frame interval coverage required.');
  let end = 0;
  const intervalIds = new Set();
  for (const interval of plan.intervals) {
    text(interval.id, 'interval.id');
    invariant(!intervalIds.has(interval.id), 'Duplicate frame interval ID.');
    intervalIds.add(interval.id);
    invariant(Number.isInteger(interval.fromFrame) && Number.isInteger(interval.toFrame) &&
      interval.fromFrame === end && interval.toFrame > interval.fromFrame &&
      interval.toFrame <= total, 'Frame intervals must cover without gaps, overlap or fractional frames.');
    const shot = packet.shots.find(item => item.id === interval.shotId);
    const beat = packet.direction.beats.find(item => item.id === interval.beatId);
    invariant(shot && beat && beat.shotId === shot.id, 'Unknown or mismatched frame shot/beat.');
    for (const source of [{from: shot.start, to: shot.end}, beat]) {
      const bounds = frameWindow(packet, source.from, source.to);
      invariant(interval.fromFrame >= bounds.fromFrame && interval.toFrame <= bounds.toFrame,
        'Frame interval references a shot/beat outside its actual timing.');
    }
    for (const key of ['storyPurpose', 'audienceRead', 'lightingChange']) text(interval[key], key);
    for (const key of ['framing', 'focus', 'movement']) text(interval.camera?.[key], `camera.${key}`);
    for (const key of ['initialState', 'intermediateState', 'finalState', 'action',
      'contactPhysics', 'animationStyle']) text(interval.motion?.[key], `motion.${key}`);
    invariant(Array.isArray(interval.characters) && interval.characters.length === identities.length &&
      new Set(interval.characters.map(item => item.identityId)).size === identities.length,
    'Frame interval requires every identity, including explicit offscreen states.');
    for (const character of interval.characters) {
      invariant(identities.includes(character.identityId) &&
        ['visible', 'offscreen'].includes(character.visibility), 'Unknown frame character or visibility.');
      for (const key of ['intent', 'emotion', 'expression', 'gaze', 'bodyLanguage', 'position']) {
        text(character[key], `character.${key}`);
      }
    }
    const active = activeFrameCues(packet, packet.atmospherePlan.effects, interval).map(cue => cue.id).sort();
    invariant(Array.isArray(interval.effectIds) &&
      fingerprint([...interval.effectIds].sort()) === fingerprint(active),
    'Frame effects must match every canonically active cue, not an inactive or omitted effect.');
    const boundary = packet.sceneChanges.find(change =>
      deliveryFrame(change.at, plan.fps) === interval.toFrame);
    const type = interval.toFrame === total ? 'end' : boundary?.type ?? 'continuous';
    invariant(interval.transitionOut?.type === type, 'Frame transition contradicts canonical shot boundary.');
    text(interval.transitionOut.reason, 'transitionOut.reason');
    list(interval.acceptance, 'interval.acceptance');
    list(interval.forbiddenArtifacts, 'interval.forbiddenArtifacts');
    end = interval.toFrame;
  }
  invariant(end === total, 'Frame plan must include the exact final delivery frame.');
  if (packet.cameraPlan) validateCameraPlan(packet);
  if (packet.dialoguePlan) validateDialoguePlan(packet);
  return true;
}

export function resolveFramePlan(packet) {
  validateFramePlan(packet);
  return {...packet.framePlan, cameraPlan: packet.cameraPlan, dialoguePlan: packet.dialoguePlan,
    totalFrames: deliveryFrame(packet.seconds, packet.framePlan.fps),
    quantization: 'Half-open ranges; nearest delivery frame via Math.round(seconds * fps), at most half-frame boundary rounding.',
    status: 'Planned requirements, not proof of generated performance or approval.',
    intervals: packet.framePlan.intervals.map(interval => ({
      ...interval,
      direction: packet.direction.beats.find(beat => beat.id === interval.beatId),
      lighting: packet.lightingPlan, continuity: packet.continuity,
      effectCues: activeFrameCues(packet, packet.atmospherePlan.effects, interval),
      cameraCues: packet.cameraPlan ? activeFrameCues(packet,
        packet.cameraPlan.shots.find(camera => camera.shotId === interval.shotId).segments, interval) : [],
      dialogueCues: packet.dialoguePlan ? activeFrameCues(packet, packet.dialoguePlan.lines, interval) : [],
      audio: {...packet.soundPlan, route: packet.soundPlan.routeHypothesis, palette: packet.direction.soundPalette,
        role: packet.direction.beats.find(beat => beat.id === interval.beatId).audioRole,
        cues: activeFrameCues(packet, packet.soundPlan.cues, interval)},
    }))};
}

export function validateVisualDevelopment(packet) {
  const refs = packet.characterPlan?.references;
  invariant(Array.isArray(refs) && refs.length > 0, 'Actual character-reference plan required.');
  const ids = new Set();
  for (const ref of refs) {
    invariant(typeof ref.id === 'string' && ref.id.trim() && !ids.has(ref.id),
      'Unique character-reference ID required.');
    ids.add(ref.id);
    invariant(typeof ref.prompt === 'string' && ref.prompt.trim() &&
      Array.isArray(ref.covers) && ref.covers.length > 0 &&
      ref.covers.every(id => typeof packet.identityBible?.[id] === 'string'),
    'Character reference requires a full prompt and declared identity coverage.');
  }
  invariant(Array.isArray(packet.characterPlan.requiredIdentities) &&
    packet.characterPlan.requiredIdentities.length > 0 &&
    packet.characterPlan.requiredIdentities.every(id => typeof packet.identityBible[id] === 'string' &&
      refs.some(ref => ref.covers.includes(id))), 'Every required identity needs a character reference.');
  for (const key of ['firstFrame', 'firstMotion', 'question', 'payoff', 'test']) {
    invariant(typeof packet.hookPlan?.[key] === 'string' && packet.hookPlan[key].trim(),
      `Hook plan requires ${key}.`);
  }
  invariant(Number.isFinite(packet.hookPlan.inspectSeconds) && packet.hookPlan.inspectSeconds > 0 &&
    packet.hookPlan.inspectSeconds <= packet.seconds, 'Declare the opening inspection window.');
  const changes = packet.sceneChanges;
  invariant(Array.isArray(changes) && changes.length === packet.shots.length - 1,
    'Design every scene/shot transition.');
  changes.forEach((change, i) => {
    invariant(change.at === packet.shots[i].end && change.fromShot === packet.shots[i].id &&
      change.toShot === packet.shots[i + 1].id &&
      ['cut', 'ellipse', 'match-cut'].includes(change.type),
    'Scene transition does not match the shot timeline.');
    for (const key of ['informationChange', 'lightingChange']) {
      invariant(typeof change[key] === 'string' && change[key].trim(),
        `Scene transition requires ${key}.`);
    }
  });
  const plan = packet.atmospherePlan;
  invariant(typeof plan?.motionBudget === 'string' && plan.motionBudget.trim() &&
    typeof plan.omissionRationale === 'string' && plan.omissionRationale.trim() &&
    Array.isArray(plan.effects), 'Declare atmosphere/effects and deliberate omissions.');
  const effectIds = new Set();
  for (const effect of plan.effects) {
    invariant(typeof effect.id === 'string' && effect.id.trim() && !effectIds.has(effect.id),
      'Unique effect ID required.');
    effectIds.add(effect.id);
    invariant(['in-generation', 'composite'].includes(effect.route), 'Declare effect implementation route.');
    invariant(Number.isFinite(effect.from) && Number.isFinite(effect.to) && effect.from >= 0 &&
      effect.to > effect.from && effect.to <= packet.seconds, 'Effect timing outside film.');
    invariant(Array.isArray(effect.shotIds) && effect.shotIds.length > 0 &&
      effect.shotIds.every(id => packet.shots.some(shot => shot.id === id &&
        effect.from < shot.end && effect.to > shot.start)) &&
      packet.shots.filter(shot => effect.from < shot.end && effect.to > shot.start).every(shot =>
        effect.shotIds.includes(shot.id)), 'Effect references an absent/inactive shot or omits an active shot.');
    for (const key of ['purpose', 'depth', 'motion', 'occlusion', 'lightInteraction',
      'shadowInteraction', 'continuity', 'fallback']) {
      invariant(typeof effect[key] === 'string' && effect[key].trim(), `Effect requires ${key}.`);
    }
    if (effect.route === 'in-generation') {
      invariant(Array.isArray(effect.referenceFrameIds) &&
        effect.shotIds.every(id => {
          const shot = packet.shots.find(item => item.id === id);
          return [shot.startFrameId, shot.endFrameId].every(frameId =>
            effect.referenceFrameIds.includes(frameId));
        }) && effect.referenceFrameIds.every(id => packet.keyframes.some(frame => frame.id === id)),
      'Generated effects need every affected literal endpoint in their reference plan.');
    }
  }
}

function validateTextPlan(plan) {
  for (const key of ['copy', 'placement', 'readabilityTest', 'renderStage']) {
    invariant(typeof plan?.[key] === 'string' && plan[key].trim(),
      `Text-led format requires ${key}; intended text must be tested with audio muted.`);
  }
}

export function validateLightingPlan(plan) {
  for (const key of ['motivation', 'key', 'fill', 'exposurePriority']) {
    invariant(plan && typeof plan[key] === 'string' && plan[key].trim(),
      `Lighting plan requires ${key}.`);
  }
  invariant(Array.isArray(plan.shadowMap) && plan.shadowMap.length > 0,
    'Lighting plan requires a shadow map.');
  for (const shadow of plan.shadowMap) {
    invariant(['caster', 'receiver', 'behavior'].every(key =>
      typeof shadow[key] === 'string' && shadow[key].trim()), 'Incomplete shadow relationship.');
  }
  invariant(Array.isArray(plan.invariants) && plan.invariants.length > 0 &&
    Array.isArray(plan.intentionalChanges), 'Declare light invariants and intentional changes.');
}

export function validatePacing(pacing, seconds, lane = 'emotion-led') {
  invariant(pacing && typeof pacing.hypothesis === 'string' && pacing.hypothesis.trim(),
    'Pacing hypothesis is required.');
  invariant(typeof pacing.hook === 'string' && pacing.hook.trim(), 'An honest hook is required.');
  const evidence = pacing.payoffEvidence ?? pacing.revealEvidence;
  invariant(typeof evidence === 'string' && evidence.trim(),
    'Describe the visible progression or payoff evidence.');
  invariant(Array.isArray(pacing.cutReasons) && pacing.cutReasons.every(item =>
    typeof item === 'string' && item.trim()), 'Cut reasons must be explicit.');
  const structure = pacing.structure ?? 'connection';
  invariant(['connection', 'lane-specific'].includes(structure), 'Unknown pacing structure.');
  invariant(structure !== 'lane-specific' || (lane !== 'emotion-led' &&
    typeof pacing.endingRationale === 'string' && pacing.endingRationale.trim()),
  'Lane-specific pacing requires an appropriate lane and ending rationale.');
  invariant(Array.isArray(pacing.beats) &&
    pacing.beats.length >= (structure === 'connection' ? 4 : 1), 'Pacing beats required.');
  let end = 0;
  for (const beat of pacing.beats) {
    invariant(beat.start === end && Number.isFinite(beat.end) && beat.end > beat.start &&
      typeof beat.job === 'string' && beat.job.trim() &&
      typeof beat.phase === 'string' && beat.phase.trim(), 'Pacing has a gap, overlap or missing job.');
    end = beat.end;
  }
  invariant(end === seconds, 'Pacing must cover the exact film duration.');
  const phases = pacing.beats.map(beat => beat.phase);
  const ordered = ['setup', 'reveal', 'response', 'hold'].map(phase => phases.indexOf(phase));
  invariant(structure === 'lane-specific' || (ordered.every(index => index >= 0) &&
    ordered.every((index, i) => i === 0 || index > ordered[i - 1])),
  'Pacing must include setup, reveal, response and hold in order.');
}

export function packetDraft(scenario, brief, feedback) {
  const review = feedback.reviews.find(item => item.scenarioId === scenario.id);
  invariant(review?.decision === 'select', 'User must select this scenario before creating its production workspace.');
  invariant(scenario.failedGates.length === 0, 'Resolve hard gates before preproduction.');
  const seconds = scenario.seconds;
  return {
    schemaVersion: 1,
    scenarioId: scenario.id,
    scenarioFingerprint: fingerprint(scenario),
    briefFingerprint: fingerprint(brief),
    brief,
    approvalRevision: 0,
    stage: 'selected',
    createdAt: new Date().toISOString(),
    seconds,
    aspectRatio: brief.format.aspectRatio,
    generationApproved: false,
    nextGenerationKind: null,
    approvedBudgetCredits: 0,
    spentCredits: 0,
    reservedCredits: 0,
    references: [],
    jobs: [],
    assets: [],
    reviews: [],
    publicationApproval: null,
    scenario,
  };
}

export function productionRevision(manifest) {
  const packet = structuredClone(manifest.productionDraft);
  if (packet?.pacing) delete packet.pacing.actualEventTimes;
  return fingerprint({scenario: manifest.scenarioFingerprint, brief: manifest.briefFingerprint,
    approvalRevision: manifest.approvalRevision, packet});
}

export function validateWorkspace(manifest, context) {
  invariant(context?.scenarios && context.brief && context.feedback,
    'Current scenarios, brief and selection feedback are required.');
  invariant(STAGES.includes(manifest.stage), 'Unknown workflow stage.');
  const scenario = context.scenarios.find(item => item.id === manifest.scenarioId);
  invariant(scenario && manifest.scenario?.id === manifest.scenarioId &&
    fingerprint(manifest.scenario) === manifest.scenarioFingerprint &&
    fingerprint(scenario) === manifest.scenarioFingerprint, 'Scenario revision is stale; refresh workspace.');
  invariant(manifest.brief && fingerprint(manifest.brief) === manifest.briefFingerprint &&
    fingerprint(context.brief) === manifest.briefFingerprint, 'Brief revision is stale; refresh workspace.');
  invariant(context.feedback.reviews.find(item => item.scenarioId === manifest.scenarioId)?.decision === 'select',
    'Scenario selection withdrawn or missing; obtain actual selection before resuming.');
  invariant(manifest.seconds === scenario.seconds &&
    manifest.aspectRatio === context.brief.format.aspectRatio, 'Workspace format differs from selection.');
  if (manifest.productionDraft) {
    validatePacket(manifest.productionDraft, context.scenarios);
    invariant(manifest.productionDraft.scenarioId === manifest.scenarioId, 'Packet belongs to another scenario.');
  }
  if (STAGES.indexOf(manifest.stage) >= STAGES.indexOf('preproduction')) {
    invariant(manifest.productionDraft, 'Complete production packet required.');
    invariant(Number.isInteger(manifest.approvalRevision) && manifest.approvalRevision > 0 &&
      manifest.productionFingerprint === productionRevision(manifest),
    'Production packet approval is stale; refresh workspace and renew storyboard approval.');
  }
  return true;
}

export function refreshWorkspace(manifest, context) {
  const scenario = context.scenarios.find(item => item.id === manifest.scenarioId);
  invariant(scenario && context.feedback.reviews.find(item =>
    item.scenarioId === scenario.id)?.decision === 'select', 'Actual selection is required to refresh.');
  return {...manifest, scenario, brief: context.brief, scenarioFingerprint: fingerprint(scenario),
    briefFingerprint: fingerprint(context.brief), seconds: scenario.seconds,
    aspectRatio: context.brief.format.aspectRatio, stage: 'selected',
    storyboardApproved: false, finalUserApproval: false, generationApproved: false,
    nextGenerationKind: null,
    productionFingerprint: null, nextRequestFingerprint: null, publicationApproval: null};
}

export function stageReady(manifest, target, context) {
  invariant(STAGES.includes(target), 'Unknown workflow stage.');
  const currentIndex = STAGES.indexOf(manifest.stage);
  invariant(currentIndex >= 0 && STAGES.indexOf(target) === currentIndex + 1,
    'Only the next workflow stage can be approved.');
  invariant(target !== 'published', 'Publication is manual and outside this CLI.');
  validateWorkspace(manifest, context);
  assertNoCurrentFailures(manifest);
  if (target === 'preproduction') {
    validatePacket(manifest.productionDraft, context.scenarios);
    validateCreationDirection(manifest.productionDraft);
    invariant(manifest.storyboardApproved === true, 'Storyboard/user preproduction approval missing.');
    invariant(typeof manifest.storyboardApprovalEvidence === 'string' &&
      manifest.storyboardApprovalEvidence.trim(), 'Storyboard approval evidence missing.');
  }
  if (target === 'characters-approved') requireCharacterApproval(manifest);
  if (target === 'keyframes-approved') {
    requireSceneApproval(manifest);
  }
  if (target === 'design-locked') {
    validateDirection(manifest.productionDraft);
    validateCreationDirection(manifest.productionDraft);
    requireSceneApproval(manifest);
    for (const effect of manifest.productionDraft.atmospherePlan.effects.filter(item =>
      item.route === 'composite')) {
      invariant(manifest.assets.some(asset => asset.kind === 'effect' && asset.effectId === effect.id) &&
        typeof manifest.effectRights?.[effect.id] === 'string' && manifest.effectRights[effect.id].trim(),
      `Composite effect needs an actual registered asset and rights evidence: ${effect.id}`);
      requireReview(manifest, 'effect-preflight');
    }
    requireAcceptance(manifest, 'design');
  }
  if (target === 'motion-approved') {
    invariant(manifest.assets.some(asset => asset.kind === 'video'), 'No video assets.');
    requireReview(manifest, 'motion');
    if (requiresCameraReview(manifest.productionDraft)) requireReview(manifest, 'camera-execution');
  }
  if (target === 'sound-approved') {
    invariant(manifest.soundDecision === 'silent' ||
      (manifest.soundDecision === 'native' && manifest.nativeAudioInspected === true) ||
      (manifest.soundDecision === 'separate' && manifest.assets.some(asset =>
        asset.kind === 'audio')), 'Separate audio or intentional silence required; inspect native audio.');
    requireReview(manifest, 'sound');
    requireReview(manifest, 'audio-scene-fit');
    if (manifest.productionDraft.dialoguePlan?.mode === 'spoken') requireReview(manifest, 'dialogue-performance');
  }
  if (target === 'final-approved') {
    invariant(manifest.assets.some(asset => asset.kind === 'final'), 'No final encoded film.');
    for (const area of REVIEW_AREAS) requireReview(manifest, area);
    if (manifest.productionDraft.dialoguePlan?.mode === 'spoken') requireReview(manifest, 'dialogue-performance');
    if (requiresCameraReview(manifest.productionDraft)) requireReview(manifest, 'camera-execution');
    invariant(manifest.finalUserApproval === true, 'Final user approval missing.');
    requireReview(manifest, 'final-user');
  }
  return true;
}

export function assetSetFingerprint(assets) {
  return fingerprint(assets.map(({path, sha256, kind, keyframeId, characterId, effectId,
    origin, sourceHistoryId, permissionEvidence}) => ({
    path, sha256, kind, ...(keyframeId ? {keyframeId} : {}),
    ...(characterId ? {characterId} : {}), ...(effectId ? {effectId} : {}),
    ...(origin ? {origin} : {}), ...(sourceHistoryId ? {sourceHistoryId} : {}),
    ...(permissionEvidence ? {permissionEvidence} : {}),
  }))
    .sort((a, b) => a.path.localeCompare(b.path)));
}

function requireProductionImage(manifest, kind, field, id) {
  const asset = manifest.assets.find(item => item.kind === kind && item[field] === id);
  invariant(asset, `Missing accepted ${kind} asset: ${id}`);
  const generated = asset.origin === 'generated' && manifest.jobs.some(job =>
    job.historyId === asset.sourceHistoryId && job.status === 'completed' &&
    job.outputAssetHashes?.includes(asset.sha256));
  const authorized = asset.origin === 'authorized-reference' &&
    typeof asset.permissionEvidence === 'string' && asset.permissionEvidence.trim();
  invariant(generated || authorized, `Real production image provenance required, not a sketch: ${id}`);
  return asset;
}

function providerImage(ref) {
  return ref?.type === 'image' && typeof ref.id === 'string' && ref.id.trim() &&
    typeof ref.url === 'string' && ref.url.startsWith('https://') &&
    typeof ref.label === 'string' && ref.label.trim();
}

export function requireCharacterApproval(manifest) {
  for (const ref of manifest.productionDraft.characterPlan.references) {
    requireProductionImage(manifest, 'character', 'characterId', ref.id);
    invariant(providerImage(manifest.characterReferences?.[ref.id]),
      `Genuine character provider reference required: ${ref.id}`);
  }
  requireReview(manifest, 'characters');
  requireAcceptance(manifest, 'characters');
  return true;
}

function requireSceneApproval(manifest) {
  requireCharacterApproval(manifest);
  for (const frame of manifest.productionDraft.keyframes) {
    requireProductionImage(manifest, 'keyframe', 'keyframeId', frame.id);
  }
  requireReview(manifest, 'keyframes');
  requireAcceptance(manifest, 'keyframes');
}

export function validateSceneReferences(manifest, frameId, params) {
  invariant(manifest.stage === 'characters-approved', 'Approve real characters before scene generation.');
  validateCreationDirection(manifest.productionDraft);
  requireCharacterApproval(manifest);
  const frame = manifest.productionDraft.keyframes.find(item => item.id === frameId);
  invariant(frame && params.prompt === frame.prompt, 'Scene prompt differs from the planned frame.');
  invariant(Array.isArray(params.visualReferences), 'Use reference-guided scene generation.');
  const cast = manifest.productionDraft.characterPlan.references.map(ref =>
    manifest.characterReferences[ref.id]);
  invariant(cast.every(ref => params.visualReferences.some(value => fingerprint(value) === fingerprint(ref))),
    'Every approved character reference must guide the scene.');
  for (const ref of params.visualReferences) {
    if (cast.some(value => fingerprint(value) === fingerprint(ref))) continue;
    const entry = Object.entries(manifest.keyframeReferences ?? {}).find(([, value]) =>
      fingerprint(value) === fingerprint(ref));
    invariant(entry, 'Unregistered scene reference.');
    requireProductionImage(manifest, 'keyframe', 'keyframeId', entry[0]);
  }
  return true;
}

export function validateMotionReferences(manifest, shotId, params) {
  invariant(manifest.stage === 'design-locked', 'Lock characters, scenes and design before paid motion.');
  validateCreationDirection(manifest.productionDraft);
  requireSceneApproval(manifest);
  const shot = manifest.productionDraft?.shots.find(item => item.id === shotId);
  invariant(shot, 'Unknown motion shot.');
  requireAcceptance(manifest, 'design');
  for (const [field, frameId] of [['startFrame', shot.startFrameId], ['endFrame', shot.endFrameId]]) {
    const reference = manifest.keyframeReferences?.[frameId];
    invariant(reference?.type === 'image' && typeof reference.id === 'string' && reference.id.trim() &&
      typeof reference.url === 'string' && reference.url.startsWith('https://') &&
      typeof reference.label === 'string' && reference.label.trim(),
    `Genuine provider reference required for ${frameId}.`);
    invariant(params[field] && fingerprint(params[field]) === fingerprint(reference),
      `${field} must use the exact accepted ${frameId} provider reference.`);
  }
  invariant(params.prompt === shot.prompt, 'Motion prompt differs from approved shot.');
  for (const [key, value] of Object.entries(shot.paramsToQuote)) {
    invariant(params[key] === value, `Motion parameter differs from approved plan: ${key}`);
  }
  const allowedFields = new Set(['prompt', 'startFrame', 'endFrame', ...Object.keys(shot.paramsToQuote)]);
  invariant(Object.keys(params).every(key => allowedFields.has(key)), 'Unapproved motion parameter.');
  return true;
}

export function reviewAssetFingerprint(manifest, area) {
  const cast = ['characters', 'characters-user', 'characters-delegated'].includes(area);
  const visual = ['keyframes', 'keyframes-user', 'keyframes-delegated', 'design-user',
    'design-delegated', 'effect-preflight'].includes(area);
  return assetSetFingerprint(manifest.assets.filter(asset =>
    cast ? asset.kind === 'character' : !visual || ['character', 'keyframe', 'effect'].includes(asset.kind)));
}

function reviewRevision(manifest, area) {
  if (area === 'audio-scene-fit') return fingerprint({production: manifest.productionFingerprint,
    soundDecision: manifest.soundDecision, nativeAudioInspected: manifest.nativeAudioInspected});
  if (area === 'entertainment-wow-enjoyment') return fingerprint({
    production: manifest.productionFingerprint, brief: manifest.entertainmentBrief});
  return ['characters', 'characters-user', 'characters-delegated'].includes(area)
    ? fingerprint({identities: Object.fromEntries(manifest.productionDraft.characterPlan.requiredIdentities.map(id =>
      [id, manifest.productionDraft.identityBible[id]])),
      characterPlan: manifest.productionDraft.characterPlan,
      ...(manifest.productionDraft.framePlan ? {
        characterDesigns: manifest.productionDraft.framePlan.characterDesigns} : {})})
    : manifest.productionFingerprint;
}

function reviewReferences(manifest, area) {
  if (['characters', 'characters-user', 'characters-delegated'].includes(area)) return fingerprint(manifest.characterReferences ?? {});
  if (['keyframes', 'keyframes-user', 'keyframes-delegated', 'design-user', 'design-delegated', 'effect-preflight'].includes(area)) {
    return fingerprint({characters: manifest.characterReferences ?? {}, frames: manifest.keyframeReferences ?? {},
      ...(['design-user', 'design-delegated', 'effect-preflight'].includes(area) ? {effectRights: manifest.effectRights ?? {}} : {})});
  }
  return null;
}

export function requireReview(manifest, area) {
  const hash = reviewAssetFingerprint(manifest, area);
  const referencesHash = reviewReferences(manifest, area);
  const review = manifest.reviews?.findLast(item => item.area === area &&
    item.assetSetFingerprint === hash && item.productionFingerprint === reviewRevision(manifest, area) &&
    (!referencesHash || item.referenceFingerprint === referencesHash));
  invariant(review?.result === 'pass' &&
    typeof review.evidence === 'string' && review.evidence.trim().length > 0,
  `Missing or stale review: ${area}`);
  validateReviewEvidence(manifest, review);
  return review;
}

export function requireAcceptance(manifest, scope) {
  invariant(ACCEPTANCE_AREAS.includes(scope), 'Unknown delegated acceptance scope.');
  const area = `${scope}-`;
  const latest = manifest.reviews?.findLast(item => item.area === `${area}user` ||
    item.area === `${area}delegated`);
  invariant(latest, `Missing acceptance: ${scope}-user or ${scope}-delegated`);
  return requireReview(manifest, latest.area);
}

function validateReviewEvidence(manifest, review) {
  if (review.result !== 'pass') return;
  if (review.area === 'camera-execution') {
    const plan = manifest.productionDraft.cameraPlan;
    const report = review.report;
    const expected = plan?.shots.flatMap(camera => camera.segments.map(segment =>
      ({shotId: camera.shotId, ...segment})));
    invariant(expected?.length && report?.picture === 'full-playback' &&
      Array.isArray(report.segments) && report.segments.length === expected.length &&
      new Set(report.segments.map(segment => `${segment.shotId}/${segment.id}`)).size === expected.length,
    'Camera pass requires full playback and every planned camera segment.');
    for (const segment of expected) {
      const observed = report.segments.find(item => item.id === segment.id && item.shotId === segment.shotId);
      invariant(observed && Number.isFinite(observed.from) && Number.isFinite(observed.to) &&
        observed.from >= 0 && observed.to > observed.from && observed.to <= manifest.seconds &&
        observed.movementMatches === true && observed.framingMaintained === true &&
        observed.focusMatches === true && observed.continuityMaintained === true &&
        typeof observed.evidence === 'string' && observed.evidence.trim(),
      'Camera needs timecoded actual movement, framing, focus and continuity evidence.');
    }
    invariant(Array.isArray(report.unresolvedFailures) && !report.unresolvedFailures.length,
      'Resolve camera failures before passing.');
  }
  if (review.area === 'dialogue-performance') {
    const plan = manifest.productionDraft.dialoguePlan;
    const report = review.report;
    invariant(plan?.mode === 'spoken' && report?.picture === 'full-playback' &&
      report.audio === 'listened' && typeof report.listeningConditions === 'string' &&
      report.listeningConditions.trim() && Array.isArray(report.lines) &&
      report.lines.length === plan.lines.length &&
      new Set(report.lines.map(line => line.id)).size === plan.lines.length,
    'Dialogue pass requires actual joined playback/listening and every planned line.');
    for (const line of plan.lines) {
      const observed = report.lines.find(item => item.id === line.id);
      invariant(observed && Number.isFinite(observed.from) && Number.isFinite(observed.to) &&
        observed.from >= 0 && observed.to > observed.from && observed.to <= manifest.seconds &&
        observed.wordsVerified === true && observed.speakerVerified === true &&
        observed.intelligible === true && observed.emotionalMatch === true &&
        observed.lipSync === (line.lipSync === 'visible' ? 'pass' : 'offscreen') &&
        typeof observed.evidence === 'string' && observed.evidence.trim(),
      'Dialogue needs observed words, correct speaker, emotion, intelligibility and lip sync.');
    }
    invariant(Array.isArray(report.unresolvedFailures) && !report.unresolvedFailures.length,
      'Resolve dialogue failures before passing.');
  }
  if (review.area.endsWith('-user')) {
    invariant(review.authority?.type === 'personal-user' &&
      review.authority.personallyViewedByUser === true,
    'Personal-user acceptance requires explicit authority and actual user viewing; legacy/delegated records cannot substitute.');
  }
  if (review.area.endsWith('-delegated')) {
    const scope = review.area.slice(0, -'-delegated'.length);
    invariant(ACCEPTANCE_AREAS.includes(scope), 'Final approval cannot be delegated.');
    const delegation = manifest.delegations?.find(item => item.id === review.authority?.delegationId);
    invariant(review.authority?.type === 'delegated' &&
      review.authority.personallyViewedByUser === false &&
      delegation?.status === 'active' && delegation.scope?.includes(scope) &&
      typeof delegation.instruction === 'string' && delegation.instruction.trim() &&
      delegation.productionFingerprint === manifest.productionFingerprint &&
      Number.isFinite(Date.parse(delegation.authorizedAt)) &&
      Date.parse(delegation.authorizedAt) <= Date.now() &&
      Date.parse(delegation.expiresAt) > Date.now() &&
      Number.isInteger(delegation.creditCeiling) && delegation.creditCeiling >= 0,
    'Missing, expired, withdrawn, stale or out-of-scope delegation.');
  }
  if (review.area === 'entertainment-wow-enjoyment') {
    const brief = manifest.entertainmentBrief;
    const report = review.report;
    invariant(brief?.audience?.trim() && brief.lane?.trim() && brief.acceptanceCriteria?.trim(),
      'Predeclare audience, lane and entertainment acceptance criteria.');
    invariant(report?.picture === 'full-playback' &&
      ['listened', 'no-audio-streams'].includes(report.audio) &&
      (report.audio !== 'no-audio-streams' || manifest.soundDecision === 'silent') &&
      Array.isArray(report.dimensions) && report.dimensions.length === ENTERTAINMENT_DIMENSIONS.length,
    'Entertainment pass requires full playback, audio scope and all dimensions; sampled frames are not playback.');
    for (const id of ENTERTAINMENT_DIMENSIONS) {
      const dimension = report.dimensions.find(item => item.id === id);
      invariant(Number.isInteger(dimension?.score) && dimension.score >= 1 && dimension.score <= 5 &&
        Array.isArray(dimension.evidence) && dimension.evidence.length > 0 &&
        dimension.evidence.every(item => Number.isFinite(item.from) && Number.isFinite(item.to) &&
          item.from >= 0 && item.to > item.from && item.to <= manifest.seconds &&
          typeof item.observation === 'string' && item.observation.trim()),
      `Entertainment needs anchored 1-5 and timecoded observations: ${id}`);
    }
    invariant(typeof report.criteriaAssessment === 'string' && report.criteriaAssessment.trim() &&
      Array.isArray(report.unresolvedFailures) && report.unresolvedFailures.length === 0,
    'Assess declared criteria and resolve substantive entertainment failures before a pass.');
  }
  if (review.area === 'audio-scene-fit') {
    const report = review.report;
    invariant(report?.picture === 'full-playback' &&
      (report.audio === 'listened' ||
        (report.audio === 'no-audio-streams' && manifest.soundDecision === 'silent')) &&
      typeof report.listeningConditions === 'string' && report.listeningConditions.trim(),
    'Audio-scene-fit requires joined full playback and actual listening conditions, not meters or frames.');
    invariant(report.comparison?.samePicture === true && report.comparison.listened === true &&
      ['ambience-only', 'silent'].includes(report.comparison.baseline) &&
      typeof report.comparison.observation === 'string' && report.comparison.observation.trim(),
    'Compare the same picture with ambience-only or silence before accepting musical weight.');
    invariant(Array.isArray(report.dimensions) && report.dimensions.length === AUDIO_FIT_DIMENSIONS.length,
      'Audio-scene-fit requires every emotional and mix dimension.');
    for (const id of AUDIO_FIT_DIMENSIONS) {
      const dimension = report.dimensions.find(item => item.id === id);
      invariant(dimension?.verdict === 'pass' && Array.isArray(dimension.evidence) &&
        dimension.evidence.length > 0 && dimension.evidence.every(item =>
          Number.isFinite(item.from) && Number.isFinite(item.to) &&
          item.from >= 0 && item.to > item.from && item.to <= manifest.seconds &&
          typeof item.observation === 'string' && item.observation.trim()),
      `Audio-scene-fit needs timecoded, passing observations: ${id}`);
    }
    let end = 0;
    invariant(Array.isArray(report.segments) && report.segments.length > 0,
      'Review the complete emotional timeline, not just a pleasant opening.');
    for (const segment of report.segments) {
      invariant(Number.isFinite(segment.from) && Number.isFinite(segment.to) &&
        segment.from === end && segment.to > segment.from && segment.to <= manifest.seconds &&
        segment.weight === 'appropriate' &&
        ['supports', 'intentional-counterpoint'].includes(segment.relationship) &&
        ['intendedFeeling', 'heardFeeling', 'observation'].every(key =>
          typeof segment[key] === 'string' && segment[key].trim()),
      'Audio-scene-fit segments must cover the film with appropriate weight and explained emotional fit.');
      end = segment.to;
    }
    invariant(end === manifest.seconds &&
      Array.isArray(report.unresolvedFailures) && report.unresolvedFailures.length === 0,
    'Resolve mismatched/heavy audio over the whole film before passing.');
  }
}

export function migrateDelegatedAcceptances(manifest, delegation) {
  invariant(manifest.jobs.every(job => ['completed', 'failed'].includes(job.status)) &&
    manifest.reservedCredits === 0, 'Migrate only at a reconciled terminal-job boundary.');
  invariant(!manifest.delegations?.some(item => item.id === delegation.id),
    'Delegation already exists; migration is not a repeatable approval shortcut.');
  let updated = {...manifest, delegations: [...(manifest.delegations ?? []), delegation]};
  assertNoCurrentFailures(manifest);
  for (const scope of delegation.scope) {
    invariant(ACCEPTANCE_AREAS.includes(scope), 'Only creative acceptance can be migrated.');
    const area = `${scope}-user`;
    const index = manifest.reviews.findLastIndex(item => item.area === area);
    const legacy = manifest.reviews[index];
    invariant(legacy?.result === 'pass' && legacy.personallyViewedByUser === false &&
      legacy.authority === 'user-delegated autonomous agent review' &&
      legacy.delegationInstruction === delegation.instruction &&
      legacy.assetSetFingerprint === reviewAssetFingerprint(manifest, area) &&
      legacy.productionFingerprint === reviewRevision(manifest, area) &&
      legacy.referenceFingerprint === reviewReferences(manifest, area),
    `Missing explicit or current legacy delegated evidence: ${area}; never rebind stale acceptance.`);
    updated = recordReview(updated, {area: `${scope}-delegated`, result: 'pass',
      evidence: legacy.evidence, authority: {type: 'delegated', delegationId: delegation.id,
        personallyViewedByUser: false},
      migration: {legacyReviewIndex: index, legacyReviewFingerprint: fingerprint(legacy),
        originalAt: legacy.at, note: 'Label migration only; no new media inspection or personal viewing.'}});
  }
  updated.generationApproved = false;
  updated.finalUserApproval = false;
  updated.publicationApproval = null;
  return updated;
}

export function assertNoCurrentFailures(manifest) {
  const current = new Map();
  for (const review of manifest.reviews ?? []) {
    if (review.assetSetFingerprint === reviewAssetFingerprint(manifest, review.area) &&
      review.productionFingerprint === reviewRevision(manifest, review.area) &&
      (!reviewReferences(manifest, review.area) ||
        review.referenceFingerprint === reviewReferences(manifest, review.area))) current.set(review.area, review);
  }
  invariant(![...current.values()].some(review => review.result === 'fail'),
    'Current failed review blocks approval or assembly.');
}

export function recordReview(manifest, review) {
  invariant(['pass', 'fail'].includes(review.result) && typeof review.evidence === 'string' &&
    review.evidence.trim(), 'Review requires pass/fail and observed evidence.');
  validateReviewEvidence(manifest, review);
  const updated = {...manifest, reviews: [...manifest.reviews, {...review,
    assetSetFingerprint: reviewAssetFingerprint(manifest, review.area),
    ...(reviewReferences(manifest, review.area) ? {referenceFingerprint: reviewReferences(manifest, review.area)} : {}),
    productionFingerprint: reviewRevision(manifest, review.area), at: new Date().toISOString()}]};
  if (review.result === 'fail') {
    const earliest = {characters: 'preproduction', 'characters-user': 'preproduction',
      'characters-delegated': 'preproduction',
      keyframes: 'characters-approved', 'keyframes-user': 'characters-approved',
      'keyframes-delegated': 'characters-approved',
      'design-user': 'keyframes-approved', 'design-delegated': 'keyframes-approved',
      'effect-preflight': 'keyframes-approved', motion: 'design-locked',
      sound: 'motion-approved', 'audio-scene-fit': 'motion-approved',
      'dialogue-performance': 'motion-approved', 'camera-execution': 'design-locked'}[review.area] ?? 'sound-approved';
    if (STAGES.indexOf(updated.stage) > STAGES.indexOf(earliest)) updated.stage = earliest;
    updated.finalUserApproval = false;
    updated.generationApproved = false;
    updated.publicationApproval = null;
  }
  return updated;
}

export function verifyAssets(root, manifest) {
  invariant(Array.isArray(manifest.assets), 'Manifest assets missing.');
  const seen = new Set();
  for (const asset of manifest.assets) {
    invariant(!seen.has(asset.path), `Duplicate asset: ${asset.path}`);
    seen.add(asset.path);
    invariant(['character', 'keyframe', 'effect', 'video', 'audio', 'final'].includes(asset.kind), 'Invalid asset kind.');
    const path = inside(root, asset.path);
    invariant(statSync(path).isFile(), `Not a file: ${asset.path}`);
    invariant(/^[a-f0-9]{64}$/.test(asset.sha256) && fileHash(path) === asset.sha256,
      `Asset hash mismatch: ${asset.path}`);
  }
  return true;
}

export function validateSpend(manifest, estimatedCredits, quote, now = Date.now(), context) {
  validateWorkspace(manifest, context);
  // Failed takes block advancement; a separately authorized repair must remain possible.
  invariant(manifest.generationApproved === true, 'No explicit generation approval.');
  const generationStage = {character: 'preproduction', scene: 'characters-approved', motion: 'design-locked'};
  invariant(Object.hasOwn(generationStage, manifest.nextGenerationKind) &&
    generationStage[manifest.nextGenerationKind] === manifest.stage,
    'Generation kind must match the character, scene or locked-design stage.');
  validateCreationDirection(manifest.productionDraft);
  if (manifest.nextGenerationKind !== 'character') requireCharacterApproval(manifest);
  if (manifest.nextGenerationKind === 'motion') {
    validateDirection(manifest.productionDraft);
    requireSceneApproval(manifest);
    requireAcceptance(manifest, 'design');
  }
  invariant(typeof manifest.spendApprovalEvidence === 'string' &&
    manifest.spendApprovalEvidence.trim(), 'Record the exact spend approval.');
  invariant(Number.isInteger(estimatedCredits) && estimatedCredits > 0, 'Invalid estimated cost.');
  const perGenerationCap = context.brief.budget?.perGenerationCapCredits;
  if (perGenerationCap != null) {
    invariant(Number.isInteger(perGenerationCap) && perGenerationCap > 0,
      'Invalid per-generation credit cap.');
    invariant(estimatedCredits <= perGenerationCap, 'Job exceeds the per-generation credit cap.');
  }
  invariant(quote && estimatedCredits === discountedCredits(quote.unitCredits,
    quote.quantity, quote.discountPercent), 'Estimated cost must match the exact quoted job.');
  invariant(typeof quote.requestFingerprint === 'string' &&
    /^[a-f0-9]{64}$/.test(quote.requestFingerprint) &&
    quote.requestFingerprint === manifest.nextRequestFingerprint,
  'Quote must be bound to the exact approved next request.');
  invariant(quote && Number.isFinite(Date.parse(quote.at)) &&
    now >= Date.parse(quote.at) && now - Date.parse(quote.at) <= 24 * 60 * 60 * 1000,
  'Obtain a fresh quote; snapshots are not live spend authorization.');
  for (const key of ['approvedBudgetCredits', 'spentCredits', 'reservedCredits']) {
    invariant(Number.isInteger(manifest[key]) && manifest[key] >= 0, `Invalid ${key}.`);
  }
  invariant(manifest.spentCredits + manifest.reservedCredits + estimatedCredits <=
    manifest.approvedBudgetCredits, 'Job exceeds approved remaining budget.');
  return true;
}

export function validateJob(job) {
  invariant(typeof job.historyId === 'string' && job.historyId.trim(), 'Store a real historyId.');
  invariant(typeof job.requestFingerprint === 'string' &&
    /^[a-f0-9]{64}$/.test(job.requestFingerprint), 'Store the exact request fingerprint.');
  invariant(['pending', 'running', 'completed', 'failed'].includes(job.status), 'Invalid job status.');
  invariant(Number.isInteger(job.chargedCredits) && job.chargedCredits >= 0,
    'Record actual charged credits, including failed charged attempts.');
}

export function ensureNoDuplicateJob(jobs, requestFingerprint) {
  invariant(!jobs.some(job => job.requestFingerprint === requestFingerprint &&
    ['pending', 'running'].includes(job.status)),
  'This request already has an active job. Resume its historyId, do not resubmit.');
}
