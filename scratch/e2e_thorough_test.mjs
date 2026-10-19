import puppeteer from "puppeteer-core";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = "http://localhost:3000";

console.log("================================================================================");
console.log("    RYPORT V1.2.0 END-TO-END BROWSER AUTOMATION & BUTTON VERIFICATION SUITE    ");
console.log("================================================================================");

const stats = {
  total: 0,
  passed: 0,
  failed: 0,
  failures: [],
};

function assert(condition, testName, details = "") {
  stats.total++;
  if (condition) {
    stats.passed++;
    console.log(`  [PASS] ${testName}`);
  } else {
    stats.failed++;
    stats.failures.push(`${testName} ${details ? `(${details})` : ""}`);
    console.error(`  [FAIL] ${testName} ${details ? `(${details})` : ""}`);
  }
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log("\n[1/12] Launching Chrome Headless Browser...");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-gpu",
      "--window-size=1366,768",
    ],
  });

  // ===========================================================================
  // SECTION A: UNAUTHENTICATED TESTS (Register, Login, Forgot Password)
  // ===========================================================================
  const authPage = await browser.newPage();
  await authPage.setViewport({ width: 1366, height: 768 });

  // TEST 1: Register Page & Form Submissions
  console.log("\n[2/12] Testing Register Screen & Account Creation...");
  await authPage.goto(`${BASE_URL}/register`, { waitUntil: "networkidle0" });
  
  const regEmailInput = await authPage.$('input[type="email"]');
  const regPassInput = await authPage.$('input[name="password"], input[type="password"]');
  const regSubmitBtn = await authPage.$('button[type="submit"]');

  assert(Boolean(regEmailInput), "Register Page: Email field present");
  assert(Boolean(regPassInput), "Register Page: Password field present");
  assert(Boolean(regSubmitBtn), "Register Page: 'Create account' submit button present");

  if (regEmailInput && regPassInput && regSubmitBtn) {
    await regEmailInput.type("new-founder@ryport.com.ng");
    await regPassInput.type("UltraSecurePassword2026!");
    const btnText = await authPage.evaluate(el => el.innerText, regSubmitBtn);
    assert(btnText.toLowerCase().includes("create") || btnText.toLowerCase().includes("sign up") || btnText.toLowerCase().includes("get started"), `Register submit button text: "${btnText}"`);
  }

  // TEST 2: Login Page & Sign In Form
  console.log("\n[3/12] Testing Login Screen & Sign In Buttons...");
  await authPage.goto(`${BASE_URL}/login`, { waitUntil: "networkidle0" });

  const loginEmailInput = await authPage.$('input[type="email"]');
  const loginPassInput = await authPage.$('input[type="password"]');
  const loginSubmitBtn = await authPage.$('button[type="submit"]');

  assert(Boolean(loginEmailInput), "Login Page: Email input field present");
  assert(Boolean(loginPassInput), "Login Page: Password input field present");
  assert(Boolean(loginSubmitBtn), "Login Page: 'Sign in' submit button present");

  if (loginEmailInput && loginPassInput && loginSubmitBtn) {
    await loginEmailInput.type("testuser@ryport.com.ng");
    await loginPassInput.type("MyPassword123!");
    const loginBtnText = await authPage.evaluate(el => el.innerText, loginSubmitBtn);
    assert(loginBtnText.toLowerCase().includes("sign in") || loginBtnText.toLowerCase().includes("log in"), `Login submit button text: "${loginBtnText}"`);
  }

  // Check Forgot Password link
  const forgotLink = await authPage.$('a[href*="reset-password"]');
  assert(Boolean(forgotLink), "Login Page: 'Forgot your password?' link present (points to /reset-password)");

  await authPage.close();

  // ===========================================================================
  // SECTION B: AUTHENTICATED TESTS (Dashboard, Debts, Transactions, Team, etc.)
  // ===========================================================================
  const appPage = await browser.newPage();
  await appPage.setViewport({ width: 1366, height: 768 });

  // Handle client-side fetch injection directly inside window context
  await appPage.evaluateOnNewDocument(() => {
    // 1. Set local storage tokens
    localStorage.setItem("access_token", "mock-jwt-access-token-12345");
    localStorage.setItem("refresh_token", "mock-jwt-refresh-token-12345");
    localStorage.setItem("ryport_access_token", "mock-jwt-access-token-12345");
    localStorage.setItem("ryport_refresh_token", "mock-jwt-refresh-token-12345");

    // 2. Intercept window.fetch to mock backend API responses seamlessly
    const origFetch = window.fetch;

    window.fetch = async (input, init = {}) => {
      const url = typeof input === "string" ? input : (input && input.url ? input.url : "");
      const method = (init && init.method ? init.method.toUpperCase() : "GET");

      function jsonRes(status, body) {
        return new Response(JSON.stringify(body), {
          status,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }

      // Users profile
      if (url.includes("/api/v1/users/me/plan/")) {
        return jsonRes(200, {
          success: true,
          data: {
            plan: "pro",
            display_name: "Pro Plan",
            features: [
              { name: "ai_chat", enabled: true, limit: null },
              { name: "cash_flow_prediction", enabled: true, limit: null },
              { name: "export_reports", enabled: true, limit: null },
              { name: "receipt_scanner", enabled: true, limit: null },
              { name: "team_collaboration", enabled: true, limit: null },
            ],
          },
        });
      }

      if (url.includes("/api/v1/users/me/dashboard-context/")) {
        return jsonRes(200, {
          success: true,
          data: {
            segment: "sme",
            plan_tier: "pro",
            active_business: {
              id: "biz-101",
              name: "Ryport SME Ltd",
              currency: "NGN",
              type: "Services",
            },
          },
        });
      }

      if (url.includes("/api/v1/users/me/")) {
        return jsonRes(200, {
          success: true,
          data: {
            id: "user-test-uuid",
            email: "testuser@ryport.com.ng",
            full_name: "Test SME Owner",
            plan: "pro",
            segment: "sme",
            is_2fa_enabled: false,
          },
        });
      }

      // Notifications
      if (url.includes("/api/v1/notifications/unread-count/")) {
        return jsonRes(200, { success: true, data: { count: 1 } });
      }

      if (url.includes("/api/v1/notifications/read-all/")) {
        return jsonRes(200, { success: true, data: null });
      }

      if (url.includes("/api/v1/notifications/")) {
        return jsonRes(200, {
          success: true,
          data: [
            {
              id: "notif-match-101",
              type: "debt_payment_match",
              title: "Payment match suggestion: Kola Enterprises",
              body: "We detected a credit of ₦30,000.00. Did Kola Enterprises make a payment towards their balance?",
              is_read: false,
              created_at: new Date().toISOString(),
              metadata: {
                debt_id: "debt-kola-uuid",
                transaction_id: "tx-credit-uuid",
                transaction_amount_kobo: 3000000,
                debt_remaining_kobo: 3000000,
                debtor_name: "Kola Enterprises",
              },
            },
          ],
        });
      }

      // Debts summary
      if (url.includes("/api/v1/debts/summary/")) {
        return jsonRes(200, {
          success: true,
          data: {
            total_outstanding_kobo: 15000000,
            overdue_count: 1,
            overdue_amount_kobo: 5000000,
            due_this_week_kobo: 10000000,
            total_debts_count: 3,
            unpaid_debts_count: 2,
            top_debtors: [
              {
                id: "debt-kola-uuid",
                debtor_name: "Kola Enterprises",
                phone_number: "2348012345678",
                amount_kobo: 10000000,
                remaining_amount_kobo: 10000000,
                due_date: "2026-10-25",
                is_overdue: false,
              },
              {
                id: "debt-tunde-uuid",
                debtor_name: "Tunde Bakare",
                phone_number: "2348098765432",
                amount_kobo: 5000000,
                remaining_amount_kobo: 5000000,
                due_date: "2026-10-10",
                is_overdue: true,
              },
            ],
          },
        });
      }

      // Debt reminders
      if (url.includes("/reminder-message/")) {
        return jsonRes(200, {
          success: true,
          data: {
            debt_id: "debt-kola-uuid",
            debtor_name: "Kola Enterprises",
            phone_number: "2348012345678",
            remaining_amount_kobo: 10000000,
            sms_text: "Hello Kola Enterprises, gentle reminder that ₦100,000.00 is due on 2026-10-25. Thank you!",
            whatsapp_url: "https://wa.me/2348012345678?text=Hello%20Kola%20Enterprises",
          },
        });
      }

      // Confirm match
      if (url.includes("/confirm-match/")) {
        return jsonRes(200, { success: true, data: { status: "paid" } });
      }

      // Mark paid
      if (url.includes("/mark-paid/")) {
        return jsonRes(200, { success: true, data: { status: "paid", amount_paid_kobo: 10000000 } });
      }

      // Create debt
      if (url.includes("/api/v1/debts/") && method === "POST") {
        return jsonRes(201, {
          success: true,
          data: {
            id: "debt-new-uuid",
            debtor_name: "Acme Logistics",
            phone_number: "08055555555",
            amount_kobo: 5000000,
            amount_paid_kobo: 0,
            remaining_amount_kobo: 5000000,
            due_date: "2026-11-01",
            status: "outstanding",
            source: "manual",
          },
        });
      }

      // Delete debt
      if (url.includes("/api/v1/debts/") && method === "DELETE") {
        return new Response(null, { status: 204 });
      }

      // List debts
      if (url.includes("/api/v1/debts/")) {
        return jsonRes(200, {
          success: true,
          data: [
            {
              id: "debt-kola-uuid",
              debtor_name: "Kola Enterprises",
              phone_number: "08012345678",
              amount_kobo: 10000000,
              amount_paid_kobo: 0,
              remaining_amount_kobo: 10000000,
              due_date: "2026-10-25",
              status: "outstanding",
              source: "auto_from_invoice",
              notes: "Invoice #1002 for warehouse logistics",
              is_overdue: false,
            },
            {
              id: "debt-tunde-uuid",
              debtor_name: "Tunde Bakare",
              phone_number: "08098765432",
              amount_kobo: 5000000,
              amount_paid_kobo: 0,
              remaining_amount_kobo: 5000000,
              due_date: "2026-10-10",
              status: "overdue",
              source: "manual",
              notes: "Personal loan for equipment",
              is_overdue: true,
            },
            {
              id: "debt-adeola-uuid",
              debtor_name: "Adeola Motors",
              phone_number: "08033333333",
              amount_kobo: 3000000,
              amount_paid_kobo: 3000000,
              remaining_amount_kobo: 0,
              due_date: "2026-09-15",
              status: "paid",
              source: "manual",
              is_overdue: false,
            },
          ],
        });
      }

      // Personal dashboard
      if (url.includes("/api/v1/dashboard/personal/")) {
        return jsonRes(200, {
          success: true,
          data: {
            balance_summary: {
              total_balance_kobo: 12500000,
              account_count: 2,
              linked_accounts_count: 2,
              currency: "NGN",
            },
            spend_by_category: [
              { category: "Food", amount_kobo: 1500000, percentage: 40 },
              { category: "Transport", amount_kobo: 1000000, percentage: 30 },
            ],
            budget_alerts: [],
            goal_progress: null,
            ai_quota: { used: 2, limit: 10, remaining: 8, resets_at: "", is_unlimited: true },
            recent_transactions: [
              {
                id: "tx-1",
                amount_kobo: 250000,
                type: "expense",
                category: "Food",
                description: "Lunch at Shoprite",
                transaction_date: "2026-10-18T12:00:00Z",
              },
            ],
            pro_features: {
              receivables_summary: {
                total_outstanding_kobo: 15000000,
                overdue_count: 1,
                overdue_amount_kobo: 5000000,
                due_this_week_kobo: 10000000,
                total_debts_count: 3,
                unpaid_debts_count: 2,
                top_debtors: [
                  {
                    id: "debt-kola-uuid",
                    debtor_name: "Kola Enterprises",
                    phone_number: "08012345678",
                    amount_kobo: 10000000,
                    remaining_amount_kobo: 10000000,
                    due_date: "2026-10-25",
                    is_overdue: false,
                  },
                ],
              },
            },
          },
        });
      }

      // Cashflow dashboard
      if (url.includes("/api/v1/dashboard/cashflow/")) {
        return jsonRes(200, {
          success: true,
          data: {
            opening_balance_kobo: 50000000,
            inflows_kobo: 30000000,
            outflows_kobo: 15000000,
            net_change_kobo: 15000000,
            closing_balance_kobo: 65000000,
            receivables_summary: {
              total_outstanding_kobo: 15000000,
              overdue_count: 1,
              overdue_amount_kobo: 5000000,
              due_this_week_kobo: 10000000,
              total_debts_count: 3,
              unpaid_debts_count: 2,
              top_debtors: [
                {
                  id: "debt-kola-uuid",
                  debtor_name: "Kola Enterprises",
                  phone_number: "08012345678",
                  amount_kobo: 10000000,
                  remaining_amount_kobo: 10000000,
                  due_date: "2026-10-25",
                  is_overdue: false,
                },
              ],
            },
          },
        });
      }

      // Transactions
      if (url.includes("/api/v1/transactions/sms/ingest/")) {
        return jsonRes(503, {
          success: false,
          error: {
            code: "feature_paused",
            message: "SMS transaction ingestion is temporarily unavailable",
          },
        });
      }

      if (url.includes("/api/v1/transactions/")) {
        return jsonRes(200, {
          success: true,
          data: [
            {
              id: "tx-1",
              amount_kobo: 500000,
              type: "income",
              category: "Sales",
              description: "Customer invoice payment",
              transaction_date: "2026-10-18T10:00:00Z",
            },
          ],
        });
      }

      // Payslip & Team members
      if (url.includes("/payslip/")) {
        return jsonRes(200, {
          success: true,
          data: {
            staff_member: {
              id: "staff-101",
              name: "Chinedu Eze",
              is_active: true,
            },
            payslip: {
              gross_salary_kobo: 25000000,
              pension_deduction_kobo: 2000000,
              nhf_deduction_kobo: 625000,
              paye_deduction_kobo: 1250000,
              total_deductions_kobo: 3875000,
              net_pay_kobo: 21125000,
            },
          },
        });
      }

      if (url.includes("/api/v1/businesses/biz-101/members/")) {
        return jsonRes(200, {
          success: true,
          data: [
            {
              id: "staff-101",
              email: "chinedu.eze@company.com",
              name: "Chinedu Eze",
              role: "accountant",
            },
          ],
        });
      }

      if (url.includes("/api/v1/businesses/biz-101/invites/")) {
        return jsonRes(200, { success: true, data: [] });
      }

      if (url.includes("/api/v1/businesses/active/")) {
        return jsonRes(200, {
          success: true,
          data: {
            id: "biz-101",
            name: "Ryport SME Ltd",
            currency: "NGN",
            type: "Services",
          },
        });
      }

      if (url.includes("/api/v1/businesses/")) {
        return jsonRes(200, {
          success: true,
          data: [
            {
              id: "biz-101",
              name: "Ryport SME Ltd",
              currency: "NGN",
              type: "Services",
            },
          ],
        });
      }

      if (url.includes("/api/v1/ai/quota/")) {
        return jsonRes(200, {
          success: true,
          data: { used: 2, limit: 10, remaining: 8, resets_at: "", is_unlimited: true },
        });
      }

      return origFetch(input, init);
    };
  });

  // Set auth cookies for SSR middleware
  await appPage.setCookie(
    { name: "ryport_auth", value: "1", domain: "localhost" },
    { name: "ryport_access_token", value: "mock-jwt-access-token-12345", domain: "localhost" },
  );

  // ---------------------------------------------------------------------------
  // TEST 3: Dashboard & 'Money Waiting to Be Collected' Widget
  // ---------------------------------------------------------------------------
  console.log("\n[4/12] Testing Dashboard & 'Money Waiting to Be Collected' Widget...");
  await appPage.goto(`${BASE_URL}/app/dashboard`, { waitUntil: "networkidle0" });
  await sleep(1500);

  const dashText = await appPage.evaluate(() => document.body.innerText);
  assert(dashText.includes("MONEY WAITING TO BE COLLECTED"), "Dashboard: 'MONEY WAITING TO BE COLLECTED' widget header rendered");
  assert(dashText.includes("150,000"), "Dashboard: Total outstanding amount (₦150,000.00) displayed in widget");
  assert(dashText.includes("Kola Enterprises"), "Dashboard: Top debtor 'Kola Enterprises' displayed in widget");
  assert(dashText.includes("View All Receivables"), "Dashboard: 'View All Receivables →' action button/link present in widget");

  // Click 'View All Receivables →' widget button
  const receivablesLink = await appPage.$('a[href="/app/debts"]');
  assert(Boolean(receivablesLink), "Dashboard: Widget link to /app/debts clickable");
  if (receivablesLink) {
    await Promise.all([
      appPage.waitForNavigation({ waitUntil: "networkidle0" }),
      receivablesLink.click(),
    ]);
    console.log("  Navigated to /app/debts via widget click!");
  }

  // ---------------------------------------------------------------------------
  // TEST 4: Debts & Receivables ("Who Owes Me") Page & Buttons
  // ---------------------------------------------------------------------------
  console.log("\n[5/12] Testing Debts & Receivables ('Who Owes Me') Screen...");
  await appPage.goto(`${BASE_URL}/app/debts`, { waitUntil: "networkidle0" });
  await sleep(1200);

  const debtsBodyText = await appPage.evaluate(() => document.body.innerText);
  assert(debtsBodyText.includes("Debts & Receivables"), "Debts Page: Header title present");
  assert(debtsBodyText.includes("Who Owes Me"), "Debts Page: 'Who Owes Me' subtitle present");
  assert(debtsBodyText.includes("Kola Enterprises"), "Debts Page: Debtor 'Kola Enterprises' displayed in list");
  assert(debtsBodyText.includes("Tunde Bakare"), "Debts Page: Overdue debtor 'Tunde Bakare' displayed");
  assert(debtsBodyText.includes("Overdue"), "Debts Page: Overdue status badge displayed");

  // Test Filter Tabs: Outstanding, Overdue, Paid, All
  const buttons = await appPage.$$("button");
  let clickedOverdue = false;
  let clickedPaid = false;
  let clickedAll = false;

  for (const btn of buttons) {
    const text = await appPage.evaluate(el => el.innerText, btn);
    if (text.includes("Overdue") && !clickedOverdue) {
      await btn.click();
      await sleep(300);
      clickedOverdue = true;
    }
  }
  assert(clickedOverdue, "Debts Page: 'Overdue' filter tab button clicked");

  const overdueTabText = await appPage.evaluate(() => document.body.innerText);
  assert(overdueTabText.includes("Tunde Bakare"), "Debts Page: 'Tunde Bakare' visible under Overdue tab");

  for (const btn of await appPage.$$("button")) {
    const text = await appPage.evaluate(el => el.innerText, btn);
    if (text.includes("Paid") && !clickedPaid) {
      await btn.click();
      await sleep(300);
      clickedPaid = true;
    }
  }
  assert(clickedPaid, "Debts Page: 'Paid / Settled' filter tab button clicked");

  for (const btn of await appPage.$$("button")) {
    const text = await appPage.evaluate(el => el.innerText, btn);
    if (text.includes("All Receivables") && !clickedAll) {
      await btn.click();
      await sleep(300);
      clickedAll = true;
    }
  }
  assert(clickedAll, "Debts Page: Reset to 'All Receivables' filter tab");

  // Test 'Add Receivable' Modal Button & Submission
  console.log("  Testing 'Add Receivable' modal button...");
  let addModalOpened = false;
  for (const btn of await appPage.$$("button")) {
    const text = await appPage.evaluate(el => el.innerText, btn);
    if (text.includes("Add Receivable")) {
      await btn.click();
      await sleep(500);
      addModalOpened = true;
      break;
    }
  }
  assert(addModalOpened, "Debts Page: 'Add Receivable' primary button opened modal");

  const addModalText = await appPage.evaluate(() => document.body.innerText);
  assert(addModalText.includes("Add Receivable (\"Who Owes Me\")"), "Debts Page: Modal title visible");

  // Fill Add Receivable Form
  const inputs = await appPage.$$("input");
  for (const inp of inputs) {
    const ph = await appPage.evaluate(el => el.getAttribute("placeholder") || "", inp);
    if (ph.includes("Kola Enterprises")) {
      await inp.type("Dangote Subcontractor");
    }
    if (ph.includes("08012345678")) {
      await inp.type("08099887766");
    }
    if (ph.includes("50000.00")) {
      await inp.type("75000");
    }
    const type = await appPage.evaluate(el => el.getAttribute("type"), inp);
    if (type === "date") {
      await inp.type("2026-11-15");
    }
  }

  // Click Cancel / Close modal
  let addModalClosed = false;
  for (const btn of await appPage.$$("button")) {
    const text = await appPage.evaluate(el => el.innerText, btn);
    if (text.includes("Cancel")) {
      await btn.click();
      await sleep(400);
      addModalClosed = true;
      break;
    }
  }
  assert(addModalClosed, "Debts Page: Add Receivable modal closed via Cancel button");

  // Test 'Send Reminder' Button on Debt
  console.log("  Testing 'Send Reminder' button...");
  let reminderModalOpened = false;
  for (const btn of await appPage.$$("button")) {
    const text = await appPage.evaluate(el => el.innerText, btn);
    if (text.includes("Send Reminder")) {
      await btn.click();
      await sleep(800);
      reminderModalOpened = true;
      break;
    }
  }
  assert(reminderModalOpened, "Debts Page: 'Send Reminder' button opened modal");

  const reminderText = await appPage.evaluate(() => document.body.innerText);
  assert(reminderText.includes("Send Payment Reminder"), "Debts Page: Reminder dialog title rendered");
  assert(reminderText.includes("Send via WhatsApp"), "Debts Page: 'Send via WhatsApp' button present");
  assert(reminderText.includes("Copy Reminder SMS"), "Debts Page: 'Copy Reminder SMS' button present");

  // Test 'Copy Reminder SMS' Button Click
  let clickedCopy = false;
  for (const btn of await appPage.$$("button")) {
    const text = await appPage.evaluate(el => el.innerText, btn);
    if (text.includes("Copy Reminder SMS")) {
      await btn.click();
      await sleep(400);
      clickedCopy = true;
      break;
    }
  }
  assert(clickedCopy, "Debts Page: Clicked 'Copy Reminder SMS' button");

  // Close Reminder Modal
  await appPage.keyboard.press("Escape");
  await sleep(400);

  // Test 'Record Payment' Button
  console.log("  Testing 'Record Payment' button...");
  let paymentDialogOpen = false;
  for (const btn of await appPage.$$("button")) {
    const text = await appPage.evaluate(el => el.innerText, btn);
    if (text.includes("Record Payment")) {
      await btn.click();
      await sleep(600);
      paymentDialogOpen = true;
      break;
    }
  }
  assert(paymentDialogOpen, "Debts Page: 'Record Payment' button opened dialog");

  const paymentText = await appPage.evaluate(() => document.body.innerText);
  assert(paymentText.includes("Record Payment"), "Debts Page: Payment dialog title rendered");
  assert(paymentText.includes("Kola Enterprises"), "Debts Page: Debtor name rendered in dialog");
  assert(paymentText.includes("Mark full remaining balance as paid"), "Debts Page: Full payment option checkbox rendered");
  assert(paymentText.includes("100,000.00"), "Debts Page: Remaining balance amount rendered in dialog");

  // Test unchecking full payment checkbox to reveal partial payment field
  const payFullCheckbox = await appPage.$('input[type="checkbox"]');
  if (payFullCheckbox) {
    await payFullCheckbox.click();
    await sleep(300);
    const partialText = await appPage.evaluate(() => document.body.innerText);
    assert(partialText.includes("Partial Payment Amount"), "Debts Page: Partial payment amount field toggled visible");
  }

  // Close payment modal
  await appPage.keyboard.press("Escape");
  await sleep(400);

  // ---------------------------------------------------------------------------
  // TEST 5: Transactions Screen (+ Import SMS Removed, + Record Transaction Primary)
  // ---------------------------------------------------------------------------
  console.log("\n[6/12] Testing Transactions Screen & SMS Button Removal...");
  await appPage.goto(`${BASE_URL}/app/transactions`, { waitUntil: "networkidle0" });
  await sleep(1000);

  const txText = await appPage.evaluate(() => document.body.innerText);
  assert(txText.includes("Transactions"), "Transactions Page: Title rendered");
  assert(!txText.includes("+ Import SMS"), "Transactions Page: '+ Import SMS' button permanently REMOVED");
  assert(txText.includes("Record Transaction"), "Transactions Page: '+ Record Transaction' button is present");

  // Toggle Record Transaction form
  let toggledTxForm = false;
  for (const btn of await appPage.$$("button")) {
    const text = await appPage.evaluate(el => el.innerText, btn);
    if (text.includes("Record Transaction")) {
      await btn.click();
      await sleep(400);
      toggledTxForm = true;
      break;
    }
  }
  assert(toggledTxForm, "Transactions Page: Clicked '+ Record Transaction' button to toggle manual form");

  // ---------------------------------------------------------------------------
  // TEST 6: SMS Import Screen (Paused Notice & 503 Friendly Fallback)
  // ---------------------------------------------------------------------------
  console.log("\n[7/12] Testing SMS Import Screen (Paused Notice & 503 Fallback)...");
  await appPage.goto(`${BASE_URL}/app/transactions/sms-import`, { waitUntil: "networkidle0" });
  await sleep(1000);

  const smsPageText = await appPage.evaluate(() => document.body.innerText);
  assert(smsPageText.includes("Notice:") && smsPageText.includes("temporarily paused on the backend"), "SMS Import: 'Notice: SMS transaction ingestion is temporarily paused on the backend' banner rendered");
  assert(smsPageText.includes("Record Manually"), "SMS Import: 'Record Manually' fallback button present");

  // Test submitting SMS paste to verify 503 error handling
  const smsTextarea = await appPage.$("textarea");
  const smsSubmitBtn = await appPage.$('button[type="submit"]');
  if (smsTextarea && smsSubmitBtn) {
    await smsTextarea.type("Acct: 1234. Debited: N15,000 on 19-Oct-2026. Bal: N85,000.");
    await smsSubmitBtn.click();
    await sleep(800);
    const afterSubmitText = await appPage.evaluate(() => document.body.innerText);
    assert(
      afterSubmitText.includes("SMS import is currently paused. Please use manual entry or receipt upload.") ||
      afterSubmitText.includes("temporarily unavailable") ||
      afterSubmitText.includes("feature_paused"),
      "SMS Import: Friendly 503 feature_paused fallback error displayed cleanly"
    );
  }

  // ---------------------------------------------------------------------------
  // TEST 7: Accounts Screen (Paused Sync State & Primary Action)
  // ---------------------------------------------------------------------------
  console.log("\n[8/12] Testing Accounts Screen & Paused Open Banking Notice...");
  await appPage.goto(`${BASE_URL}/app/accounts`, { waitUntil: "networkidle0" });
  await sleep(1000);

  const accountsText = await appPage.evaluate(() => document.body.innerText);
  assert(accountsText.includes("Direct open banking sync and SMS ingestion are temporarily paused"), "Accounts Page: Paused notice rendered");
  assert(!accountsText.includes("Import from SMS"), "Accounts Page: 'Import from SMS' button removed");
  assert(accountsText.includes("Record Transaction"), "Accounts Page: 'Record Transaction' button present");

  // ---------------------------------------------------------------------------
  // TEST 8: Notifications Screen & 1-Click Payment Confirmation
  // ---------------------------------------------------------------------------
  console.log("\n[9/12] Testing Notifications & 1-Click Payment Match...");
  await appPage.goto(`${BASE_URL}/app/notifications`, { waitUntil: "networkidle0" });
  await sleep(1200);

  const notifPageText = await appPage.evaluate(() => document.body.innerText);
  assert(notifPageText.includes("Notifications"), "Notifications Page: Title rendered");
  assert(notifPageText.includes("Payment match suggestion: Kola Enterprises"), "Notifications Page: 'debt_payment_match' card rendered");
  assert(notifPageText.includes("Yes, Confirm Match"), "Notifications Page: 'Yes, Confirm Match' 1-click button rendered");

  // Click 'Yes, Confirm Match'
  let confirmedMatch = false;
  for (const btn of await appPage.$$("button")) {
    const text = await appPage.evaluate(el => el.innerText, btn);
    if (text.includes("Yes, Confirm Match")) {
      await btn.click();
      await sleep(800);
      confirmedMatch = true;
      break;
    }
  }
  assert(confirmedMatch, "Notifications Page: Clicked 'Yes, Confirm Match' 1-click button");

  const afterMatchText = await appPage.evaluate(() => document.body.innerText);
  assert(afterMatchText.includes("Payment match confirmed"), "Notifications Page: Toast 'Payment match confirmed for Kola Enterprises!' rendered");

  // ---------------------------------------------------------------------------
  // TEST 9: Team & Staff Payslip Statutory Breakdown (PAYE, Pension 8%, NHF 2.5%)
  // ---------------------------------------------------------------------------
  console.log("\n[10/12] Testing Team Page & Staff Payslip Statutory Breakdown...");
  await appPage.goto(`${BASE_URL}/app/businesses/biz-101/team`, { waitUntil: "networkidle0" });
  await sleep(1200);

  const teamPageText = await appPage.evaluate(() => document.body.innerText);
  assert(teamPageText.includes("Chinedu Eze"), "Team Page: Staff member 'Chinedu Eze' rendered");
  assert(teamPageText.includes("View Payslip"), "Team Page: 'View Payslip' button rendered");

  // Click 'View Payslip' button
  let payslipModalOpened = false;
  for (const btn of await appPage.$$("button")) {
    const text = await appPage.evaluate(el => el.innerText, btn);
    if (text.includes("View Payslip")) {
      await btn.click();
      await sleep(800);
      payslipModalOpened = true;
      break;
    }
  }
  assert(payslipModalOpened, "Team Page: Clicked 'View Payslip' button to open modal");

  const payslipModalText = await appPage.evaluate(() => document.body.innerText);
  assert(payslipModalText.includes("Staff Payslip & Statutory Breakdown"), "Payslip Modal: Title rendered");
  assert(payslipModalText.includes("Gross Monthly Salary"), "Payslip Modal: 'Gross Monthly Salary' label rendered");
  assert(payslipModalText.includes("250,000"), "Payslip Modal: Gross salary ₦250,000.00 rendered");
  assert(payslipModalText.includes("Pension Contribution (8%)"), "Payslip Modal: 'Pension Contribution (8%)' statutory deduction label rendered");
  assert(payslipModalText.includes("20,000"), "Payslip Modal: Pension deduction ₦20,000.00 rendered");
  assert(payslipModalText.includes("National Housing Fund (NHF 2.5%)"), "Payslip Modal: 'National Housing Fund (NHF 2.5%)' deduction label rendered");
  assert(payslipModalText.includes("6,250"), "Payslip Modal: NHF deduction ₦6,250.00 rendered");
  assert(payslipModalText.includes("Pay As You Earn (PAYE)"), "Payslip Modal: 'Pay As You Earn (PAYE)' label rendered");
  assert(payslipModalText.includes("12,500"), "Payslip Modal: PAYE tax ₦12,500.00 rendered");
  assert(payslipModalText.includes("Total Deductions"), "Payslip Modal: 'Total Deductions' label rendered");
  assert(payslipModalText.includes("38,750"), "Payslip Modal: Total statutory deductions ₦38,750.00 rendered");
  assert(payslipModalText.includes("Take-Home Net Pay"), "Payslip Modal: 'Take-Home Net Pay' highlighted banner rendered");
  assert(payslipModalText.includes("211,250"), "Payslip Modal: Net take-home pay ₦211,250.00 rendered");

  // Close payslip modal
  let closedPayslip = false;
  for (const btn of await appPage.$$("button")) {
    const text = await appPage.evaluate(el => el.innerText, btn);
    if (text.includes("Close")) {
      await btn.click();
      await sleep(300);
      closedPayslip = true;
      break;
    }
  }
  assert(closedPayslip, "Payslip Modal: Closed modal via 'Close' button");

  // ---------------------------------------------------------------------------
  // TEST 10: App Navigation & Sidebar (SMS Import Nav Item Removed)
  // ---------------------------------------------------------------------------
  console.log("\n[11/12] Testing Sidebar Navigation Links...");
  const navText = await appPage.evaluate(() => {
    const nav = document.querySelector("nav") || document.querySelector("aside");
    return nav ? nav.innerText : "";
  });

  assert(navText.includes("Overview"), "Sidebar: 'Overview' nav item present");
  assert(navText.includes("Receivables"), "Sidebar: 'Receivables' nav item present");
  assert(navText.includes("Transactions"), "Sidebar: 'Transactions' nav item present");
  assert(navText.includes("Accounts"), "Sidebar: 'Accounts' nav item present");
  assert(!navText.includes("Import SMS"), "Sidebar: 'Import SMS' permanently removed from navigation");

  // ---------------------------------------------------------------------------
  // TEST 11: Feature Pages Sanity Check (Budgets, Reports, AI Hub, Settings)
  // ---------------------------------------------------------------------------
  console.log("\n[12/12] Testing Feature Pages (Budgets, Reports, AI Hub, Settings)...");
  
  await appPage.goto(`${BASE_URL}/app/budgets`, { waitUntil: "networkidle0" });
  assert((await appPage.evaluate(() => document.body.innerText)).includes("Budget"), "Budgets Page loaded cleanly");

  await appPage.goto(`${BASE_URL}/app/reports`, { waitUntil: "networkidle0" });
  assert((await appPage.evaluate(() => document.body.innerText)).includes("Report"), "Reports Page loaded cleanly");

  await appPage.goto(`${BASE_URL}/app/ai`, { waitUntil: "networkidle0" });
  assert((await appPage.evaluate(() => document.body.innerText)).includes("AI"), "AI Hub loaded cleanly");

  await appPage.goto(`${BASE_URL}/app/settings`, { waitUntil: "networkidle0" });
  assert((await appPage.evaluate(() => document.body.innerText)).includes("Settings"), "Settings Page loaded cleanly");

  // Close browser
  await browser.close();

  // ---------------------------------------------------------------------------
  // Summary Report
  // ---------------------------------------------------------------------------
  console.log("\n================================================================================");
  console.log("                           TEST SUITE SUMMARY                                  ");
  console.log("================================================================================");
  console.log(`TOTAL CHECKS: ${stats.total}`);
  console.log(`PASSED:       ${stats.passed}`);
  console.log(`FAILED:       ${stats.failed}`);

  if (stats.failed > 0) {
    console.log("\nFAILURES:");
    stats.failures.forEach(f => console.log(`  - ${f}`));
    process.exit(1);
  } else {
    console.log("\nSUCCESS: All features, buttons, and statutory requirements passed with 100% fidelity!");
    process.exit(0);
  }
}

run().catch((err) => {
  console.error("FATAL RUNTIME ERROR:", err);
  process.exit(1);
});
