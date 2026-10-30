import {existsSync, mkdirSync, readdirSync, writeFileSync} from 'node:fs';
import {basename, dirname, extname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  assetSetFingerprint, diverseShortlist, estimatePlan, fileHash, inside, invariant, packetDraft,
  productionRevision, rankScenarios, readJson, recordReview, refreshWorkspace,
  REVIEW_AREAS, stageReady, STAGES,
  validateFeedback, validatePacket, validateRubric, validateScenario, validateWorkspace, verifyAssets,
} from '../lib/workflow.mjs';
import {planSongCue} from '../lib/music.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const load = path => readJson(inside(root, path));
const save = (path, value) => {
  mkdirSync(dirname(path), {recursive: true});
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
};

function project() {
  const brief = load('data/brief.json');
  const rubric = load('data/rubric.json');
  const {scenarios} = load('data/scenarios.json');
  const feedback = load('data/feedback.json');
  const models = load('data/model-quotes.json');
  const roadmap = load('data/roadmap.json');
  const workflows = load('data/workflows.json');
  const lanes = load('data/creative-lanes.json');
  validateRubric(rubric);
  invariant(new Set(scenarios.map(item => item.id)).size === scenarios.length, 'Duplicate scenario ID.');
  scenarios.forEach(item => validateScenario(item, rubric, brief));
  invariant(scenarios.every(item => lanes.lanes.some(lane =>
    lane.id === (item.lane ?? 'emotion-led'))), 'Scenario has an unknown creative lane.');
  validateFeedback(feedback, scenarios);
  for (const quote of models.quotes) {
    invariant(estimatePlan([{quoteId: quote.id, jobs: 1}], models.quotes) ===
      quote.chargedCreditsAtQuote, `Incorrect quote arithmetic: ${quote.id}`);
  }
  for (const example of models.planningExamples) {
    invariant(estimatePlan(example.lines, models.quotes) === example.estimatedCredits,
      `Incorrect example budget: ${example.id}`);
  }
  invariant(new Set(roadmap.phases.map(item => item.id)).size === roadmap.phases.length,
    'Duplicate roadmap phase.');
  for (const phase of roadmap.phases) {
    invariant(phase.dependsOn.every(id => roadmap.phases.some(item => item.id === id)),
      `Unknown roadmap dependency: ${phase.id}`);
  }
  for (const workflow of workflows.workflows) {
    for (const reviewer of workflow.reviewers) {
      invariant(existsSync(inside(root, `.github/agents/${reviewer}.agent.md`)),
        `Missing project reviewer: ${reviewer}`);
    }
  }
  return {brief, rubric, scenarios, feedback, models, roadmap, workflows};
}

function usage() {
  console.log(`Emotional Microfilms - local planning; never calls paid generation.

  validate [workspace-relative-manifest.json]
  rank [count]
  shortlist [count]
  budgets
  roadmap
  workflow <workflow-id>
  song-plan <workspace-relative-song-cue.json>
  feedback <scenario-id> <1-5|unrated> <shortlist|select|reject|rewrite> [note]
  packet <selected-scenario-id>
  status <workspace-relative-manifest.json>
  refresh <workspace-relative-manifest.json>
  asset <manifest> <character|keyframe|effect|video|audio|final> <project-relative-file> [reference-id]
  review <manifest> <area> <pass|fail> <observed-evidence>
  advance <manifest> <next-stage>

Feedback/packet/refresh/asset/review/advance WRITE local files; obtain user approval.
Review areas: characters, characters-user, keyframes, keyframes-user, design-user, effect-preflight, motion, sound, ${REVIEW_AREAS.join(', ')}.
Stages: ${STAGES.join(' -> ')}.
No automatic spend, upload, publish, commit or push.`);
}

try {
  const [command = 'help', ...args] = process.argv.slice(2);
  if (['help', '--help', '-h'].includes(command)) {
    usage();
  } else {
    const data = project();
    if (command === 'validate') {
      const packets = readdirSync(inside(root, 'examples')).filter(file => file.endsWith('.json'));
      for (const file of packets) {
        validatePacket(load(`examples/${file}`), data.scenarios);
      }
      if (args[0]) {
        const manifest = load(args[0]);
        validateWorkspace(manifest, data);
        verifyAssets(root, manifest);
      }
      console.log(`Valid: ${data.scenarios.length} scenarios, rubric, feedback, ${data.models.quotes.length} quotes, ${packets.length} prompt packets${args[0] ? ', supplied asset manifest' : ''}.`);
    } else if (command === 'rank') {
      const count = args[0] === undefined ? 6 : Number(args[0]);
      invariant(Number.isInteger(count) && count > 0, 'Rank count must be a positive integer.');
      console.table(rankScenarios(data.scenarios, data.rubric, data.feedback).slice(0, count));
      console.log('Editorial hypotheses only. User decisions remain separate; no scenario auto-selected.');
    } else if (command === 'shortlist') {
      console.table(diverseShortlist(data.scenarios, data.rubric, data.feedback,
        args[0] === undefined ? 6 : Number(args[0])));
      console.log('Diverse discussion slate, not a score-only winner or measured market forecast.');
    } else if (command === 'song-plan') {
      invariant(args[0], 'Provide a filled song-cue JSON; the template is not a selected song.');
      console.log(JSON.stringify(planSongCue(load(args[0])), null, 2));
    } else if (command === 'budgets') {
      console.table(data.models.planningExamples.map(item => ({
        plan: item.id, credits: estimatePlan(item.lines, data.models.quotes),
        status: 'Dated estimate; not authorized',
      })));
      console.log('Add first identity anchor (currently 18 credits per 1K attempt), music licensing and repair reserve. Refresh all quotes.');
    } else if (command === 'roadmap') {
      console.table(data.roadmap.phases.map(({id, title, status, dependsOn}) =>
        ({id, title, status, dependsOn: dependsOn.join(', ')})));
    } else if (command === 'workflow') {
      const workflow = data.workflows.workflows.find(item => item.id === args[0]);
      invariant(workflow, 'Unknown workflow. Inspect data/workflows.json for available IDs.');
      console.log(JSON.stringify(workflow, null, 2));
    } else if (command === 'feedback') {
      const [scenarioId, rating, decision, ...note] = args;
      const review = {scenarioId, rating: rating === 'unrated' ? null : Number(rating), decision,
        note: note.join(' '), at: new Date().toISOString()};
      const updated = {...data.feedback, reviews: [
        ...data.feedback.reviews.filter(item => item.scenarioId !== scenarioId), review,
      ]};
      validateFeedback(updated, data.scenarios);
      save(inside(root, 'data/feedback.json'), updated);
      console.log(`Recorded explicit user feedback: ${scenarioId}. Selection does not authorize spending.`);
    } else if (command === 'packet') {
      const scenario = data.scenarios.find(item => item.id === args[0]);
      invariant(scenario, 'Unknown scenario.');
      const manifest = packetDraft(scenario, data.brief, data.feedback);
      const path = inside(root, `workspace/${scenario.id}/manifest.json`);
      invariant(!existsSync(path), 'Workspace exists; resume its manifest rather than overwriting it.');
      const examplePath = inside(root, `examples/${scenario.id}.json`);
      if (existsSync(examplePath)) manifest.productionDraft = readJson(examplePath);
      save(path, manifest);
      console.log(`Created ${path}; generation remains unapproved, budget zero.`);
    } else if (['status', 'refresh', 'asset', 'review', 'advance'].includes(command)) {
      invariant(args[0]?.startsWith('workspace/') || args[0]?.startsWith('workspace\\'),
        'Use an ignored workspace-relative manifest path.');
      const path = inside(root, args[0]);
      let manifest = readJson(path);
      if (command !== 'refresh') validateWorkspace(manifest, data);
      if (command === 'refresh') {
        manifest = refreshWorkspace(manifest, data);
        save(path, manifest);
        console.log('Refreshed selection and brief; assets/jobs/review history retained, all approvals reset. Revise packet and renew storyboard approval.');
      } else if (command === 'status') {
        verifyAssets(root, manifest);
        console.log(JSON.stringify({
          scenarioId: manifest.scenarioId, stage: manifest.stage,
          assets: manifest.assets.length, assetSetFingerprint: assetSetFingerprint(manifest.assets),
          jobs: manifest.jobs, approvedBudgetCredits: manifest.approvedBudgetCredits,
          spentCredits: manifest.spentCredits, reservedCredits: manifest.reservedCredits,
          generationApproved: manifest.generationApproved,
          note: 'Hashes verify file integrity only, not story, motion, sound, rights or publishability.',
        }, null, 2));
      } else if (command === 'asset') {
        const [, kind, assetPath] = args;
        invariant(['character', 'keyframe', 'effect', 'video', 'audio', 'final'].includes(kind), 'Invalid asset kind.');
        const referenceId = args[3] ?? basename(assetPath, extname(assetPath));
        const idField = {character: 'characterId', keyframe: 'keyframeId', effect: 'effectId'}[kind];
        const planned = {character: manifest.productionDraft?.characterPlan?.references,
          keyframe: manifest.productionDraft?.keyframes, effect: manifest.productionDraft?.atmospherePlan?.effects}[kind];
        if (idField) invariant(planned?.some(item => item.id === referenceId), 'Provide a reference ID from the selected production packet.');
        const source = manifest.assetSources?.[assetPath] ?? {};
        if (['character', 'keyframe'].includes(kind)) invariant(
          ['generated', 'authorized-reference'].includes(source.origin), 'Record real image provenance in assetSources; sketches are not production assets.');
        const asset = {kind, path: assetPath, sha256: fileHash(inside(root, assetPath)),
          ...(idField ? {[idField]: referenceId} : {}),
          ...Object.fromEntries(['origin', 'sourceHistoryId', 'permissionEvidence'].filter(key =>
            source[key] !== undefined).map(key => [key, source[key]]))};
        const prior = manifest.assets.find(item => item.path === assetPath);
        const changed = !prior || prior.sha256 !== asset.sha256 || prior.kind !== kind ||
          assetSetFingerprint([prior]) !== assetSetFingerprint([asset]);
        manifest.assets = [...manifest.assets.filter(item => item.path !== assetPath), asset];
        verifyAssets(root, manifest);
        if (changed) {
          const earliest = {character: 'preproduction', keyframe: 'characters-approved',
            effect: 'keyframes-approved', video: 'design-locked',
            audio: 'motion-approved', final: 'sound-approved'}[kind];
          if (STAGES.indexOf(manifest.stage) > STAGES.indexOf(earliest)) manifest.stage = earliest;
          manifest.finalUserApproval = false;
          manifest.generationApproved = false;
          manifest.publicationApproval = null;
        }
        save(path, manifest);
        console.log('Asset hashed. Changed assets invalidate downstream stage and spend approvals.');
      } else if (command === 'review') {
        const [, area, result, ...evidence] = args;
        invariant(['characters', 'characters-user', 'keyframes', 'keyframes-user', 'design-user',
          'effect-preflight', 'motion', 'sound', ...REVIEW_AREAS].includes(area), 'Unknown review area.');
        invariant(['pass', 'fail'].includes(result) && evidence.join(' ').trim(),
          'Use pass/fail plus observed evidence; do not fabricate human review.');
        verifyAssets(root, manifest);
        manifest = recordReview(manifest, {area, result, evidence: evidence.join(' ')});
        save(path, manifest);
        console.log('Review recorded against the current exact asset set.');
      } else {
        verifyAssets(root, manifest);
        stageReady(manifest, args[1], data);
        if (args[1] === 'preproduction') {
          manifest.approvalRevision = (manifest.approvalRevision ?? 0) + 1;
          manifest.productionFingerprint = productionRevision(manifest);
          manifest.generationApproved = false;
          manifest.finalUserApproval = false;
        }
        manifest.stage = args[1];
        save(path, manifest);
        console.log(`Advanced to ${manifest.stage}. Publication remains manual and separately approved.`);
      }
    } else {
      throw new Error(`Unknown command: ${command}. Run help.`);
    }
  }
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
}
