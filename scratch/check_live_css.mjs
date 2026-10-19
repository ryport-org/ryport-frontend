async function check() {
  const htmlRes = await fetch('http://localhost:3000/');
  const html = await htmlRes.text();
  console.log('HTML size:', html.length);
  const cssMatches = Array.from(html.matchAll(/href="([^"]+\.css[^"]*)"/g));
  console.log('CSS links found in HTML:', cssMatches.map(m => m[1]));
  
  for (const m of cssMatches) {
    const url = m[1];
    const fullUrl = url.startsWith('http') ? url : 'http://localhost:3000' + url;
    const cssRes = await fetch(fullUrl);
    const cssText = await cssRes.text();
    console.log('\nInspecting:', fullUrl);
    console.log('  CSS size in bytes:', cssText.length);
    console.log('  Contains .flex:', cssText.includes('.flex') || cssText.includes('display: flex') || cssText.includes('display:flex'));
    console.log('  Contains .relative:', cssText.includes('.relative') || cssText.includes('position: relative') || cssText.includes('position:relative'));
    console.log('  Contains .bg-white:', cssText.includes('.bg-white') || cssText.includes('background-color: #fff'));
    console.log('  Contains .rounded-xl:', cssText.includes('.rounded-xl'));
  }
}

check().catch(console.error);
