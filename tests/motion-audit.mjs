import { chromium } from "playwright";
import assert from "node:assert/strict";

const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
page.on("pageerror", (error) => errors.push(error.message));
await page.goto("http://127.0.0.1:5173/", { waitUntil: "networkidle" });

assert.equal(await page.locator("html").evaluate((el) => el.classList.contains("motion-ready")), true);
assert.equal(await page.locator("#hero").evaluate((el) => el.classList.contains("hero-ready")), true);
assert.equal(await page.locator("#sticky").evaluate((el) => el.classList.contains("show")), false);

for (let y = 0; y <= await page.evaluate(() => document.body.scrollHeight - innerHeight); y += 420) {
  await page.evaluate((top) => window.scrollTo(0, top), y);
  await page.waitForTimeout(90);
}
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(850);

const motion = await page.evaluate(() => ({
  visibleSections: document.querySelectorAll(".track.section-visible").length,
  expectedSections: document.querySelectorAll(".track:not(.hero)").length,
  flowOpacity: [...document.querySelectorAll(".flow li")].map((el) => getComputedStyle(el).opacity),
  caseOpacity: [...document.querySelectorAll(".case-flow > *")].map((el) => getComputedStyle(el).opacity),
  seenCtas: document.querySelectorAll(".cta.cta-seen").length,
  stickyVisible: document.getElementById("sticky").classList.contains("show"),
  rootOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
}));
assert.equal(motion.visibleSections, motion.expectedSections);
assert.ok(motion.flowOpacity.every((opacity) => opacity === "1"));
assert.ok(motion.caseOpacity.every((opacity) => opacity === "1"));
assert.ok(motion.seenCtas >= 3);
assert.equal(motion.stickyVisible, true);
assert.equal(motion.rootOverflow, false);

const firstFaq = page.locator("#faq details").first();
await firstFaq.locator("summary").click();
await page.waitForTimeout(550);
assert.equal(await firstFaq.getAttribute("open") !== null, true);
await firstFaq.locator("summary").click();
await page.waitForTimeout(550);
assert.equal(await firstFaq.getAttribute("open") !== null, false);
assert.deepEqual(errors, []);
await page.close();

const reduced = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
await reduced.goto("http://127.0.0.1:5173/", { waitUntil: "networkidle" });
assert.equal(await reduced.locator("html").evaluate((el) => el.classList.contains("motion-ready")), false);
assert.equal(await reduced.locator(".reveal").first().evaluate((el) => getComputedStyle(el).opacity), "1");
await reduced.close();
await browser.close();
console.log(JSON.stringify(motion, null, 2));
