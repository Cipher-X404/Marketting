#!/usr/bin/env node
/**
 * Project sanity check: JS syntax, local links/assets, and stray remote images.
 * Run with `npm run check`. Exits 1 if anything is wrong.
 */
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname, normalize, extname } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = new URL('..', import.meta.url).pathname;
const skip = new Set(['.git', 'node_modules', 'vendor']);
const files = [];
(function walk(d) {
    for (const n of readdirSync(d)) {
        if (skip.has(n)) continue;
        const p = join(d, n);
        statSync(p).isDirectory() ? walk(p) : files.push(p);
    }
})(root);

const problems = [];
const warnings = [];
for (const f of files.filter((f) => extname(f) === '.js')) {
    try { execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' }); } catch (e) { problems.push('syntax: ' + f.replace(root, '') + '\n' + e.stderr.toString().split('\n').slice(0, 4).join('\n')); }
}
const attr = /(?:href|src)=\\?["']([^"'`${}#]+?)\\?["']/g;
for (const f of files.filter((f) => ['.html', '.js'].includes(extname(f)))) {
    const t = readFileSync(f, 'utf8');
    for (const m of t.matchAll(attr)) {
        const u = m[1];
        if (/^(https?:|mailto:|tel:|data:|javascript:|\/\/)/.test(u)) continue;
        const p = decodeURIComponent(u.split('?')[0]);
        // links inside scripts resolve against the page, which sits above assets/js
        const base = extname(f) === '.js' && f.includes('/assets/js/') ? f.split('/assets/js/')[0] : dirname(f);
        if (p && !existsSync(normalize(join(base, p)))) problems.push(`missing: ${f.replace(root, '')} -> ${u}`);
    }
    if (/images\.unsplash\.com|ui-avatars\.com/.test(t)) (process.argv.includes('--strict') ? problems : warnings).push('remote image still referenced: ' + f.replace(root, ''));
}
if (warnings.length) console.warn(warnings.join('\n') + '\n(warnings only; run with --strict to fail on them)');
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
console.log(`OK: ${files.length} files checked`);
