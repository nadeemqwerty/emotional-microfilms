# Agent integration and private handoff

One pipeline, multiple hosts. Start at root `AGENTS.md`, then the canonical
studio/review skills it links. The Node CLI is the execution contract, not an
Agency controller. No cloned prompts, model API keys, auto-spend or paid client.
Supporting Claude does not change the GPT-only policy for delegated reasoning.

## Host matrix

Documentation checked 30 October 2026, IST. Product/transport matters, not just
the model name. Documentation capability is not an exercised account.

| Host | Entry / execution route | Verified here | Still unverified or blocked |
|---|---|---|---|
| Agency / Copilot CLI, Windows | `AGENTS.md`, repository skill, local Node commands, separately discovered OpenArt MCP tools | This session exercised CLI, ownership, synthetic transfer/relocation, tests and FFmpeg | Whole-video playback/listening, phone viewing and a second real host handoff |
| Claude Code | Thin `CLAUDE.md` imports common `AGENTS.md`; local CLI with host-granted permissions | Official discovery documentation checked; adapter included | No Claude executable/authenticated session exercised; OpenArt/auth and perception must be checked there |
| Codex local agent | Official `AGENTS.md` discovery; same CLI | Official discovery documentation checked | No authenticated Codex session exercised |
| ChatGPT web/desktop | Operator-assisted private file/handoff exchange; approved connector only if actually configured | Operator contract documented, no automatic transport claimed | No local filesystem/CLI bridge or account exercised; no automatic integration PASS |
| OpenAI Responses API / other MCP-capable hosts | Existing CLI through an explicitly approved thin tool transport | Official remote MCP/tunnel documentation checked | No deployed connector/auth; never expose a shell/public server by implication |

Official references:
[Claude memory/discovery](https://code.claude.com/docs/en/memory),
[Codex instructions](https://developers.openai.com/codex/guides/agents-md/),
[OpenAI MCP transports](https://platform.openai.com/docs/guides/tools-connectors-mcp),
[Copilot CLI](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/use-copilot-cli).
The installed Copilot help confirmed `AGENTS.md`, repository instructions,
`/skills`, `/mcp` and `/instructions`; its packaged README was unavailable.
Do not install an unverified connector or treat API documentation as proof of
ChatGPT UI capability.

At each host explicitly check: repo read/write, Node CLI, private media access,
image inspection, full video playback, full audio listening, OpenArt tools/auth,
user approval interaction, and existing owner/job status. For each capability
record available/tested/blocked and evidence in the private handoff. If absent:
use an operator for that exact action and return their real result, or BLOCKED.
Never replace missing playback with a pretend visual review.

## Shared operations

Node 20+; no npm install. FFmpeg must already be installed:
`--ffmpeg "C:\path\to\ffmpeg.exe"` or `FFMPEG_PATH`. No hardcoded machine path.

```powershell
node scripts\film.mjs workflow produce
node scripts\film.mjs status workspace\a-seat-for-dad\manifest.json
node scripts\film.mjs handoff workspace\a-seat-for-dad\manifest.json
```

`handoff` is read-only, verifies registered media and emits relative asset
paths/hashes, revision, owner, job IDs/status, budgets and remaining inspections.
It omits reference URLs and arbitrary manifest metadata. Keep it private.
Preserve the complete original manifest/media separately; the redacted summary
is NOT a restore bundle or complete authority record.

For external generation discover the real host's available tool schemas first.
The inspected OpenArt server exposes model list/form/cost, generation, creation
get/wait and upload tools. Do not invent aliases or assume a standalone music
endpoint. Read-only research needs no spend permission. Actual upload/generation
still requires the exact consent, real refs, quote, duplicate check and saved ID.

## Single writer, transfer and recovery

After terminal-job/reservation reconciliation, claim an unowned workspace:

```powershell
node scripts\film.mjs claim workspace\a-seat-for-dad\manifest.json producer-id
$env:FILM_OWNER = 'producer-id'
```

All mutating existing-manifest CLI commands require this owner. An exclusive
short-lived `.write-lock` prevents overlapping writes; compare-and-swap refuses
to replace a manifest changed since read. `.owner.json` is persistent and private.
Raw edits/external scripts can bypass cooperative guards: coordinate them too.
These checks do not authenticate humans, provider testimony or other hosts.
No automatic timeout takeover. After a crash inspect the specific lock's PID,
owner, source hash, actual provider jobs/reservations; only after agreed recovery
remove that exact orphan lock. Never delete the manifest or reset its ledger.

Transfer uses `film transfer <manifest> <next-owner> <private-receipt.json>`,
with the current `FILM_OWNER`. Receipt fields:
`manifestSha256`, `at` (within one hour), `reservedCredits`,
`resumeHistoryIds` (ALL active IDs), `providerReconciliationEvidence`.
Reconcile against the real provider before writing it. A transfer changes only
ownership, not jobs/charges/reviews/consent. The new owner resumes the same IDs;
never resubmit because an agent changed or a call timed out.
Authority remains scoped/revocable and must be rechecked, not copied as new consent.

For operator-assisted ChatGPT: give the common instructions and private handoff,
ask it for the next scoped proposal/review, have the current authorized operator
run the same CLI, and return exact output/hash. Transfer ownership only if that
operator really changes. This is assisted integration, NOT automatic execution.

## Restore and evidence

Privately transfer source revision/diff, `workspace`, registered `media` and
`outputs`, ownership sidecar, exact feedback, rights/delegation records, inspection
reports and hashes. Do not copy tokens, `.env`, caches, signed-link logs, installed
dependencies or host-private authentication. Reacquire provider refs through
authorized current metadata when expired. Missing private inputs remain blocked.
Use relative paths, restore into another directory and run check, validate,
status and handoff before any write. Read-only handoff does not authorize spend.

Automated tests exercise synthetic relocation, pending-ID preservation,
failed-review preservation, ownership transfer, stale-write refusal and absent
encoder. They do not prove a real Claude/ChatGPT account or media-perception
integration. Real multi-host exercise remains an explicit open acceptance item.
