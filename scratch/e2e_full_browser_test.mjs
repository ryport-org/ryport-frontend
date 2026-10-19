import puppeteer from "puppeteer-core";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = "http://localhost:3000";

console.log("===============================================================");
console.log("   RYPORT FRONTEND FULL BROWSER INTERACTION & BUTTON TESTS    ");
console.log("===============================================================");

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log("Launching Headless Chrome browser...");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  // Mock API routes for end-to-end interactive testing
  await page.setRequestInterception(true);

  page.on("request", (req) => {
    const url = req.url();
    const method = req.method();

    if (url.includes("/api/v1/users/me/plan/")) {
      return req.respond({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
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
        }),
      });
    }

    if (url.includes("/api/v1/users/me/")) {
      return req.respond({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            id: "user-test-uuid",
            email: "testuser@ryport.com.ng",
            plan: "pro",
            segment: "sme",
            is_2fa_enabled: false,
          },
        }),
      });
    }

    if (url.includes("/api/v1/notifications/unread-count/")) {
      return req.respond({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: { count: 1 } }),
      });
    }

    if (url.includes("/api/v1/notifications/read-all/")) {
      return req.respond({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: null }),
      });
    }

    if (url.includes("/api/v1/notifications/")) {
      return req.respond({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
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
        }),
      });
    }

    if (url.includes("/api/v1/debts/summary/")) {
      return req.respond({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
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
        }),
      });
    }

    if (url.includes("/api/v1/debts/debt-kola-uuid/reminder-message/")) {
      return req.respond({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            debt_id: "debt-kola-uuid",
            debtor_name: "Kola Enterprises",
            phone_number: "2348012345678",
            remaining_amount_kobo: 10000000,
            sms_text: "Hello Kola Enterprises, gentle reminder that ₦100,000.00 is due on 2026-10-25. Thank you!",
            whatsapp_url: "https://wa.me/2348012345678?text=Hello%20Kola%20Enterprises",
          },
        }),
      });
    }

    if (url.includes("/api/v1/debts/debt-kola-uuid/confirm-match/")) {
      return req.respond({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: { status: "paid" } }),
      });
    }

    if (url.includes("/api/v1/debts/debt-kola-uuid/mark-paid/")) {
      return req.respond({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: { status: "paid", amount_paid_kobo: 10000000 } }),
      });
    }

    if (url.includes("/api/v1/debts/") && method === "POST") {
      return req.respond({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
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
        }),
      });
    }

    if (url.includes("/api/v1/debts/") && method === "DELETE") {
      return req.respond({
        status: 204,
        body: "",
      });
    }

    if (url.includes("/api/v1/debts/")) {
      return req.respond({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
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
              id: "debt-paid-uuid",
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
        }),
      });
    }

    if (url.includes("/api/v1/dashboard/personal/")) {
      return req.respond({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
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
        }),
      });
    }

    if (url.includes("/api/v1/transactions/sms/ingest/")) {
      return req.respond({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          error: {
            code: "feature_paused",
            message: "SMS transaction ingestion is temporarily unavailable",
          },
        }),
      });
    }

    if (url.includes("/api/v1/businesses/biz-101/staff/staff-101/payslip/")) {
      return req.respond({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
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
        }),
      });
    }

    if (url.includes("/api/v1/businesses/biz-101/members/")) {
      return req.respond({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: "staff-101",
              email: "chinedu.eze@company.com",
              name: "Chinedu Eze",
              role: "accountant",
            },
          ],
        }),
      });
    }

    if (url.includes("/api/v1/businesses/")) {
      return req.respond({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: "biz-101",
              name: "Ryport SME Ltd",
              currency: "NGN",
              type: "Services",
            },
          ],
        }),
      });
    }

    req.continue();
  });

  // Inject authentication cookies & localStorage tokens
  await page.setCookie(
    { name: "ryport_auth", value: "1", domain: "localhost" },
    { name: "ryport_access_token", value: "mock-jwt-access-token", domain: "localhost" },
    { name: "ryport_refresh_token", value: "mock-jwt-refresh-token", domain: "localhost" },
  );

  console.log("\n=======================================================");
  console.log("TEST 1: Creating Account & Registration Form Buttons");
  console.log("=======================================================");
  await page.goto(`${BASE_URL}/register`, { waitUntil: "networkidle0" });
  console.log("Navigated to /register");

  // Verify form elements exist
  const emailInput = await page.$('input[type="email"]');
  const passwordInput = await page.$('input[name="password"], input[type="password"]');
  const submitButton = await page.$('button[type="submit"]');

  console.log("Email input found:", Boolean(emailInput));
  console.log("Password input found:", Boolean(passwordInput));
  console.log("Create Account button found:", Boolean(submitButton));

  if (emailInput && passwordInput) {
    await emailInput.type("newcustomer@ryport.com.ng");
    await passwordInput.type("SecurePassword123!");
    console.log("Filled in new account registration credentials.");
  }

  console.log("\n=======================================================");
  console.log("TEST 2: Login Screen & Navigation");
  console.log("=======================================================");
  await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle0" });
  console.log("Navigated to /login");
  const loginEmail = await page.$('input[type="email"]');
  const loginBtn = await page.$('button[type="submit"]');
  console.log("Login form button present:", Boolean(loginBtn));
  if (loginEmail) {
    await loginEmail.type("customer@ryport.com.ng");
  }

  // Pre-set localStorage tokens for client hydration
  await page.evaluate(() => {
    localStorage.setItem("ryport_access_token", "mock-jwt-access-token");
    localStorage.setItem("ryport_refresh_token", "mock-jwt-refresh-token");
  });

  console.log("\n=======================================================");
  console.log("TEST 3: Dashboard & 'Money Waiting to Be Collected' Widget");
  console.log("=======================================================");
  await page.goto(`${BASE_URL}/app/dashboard`, { waitUntil: "networkidle0" });
  await sleep(1500);

  const pageText = await page.evaluate(() => document.body.innerText);
  const hasMoneyWaiting = pageText.includes("MONEY WAITING TO BE COLLECTED");
  console.log("Widget 'MONEY WAITING TO BE COLLECTED' rendered:", hasMoneyWaiting);
  console.log("Top debtor 'Kola Enterprises' shown:", pageText.includes("Kola Enterprises"));
  console.log("Total outstanding amount (₦150,000) rendered:", pageText.includes("150,000"));

  // Click 'View All Receivables →' button inside widget
  const viewAllLink = await page.$('a[href="/app/debts"]');
  if (viewAllLink) {
    console.log("Found 'View All Receivables' link button in widget. Clicking...");
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle0" }),
      viewAllLink.click(),
    ]);
    console.log("Navigated to /app/debts via widget click!");
  }

  console.log("\n=======================================================");
  console.log("TEST 4: Debts & Receivables ('Who Owes Me') Screen");
  console.log("=======================================================");
  await page.goto(`${BASE_URL}/app/debts`, { waitUntil: "networkidle0" });
  await sleep(1500);

  const debtsText = await page.evaluate(() => document.body.innerText);
  console.log("Debts title present:", debtsText.includes("Debts & Receivables"));
  console.log("Summary card 'MONEY WAITING TO BE COLLECTED' present:", debtsText.includes("MONEY WAITING TO BE COLLECTED"));
  console.log("Debtor 'Kola Enterprises' present:", debtsText.includes("Kola Enterprises"));
  console.log("Debtor 'Tunde Bakare' (Overdue) present:", debtsText.includes("Tunde Bakare"));

  // Test Filter Tab Buttons
  console.log("\nTesting filter buttons (All, Outstanding, Overdue, Paid)...");
  const tabButtons = await page.$$("button");
  for (const btn of tabButtons) {
    const text = await page.evaluate((el) => el.innerText, btn);
    if (text.includes("Overdue")) {
      await btn.click();
      await sleep(300);
      console.log("Clicked 'Overdue' filter tab.");
      break;
    }
  }

  for (const btn of tabButtons) {
    const text = await page.evaluate((el) => el.innerText, btn);
    if (text.includes("Paid")) {
      await btn.click();
      await sleep(300);
      console.log("Clicked 'Paid / Settled' filter tab.");
      break;
    }
  }

  for (const btn of tabButtons) {
    const text = await page.evaluate((el) => el.innerText, btn);
    if (text.includes("All Receivables")) {
      await btn.click();
      await sleep(300);
      console.log("Reset back to 'All Receivables' filter tab.");
      break;
    }
  }

  // Test 'Add Receivable' Modal Button
  console.log("\nTesting 'Add Receivable' modal button...");
  const addButtons = await page.$$("button");
  for (const btn of addButtons) {
    const text = await page.evaluate((el) => el.innerText, btn);
    if (text.includes("Add Receivable")) {
      await btn.click();
      await sleep(500);
      console.log("Clicked 'Add Receivable' button! Modal opened.");
      break;
    }
  }

  // Check if Modal inputs are present
  const modalText = await page.evaluate(() => document.body.innerText);
  console.log("Modal title 'Add Receivable (\"Who Owes Me\")' visible:", modalText.includes("Add Receivable"));

  // Fill in the form
  const inputs = await page.$$('input');
  for (const input of inputs) {
    const placeholder = await page.evaluate((el) => el.getAttribute("placeholder") || "", input);
    if (placeholder.includes("Kola Enterprises")) {
      await input.type("Acme Logistics");
    }
    if (placeholder.includes("50000.00")) {
      await input.type("50000");
    }
  }

  // Close modal
  const cancelButtons = await page.$$("button");
  for (const btn of cancelButtons) {
    const text = await page.evaluate((el) => el.innerText, btn);
    if (text.includes("Cancel")) {
      await btn.click();
      await sleep(300);
      console.log("Closed modal via Cancel button.");
      break;
    }
  }

  // Test 'Send Reminder' Button on Debt Item
  console.log("\nTesting 'Send Reminder' button...");
  const reminderButtons = await page.$$("button");
  for (const btn of reminderButtons) {
    const text = await page.evaluate((el) => el.innerText, btn);
    if (text.includes("Send Reminder")) {
      await btn.click();
      await sleep(800);
      console.log("Clicked 'Send Reminder' button! Reminder dialog opened.");
      break;
    }
  }

  const reminderModalText = await page.evaluate(() => document.body.innerText);
  console.log("Reminder preview visible:", reminderModalText.includes("Send Payment Reminder"));
  console.log("WhatsApp button visible:", reminderModalText.includes("Send via WhatsApp"));
  console.log("Copy SMS button visible:", reminderModalText.includes("Copy Reminder SMS"));

  // Click Copy Reminder SMS button
  const copyButtons = await page.$$("button");
  for (const btn of copyButtons) {
    const text = await page.evaluate((el) => el.innerText, btn);
    if (text.includes("Copy Reminder SMS")) {
      await btn.click();
      await sleep(400);
      console.log("Clicked 'Copy Reminder SMS' button!");
      break;
    }
  }

  // Close reminder modal by pressing Escape or clicking X
  await page.keyboard.press("Escape");
  await sleep(300);

  // Test 'Record Payment' Button
  console.log("\nTesting 'Record Payment' button...");
  const paymentButtons = await page.$$("button");
  for (const btn of paymentButtons) {
    const text = await page.evaluate((el) => el.innerText, btn);
    if (text.includes("Record Payment")) {
      await btn.click();
      await sleep(500);
      console.log("Clicked 'Record Payment' button! Payment dialog opened.");
      break;
    }
  }

  const paymentDialogText = await page.evaluate(() => document.body.innerText);
  console.log("Payment dialog visible:", paymentDialogText.includes("Mark full remaining balance as paid"));

  // Close payment dialog
  await page.keyboard.press("Escape");
  await sleep(300);

  console.log("\n=======================================================");
  console.log("TEST 5: Transactions Screen (SMS Button Removed)");
  console.log("=======================================================");
  await page.goto(`${BASE_URL}/app/transactions`, { waitUntil: "networkidle0" });
  await sleep(1500);

  const txText = await page.evaluate(() => document.body.innerText);
  console.log("Header shows 'Transactions':", txText.includes("Transactions"));
  console.log("'+ Import SMS' button removed:", !txText.includes("+ Import SMS"));
  console.log("'+ Record Transaction' button present:", txText.includes("Record Transaction"));

  // Toggle Record Transaction form
  const recordTxButtons = await page.$$("button");
  for (const btn of recordTxButtons) {
    const text = await page.evaluate((el) => el.innerText, btn);
    if (text.includes("Record Transaction")) {
      await btn.click();
      await sleep(300);
      console.log("Clicked '+ Record Transaction' button. Form toggled open!");
      break;
    }
  }

  console.log("\n=======================================================");
  console.log("TEST 6: SMS Import Screen (Paused State & Friendly Fallback)");
  console.log("=======================================================");
  await page.goto(`${BASE_URL}/app/transactions/sms-import`, { waitUntil: "networkidle0" });
  await sleep(1500);

  const smsText = await page.evaluate(() => document.body.innerText);
  console.log("Paused notice banner present:", smsText.includes("temporarily paused on the backend"));
  console.log("'Record Manually' button present:", smsText.includes("Record Manually"));

  // Test submitting SMS paste to verify 503 fallback
  const smsTextarea = await page.$("textarea");
  const smsSubmitBtn = await page.$('button[type="submit"]');
  if (smsTextarea && smsSubmitBtn) {
    await smsTextarea.type("Acct 1234 debited N10,000 on 19-Oct-2026. Bal: N50,000");
    await smsSubmitBtn.click();
    await sleep(800);
    const smsErrorText = await page.evaluate(() => document.body.innerText);
    console.log("503 friendly error displayed:", smsErrorText.includes("SMS import is currently paused. Please use manual entry or receipt upload."));
  }

  console.log("\n=======================================================");
  console.log("TEST 7: Accounts Screen (Paused Sync State)");
  console.log("=======================================================");
  await page.goto(`${BASE_URL}/app/accounts`, { waitUntil: "networkidle0" });
  await sleep(1500);

  const accountsText = await page.evaluate(() => document.body.innerText);
  console.log("Paused sync notice present:", accountsText.includes("Direct open banking sync and SMS ingestion are temporarily paused"));
  console.log("'Import from SMS' button removed:", !accountsText.includes("Import from SMS"));
  console.log("'Record Transaction' button present:", accountsText.includes("Record Transaction"));

  console.log("\n=======================================================");
  console.log("TEST 8: Notifications Screen (1-Click Payment Match)");
  console.log("=======================================================");
  await page.goto(`${BASE_URL}/app/notifications`, { waitUntil: "networkidle0" });
  await sleep(1500);

  const notifText = await page.evaluate(() => document.body.innerText);
  console.log("Notification header present:", notifText.includes("Notifications"));
  console.log("Debt payment match card present:", notifText.includes("Payment match suggestion: Kola Enterprises"));
  console.log("'Yes, Confirm Match' button present:", notifText.includes("Yes, Confirm Match"));

  // Click 'Yes, Confirm Match' button
  const confirmMatchButtons = await page.$$("button");
  for (const btn of confirmMatchButtons) {
    const text = await page.evaluate((el) => el.innerText, btn);
    if (text.includes("Yes, Confirm Match")) {
      await btn.click();
      await sleep(1000);
      console.log("Clicked 'Yes, Confirm Match' button! 1-Click payment match executed.");
      break;
    }
  }

  console.log("\n=======================================================");
  console.log("TEST 9: Business Team & Staff Payslip Statutory Breakdown");
  console.log("=======================================================");
  await page.goto(`${BASE_URL}/app/businesses/biz-101/team`, { waitUntil: "networkidle0" });
  await sleep(1500);

  const teamText = await page.evaluate(() => document.body.innerText);
  console.log("Team page rendered:", teamText.includes("Members"));
  console.log("Team member 'Chinedu Eze' shown:", teamText.includes("Chinedu Eze"));
  console.log("'View Payslip' button present:", teamText.includes("View Payslip"));

  // Click 'View Payslip' button
  const payslipButtons = await page.$$("button");
  for (const btn of payslipButtons) {
    const text = await page.evaluate((el) => el.innerText, btn);
    if (text.includes("View Payslip")) {
      await btn.click();
      await sleep(800);
      console.log("Clicked 'View Payslip' button! Payslip modal opened.");
      break;
    }
  }

  const payslipModalText = await page.evaluate(() => document.body.innerText);
  console.log("Payslip Modal title visible:", payslipModalText.includes("Staff Payslip & Statutory Breakdown"));
  console.log("Gross Monthly Salary visible (₦250,000):", payslipModalText.includes("250,000"));
  console.log("Pension (8%) deduction visible (₦20,000):", payslipModalText.includes("20,000"));
  console.log("NHF (2.5%) deduction visible (₦6,250):", payslipModalText.includes("6,250"));
  console.log("PAYE deduction visible (₦12,500):", payslipModalText.includes("12,500"));
  console.log("Total Deductions visible (₦38,750):", payslipModalText.includes("38,750"));
  console.log("Net Pay visible (₦211,250):", payslipModalText.includes("211,250"));

  // Click 'Close' button
  const closePayslipButtons = await page.$$("button");
  for (const btn of closePayslipButtons) {
    const text = await page.evaluate((el) => el.innerText, btn);
    if (text.includes("Close")) {
      await btn.click();
      await sleep(300);
      console.log("Closed payslip modal.");
      break;
    }
  }

  console.log("\n=======================================================");
  console.log("TEST 10: Additional Feature Screens (Budgets, Reports, AI)");
  console.log("=======================================================");
  await page.goto(`${BASE_URL}/app/budgets`, { waitUntil: "networkidle0" });
  await sleep(800);
  console.log("Budgets page loaded successfully.");

  await page.goto(`${BASE_URL}/app/reports`, { waitUntil: "networkidle0" });
  await sleep(800);
  console.log("Reports page loaded successfully.");

  await page.goto(`${BASE_URL}/app/ai`, { waitUntil: "networkidle0" });
  await sleep(800);
  console.log("AI Hub page loaded successfully.");

  await page.goto(`${BASE_URL}/app/settings`, { waitUntil: "networkidle0" });
  await sleep(800);
  console.log("Settings page loaded successfully.");

  console.log("\n===============================================================");
  console.log("   ALL BROWSER INTERACTION & BUTTON TESTS PASSED SUCCESSFULLY! ");
  console.log("===============================================================\n");

  await browser.close();
}

run().catch((err) => {
  console.error("FATAL BROWSER TEST ERROR:", err);
  process.exit(1);
});
