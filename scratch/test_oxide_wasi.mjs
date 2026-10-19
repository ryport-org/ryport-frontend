import oxide from '@tailwindcss/oxide';

console.log('Testing oxide Scanner with various paths:');

const testCases = [
  { base: '.', pattern: '**/*', negated: false },
  { base: process.cwd(), pattern: '**/*', negated: false },
  { base: process.cwd().replace(/\\/g, '/'), pattern: '**/*', negated: false },
  { base: 'c:/Users/israe/ryport-frontend', pattern: '**/*.{tsx,ts,jsx,js}', negated: false },
  { base: '/Users/israe/ryport-frontend', pattern: '**/*.{tsx,ts,jsx,js}', negated: false },
];

for (const source of testCases) {
  try {
    const scanner = new oxide.Scanner({ sources: [source] });
    const candidates = scanner.scan();
    console.log(`Source ${JSON.stringify(source)}: found ${candidates.length} candidates`);
    if (candidates.length > 0) {
      console.log('Sample:', candidates.slice(0, 10));
    }
  } catch (err) {
    console.log(`Source ${JSON.stringify(source)}: Error: ${err.message}`);
  }
}
