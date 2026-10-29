import {createHash} from 'node:crypto';
import {readFileSync, statSync} from 'node:fs';
import {isAbsolute, resolve, relative, sep} from 'node:path';

export const STAGES = [
  'concept', 'selected', 'preproduction', 'keyframes-approved',
  'motion-approved', 'sound-approved', 'final-approved', 'published',
];

export const REVIEW_AREAS = [
  'silent-comprehension', 'intended-payoff', 'continuity',
  'pacing-hook-reveal-hold', 'lighting-shadow-continuity', 'motion-contact', 'audio-rights-and-mix',
  'research-claims', 'phone-and-export',
];

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
    invariant(Number.isInteger(item.rating) && item.rating >= 1 && item.rating <= 5,
      'User rating must be an integer from 1 to 5.');
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
  invariant(packet.singlePassPrompt?.trim(), 'Single-pass video prompt is required.');
  invariant(packet.generationApproved === false, 'Example packets cannot pre-approve spending.');
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
    invariant(manifest.storyboardApproved === true, 'Storyboard/user preproduction approval missing.');
    invariant(typeof manifest.storyboardApprovalEvidence === 'string' &&
      manifest.storyboardApprovalEvidence.trim(), 'Storyboard approval evidence missing.');
  }
  if (target === 'keyframes-approved') {
    invariant(manifest.assets.some(asset => asset.kind === 'keyframe'), 'No keyframe assets.');
    requireReview(manifest, 'keyframes');
  }
  if (target === 'motion-approved') {
    invariant(manifest.assets.some(asset => asset.kind === 'video'), 'No video assets.');
    requireReview(manifest, 'motion');
  }
  if (target === 'sound-approved') {
    invariant(manifest.soundDecision === 'silent' ||
      (manifest.soundDecision === 'native' && manifest.nativeAudioInspected === true) ||
      (manifest.soundDecision === 'separate' && manifest.assets.some(asset =>
        asset.kind === 'audio')), 'Separate audio or intentional silence required; inspect native audio.');
    requireReview(manifest, 'sound');
  }
  if (target === 'final-approved') {
    invariant(manifest.assets.some(asset => asset.kind === 'final'), 'No final encoded film.');
    for (const area of REVIEW_AREAS) requireReview(manifest, area);
    invariant(manifest.finalUserApproval === true, 'Final user approval missing.');
  }
  return true;
}

export function assetSetFingerprint(assets) {
  return fingerprint(assets.map(({path, sha256, kind}) => ({path, sha256, kind}))
    .sort((a, b) => a.path.localeCompare(b.path)));
}

export function requireReview(manifest, area) {
  const hash = assetSetFingerprint(manifest.assets);
  const review = manifest.reviews?.findLast(item => item.area === area &&
    item.assetSetFingerprint === hash && item.productionFingerprint === manifest.productionFingerprint);
  invariant(review?.result === 'pass' &&
    typeof review.evidence === 'string' && review.evidence.trim().length > 0,
  `Missing or stale review: ${area}`);
}

export function assertNoCurrentFailures(manifest) {
  const current = new Map();
  const hash = assetSetFingerprint(manifest.assets);
  for (const review of manifest.reviews ?? []) {
    if (review.assetSetFingerprint === hash &&
      review.productionFingerprint === manifest.productionFingerprint) current.set(review.area, review);
  }
  invariant(![...current.values()].some(review => review.result === 'fail'),
    'Current failed review blocks approval or assembly.');
}

export function recordReview(manifest, review) {
  const updated = {...manifest, reviews: [...manifest.reviews, {...review,
    assetSetFingerprint: assetSetFingerprint(manifest.assets),
    productionFingerprint: manifest.productionFingerprint, at: new Date().toISOString()}]};
  if (review.result === 'fail') {
    const earliest = {keyframes: 'preproduction', motion: 'keyframes-approved',
      sound: 'motion-approved'}[review.area] ?? 'sound-approved';
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
    invariant(['keyframe', 'video', 'audio', 'final'].includes(asset.kind), 'Invalid asset kind.');
    const path = inside(root, asset.path);
    invariant(statSync(path).isFile(), `Not a file: ${asset.path}`);
    invariant(/^[a-f0-9]{64}$/.test(asset.sha256) && fileHash(path) === asset.sha256,
      `Asset hash mismatch: ${asset.path}`);
  }
  return true;
}

export function validateSpend(manifest, estimatedCredits, quote, now = Date.now(), context) {
  validateWorkspace(manifest, context);
  assertNoCurrentFailures(manifest);
  invariant(manifest.generationApproved === true, 'No explicit generation approval.');
  invariant(manifest.stage === 'preproduction' || manifest.stage === 'keyframes-approved',
    'Generation requires approved preproduction or keyframes.');
  invariant(typeof manifest.spendApprovalEvidence === 'string' &&
    manifest.spendApprovalEvidence.trim(), 'Record the exact spend approval.');
  invariant(Number.isInteger(estimatedCredits) && estimatedCredits > 0, 'Invalid estimated cost.');
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
