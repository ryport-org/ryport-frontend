import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const mockZeroReport = {
  id: 'report-zero',
  type: 'weekly',
  period: '2026-W43',
  title: 'Weekly Summary',
  created_at: '2026-10-19T10:00:00Z',
  data: {
    period: '2026-W43',
    net_kobo: 0,
    period_end: '2026-10-25',
    by_category: [],
    period_start: '2026-10-19',
    ai_suggestions: [],
    total_income_kobo: 0,
    transaction_count: 0,
    total_expense_kobo: 0
  }
};

const mockPopulatedReport = {
  id: 'report-populated',
  type: 'weekly',
  period: '2026-W43',
  title: 'Executive Financial Summary',
  created_at: '2026-10-19T10:00:00Z',
  data: {
    period: '2026-W43',
    net_kobo: 12500000,
    period_end: '2026-10-25',
    by_category: [
      { category: 'Groceries & Food', amount_kobo: 4500000, percentage: 45, transaction_count: 5 },
      { category: 'Utilities & Power', amount_kobo: 3000000, percentage: 30, transaction_count: 3 },
      { category: 'Transit & Fuel', amount_kobo: 2500000, percentage: 25, transaction_count: 4 }
    ],
    period_start: '2026-10-19',
    ai_suggestions: [
      'Operating expenses are down 12% compared to last week.',
      'Utility charges were stable throughout the reporting period.'
    ],
    total_income_kobo: 22500000,
    transaction_count: 12,
    total_expense_kobo: 10000000
  }
};

const mockBudget = {
  id: 'b-123',
  category: 'Food & Dining',
  period: 'monthly',
  limit_kobo: 50000000,
  spent_kobo: 21500000,
  remaining_kobo: 28500000,
  usage_percent: 43
};

const mockAlerts = [
  {
    id: 'alt-1',
    message: 'Food & Dining budget exceeded 40% threshold with 15 days remaining.',
    severity: 'warning',
    category: 'Food & Dining',
    created_at: '2026-10-19T12:00:00Z'
  },
  {
    id: 'alt-2',
    message: 'Upcoming bill from PHCN due in 3 days.',
    severity: 'info',
    category: 'Utilities',
    created_at: '2026-10-18T09:30:00Z'
  }
];

async function run() {
  console.log('--- Starting Presentable Data Verification ---');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  await page.setCookie(
    { name: 'ryport_auth', value: '1', domain: 'localhost' },
    { name: 'ryport_access_token', value: 'mock-jwt-token-123', domain: 'localhost' }
  );

  await page.evaluateOnNewDocument((zeroReport, populatedReport, budget, alerts) => {
    localStorage.setItem('access_token', 'mock-jwt-token-123');
    localStorage.setItem('refresh_token', 'mock-jwt-token-123');
    localStorage.setItem('ryport_access_token', 'mock-jwt-token-123');
    localStorage.setItem('ryport_refresh_token', 'mock-jwt-token-123');

    window.fetch = async (input, init = {}) => {
      const url = typeof input === 'string' ? input : (input && input.url ? input.url : '');

      function jsonRes(status, body) {
        return new Response(JSON.stringify(body), {
          status,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (url.includes('/api/v1/users/me/plan/')) {
        return jsonRes(200, {
          success: true,
          data: {
            plan: 'free',
            display_name: 'Free',
            features: [
              { name: 'export_reports', enabled: true, limit: null },
              { name: 'ai_chat', enabled: true, limit: null },
            ]
          }
        });
      }

      if (url.includes('/api/v1/users/me/')) {
        return jsonRes(200, {
          success: true,
          data: {
            id: 'u-1',
            email: 'israel@example.com',
            full_name: 'Israel Developer',
            plan: 'free',
            segment: 'freelancer'
          }
        });
      }

      if (url.includes('/api/v1/reports/report-zero/')) {
        return jsonRes(200, { success: true, data: zeroReport });
      }

      if (url.includes('/api/v1/reports/report-populated/')) {
        return jsonRes(200, { success: true, data: populatedReport });
      }

      if (url.includes('/api/v1/reports/')) {
        return jsonRes(200, { success: true, data: [zeroReport, populatedReport] });
      }

      if (url.includes('/api/v1/budgets/b-123/alerts/')) {
        return jsonRes(200, { success: true, data: alerts });
      }

      if (url.includes('/api/v1/budgets/b-123/usage/')) {
        return jsonRes(200, {
          success: true,
          data: {
            budget_id: 'b-123',
            category: 'Food & Dining',
            period: 'monthly',
            limit_kobo: 50000000,
            spent_kobo: 21500000,
            remaining_kobo: 28500000,
            usage_percent: 43,
            period_start: '2026-10-01',
            period_end: '2026-10-31',
            is_over_budget: false,
            is_warning: false
          }
        });
      }

      if (url.includes('/api/v1/budgets/b-123/')) {
        return jsonRes(200, { success: true, data: budget });
      }

      return jsonRes(200, { success: true, data: {} });
    };
  }, mockZeroReport, mockPopulatedReport, mockBudget, mockAlerts);

  async function safeGoto(url) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await new Promise(r => setTimeout(r, 2000));
        return;
      } catch (e) {
        if (attempt === 3) throw e;
        console.log(`Retry navigating to ${url} (attempt ${attempt + 1})...`);
        await new Promise(r => setTimeout(r, 1500));
      }
    }
  }

  // Test 1: Check Report Details with Zero Data (The user's exact case)
  console.log('\n[TEST 1] Visiting /app/reports/report-zero...');
  await safeGoto('http://localhost:3000/app/reports/report-zero');
  await page.screenshot({ path: 'scratch/report_zero_preview.png', fullPage: true });
  console.log('Saved screenshot to scratch/report_zero_preview.png');

  const pageTextZero = await page.evaluate(() => document.body.innerText);

  // Assert NO raw JSON dump is visible by default
  const hasRawJsonDump = pageTextZero.includes('"period": "2026-W43"') && pageTextZero.includes('"total_income_kobo": 0');
  console.log('Has raw JSON dump on zero report screen?', hasRawJsonDump);

  const hasInflowCard = pageTextZero.includes('Total Inflow') || pageTextZero.includes('TOTAL INFLOW');
  const hasOutflowCard = pageTextZero.includes('Total Outflow') || pageTextZero.includes('TOTAL OUTFLOW');
  const hasNetCard = pageTextZero.includes('Net Balance') || pageTextZero.includes('NET BALANCE');
  const hasTxCount = pageTextZero.includes('Total Transactions') || pageTextZero.includes('TOTAL TRANSACTIONS');

  console.log('Presentable KPI scorecards visible:');
  console.log(' - Inflow Card:', hasInflowCard);
  console.log(' - Outflow Card:', hasOutflowCard);
  console.log(' - Net Balance Card:', hasNetCard);
  console.log(' - Total Transactions Card:', hasTxCount);

  // Test 2: Check Populated Report
  console.log('\n[TEST 2] Visiting /app/reports/report-populated...');
  await safeGoto('http://localhost:3000/app/reports/report-populated');

  const pageTextPopulated = await page.evaluate(() => document.body.innerText);
  console.log('Populated report elements:');
  console.log(' - Groceries & Food breakdown visible:', pageTextPopulated.includes('Groceries & Food'));
  console.log(' - AI Suggestions card visible:', pageTextPopulated.includes('AI CFO Insights') || pageTextPopulated.includes('AI Financial Insights') || pageTextPopulated.includes('Operating expenses'));

  // Test 3: Check Budget Page Alerts (verifying no JSON.stringify(a))
  console.log('\n[TEST 3] Visiting /app/budgets/b-123...');
  await safeGoto('http://localhost:3000/app/budgets/b-123');

  const pageTextBudget = await page.evaluate(() => document.body.innerText);
  const budgetHasRawJson = pageTextBudget.includes('{"id":"alt-1"') || pageTextBudget.includes('"message":');
  console.log('Budget has raw JSON alerts?', budgetHasRawJson);
  console.log('Budget has formatted alert message?', pageTextBudget.includes('Food & Dining budget exceeded'));

  // Take screenshot of report
  await safeGoto('http://localhost:3000/app/reports/report-populated');
  await page.screenshot({ path: 'scratch/report_dashboard_preview.png', fullPage: true });
  console.log('\nSaved screenshot to scratch/report_dashboard_preview.png');

  // Also take screenshot of budget alerts
  await safeGoto('http://localhost:3000/app/budgets/b-123');
  await page.screenshot({ path: 'scratch/budget_alerts_preview.png', fullPage: true });
  console.log('Saved screenshot to scratch/budget_alerts_preview.png');

  await browser.close();

  const passed = !hasRawJsonDump && hasInflowCard && hasOutflowCard && hasNetCard && hasTxCount && !budgetHasRawJson;
  console.log('\n>>> OVERALL TEST RESULT:', passed ? 'SUCCESS! DATA IS FULLY PRESENTABLE' : 'FAILED');
  process.exit(passed ? 0 : 1);
}

run().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
