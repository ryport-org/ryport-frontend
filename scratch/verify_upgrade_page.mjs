import puppeteer from 'puppeteer-core';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testUpgrade() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  // Set auth cookies & localStorage
  await page.setCookie(
    { name: 'ryport_auth', value: '1', domain: 'localhost' },
    { name: 'ryport_access_token', value: 'mock-jwt-token-123', domain: 'localhost' }
  );

  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('access_token', 'mock-jwt-token-123');
    localStorage.setItem('refresh_token', 'mock-jwt-token-123');
    localStorage.setItem('ryport_access_token', 'mock-jwt-token-123');
    localStorage.setItem('ryport_refresh_token', 'mock-jwt-token-123');

    const origFetch = window.fetch;
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
              { name: 'ai_chat', enabled: true, limit: null },
              { name: 'cash_flow_prediction', enabled: true, limit: null },
              { name: 'export_reports', enabled: true, limit: null },
              { name: 'receipt_scanner', enabled: true, limit: null },
              { name: 'team_collaboration', enabled: true, limit: null },
            ],
          },
        });
      }

      if (url.includes('/api/v1/users/me/')) {
        return jsonRes(200, {
          success: true,
          data: {
            id: 'user-123',
            email: 'israel@example.com',
            full_name: 'Israel User',
            is_active: true,
            tier: 'free',
          },
        });
      }

      if (url.includes('/api/v1/notifications/unread-count/')) {
        return jsonRes(200, { success: true, data: { count: 0 } });
      }

      if (url.includes('/api/v1/businesses/active/')) {
        return jsonRes(200, {
          success: true,
          data: { id: 'biz-1', name: 'My Business', currency: 'NGN' },
        });
      }

      if (url.includes('/api/v1/ai/quota/')) {
        return jsonRes(200, {
          success: true,
          data: { used: 0, limit: -1, remaining: -1, is_unlimited: true },
        });
      }

      if (url.includes('/api/v1/users/dashboard-context/')) {
        return jsonRes(200, {
          success: true,
          data: {
            active_business: { id: 'biz-1', name: 'My Business', currency: 'NGN' },
            recent_businesses: [],
          },
        });
      }

      if (url.includes('/api/v1/debts/summary/')) {
        return jsonRes(200, {
          success: true,
          data: {
            total_outstanding_kobo: 0,
            overdue_count: 0,
            overdue_amount_kobo: 0,
            due_this_week_kobo: 0,
            total_debts_count: 0,
            unpaid_debts_count: 0,
            top_debtors: [],
          },
        });
      }

      if (url.includes('/api/v1/dashboard/personal/')) {
        return jsonRes(200, {
          success: true,
          data: {
            balance_summary: { total_balance_kobo: 1000000, account_count: 1, currency: 'NGN' },
            spend_by_category: [],
            budget_alerts: [],
            goal_progress: null,
            ai_quota: { used: 0, limit: -1, remaining: -1, is_unlimited: true },
            recent_transactions: [],
            pro_features: null,
          },
        });
      }

      return origFetch(input, init);
    };
  });

  console.log('Navigating to http://localhost:3000/app/upgrade ...');
  await page.goto('http://localhost:3000/app/upgrade', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 2000));

  const upgradeInfo = await page.evaluate(() => {
    const banners = Array.from(document.querySelectorAll('h3')).map(h => h.innerText);
    const buttons = Array.from(document.querySelectorAll('button')).map((b) => ({
      text: b.innerText.trim(),
      disabled: b.disabled,
      classes: b.className,
    }));
    const grid = document.querySelector('div.grid');

    return {
      url: window.location.href,
      banners,
      buttons,
      gridOpacity: grid ? window.getComputedStyle(grid).opacity : null,
    };
  });

  console.log('Upgrade Page Info:', JSON.stringify(upgradeInfo, null, 2));

  // Check Dashboard sidebar
  console.log('\nNavigating to http://localhost:3000/app/dashboard ...');
  await page.goto('http://localhost:3000/app/dashboard', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 2000));

  const sidebarButtonInfo = await page.evaluate(() => {
    const upgradeLink = document.querySelector('aside a[href="/app/upgrade"]');
    return upgradeLink
      ? {
          text: upgradeLink.innerText.trim(),
          href: upgradeLink.getAttribute('href'),
          classes: upgradeLink.className,
          opacity: window.getComputedStyle(upgradeLink).opacity,
          color: window.getComputedStyle(upgradeLink).color,
        }
      : null;
  });

  console.log('Sidebar Upgrade Button Info:', JSON.stringify(sidebarButtonInfo, null, 2));

  // Check Settings page
  console.log('\nNavigating to http://localhost:3000/app/settings ...');
  await page.goto('http://localhost:3000/app/settings', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 2000));

  const settingsButtonInfo = await page.evaluate(() => {
    const btn = document.querySelector('a[href="/app/upgrade"]');
    return btn
      ? {
          text: btn.innerText.trim(),
          classes: btn.className,
          opacity: window.getComputedStyle(btn).opacity,
        }
      : null;
  });

  console.log('Settings Page Button Info:', JSON.stringify(settingsButtonInfo, null, 2));

  await browser.close();
  console.log('\nVerification completed successfully!');
}

testUpgrade().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
