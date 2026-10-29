import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {prepareReference, reviewWorkspace, expandReference, writeRemakeBrief} from '../lib/reverse.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const help = `Private local reverse-engineering workbench (Node 20+, no installed plugin).
  node scripts\\reverse.mjs prepare --input <local-video-or-URL> --workspace <NEW-name> --ffmpeg <exe>
    [--interval 2] [--max-frames 120] [--transcript <user-text-file>] [--download-public-video]
  node scripts\\reverse.mjs expand --workspace <name> --start 2 --end 4 --interval 0.25 --ffmpeg <exe>
  node scripts\\reverse.mjs validate-review --workspace <name> [--analysis analysis.json]
  node scripts\\reverse.mjs remake-brief --workspace <name> --feedback <actual-feedback.json>
    [--analysis analysis.json] [--out <new-filename.json>]
FFMPEG_PATH can replace --ffmpeg. Workspace names live only under ignored workspace\\.
Instagram pages return NEEDS_LOCAL_EXPORT, never scrape/auth-bypass. Direct HTTPS video
download is opt-in, public IPv4 only, no redirects, <=250 MiB/30s. No hidden network calls.
Every prepare starts pending. Watch/listen to the entire exact source, review every
segment, and supply actual structured feedback. No generation/upload/publication approval.
See docs\\reverse-engineering.md and data\\reverse-analysis-template.json.`;

function parse(argv) {
  const [command, ...args] = argv;
  if (!command || command === '--help' || command === 'help') return {command: 'help'};
  const accepted = {
    prepare: ['input', 'workspace', 'ffmpeg', 'interval', 'max-frames', 'transcript', 'download-public-video'],
    expand: ['workspace', 'start', 'end', 'interval', 'max-frames', 'ffmpeg'],
    'validate-review': ['workspace', 'analysis'],
    'remake-brief': ['workspace', 'feedback', 'analysis', 'out'],
  };
  if (!accepted[command]) throw new Error(`Unknown command: ${command}`);
  const flags = {};
  for (let i = 0; i < args.length; i++) {
    const key = args[i].slice(2);
    if (!args[i].startsWith('--') || !accepted[command].includes(key) || key in flags) {
      throw new Error(`Unknown/duplicate option: ${args[i]}`);
    }
    if (key === 'download-public-video') flags[key] = true;
    else {
      if (!args[i + 1] || args[i + 1].startsWith('--')) throw new Error(`Missing value: --${key}`);
      flags[key] = args[++i];
    }
  }
  const required = command === 'prepare' ? ['input', 'workspace'] :
    command === 'expand' ? ['workspace', 'start', 'end'] :
      command === 'remake-brief' ? ['workspace', 'feedback'] : ['workspace'];
  for (const key of required) if (!flags[key]) throw new Error(`Missing --${key}.`);
  for (const key of ['interval', 'max-frames', 'start', 'end']) {
    if (key in flags) {
      flags[key] = Number(flags[key]);
      if (!Number.isFinite(flags[key])) throw new Error(`--${key} must be finite.`);
    }
  }
  return {command, flags};
}

try {
  const {command, flags: f} = parse(process.argv.slice(2));
  let result;
  if (command === 'help') console.log(help);
  else if (command === 'prepare') {
    result = await prepareReference(root, {input: f.input, workspace: f.workspace,
      ffmpeg: f.ffmpeg ?? process.env.FFMPEG_PATH, interval: f.interval, maxFrames: f['max-frames'],
      transcript: f.transcript, allowDownload: f['download-public-video']});
  } else if (command === 'expand') {
    result = await expandReference(root, {workspace: f.workspace, start: f.start, end: f.end,
      interval: f.interval, maxFrames: f['max-frames'], ffmpeg: f.ffmpeg ?? process.env.FFMPEG_PATH});
  } else if (command === 'validate-review') {
    result = (await reviewWorkspace(root, f.workspace, f.analysis)).report;
  } else {
    result = await writeRemakeBrief(root, f.workspace, f.feedback, f.analysis, f.out);
  }
  if (result) {
    console.log(JSON.stringify(result, null, 2));
    if (result.code === 'NEEDS_LOCAL_EXPORT') process.exitCode = 2;
  }
} catch (error) {
  console.error(`Reverse workbench: ${error.message}`);
  process.exitCode = 1;
}
