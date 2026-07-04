/* ============================================================
   BAL STUDIO 無料講義LP script.js
   ============================================================ */

// ------------------------------------------------------------
// 設定: LINE登録URL
// ここを書き換えるだけで、ページ内すべてのCTAボタン
// (data-cta="line" を持つリンク)の遷移先が一括で変わります。
// ------------------------------------------------------------
const CONFIG = {
  LINE_URL: "https://example.com/line"
};

document.addEventListener("DOMContentLoaded", () => {
  applyLineUrl();
  initFaqAccordion();
  initFadeIn();
  initStickyCta();
});

// ------------------------------------------------------------
// CTAリンクへのLINE URL一括適用
// ------------------------------------------------------------
function applyLineUrl() {
  document.querySelectorAll('[data-cta="line"]').forEach((el) => {
    el.setAttribute("href", CONFIG.LINE_URL);
  });
}

// ------------------------------------------------------------
// FAQ アコーディオン
// ------------------------------------------------------------
function initFaqAccordion() {
  const questions = document.querySelectorAll(".faq-item__question");

  questions.forEach((btn) => {
    const answer = btn.nextElementSibling;
    if (!answer) return;

    // 初期状態(閉じた状態)を明示的にセット
    answer.style.maxHeight = "0px";

    btn.addEventListener("click", () => {
      const isOpen = btn.getAttribute("aria-expanded") === "true";

      // 他のFAQは閉じない仕様(それぞれ独立して開閉可能)にする場合は
      // 下のforEachブロックを削除してください。
      questions.forEach((otherBtn) => {
        if (otherBtn !== btn) {
          otherBtn.setAttribute("aria-expanded", "false");
          const otherAnswer = otherBtn.nextElementSibling;
          if (otherAnswer) otherAnswer.style.maxHeight = "0px";
        }
      });

      btn.setAttribute("aria-expanded", String(!isOpen));
      answer.style.maxHeight = isOpen ? "0px" : answer.scrollHeight + "px";
    });
  });
}

// ------------------------------------------------------------
// スクロール時のフェードイン
// ------------------------------------------------------------
function initFadeIn() {
  const targets = document.querySelectorAll(".fade-in");

  if (!("IntersectionObserver" in window) || targets.length === 0) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  targets.forEach((el) => observer.observe(el));
}

// ------------------------------------------------------------
// スマートフォン用 追従CTA
// ヒーローセクションを通過したら表示する
// ------------------------------------------------------------
function initStickyCta() {
  const stickyCta = document.getElementById("sticky-cta");
  const hero = document.getElementById("hero");
  if (!stickyCta || !hero) return;

  const toggleSticky = () => {
    const heroBottom = hero.getBoundingClientRect().bottom;
    if (heroBottom < 0) {
      stickyCta.classList.add("is-visible");
    } else {
      stickyCta.classList.remove("is-visible");
    }
  };

  window.addEventListener("scroll", toggleSticky, { passive: true });
  toggleSticky();
}
