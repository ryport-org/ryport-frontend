import fs from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';

async function test() {
  const postcssConfigModule = await import('../postcss.config.mjs');
  const tailwindPlugin = (await import('@tailwindcss/postcss')).default;
  const css = fs.readFileSync('app/globals.css', 'utf8');
  
  const result = await postcss([tailwindPlugin]).process(css, { from: 'app/globals.css' });
  console.log('Processed CSS with postcss.config.mjs:');
  console.log('Length:', result.css.length);
  console.log('Has .flex:', result.css.includes('.flex'));
  console.log('Has .relative:', result.css.includes('.relative'));
  console.log('Has .bg-white:', result.css.includes('.bg-white'));
}

test().catch(console.error);
