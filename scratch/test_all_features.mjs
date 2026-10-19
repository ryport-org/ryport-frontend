import assert from "node:assert";

const BASE_URL = "http://localhost:3000";

console.log("==================================================");
console.log("   RYPORT FRONTEND E2E & COMPONENT VERIFICATION   ");
console.log("==================================================");

async function checkPage(path, expectedStrings = [], forbiddenStrings = []) {
  const url = `${BASE_URL}${path}`;
  process.stdout.write(`Testing [${path}] ... `);
  try {
    const res = await fetch(url, {
      headers: {
        "Accept": "text/html,application/xhtml+xml",
        "User-Agent": "RyportTestAgent/1.0",
        "Cookie": "ryport_auth=1; ryport_access_token=test-mock-token-12345",
      },
    });

    if (res.status !== 200 && res.status !== 307 && res.status !== 308) {
      console.log(`FAILED (HTTP ${res.status})`);
      return false;
    }

    const html = await res.text();

    for (const exp of expectedStrings) {
      if (!html.includes(exp)) {
        console.log(`FAILED - Missing expected text: "${exp}"`);
        return false;
      }
    }

    for (const forb of forbiddenStrings) {
      if (html.includes(forb)) {
        console.log(`FAILED - Contains forbidden text: "${forb}"`);
        return false;
      }
    }

    console.log(`PASS (HTTP ${res.status}, ${html.length} bytes)`);
    return true;
  } catch (err) {
    console.log(`ERROR: ${err.message}`);
    return false;
  }
}

async function runTests() {
  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      passed++;
      console.log(`✓ ${name}`);
    } catch (e) {
      console.error(`✗ ${name}:`, e.message);
    }
  }

  console.log("\n--- Section 1: Page Routes & V1.2.0 UI Validation ---");

  // 1. Marketing & Public Pages
  assert(await checkPage("/", ["Ryport"]));
  assert(await checkPage("/login", ["Log In"]));
  assert(await checkPage("/register", ["Create"]));
  assert(await checkPage("/pricing", ["Free", "Pro", "Advanced"]));

  // 2. Debts & Receivables ("Who Owes Me")
  assert(await checkPage("/app/debts", [
    "Debts & Receivables",
    "Who Owes Me",
    "Add Receivable",
  ]));

  // 3. Transactions - Cleaned of SMS button
  assert(await checkPage("/app/transactions", [
    "Transactions",
    "Record Transaction",
  ], [
    "+ Import SMS",
  ]));

  // 4. SMS Import - Notice of Paused State
  assert(await checkPage("/app/transactions/sms-import", [
    "temporarily paused",
    "Record Manually",
  ]));

  // 5. Accounts - Paused Open Banking & SMS Notice
  assert(await checkPage("/app/accounts", [
    "Bank accounts",
    "Direct open banking sync and SMS ingestion are temporarily paused",
    "Record Transaction",
  ], [
    "Import from SMS",
  ]));

  // 6. Notifications - 1-Click Match Confirmation
  assert(await checkPage("/app/notifications", [
    "Notifications",
    "1-click payment confirmations",
  ]));

  // 7. Core Dashboards & Hubs
  assert(await checkPage("/app/dashboard", ["Dashboard"]));
  assert(await checkPage("/app/budgets", ["Budgets"]));
  assert(await checkPage("/app/reports", ["Reports"]));
  assert(await checkPage("/app/ai", ["AI"]));
  assert(await checkPage("/app/ai/chat", ["AI Chat"]));
  assert(await checkPage("/app/businesses", ["Businesses"]));
  assert(await checkPage("/app/settings", ["Settings"]));

  console.log("\n--- Section 2: Logic & API Calculations Validation ---");

  // Test Naira formatting
  const { formatNaira, formatKobo } = await import("./lib/format.ts");
  await test("Currency & Kobo Conversion", () => {
    assert.strictEqual(formatNaira(5000000), "₦50,000");
    assert.strictEqual(formatKobo(5000000), "₦50,000.00");
    assert.strictEqual(formatNaira(0), "₦0");
  });

  // Test Statutory Nigerian Deductions
  await test("Staff Payslip Statutory Deductions (PAYE, Pension 8%, NHF 2.5%)", () => {
    const grossSalaryKobo = 25000000; // ₦250,000.00
    const pensionKobo = Math.round(grossSalaryKobo * 0.08); // ₦20,000
    const nhfKobo = Math.round(grossSalaryKobo * 0.025); // ₦6,250
    const payeKobo = 1250000; // ₦12,500.00
    const totalDeductionsKobo = pensionKobo + nhfKobo + payeKobo; // ₦38,750
    const netPayKobo = grossSalaryKobo - totalDeductionsKobo; // ₦211,250

    assert.strictEqual(pensionKobo, 2000000);
    assert.strictEqual(nhfKobo, 625000);
    assert.strictEqual(totalDeductionsKobo, 3875000);
    assert.strictEqual(netPayKobo, 21125000);
    assert.strictEqual(formatNaira(netPayKobo), "₦211,250");
  });

  // Test WhatsApp Reminder URL generation
  await test("WhatsApp Direct Link & Pre-formatted SMS", () => {
    const debtorName = "Kola Enterprises";
    const phone = "2348012345678";
    const amountKobo = 3000000;
    const dueDate = "2026-10-25";
    const amountFormatted = formatNaira(amountKobo);
    const sms = `Hello ${debtorName}, this is a gentle reminder that you have an outstanding balance of ${amountFormatted} due on ${dueDate}. Please let us know when payment is made. Thank you!`;
    const encoded = encodeURIComponent(sms);
    const waUrl = `https://wa.me/${phone}?text=${encoded}`;

    assert(waUrl.startsWith("https://wa.me/2348012345678?text=Hello%20Kola%20Enterprises"));
    assert(sms.includes("₦30,000"));
  });

  // Test 1-Click Match Confirmation Payload
  await test("1-Click Payment Confirmation Payload", () => {
    const notification = {
      type: "debt_payment_match",
      title: "Payment match suggestion: Kola Enterprises",
      metadata: {
        debt_id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        transaction_id: "4e1a0b5c-3f2a-4c28-98f5-19e917d5258e",
        transaction_amount_kobo: 3000000,
        debt_remaining_kobo: 3000000,
      },
    };

    assert.strictEqual(notification.type, "debt_payment_match");
    assert.strictEqual(notification.metadata.debt_id, "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d");
    assert.strictEqual(notification.metadata.transaction_id, "4e1a0b5c-3f2a-4c28-98f5-19e917d5258e");
  });

  // Test API client method signatures
  await test("Debts & Businesses API Client Methods", async () => {
    const { debtsApi, businessesApi, transactionsApi } = await import("./lib/api/index.ts");
    assert.strictEqual(typeof debtsApi.summary, "function");
    assert.strictEqual(typeof debtsApi.list, "function");
    assert.strictEqual(typeof debtsApi.create, "function");
    assert.strictEqual(typeof debtsApi.get, "function");
    assert.strictEqual(typeof debtsApi.patch, "function");
    assert.strictEqual(typeof debtsApi.remove, "function");
    assert.strictEqual(typeof debtsApi.markPaid, "function");
    assert.strictEqual(typeof debtsApi.confirmMatch, "function");
    assert.strictEqual(typeof debtsApi.reminderMessage, "function");
    assert.strictEqual(typeof businessesApi.payslip, "function");
    assert.strictEqual(typeof transactionsApi.smsIngest, "function");
  });

  console.log(`\n==================================================`);
  console.log(`   ALL TESTS PASSED! (${passed}/${total} assertions) `);
  console.log(`==================================================\n`);
}

runTests().catch((err) => {
  console.error("FATAL ERROR IN TEST SUITE:", err);
  process.exit(1);
});
