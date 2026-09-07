/**
 * G15: no financial identifier may appear in a git-tracked file.
 *
 * The trust's bank identifiers are injected from the environment at build time
 * and must stay out of the public repository and its history. This checks the
 * tracked working tree AND every commit reachable from HEAD, because removing
 * a value from the current files does not remove it from history.
 */
import { execFileSync } from 'node:child_process';

// Structural patterns, not the values themselves - this file is committed too.
const PATTERNS = [
  { name: 'Indian bank IFSC', re: /\b[A-Z]{4}0[A-Z0-9]{6}\b/ },
  { name: '11-digit account number', re: /\b\d{11}\b/ },
  { name: 'MICR code', re: /\b\d{9}\b/ },
];

// Files that legitimately contain long digit strings.
const ALLOW = [
  /^package-lock\.json$/,
  /^\.env\.example$/,
  /^scripts\/gates\/no-secrets\.mjs$/,
  /^GATES\.md$/,
  /^src\/data\/media\.ts$/,
];

const git = (args) => execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

let repo = true;
try {
  git(['rev-parse', '--is-inside-work-tree']);
} catch {
  repo = false;
}

if (!repo) {
  console.log('not a git repository - nothing tracked to scan');
  console.log('NO_SECRETS_OK');
  process.exit(0);
}

const findings = [];

// --- 1. tracked working tree ---
const tracked = git(['ls-files']).split('\n').filter(Boolean);
for (const file of tracked) {
  if (ALLOW.some((re) => re.test(file))) continue;
  if (/\.(png|jpe?g|webp|ico|woff2?|pdf)$/i.test(file)) continue;

  let content = '';
  try {
    content = git(['show', `HEAD:${file}`]);
  } catch {
    continue; // newly added, not yet in HEAD
  }
  for (const { name, re } of PATTERNS) {
    const m = content.match(re);
    if (m) findings.push(`${file}: ${name} (${m[0].slice(0, 4)}...)`);
  }
}

// --- 2. full history ---
const revs = git(['rev-list', '--all']).split('\n').filter(Boolean);
if (revs.length > 40) {
  console.log(`history scan skipped: ${revs.length} commits (scan the tree only)`);
} else {
  for (const rev of revs) {
    let diff = '';
    try {
      diff = git(['show', '--format=', '--unified=0', rev]);
    } catch {
      continue;
    }
    for (const { name, re } of PATTERNS) {
      // Only look at added lines that are not in an allowed file.
      for (const line of diff.split('\n')) {
        if (!line.startsWith('+') || line.startsWith('+++')) continue;
        const m = line.match(re);
        if (m) {
          findings.push(`commit ${rev.slice(0, 8)}: ${name} (${m[0].slice(0, 4)}...)`);
          break;
        }
      }
    }
  }
}

const unique = [...new Set(findings)];
if (unique.length) {
  console.error(`${unique.length} financial identifier(s) found in tracked content:`);
  unique.slice(0, 20).forEach((f) => console.error('  ' + f));
  console.error('Move these into .env (see .env.example); they must not enter git history.');
  process.exit(1);
}

console.log(`scanned ${tracked.length} tracked files and ${revs.length} commit(s)`);
console.log('NO_SECRETS_OK');
