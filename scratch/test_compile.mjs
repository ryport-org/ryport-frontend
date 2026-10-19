import { compile } from '@tailwindcss/node';
import fs from 'fs';

async function run() {
  const css = fs.readFileSync('app/globals.css', 'utf8');
  const compiler = await compile(css, {
    base: 'c:/Users/israe/ryport-frontend',
    from: 'c:/Users/israe/ryport-frontend/app/globals.css',
  });
  console.log('Compiler created!');
  console.log('Root:', compiler.root);
  console.log('Sources:', compiler.sources);
  const candidates = ['flex', 'bg-white', 'rounded-xl', 'text-ink', 'relative', 'hidden'];
  const builtCss = compiler.build(candidates);
  console.log('Built CSS with explicit candidates:');
  console.log('Length:', builtCss.length);
  console.log('Has .flex:', builtCss.includes('.flex') || builtCss.includes('flex'));
  console.log('Has .bg-white:', builtCss.includes('.bg-white') || builtCss.includes('bg-white'));
}

run().catch(console.error);
