import puppeteer from 'puppeteer-core';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testPage() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push({ type: msg.type(), text: msg.text() });
  });
  page.on('pageerror', err => {
    consoleLogs.push({ type: 'pageerror', text: err.toString() });
  });

  console.log('Navigating to http://localhost:3000/ ...');
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));

  // Evaluate computed styles on landing page
  const styles = await page.evaluate(() => {
    const nav = document.querySelector('nav');
    const heroBtn = document.querySelector('a[href="/register"]');
    const body = document.body;
    
    // Check testimonial image parent
    const testimonialImg = document.querySelector('img[src*="testimonial"]');
    const imgParent = testimonialImg ? testimonialImg.parentElement : null;
    
    return {
      bodyBg: window.getComputedStyle(body).backgroundColor,
      bodyFont: window.getComputedStyle(body).fontFamily,
      navDisplay: nav ? window.getComputedStyle(nav).display : null,
      heroBtnBg: heroBtn ? window.getComputedStyle(heroBtn).backgroundColor : null,
      heroBtnRadius: heroBtn ? window.getComputedStyle(heroBtn).borderRadius : null,
      imgParentPosition: imgParent ? window.getComputedStyle(imgParent).position : null,
    };
  });

  console.log('Landing page computed styles:', styles);

  // Check for any console errors or hydration errors
  const errors = consoleLogs.filter(l => l.type === 'error' || l.text.includes('hydration') || l.text.includes('invalid "position"'));
  console.log('Console errors/warnings count:', errors.length);
  if (errors.length > 0) {
    console.log('Found issues:', errors);
  } else {
    console.log('No hydration errors or Image position warnings found!');
  }

  // Navigate to login
  console.log('\nNavigating to http://localhost:3000/login ...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));

  const loginStyles = await page.evaluate(() => {
    const card = document.querySelector('form') ? document.querySelector('form').parentElement : null;
    const submitBtn = document.querySelector('button[type="submit"]');
    return {
      cardBg: card ? window.getComputedStyle(card).backgroundColor : null,
      cardBorder: card ? window.getComputedStyle(card).borderRadius : null,
      btnBg: submitBtn ? window.getComputedStyle(submitBtn).backgroundColor : null,
    };
  });
  console.log('Login page computed styles:', loginStyles);

  await browser.close();
}

testPage().catch(err => {
  console.error('Browser test failed:', err);
  process.exit(1);
});
