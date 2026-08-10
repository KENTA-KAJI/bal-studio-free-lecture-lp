import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const script = await readFile(new URL("../script.js", import.meta.url), "utf8");

test("all required GA4 events remain present", () => {
  for (const name of ["lp_view_hero","lp_view_pain","lp_view_steps_flow","lp_view_lecture_content","lp_view_shoulder_example","lp_view_instructor","lp_view_about_bal","lp_view_how_to_get","lp_view_faq","lp_view_final_cta","line_click_hero","line_click_lecture_content","line_click_how_to_get","line_click_final_cta","line_click_sticky_mobile"]) {
    assert.ok((html + script).includes(name), name);
  }
});

test("Meta Pixel sends the required LP events with the configured pixel", () => {
  assert.match(html, /fbq\('init', '590843899185461'\)/);
  assert.equal((html.match(/fbq\('track', 'PageView'\)/g) || []).length, 1);
  assert.equal((html.match(/fbq\('track', 'ViewContent'/g) || []).length, 1);
  for (const value of [
    "TOP10%のトレーナーになるための実践解剖学",
    "free_lecture",
    "free_lecture_line",
    "bal_studio_free_lecture"
  ]) assert.ok(html.includes(value), value);
});

test("LineClick includes CTA and Meta ad attribution parameters", () => {
  assert.match(script, /sendMeta\("LineClick"/);
  for (const name of [
    "cta_position",
    "section_id",
    "link_url",
    "funnel_name",
    "landing_page",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "fbclid"
  ]) assert.ok(script.includes(name), name);
  assert.doesNotMatch(html + script, /CompleteRegistration/);
});

test("every image has alt text and local sources exist in markup", () => {
  const images = [...html.matchAll(/<img\s+[^>]*>/g)].map((m) => m[0]);
  assert.ok(images.length >= 5);
  images.forEach((image) => assert.match(image, /alt="[^"]*"/));
});

test("LINE CTA fallback URLs are valid", () => {
  const ctas = [...html.matchAll(/<a[^>]+data-cta="line"[^>]+>/g)].map((m) => m[0]);
  assert.ok(ctas.length >= 5);
  ctas.forEach((cta) => assert.match(cta, /href="https:\/\/lin\.ee\/VYgsvSm"/));
});

test("every CTA includes guidance for existing LINE members", () => {
  assert.equal((html.match(/すでにBAL公式LINEを登録済みの方/g) || []).length, 4);
  assert.match(html, /登録済みの方は「無料講義」と送信/);
});

test("case study explains the missing shoulder movement", () => {
  for (const text of ["ショルダープレス", "抜けている動き", "肩関節の", "内旋・外旋"]) assert.ok(html.includes(text));
});
