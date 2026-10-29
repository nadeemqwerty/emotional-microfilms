import test from 'node:test';
import assert from 'node:assert/strict';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  assetSetFingerprint, discountedCredits, diverseShortlist, editorialScore, ensureNoDuplicateJob,
  estimatePlan, fingerprint, inside, packetDraft, rankScenarios, readJson,
  REVIEW_AREAS, stageReady, validateFeedback, validateJob, validatePacket,
  validateLightingPlan, validatePacing, validateRubric, validateScenario, validateSpend, validateTimeline,
} from '../lib/workflow.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const load = path => readJson(resolve(root, path));
const rubric = load('data/rubric.json');
const brief = load('data/brief.json');
const {scenarios} = load('data/scenarios.json');
const modelData = load('data/model-quotes.json');
const scenario = scenarios.find(item => item.id === 'the-dry-seat');
const packet = load('examples/the-dry-seat.json');
const selected = {schemaVersion: 1, reviews: [{
  scenarioId: scenario.id, rating: 5, decision: 'select', note: 'Synthetic unit-test feedback.',
  at: '2026-10-30T00:00:00+05:30',
}]};

test('bank fits brief; malformed criteria and scores cannot silently rank', () => {
  validateRubric(rubric);
  scenarios.forEach(item => validateScenario(item, rubric, brief));
  assert.throws(() => validateRubric({...rubric, criteria: rubric.criteria.slice(1)}), /total 100/);
  assert.throws(() => validateScenario({...scenario, scores: {...scenario.scores, clarity: 6}},
    rubric, brief), /1 to 5/);
});

test('discussion shortlist samples storytelling lanes and respects explicit rejects', () => {
  const slate = diverseShortlist(scenarios, rubric, {schemaVersion: 1, reviews: []}, 6);
  assert.equal(new Set(slate.map(item => item.lane)).size, 6);
  const rejected = {...selected, reviews: [{...selected.reviews[0], decision: 'reject'}]};
  assert.ok(!diverseShortlist(scenarios, rubric, rejected, 40).some(item => item.id === scenario.id));
  assert.throws(() => diverseShortlist(scenarios, rubric, rejected, 0), /positive/);
});

test('lighting plan must define motivated source, readability and shadow relationships', () => {
  validateLightingPlan(packet.lightingPlan);
  assert.throws(() => validateLightingPlan({...packet.lightingPlan, key: ''}), /key/);
  assert.throws(() => validateLightingPlan({...packet.lightingPlan, shadowMap: []}), /shadow map/);
  assert.throws(() => validateLightingPlan({...packet.lightingPlan,
    shadowMap: [{caster: 'hand', receiver: 'bench'}]}), /shadow relationship/);
});

test('user decision stays separate from editorial score, missing feedback is unreviewed', () => {
  const before = rankScenarios(scenarios, rubric);
  const after = rankScenarios(scenarios, rubric, selected);
  assert.equal(before.find(item => item.id === scenario.id).userDecision, 'unreviewed');
  assert.equal(after.find(item => item.id === scenario.id).userDecision, 'select');
  assert.equal(editorialScore(scenario, rubric), after.find(item => item.id === scenario.id).editorialScore);
  assert.deepEqual(before.map(item => item.id), after.map(item => item.id));
});

test('hard-gate failures remain ineligible regardless of weighted score', () => {
  const blocked = {...scenario, id: 'blocked-test', failedGates: ['feasible-repair-plan'],
    scores: Object.fromEntries(rubric.criteria.map(item => [item.id, 5]))};
  const ranked = rankScenarios([blocked, scenario], rubric);
  assert.equal(ranked[0].id, scenario.id);
  assert.equal(ranked[1].eligible, false);
});

test('feedback rejects unknown IDs, duplicates, out-of-range ratings and invented decisions', () => {
  for (const patch of [{scenarioId: 'missing'}, {rating: 0}, {decision: 'approved-to-spend'}]) {
    assert.throws(() => validateFeedback({schemaVersion: 1,
      reviews: [{...selected.reviews[0], ...patch}]}, scenarios));
  }
  assert.throws(() => validateFeedback({...selected,
    reviews: [selected.reviews[0], selected.reviews[0]]}, scenarios), /Duplicate/);
});

test('selection is required but never gives a production budget or spend approval', () => {
  assert.throws(() => packetDraft(scenario, brief, {reviews: []}), /must select/);
  const draft = packetDraft(scenario, brief, selected);
  assert.equal(draft.generationApproved, false);
  assert.equal(draft.approvedBudgetCredits, 0);
  assert.equal(draft.stage, 'selected');
  assert.throws(() => packetDraft({...scenario, failedGates: ['feasible-repair-plan']},
    brief, selected), /hard gates/);
});

test('quote rounding is per unit half-up, then quantity, including rounding cancelling discount', () => {
  assert.equal(discountedCredits(5, 3, 10), 15);
  assert.equal(discountedCredits(70, 2, 10), 126);
  assert.throws(() => discountedCredits(70, 0, 10), /quantity/);
  for (const quote of modelData.quotes) {
    assert.equal(discountedCredits(quote.unitCredits, quote.quantity, quote.discountPercent),
      quote.chargedCreditsAtQuote);
  }
  for (const plan of modelData.planningExamples) {
    assert.equal(estimatePlan(plan.lines, modelData.quotes), plan.estimatedCredits);
  }
  assert.throws(() => estimatePlan([{quoteId: 'missing', jobs: 1}], modelData.quotes), /Unknown quote/);
});

test('packet requires existing endpoints, exact shot coverage and explicit pacing', () => {
  validatePacket(packet, scenarios);
  const bad = structuredClone(packet);
  bad.shots[0].endFrameId = 'nonexistent';
  assert.throws(() => validatePacket(bad, scenarios), /does not exist/);
  assert.throws(() => validatePacket({...packet, pacing: null}, scenarios), /Pacing/);
  assert.throws(() => validateTimeline([{...packet.shots[0], start: 1}], 5), /gap or overlap/);
  assert.throws(() => validateTimeline(packet.shots, 9), /exact film duration/);
});

test('pacing cannot omit response/hold or hide timeline gaps', () => {
  const bad = structuredClone(packet.pacing);
  bad.beats.at(-1).phase = 'anticipation';
  assert.throws(() => validatePacing(bad, 10), /hold in order/);
  bad.beats = structuredClone(packet.pacing.beats);
  bad.beats[1].start += 0.1;
  assert.throws(() => validatePacing(bad, 10), /gap/);
});

test('hash is canonical and manifest paths cannot escape the project', () => {
  assert.equal(fingerprint({b: 2, a: 1}), fingerprint({a: 1, b: 2}));
  assert.notEqual(fingerprint({a: 1}), fingerprint({a: 2}));
  assert.throws(() => inside(root, '..\\outside.txt'), /escapes/);
  assert.throws(() => inside(root, 'C:\\private\\outside.txt'), /Absolute/);
  assert.equal(inside(root, 'data\\brief.json'), resolve(root, 'data\\brief.json'));
});

test('spend check binds exact quote and request, expiry, reserved budget and actual consent', () => {
  const at = Date.parse('2026-10-30T01:00:00+05:30');
  const request = fingerprint({model: 'test', params: {duration: 5}});
  const quote = {at: new Date(at).toISOString(), unitCredits: 70, quantity: 1,
    discountPercent: 10, requestFingerprint: request};
  const manifest = {stage: 'preproduction', generationApproved: true,
    spendApprovalEvidence: 'Synthetic test approval only', nextRequestFingerprint: request,
    approvedBudgetCredits: 200, spentCredits: 100, reservedCredits: 30};
  assert.equal(validateSpend(manifest, 63, quote, at), true);
  assert.throws(() => validateSpend({...manifest, generationApproved: false}, 63, quote, at), /approval/);
  assert.throws(() => validateSpend({...manifest, reservedCredits: 40}, 63, quote, at), /budget/);
  assert.throws(() => validateSpend(manifest, 62, quote, at), /exact quoted/);
  assert.throws(() => validateSpend(manifest, 63, {...quote, requestFingerprint: fingerprint({different: 1})}, at), /bound/);
  assert.throws(() => validateSpend(manifest, 63, quote, at + 86400001), /fresh quote/);
  assert.throws(() => validateSpend(manifest, 63, quote, at - 1), /fresh quote/);
});

test('active job must resume its historyId rather than submitting again', () => {
  const requestFingerprint = fingerprint({prompt: 'synthetic'});
  const job = {historyId: 'synthetic-test-id', requestFingerprint, status: 'running', chargedCredits: 63};
  validateJob(job);
  assert.throws(() => ensureNoDuplicateJob([job], requestFingerprint), /Resume/);
  ensureNoDuplicateJob([{...job, status: 'completed'}], requestFingerprint);
  assert.throws(() => validateJob({...job, historyId: ''}), /real historyId/);
});

test('changed asset hashes invalidate reviews and a later failure supersedes an old pass', () => {
  const assets = [{path: 'media/a.png', kind: 'keyframe', sha256: 'a'.repeat(64)}];
  const review = {area: 'keyframes', result: 'pass', evidence: 'Synthetic review',
    assetSetFingerprint: assetSetFingerprint(assets)};
  const manifest = {stage: 'preproduction', assets, reviews: [review]};
  assert.equal(stageReady(manifest, 'keyframes-approved'), true);
  assert.throws(() => stageReady({...manifest,
    reviews: [review, {...review, result: 'fail'}]}, 'keyframes-approved'), /review/);
  assert.throws(() => stageReady({...manifest,
    assets: [{...assets[0], sha256: 'b'.repeat(64)}]}, 'keyframes-approved'), /stale review/);
});

test('stage gates cannot skip, infer native sound inspection or publish', () => {
  assert.throws(() => stageReady({stage: 'selected'}, 'motion-approved'), /next workflow/);
  assert.throws(() => stageReady({stage: 'final-approved'}, 'published'), /manual/);
  assert.throws(() => stageReady({stage: 'motion-approved', soundDecision: 'native',
    assets: [], reviews: []}, 'sound-approved'), /audio/);
});

test('final approval requires every current review including pacing and actual user consent', () => {
  const assets = [{path: 'outputs/final.mp4', kind: 'final', sha256: 'c'.repeat(64)}];
  const reviews = REVIEW_AREAS.map(area => ({area, result: 'pass',
    evidence: 'Synthetic test evidence', assetSetFingerprint: assetSetFingerprint(assets)}));
  const manifest = {stage: 'sound-approved', assets, reviews, finalUserApproval: true};
  assert.equal(stageReady(manifest, 'final-approved'), true);
  assert.throws(() => stageReady({...manifest, reviews: reviews.filter(item =>
    item.area !== 'pacing-hook-reveal-hold')}, 'final-approved'), /pacing/);
  assert.throws(() => stageReady({...manifest, reviews: reviews.filter(item =>
    item.area !== 'lighting-shadow-continuity')}, 'final-approved'), /lighting/);
  assert.throws(() => stageReady({...manifest, finalUserApproval: false}, 'final-approved'), /user approval/);
});
