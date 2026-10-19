async function inspect() {
  const cssRes = await fetch('http://localhost:3000/_next/static/css/app/layout.css?v=1792423705265');
  const text = await cssRes.text();
  console.log('--- FIRST 500 CHARACTERS ---');
  console.log(text.slice(0, 500));
  console.log('--- LAST 500 CHARACTERS ---');
  console.log(text.slice(-500));
}
inspect().catch(console.error);
