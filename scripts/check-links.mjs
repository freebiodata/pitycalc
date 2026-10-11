/**
 * Verifies that every internal link/asset reference in dist/ resolves to a
 * real file. Run after `npm run build`.
 */
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const dist = resolve(process.cwd(), 'dist');
if (!existsSync(dist)) {
  console.error('dist/ not found — run `npm run build` first.');
  process.exit(1);
}

const htmlFiles = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full);
    else if (name.endsWith('.html')) htmlFiles.push(full);
  }
})(dist);

const targets = new Set();
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      walk(full);
      targets.add(full + '/'); // directory → dir/index.html
    } else {
      targets.add(full);
    }
  }
})(dist);

const refRe = /(?:href|src)="([^"]+)"/g;
const problems = [];
const checked = new Set();

function resolves(urlPath) {
  if (urlPath === '' || urlPath.startsWith('#')) return true;
  if (urlPath.startsWith('mailto:') || urlPath.startsWith('tel:')) return true;
  if (/^https?:\/\//.test(urlPath)) return true; // external, skip
  if (urlPath.startsWith('//')) return true;
  let p = urlPath.split('#')[0].split('?')[0];
  if (p === '') return true;
  const abs = join(dist, p.replace(/^\//, ''));
  if (existsSync(abs) && statSync(abs).isFile()) return true;
  if (existsSync(join(abs, 'index.html'))) return true;
  if (existsSync(abs + '.html')) return true;
  return false;
}

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  let m;
  while ((m = refRe.exec(html)) !== null) {
    const url = m[1];
    const key = `${file} → ${url}`;
    if (checked.has(key)) continue;
    checked.add(key);
    if (!resolves(url)) {
      problems.push(`${file.replace(dist, '')} → ${url}`);
    }
  }
}

if (problems.length > 0) {
  console.error(`\n${problems.length} broken internal reference(s):`);
  for (const p of problems) console.error('  ' + p);
  process.exit(1);
}
console.log(`Link check passed: ${htmlFiles.length} HTML files, ${checked.size} references all resolve.`);
