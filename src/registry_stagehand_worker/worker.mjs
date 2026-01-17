// worker.mjs
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { Stagehand } from "@browserbasehq/stagehand";

// ---------- КОНСТАНТИ ----------
const TOO_MANY_MATCHES_THRESHOLD = 100;  // >100 → too_many_matches
const MAX_STAGEHAND_RETRIES = 2;
const POLL_INTERVAL_MS = 10_000;

// доп. изчакване при много резултати (за да се стабилизира броят)
const HIGH_RESULTS_MIN = 200;
const HIGH_RESULTS_MAX = 1000;
const EXTRA_WAIT_MS = 15_000;

// лимити за компании/страници (за ЕДИН потребител)
const MAX_COMPANIES_TO_COLLECT = 10;
const MAX_PAGES_TO_SCAN = 5;
const GUESSED_PAGE_SIZE = 25; // толкова е в портала

// ---------- HELPER: нормализиране на име ----------
function normalizeName(str) {
  return (str || "")
    .replace(/\u00a0/g, " ") // NBSP → space
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

// по-агресивно чистене + ключ по токени
function cleanNameForCompare(str) {
  return normalizeName(str)
    .replace(/[\"'’„”“]/g, "")        // кавички
    .replace(/\./g, "")               // точки
    .replace(/[^a-zа-я0-9\s]/gi, "")  // всичко друго
    .trim();
}

function nameTokensKey(str) {
  const cleaned = cleanNameForCompare(str);
  if (!cleaned) return "";
  return cleaned
    .split(" ")
    .filter(Boolean)
    .sort()          // ако не искаш разменени имена да съвпадат → махни .sort()
    .join(" ");
}

// ---------- Supabase ----------
const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, REGISTRY_BASE_URL } =
  process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing Supabase env vars.");
  process.exit(1);
}

if (!REGISTRY_BASE_URL) {
  console.error("Missing REGISTRY_BASE_URL env var.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ---------- Stagehand ----------
const stagehand = new Stagehand({
  env: "BROWSERBASE",
});

console.log("Initializing Stagehand...");
await stagehand.init();
console.log("Stagehand initialized.");

function getPage() {
  if (stagehand.page) return stagehand.page;

  const ctx = stagehand.context;
  if (ctx && typeof ctx.pages === "function") {
    const pages = ctx.pages();
    if (pages && pages.length > 0) return pages[0];
  }
  return null;
}

let isRunning = false;

console.log("Worker started. Listening for pending users...");

// ------ HELPER: sleep ------
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ------ HELPER: вади броя резултати от страницата ------
async function getMatchCountFromPage(page) {
  await sleep(2000); // малка пауза

  try {
    const { resultTexts, bodyText } = await page.evaluate(() => {
      const resultTexts = Array.from(
        document.querySelectorAll("div.result-count")
      )
        .map((el) => (el.textContent || "").trim())
        .filter(Boolean);

      const bodyText = document.body?.innerText || "";
      return { resultTexts, bodyText };
    });

    let count = 0;

    if (resultTexts && resultTexts.length) {
      const joined = resultTexts.join(" ");
      const matchBg = joined.match(/Общо:\s*(\d+)/);
      const matchEn = joined.match(/Total:\s*(\d+)/);
      const numStr = (matchBg && matchBg[1]) || (matchEn && matchEn[1]);
      if (numStr) count = parseInt(numStr, 10);
    }

    if (!count && bodyText) {
      const matchBgBody = bodyText.match(/Общо:\s*(\d+)/);
      const matchEnBody = bodyText.match(/Total:\s*(\d+)/);
      const numStrBody =
        (matchBgBody && matchBgBody[1]) || (matchEnBody && matchEnBody[1]);
      if (numStrBody) {
        count = parseInt(numStrBody, 10);
        console.log("Match count from body fallback:", count);
      }
    }

    count = Number.isFinite(count) ? count : 0;
    if (!count) console.log("No match count detected, returning 0.");
    return count;
  } catch (e) {
    console.log(
      "Could not read match count from page, treating as 0. Error:",
      e.message || e
    );
    return 0;
  }
}

// ------ ИЗВЛИЧАНЕ НА КОМПАНИИ ОТ ТЕКУЩАТА СТРАНИЦА ------
// Работи по двойки редове: header (even/odd) + collapsible-row под него.
async function extractCompaniesFromCurrentPage(page, fullName, targetNameKey) {
  // кликаме всички стрелки (за всеки случай)
  await page.evaluate(() => {
    const tableBlock = document.querySelector("div.table-responsive-block");
    if (!tableBlock) return;

    const buttons = Array.from(
      tableBlock.querySelectorAll("td.toggle-collapse button.system-button")
    );
    for (const btn of buttons) {
      const el = btn;
      if (el instanceof HTMLElement) el.click();
    }
  });

  // чакаме да се разгънат
  await sleep(1500);

  const { companies, debugBlocks } = await page.evaluate(
    ({ targetNameKey }) => {
      function normalizeBasic(str) {
        return (str || "")
          .replace(/\u00a0/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .toLowerCase();
      }

      function makeNameKey(str) {
        const norm = normalizeBasic(str)
          .replace(/[\"'’„”“]/g, "")
          .replace(/\./g, "")
          .replace(/[^a-zа-я0-9\s]/gi, "")
          .trim();

        if (!norm) return "";
        return norm
          .split(" ")
          .filter(Boolean)
          .sort()
          .join(" ");
      }

      const results = [];
      const debugBlocks = [];

      const tableBlock = document.querySelector("div.table-responsive-block");
      if (!tableBlock) {
        return { companies: [], debugBlocks };
      }

      const tbody = tableBlock.querySelector("tbody");
      if (!tbody) {
        return { companies: [], debugBlocks };
      }

      const rows = Array.from(tbody.querySelectorAll("tr"));

      for (let i = 0; i < rows.length - 1; i++) {
        const headerRow = rows[i];
        const collapsibleRow = rows[i + 1];

        // търсим само двойки: header + collapsible-row
        if (!collapsibleRow.classList.contains("collapsible-row")) continue;

        const nameCell = headerRow.querySelector("td:last-child");
        const nameText = nameCell
          ? (nameCell.innerText || nameCell.textContent || "")
          : (headerRow.innerText || headerRow.textContent || "");

        const normalizedRowName = normalizeBasic(nameText);
        const rowNameKey = makeNameKey(nameText);

        // за дебъг – да виждаме какво е прочел от хедъра
        debugBlocks.push({
          headerText: normalizedRowName,
          rowNameKey,
        });

        // блокът не е за нашето име → прескачаме
        if (!rowNameKey || rowNameKey !== targetNameKey) continue;

        // вътрешната таблица с ролите/компаниите
        const innerTable = collapsibleRow.querySelector("table.inner-table");
        if (!innerTable) continue;

        const innerRows = Array.from(
          innerTable.querySelectorAll("tbody tr")
        );

        for (const innerRow of innerRows) {
          const labelTd = innerRow.querySelector("td:first-child");
          const valueTd = innerRow.querySelector("td:nth-child(2)");
          if (!labelTd || !valueTd) continue;

          const labelText = normalizeBasic(
            labelTd.innerText || labelTd.textContent || ""
          );

          const isOwner23 =
            labelText.startsWith("23.") ||
            labelText.includes("sole owner of the capital") ||
            labelText.includes("собственик на капитала");

          if (!isOwner23) continue; // интересуват ни само „23.“

          const link = valueTd.querySelector(
            'a[href*="ActiveConditionTabResult"]'
          );
          if (!link) continue;

          const href = link.getAttribute("href") || "";
          const companyName = (link.textContent || "").trim();

          const m = href.match(/uic=(\d+)/);
          const eik = m ? m[1] : null;

          const rowText = (innerRow.innerText || innerRow.textContent || "")
            .replace(/\s+/g, " ")
            .trim();

          results.push({
            eik,
            href,
            rawText: rowText,
            companyName,
          });
        }
      }

      // дедуп по eik|href
      const seen = new Set();
      const deduped = results.filter((c) => {
        const key = (c.eik || "") + "|" + (c.href || "");
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      return { companies: deduped, debugBlocks };
    },
    { targetNameKey }
  );

  console.log(
    `Extracted ${companies.length} companies from current page for ${fullName}.`
  );

  // полезно за странни случаи като Асен – да видиш какви header-и реално вижда
  if (!companies.length) {
    console.log("Debug header blocks for this page:", debugBlocks);
  }

  return companies;
}

// ------ навигация по страници и събиране до MAX_COMPANIES_TO_COLLECT компании ------
async function collectCompaniesAcrossPages(
  page,
  baseSearchUrl,
  fullName,
  targetNameKey,
  matchCount
) {
  const collected = [];
  const seen = new Set();

  const maxPagesByCount = Math.ceil(matchCount / GUESSED_PAGE_SIZE);
  const maxPages = Math.min(MAX_PAGES_TO_SCAN, maxPagesByCount || 1);

  for (let pageIndex = 1; pageIndex <= maxPages; pageIndex++) {
    let pageUrl = baseSearchUrl;

    if (pageUrl.includes("page=")) {
      pageUrl = pageUrl.replace(/([?&]page=)\d+/i, `$1${pageIndex}`);
    } else {
      pageUrl += (pageUrl.includes("?") ? "&" : "?") + `page=${pageIndex}`;
    }

    if (pageIndex > 1) {
      console.log(
        `Loading page ${pageIndex}/${maxPages} for ${fullName} → ${pageUrl}`
      );
      await page.goto(pageUrl, { waitUntil: "networkidle" });
    }

    const companiesOnPage = await extractCompaniesFromCurrentPage(
      page,
      fullName,
      targetNameKey
    );

    for (const c of companiesOnPage) {
      const key = (c.eik || "") + "|" + (c.href || "");
      if (seen.has(key)) continue;
      seen.add(key);
      collected.push(c);
      if (collected.length >= MAX_COMPANIES_TO_COLLECT) break;
    }

    console.log(
      `Collected so far ${collected.length} companies for ${fullName}.`
    );

    if (collected.length >= MAX_COMPANIES_TO_COLLECT) break;
  }

  console.log(`Total collected companies for ${fullName}: ${collected.length}`);
  return collected;
}

// ------ Обработка на един user_pending ------
async function processUser(user) {
  const fullName = (user.full_name || "").trim();

  if (!fullName) {
    console.error("User has no full_name, skipping:", user.id);
    await supabase
      .from("users_pending")
      .update({ status: "error" })
      .eq("id", user.id);
    return;
  }

  const targetNameKey = nameTokensKey(fullName);

  console.log("Processing:", fullName);
  console.log("Target name key:", targetNameKey);

  const searchUrl = `${REGISTRY_BASE_URL}${encodeURIComponent(fullName)}`;
  console.log("Opening:", searchUrl);

  const page = getPage();
  if (!page) {
    console.error("No Stagehand page found.");
    await supabase
      .from("users_pending")
      .update({ status: "error" })
      .eq("id", user.id);
    return;
  }

  let matchCount = 0;
  let companies = [];
  let lastError = null;

  for (let attempt = 1; attempt <= MAX_STAGEHAND_RETRIES; attempt++) {
    try {
      console.log(`Attempt ${attempt} for ${fullName}`);
      await page.goto(searchUrl, { waitUntil: "networkidle" });

      const initialMatchCount = await getMatchCountFromPage(page);
      console.log("Initial match count:", initialMatchCount);

      let finalMatchCount = initialMatchCount;

      if (
        initialMatchCount >= HIGH_RESULTS_MIN &&
        initialMatchCount < HIGH_RESULTS_MAX
      ) {
        console.log(
          `Match count between ${HIGH_RESULTS_MIN} and ${HIGH_RESULTS_MAX} → waiting extra ${
            EXTRA_WAIT_MS / 1000
          } seconds for final count...`
        );
        await sleep(EXTRA_WAIT_MS);
        const afterWaitCount = await getMatchCountFromPage(page);
        console.log("Match count after extra wait:", afterWaitCount);
        finalMatchCount = afterWaitCount;
      }

      console.log("Final match count:", finalMatchCount);
      matchCount = finalMatchCount;

      if (finalMatchCount > 0 && finalMatchCount <= TOO_MANY_MATCHES_THRESHOLD) {
        companies = await collectCompaniesAcrossPages(
          page,
          searchUrl,
          fullName,
          targetNameKey,
          finalMatchCount
        );
      } else {
        companies = [];
      }

      lastError = null;
      break;
    } catch (err) {
      console.error(`Error on attempt ${attempt} for ${fullName}:`, err);
      lastError = err;

      if (attempt < MAX_STAGEHAND_RETRIES) {
        console.log("Transient error, retrying after short delay...");
        await sleep(2000);
      }
    }
  }

  if (lastError) {
    console.error(
      "Final error while processing user (after retries):",
      lastError
    );
    await supabase
      .from("users_pending")
      .update({ status: "error" })
      .eq("id", user.id);
    return;
  }

  // --- Определяме status според matchCount ---
  let status;
  if (matchCount === 0) {
    status = "no_match";
  } else if (matchCount > TOO_MANY_MATCHES_THRESHOLD) {
    console.log(
      `Too many matches (${matchCount}) > ${TOO_MANY_MATCHES_THRESHOLD}, skipping company scrape.`
    );
    status = "too_many_matches";
    companies = [];
  } else {
    status = "checked";
  }

  // --- Пишем в user_registry_checks ---
  const registryPayload = {
    email: user.email,
    full_name: fullName,
    match_count: matchCount,
    any_match: matchCount > 0,
    companies,
  };

  const { error: insertError } = await supabase
    .from("user_registry_checks")
    .insert(registryPayload);

  if (insertError) {
    console.error("Error inserting into user_registry_checks:", insertError);
  } else {
    console.log(
      `Inserted registry check for ${fullName} (matches=${matchCount}, companies=${companies.length}).`
    );
  }

  // --- Обновяваме users_pending.status ---
  await supabase
    .from("users_pending")
    .update({ status })
    .eq("id", user.id);

  console.log(
    `Done processing: ${fullName} | matchCount=${matchCount}, companies=${companies.length}, status=${status}`
  );
}

// ------ Периодична проверка за pending users ------
async function checkPendingUsers() {
  if (isRunning) {
    console.log("Previous run still in progress, skipping this tick.");
    return;
  }
  isRunning = true;

  try {
    console.log("Checking pending users...");

    const { data: users, error } = await supabase
      .from("users_pending")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(1);

    if (error) {
      console.error("Supabase error while fetching users_pending:", error);
      return;
    }

    if (!users || users.length === 0) {
      console.log("No pending users.");
      return;
    }

    const user = users[0];
    await processUser(user);
  } catch (err) {
    console.error("Unexpected error in checkPendingUsers:", err);
  } finally {
    isRunning = false;
  }
}

// стартов run + интервал
await checkPendingUsers();
setInterval(checkPendingUsers, POLL_INTERVAL_MS);

// коректно спиране
process.on("SIGINT", async () => {
  console.log("Shutting down...");
  try {
    await stagehand.close();
  } catch (e) {
    console.error("Error while closing Stagehand:", e);
  }
  process.exit(0);
});