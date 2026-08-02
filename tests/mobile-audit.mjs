import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" });
await mkdir("screenshots/mobile-audit", { recursive: true });

for (const width of [390, 430]) {
  const page = await browser.newPage({ viewport: { width, height: width === 390 ? 844 : 932 } });
  const errors = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto("http://127.0.0.1:5173/", { waitUntil: "networkidle" });
  await page.evaluate(() => document.querySelectorAll(".reveal").forEach((el) => el.classList.add("visible")));
  const stickyVisible = [];
  for (const ratio of [0, .25, .5, .75, 1]) {
    await page.evaluate((value) => window.scrollTo(0, (document.body.scrollHeight - window.innerHeight) * value), ratio);
    await page.waitForTimeout(50);
    stickyVisible.push(await page.locator("#sticky").evaluate((el) => el.classList.contains("show")));
  }
  for (const selector of ["#hero", "#pain", "#steps-flow", "#shoulder-example", "#how-to-get", "#faq", "#final-cta"]) {
    await page.locator(selector).scrollIntoViewIfNeeded();
    await page.waitForTimeout(100);
    await page.locator(selector).screenshot({ path: `screenshots/mobile-audit/${width}-${selector.slice(1)}.png` });
  }
  const audit = await page.evaluate(() => {
    const style = (selector) => {
      const el = document.querySelector(selector);
      const css = getComputedStyle(el);
      return { fontSize: css.fontSize, lineHeight: css.lineHeight, width: Math.round(el.getBoundingClientRect().width), height: Math.round(el.getBoundingClientRect().height) };
    };
    return {
      viewport: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      h1: style("h1"), h2: style("h2"), caseTitle: style(".case-title"), finalTitle: style(".final-title"), body: style("body"), cta: style(".cta"), caseCard: style(".case-flow > div"), faq: style(".faq summary"),
      tinyText: [...document.querySelectorAll("body *")].filter((el) => el.children.length === 0 && el.textContent.trim() && parseFloat(getComputedStyle(el).fontSize) < 11).map((el) => `${el.tagName}.${el.className}:${getComputedStyle(el).fontSize}`).slice(0, 20),
      memberLines: [...document.querySelectorAll(".member p")].map((el) => el.innerText.split("\n").length),
      overflowing: [...document.querySelectorAll("body *")].filter((el) => el.scrollWidth > el.clientWidth + 1).map((el) => `${el.tagName}.${el.className}`).slice(0, 20)
    };
  });
  console.log(JSON.stringify({ width, errors, stickyVisible, ...audit }));
  if (stickyVisible[0] || stickyVisible.slice(1).some((visible) => !visible)) process.exitCode = 1;
  if (audit.memberLines.some((lines) => lines !== 2)) process.exitCode = 1;
  await page.close();
}
await browser.close();
