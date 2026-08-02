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

test("every image has alt text and local sources exist in markup", () => {
  const images = [...html.matchAll(/<img\s+[^>]*>/g)].map((m) => m[0]);
  assert.ok(images.length >= 5);
  images.forEach((image) => assert.match(image, /alt="[^"]+"/));
});

test("LINE CTA fallback URLs are valid", () => {
  const ctas = [...html.matchAll(/<a[^>]+data-cta="line"[^>]+>/g)].map((m) => m[0]);
  assert.ok(ctas.length >= 5);
  ctas.forEach((cta) => assert.match(cta, /href="https:\/\/lin\.ee\/VYgsvSm"/));
});
