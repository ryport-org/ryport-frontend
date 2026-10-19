import fs from 'fs';
import path from 'path';
import postcss from 'postcss';
import tailwind from '@tailwindcss/postcss';
import oxide from '@tailwindcss/oxide';

// Fast pure-JS candidate extractor
function extractCandidates(content) {
  const candidates = new Set();
  // Match any whitespace-separated tokens or class-like strings
  const words = content.match(/[a-zA-Z0-9_\-\/\[\]#:\.%]+/g) || [];
  for (const word of words) {
    if (word.length >= 2 && word.length <= 100) {
      candidates.add(word);
    }
  }
  return candidates;
}

function scanProject(dirs) {
  const allCandidates = new Set();
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === '.git') continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (/\.(tsx|ts|jsx|js|html)$/.test(entry.name)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const cands = extractCandidates(content);
        for (const c of cands) allCandidates.add(c);
      }
    }
  }
  for (const d of dirs) walk(d);
  return Array.from(allCandidates);
}

const jsCandidates = scanProject(['app', 'components', 'staff', 'lib']);
console.log('Total extracted candidates from JS:', jsCandidates.length);
console.log('Sample candidates:', jsCandidates.slice(0, 20));

// Monkey patch oxide.Scanner.prototype.scan
const origScan = oxide.Scanner.prototype.scan;
oxide.Scanner.prototype.scan = function () {
  console.log('Intercepted scanner.scan()! Returning', jsCandidates.length, 'candidates');
  return jsCandidates;
};

// Now run PostCSS with @tailwindcss/postcss
const css = fs.readFileSync('app/globals.css', 'utf8');
postcss([tailwind])
  .process(css, { from: 'c:/Users/israe/ryport-frontend/app/globals.css' })
  .then((result) => {
    console.log('RESULT CSS LENGTH:', result.css.length);
    console.log('Has .flex:', result.css.includes('.flex'));
    console.log('Has .bg-white:', result.css.includes('.bg-white'));
    console.log('Has .rounded-xl:', result.css.includes('.rounded-xl'));
    console.log('Has .text-ink:', result.css.includes('.text-ink') || result.css.includes('color-ink'));
    console.log('Has .relative:', result.css.includes('.relative'));
    console.log('Has .grid:', result.css.includes('.grid'));
  })
  .catch(console.error);
