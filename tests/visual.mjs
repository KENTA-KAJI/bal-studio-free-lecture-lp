import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" });
const sizes = [[390,844],[430,932],[1440,900]];
await mkdir("screenshots", { recursive: true });
const results = [];

for (const [width,height] of sizes) {
  const page = await browser.newPage({ viewport: { width, height } });
  const errors = [];
  page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("http://127.0.0.1:5173/", { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight * .7) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 40));
    }
    window.scrollTo(0, 0);
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("visible"));
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `screenshots/lp-${width}x${height}.png`, fullPage: true });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  const text = await page.locator("h1").innerText();
  const ctas = await page.locator('[data-cta="line"]').count();
  const badCtas = await page.locator('[data-cta="line"]:not([href="https://lin.ee/VYgsvSm"])').count();
  await page.locator("#faq summary").first().click();
  const faqOpen = await page.locator("#faq details").first().getAttribute("open") !== null;
  results.push({ width, height, overflow, text, ctas, badCtas, faqOpen, errors });
  await page.close();
}

console.log(JSON.stringify(results, null, 2));
if (results.some((r) => r.overflow || r.badCtas || !r.faqOpen || r.errors.length)) process.exitCode = 1;
await browser.close();
