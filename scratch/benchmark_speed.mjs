import puppeteer from 'puppeteer-core';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function benchmark() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  await page.setCookie(
    { name: 'ryport_auth', value: '1', domain: 'localhost' },
    { name: 'ryport_access_token', value: 'mock-jwt-token-123', domain: 'localhost' }
  );

  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('access_token', 'mock-jwt-token-123');
    localStorage.setItem('ryport_access_token', 'mock-jwt-token-123');
    localStorage.setItem(
      'ryport_user_cache',
      JSON.stringify({
        id: 'u1',
        email: 'israel@example.com',
        full_name: 'Israel User',
        is_active: true,
        tier: 'free',
      })
    );

    const origFetch = window.fetch;
    window.fetch = async (input, init = {}) => {
      const url = typeof input === 'string' ? input : (input && input.url ? input.url : '');
      const jsonRes = (status, body) =>
        new Response(JSON.stringify(body), {
          status,
          headers: { 'Content-Type': 'application/json' },
        });

      if (url.includes('/api/v1/users/me/plan/')) {
        return jsonRes(200, {
          success: true,
          data: {
            plan: 'free',
            display_name: 'Free',
            features: [
              { name: 'ai_chat', enabled: true, limit: null },
              { name: 'cash_flow_prediction', enabled: true, limit: null },
              { name: 'export_reports', enabled: true, limit: null },
              { name: 'receipt_scanner', enabled: true, limit: null },
            ],
          },
        });
      }
      if (url.includes('/api/v1/users/me/')) {
        return jsonRes(200, {
          success: true,
          data: { id: 'u1', email: 'israel@example.com', full_name: 'Israel User' },
        });
      }
      if (url.includes('/api/v1/notifications/unread-count/')) return jsonRes(200, { success: true, data: { count: 0 } });
      if (url.includes('/api/v1/businesses/active/')) return jsonRes(200, { success: true, data: { id: 'b1', name: 'Biz' } });
      if (url.includes('/api/v1/ai/quota/')) return jsonRes(200, { success: true, data: { used: 0, limit: -1, remaining: -1, is_unlimited: true } });
      if (url.includes('/api/v1/users/dashboard-context/')) return jsonRes(200, { success: true, data: { active_business: null } });
      if (url.includes('/api/v1/dashboard/personal/')) {
        return jsonRes(200, {
          success: true,
          data: {
            balance_summary: { total_balance_kobo: 5000000, account_count: 1, currency: 'NGN' },
            spend_by_category: [{ category: 'Ops', amount_kobo: 100000, percentage: 50 }],
            budget_alerts: [],
            goal_progress: null,
            ai_quota: { used: 0, limit: -1, remaining: -1, is_unlimited: true },
            recent_transactions: [],
          },
        });
      }
      if (url.includes('/api/v1/debts/summary/')) {
        return jsonRes(200, {
          success: true,
          data: {
            total_outstanding_kobo: 2500000,
            overdue_count: 0,
            overdue_amount_kobo: 0,
            due_this_week_kobo: 2500000,
            top_debtors: [],
          },
        });
      }
      if (url.includes('/api/v1/debts/')) return jsonRes(200, { success: true, data: [] });
      if (url.includes('/api/v1/transactions/')) return jsonRes(200, { success: true, data: [] });

      return origFetch(input, init);
    };
  });

  console.log('--- STARTING PERFORMANCE BENCHMARK ---');

  // Test 1: Cold load Dashboard
  let t0 = Date.now();
  await page.goto('http://localhost:3000/app/dashboard', { waitUntil: 'domcontentloaded' });
  let t1 = Date.now();
  console.log(`[Cold Load] /app/dashboard: ${t1 - t0}ms`);

  // Test 2: Navigate to Debts
  t0 = Date.now();
  await page.goto('http://localhost:3000/app/debts', { waitUntil: 'domcontentloaded' });
  t1 = Date.now();
  console.log(`[Navigation] /app/debts: ${t1 - t0}ms`);

  // Test 3: Navigate to Transactions
  t0 = Date.now();
  await page.goto('http://localhost:3000/app/transactions', { waitUntil: 'domcontentloaded' });
  t1 = Date.now();
  console.log(`[Navigation] /app/transactions: ${t1 - t0}ms`);

  // Test 4: Navigate back to Dashboard (cached)
  t0 = Date.now();
  await page.goto('http://localhost:3000/app/dashboard', { waitUntil: 'domcontentloaded' });
  t1 = Date.now();
  console.log(`[Cached Load] /app/dashboard: ${t1 - t0}ms`);

  // Test 5: Navigate back to Debts (cached)
  t0 = Date.now();
  await page.goto('http://localhost:3000/app/debts', { waitUntil: 'domcontentloaded' });
  t1 = Date.now();
  console.log(`[Cached Load] /app/debts: ${t1 - t0}ms`);

  // Test 6: In-page client router transition
  t0 = Date.now();
  const transactionsLink = await page.$('a[href="/app/transactions"]');
  if (transactionsLink) {
    await transactionsLink.click();
    await page.waitForSelector('h1', { timeout: 3000 });
  }
  t1 = Date.now();
  console.log(`[In-App Client Click Transition] to Transactions: ${t1 - t0}ms`);

  await browser.close();
  console.log('--- BENCHMARK FINISHED ---');
}

benchmark().catch((err) => {
  console.error('Benchmark failed:', err);
  process.exit(1);
});
