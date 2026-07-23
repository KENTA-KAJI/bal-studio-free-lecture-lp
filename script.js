/* ============================================================
   BAL STUDIO 無料講義LP script.js
   ============================================================ */

// ------------------------------------------------------------
// 設定: ここだけ書き換えれば全体に反映されます
// ------------------------------------------------------------
const CONFIG = {
  LINE_URL: "https://lin.ee/VYgsvSm",
  TRAFFIC_STORAGE_KEY: "bal_lp_traffic"
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

    answer.style.maxHeight = "0px";

    btn.addEventListener("click", () => {
      const isOpen = btn.getAttribute("aria-expanded") === "true";

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
// GA4: LPセクション到達・LINE CTA位置別クリック・流入元計測
// ------------------------------------------------------------
function initAnalyticsTracking() {
  if (typeof window.gtag !== "function") return;

  const sectionIds = [
    "hero", "pain", "steps-flow", "lecture-content", "shoulder-example",
    "instructor", "about-bal", "how-to-get", "faq", "final-cta"
  ];
  const traffic = getTrafficAttribution();
  const viewed = new Set();

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      if (viewed.has(entry.target.id)) return;

      viewed.add(entry.target.id);
      gtag("event", "lp_view_" + normalizeEventPart(entry.target.id), {
        ...traffic,
        section_name: entry.target.id
      });
      sectionObserver.unobserve(entry.target);
    });
  }, { threshold: 0.25 });

  sectionIds.forEach((id) => {
    const section = document.getElementById(id);
    if (section) sectionObserver.observe(section);
  });

  document.querySelectorAll('[data-cta="line"]').forEach((cta) => {
    cta.addEventListener("click", () => {
      const isSticky = Boolean(cta.closest("#sticky-cta"));
      const section = cta.closest("section");
      const sectionContext = isSticky ? getVisibleSectionId(sectionIds) : (section ? section.id : "other");
      const ctaPosition = isSticky ? "sticky" : sectionContext;
      const eventName = isSticky
        ? "line_click_sticky_" + normalizeEventPart(sectionContext)
        : "line_click_" + normalizeEventPart(sectionContext);

      gtag("event", eventName, {
        ...traffic,
        cta_position: ctaPosition,
        section_context: sectionContext,
        link_url: CONFIG.LINE_URL,
        transport_type: "beacon"
      });
    });
  });
}

function getVisibleSectionId(sectionIds) {
  const viewportAnchor = Math.min(window.innerHeight * 0.35, 240);
  let best = { id: "hero", distance: Infinity };

  sectionIds.forEach((id) => {
    const section = document.getElementById(id);
    if (!section) return;
    const rect = section.getBoundingClientRect();
    if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;
    const distance = Math.abs(rect.top - viewportAnchor);
    if (distance < best.distance) best = { id, distance };
  });

  return best.id;
}

function normalizeEventPart(value) {
  return String(value || "other").replace(/-/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
}

function getTrafficAttribution() {
  const params = new URLSearchParams(window.location.search);
  const stored = readStoredTraffic();
  const referrer = document.referrer || "";
  const referrerSource = inferReferrerSource(referrer);

  const traffic = {
    traffic_source: params.get("utm_source") || stored.traffic_source || referrerSource || "direct",
    traffic_medium: params.get("utm_medium") || stored.traffic_medium || (referrerSource ? "referral" : "none"),
    traffic_campaign: params.get("utm_campaign") || stored.traffic_campaign || "(not set)",
    traffic_content: params.get("utm_content") || stored.traffic_content || "(not set)"
  };

  try {
    sessionStorage.setItem(CONFIG.TRAFFIC_STORAGE_KEY, JSON.stringify(traffic));
  } catch (error) {
    // ストレージが無効でもGA4の標準流入元は計測されるため処理を継続する。
  }

  return traffic;
}

function readStoredTraffic() {
  try {
    return JSON.parse(sessionStorage.getItem(CONFIG.TRAFFIC_STORAGE_KEY) || "{}");
  } catch (error) {
    return {};
  }
}

function inferReferrerSource(referrer) {
  if (!referrer) return "";

  try {
    const host = new URL(referrer).hostname.toLowerCase();
    if (host.includes("instagram.com") || host.includes("l.instagram.com")) return "instagram";
    if (host.includes("youtube.com") || host.includes("youtu.be")) return "youtube";
    if (host.includes("tiktok.com")) return "tiktok";
    return host.replace(/^www\./, "");
  } catch (error) {
    return "";
  }
}
