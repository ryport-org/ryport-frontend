import fs from 'fs';
import postcss from 'postcss';
import tailwind from '@tailwindcss/postcss';

async function test(sourceDirective) {
  const css = `@import "tailwindcss";\n${sourceDirective}\n` + fs.readFileSync('app/globals.css', 'utf8').replace('@import "tailwindcss";', '');
  const result = await postcss([tailwind]).process(css, { from: 'c:/Users/israe/ryport-frontend/app/globals.css' });
  console.log(`Directive [${sourceDirective}]:`);
  console.log('  Length:', result.css.length);
  console.log('  Has .flex:', result.css.includes('.flex'));
  console.log('  Has .bg-white:', result.css.includes('.bg-white'));
  console.log('  Has .rounded-xl:', result.css.includes('.rounded-xl'));
  console.log('  Has .text-ink:', result.css.includes('.text-ink') || result.css.includes('color-ink'));
}

async function run() {
  await test('');
  await test('@source "../";');
  await test('@source "../components";\n@source "../app";');
  await test('@source "../components/**/*.tsx";\n@source "../app/**/*.tsx";');
}

run().catch(console.error);
