/* ============================================================
   BAL STUDIO 無料講義LP script.js
   ============================================================ */

// ------------------------------------------------------------
// 設定: ここだけ書き換えれば全体に反映されます
//   LINE_URL : すべてのCTAボタン(data-cta="line")の遷移先。
//              正式URLはこの1箇所のみで管理しています。
//              ※HTML内の href="https://lin.ee/VYgsvSm" は
//                JS無効時のフォールバックです。
// ------------------------------------------------------------
const CONFIG = {
  LINE_URL: "https://lin.ee/VYgsvSm"
};

document.addEventListener("DOMContentLoaded", () => {
  applyLineUrl();
  initFaqAccordion();
  initFadeIn();
  initStickyCta();
  initAnalyticsTracking();
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


// ------------------------------------------------------------
// GA4: LPセクション到達・LINE CTA位置別クリック計測
// ------------------------------------------------------------
function initAnalyticsTracking() {
  if (typeof window.gtag !== "function") return;

  const sectionIds = [
    "hero", "pain", "steps-flow", "lecture-content", "shoulder-example",
    "instructor", "about-bal", "how-to-get", "faq", "final-cta"
  ];
  const viewed = new Set();
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || viewed.has(entry.target.id)) return;
      viewed.add(entry.target.id);
      gtag("event", "lp_view_" + entry.target.id.replace(/-/g, "_"));
      sectionObserver.unobserve(entry.target);
    });
  }, { threshold: 0.25 });

  sectionIds.forEach((id) => {
    const section = document.getElementById(id);
    if (section) sectionObserver.observe(section);
  });

  document.querySelectorAll('[data-cta="line"]').forEach((cta) => {
    cta.addEventListener("click", () => {
      const section = cta.closest("section");
      const location = cta.closest("#sticky-cta") ? "sticky" : (section ? section.id : "other");
      gtag("event", "line_click_" + location.replace(/-/g, "_"));
    });
  });
}
