#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const mode = process.env.COVERAGE_ENFORCEMENT_MODE ?? 'report';

const ROOT = process.cwd();
const ARTIFACTS = path.join(ROOT, '.artifacts');

const DOMAIN_PATTERNS = [
  '.domain.',
  '.application.usecase.',
  '.application.command.',
  '.application.query.'
];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function parseJacocoCounters(xml) {
  const packageRegex = /<package name="([^"]+)">([\s\S]*?)<\/package>/g;
  const lineCounterRegex = /<counter type="LINE" missed="(\d+)" covered="(\d+)"\/>/g;

  let domain = { covered: 0, total: 0 };
  let nonDomain = { covered: 0, total: 0 };

  let pkgMatch;
  while ((pkgMatch = packageRegex.exec(xml)) !== null) {
    const pkgName = pkgMatch[1].replaceAll('/', '.');
    const pkgBody = pkgMatch[2];
    const isDomain = DOMAIN_PATTERNS.some((p) => pkgName.includes(p));

    let counterMatch;
    while ((counterMatch = lineCounterRegex.exec(pkgBody)) !== null) {
      const missed = Number(counterMatch[1]);
      const covered = Number(counterMatch[2]);
      const total = missed + covered;
      if (isDomain) {
        domain.covered += covered;
        domain.total += total;
      } else {
        nonDomain.covered += covered;
        nonDomain.total += total;
      }
    }
  }

  return { domain, nonDomain };
}

function parseLcov(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let covered = 0;
  let total = 0;
  for (const line of content.split(/\r?\n/)) {
    if (!line.startsWith('DA:')) continue;
    const raw = line.slice(3).split(',');
    if (raw.length < 2) continue;
    total += 1;
    if (Number(raw[1]) > 0) covered += 1;
  }
  return { covered, total };
}

function ratio(stats) {
  if (stats.total === 0) return null;
  return (stats.covered / stats.total) * 100;
}

const files = walk(ARTIFACTS);
const jacocoFiles = files.filter((f) => f.endsWith('jacoco.xml'));
const lcovFiles = files.filter((f) => f.endsWith('lcov.info'));

let domain = { covered: 0, total: 0 };
let nonDomain = { covered: 0, total: 0 };

for (const jf of jacocoFiles) {
  const xml = fs.readFileSync(jf, 'utf8');
  const parsed = parseJacocoCounters(xml);
  domain.covered += parsed.domain.covered;
  domain.total += parsed.domain.total;
  nonDomain.covered += parsed.nonDomain.covered;
  nonDomain.total += parsed.nonDomain.total;
}

for (const lf of lcovFiles) {
  const parsed = parseLcov(lf);
  nonDomain.covered += parsed.covered;
  nonDomain.total += parsed.total;
}

const domainPct = ratio(domain);
const nonDomainPct = ratio(nonDomain);

console.log('--- Coverage Gate Summary ---');
console.log(`Mode: ${mode}`);
console.log(`JaCoCo files: ${jacocoFiles.length}`);
console.log(`LCOV files: ${lcovFiles.length}`);
console.log(`Domain lines: ${domain.covered}/${domain.total}`);
console.log(`Non-domain lines: ${nonDomain.covered}/${nonDomain.total}`);
console.log(`Domain coverage: ${domainPct === null ? 'N/A' : domainPct.toFixed(2) + '%'}`);
console.log(`Non-domain coverage: ${nonDomainPct === null ? 'N/A' : nonDomainPct.toFixed(2) + '%'}`);

const failures = [];
if (domainPct !== null && domainPct < 100) failures.push('COVERAGE_DOMAIN_100_FAILED');
if (nonDomainPct !== null && nonDomainPct < 80) failures.push('COVERAGE_NON_DOMAIN_80_FAILED');

if (mode === 'enforce' && failures.length > 0) {
  for (const code of failures) console.error(code);
  process.exit(1);
}

if (mode === 'enforce' && domainPct === null) {
  console.error('COVERAGE_DOMAIN_100_FAILED: No domain scope data found');
  process.exit(1);
}

if (mode === 'enforce' && nonDomainPct === null) {
  console.error('COVERAGE_NON_DOMAIN_80_FAILED: No non-domain scope data found');
  process.exit(1);
}

process.exit(0);
