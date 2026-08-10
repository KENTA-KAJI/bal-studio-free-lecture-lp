(() => {
  if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
  const resetScroll = () => window.requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }));
  window.addEventListener("pageshow", resetScroll);
  resetScroll();

  const LINE_URL = "https://lin.ee/VYgsvSm";
  const FUNNEL_NAME = "free_lecture_line";
  const LANDING_PAGE = "bal_studio_free_lecture";
  const ATTRIBUTION_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid"];
  const searchParams = new window.URLSearchParams(window.location.search);
  const attribution = Object.fromEntries(ATTRIBUTION_KEYS.map((key) => [key, searchParams.get(key) || ""]));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const send = (name, params = {}) => {
    const analytics = Reflect.get(window, "gtag");
    if (typeof analytics === "function") analytics("event", name, params);
  };
  const sendMeta = (name, params = {}) => {
    const pixel = Reflect.get(window, "fbq");
    if (typeof pixel === "function") pixel("trackCustom", name, params);
  };

  document.querySelectorAll('[data-cta="line"]').forEach((link) => {
    link.setAttribute("href", LINE_URL);
    link.setAttribute("rel", "noopener");
    link.addEventListener("click", () => {
      const ga4EventName = link.getAttribute("data-event") || "line_click_unknown";
      const sectionId = link.closest("section")?.id || "sticky";
      send(ga4EventName, {
        link_url: LINE_URL,
        section_id: sectionId
      });
      sendMeta("LineClick", {
        cta_position: ga4EventName.replace(/^line_click_/, ""),
        section_id: sectionId,
        link_url: LINE_URL,
        funnel_name: FUNNEL_NAME,
        landing_page: LANDING_PAGE,
        ...attribution
      });
    }, { once: true });
  });

  const viewed = new Set();
  const viewObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const eventName = entry.target.getAttribute("data-view-event");
      if (entry.isIntersecting && eventName && !viewed.has(eventName)) {
        viewed.add(eventName);
        send(eventName, { section_id: entry.target.id });
      }
    });
  }, { threshold: 0.22 });
  document.querySelectorAll("[data-view-event]").forEach((section) => viewObserver.observe(section));

  const countUp = document.querySelector("[data-count-up]");
  if (countUp && !reducedMotion) {
    const target = Number(countUp.getAttribute("data-count-up"));
    countUp.textContent = "0";
    const countObserver = new IntersectionObserver((entries, observer) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      const startedAt = window.performance.now();
      const duration = 1200;
      const draw = (now) => {
        const progress = Math.min((now - startedAt) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        countUp.textContent = Math.round(target * eased).toLocaleString("ja-JP");
        if (progress < 1) window.requestAnimationFrame(draw);
      };
      window.requestAnimationFrame(draw);
    }, { threshold: 0.6 });
    countObserver.observe(countUp);
  }

  if (!reducedMotion) {
    document.documentElement.classList.add("motion-ready");
    window.requestAnimationFrame(() => document.getElementById("hero")?.classList.add("hero-ready"));

    const sectionObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("section-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    document.querySelectorAll(".track:not(.hero)").forEach((section) => sectionObserver.observe(section));

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

    const ctaObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("cta-seen");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.65 });
    document.querySelectorAll(".cta").forEach((cta) => ctaObserver.observe(cta));

    let ticking = false;
    const updateParallax = () => {
      const offset = Math.min(window.scrollY * 0.055, 48);
      document.documentElement.style.setProperty("--parallax-y", `${offset}px`);
      document.documentElement.style.setProperty("--parallax-x", `${offset * -0.18}px`);
      ticking = false;
    };
    window.addEventListener("scroll", () => {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
  } else {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("visible"));
  }

  document.querySelectorAll(".faq details").forEach((item) => {
    item.addEventListener("toggle", () => {
      if (item.hasAttribute("open")) send("faq_open", { question: item.querySelector("summary")?.textContent.trim() });
    });
    if (reducedMotion) return;
    const summary = item.querySelector("summary");
    summary?.addEventListener("click", (event) => {
      event.preventDefault();
      if (item.getAttribute("data-animating") === "true") return;
      const opening = !item.hasAttribute("open");
      const startHeight = item.getBoundingClientRect().height;
      if (opening) item.setAttribute("open", "");
      const endHeight = opening ? item.scrollHeight : summary.offsetHeight;
      item.setAttribute("data-animating", "true");
      const animation = item.animate(
        [{ height: `${startHeight}px` }, { height: `${endHeight}px` }],
        { duration: 480, easing: "cubic-bezier(.22,.61,.36,1)" }
      );
      animation.onfinish = () => {
        if (!opening) item.removeAttribute("open");
        item.removeAttribute("data-animating");
      };
    });
  });

  const sticky = document.getElementById("sticky");
  const hero = document.getElementById("hero");
  const updateSticky = () => sticky.classList.toggle("show", window.scrollY > Math.min(420, hero.offsetHeight * 0.42));
  window.addEventListener("scroll", updateSticky, { passive: true });
  window.addEventListener("resize", updateSticky);
  updateSticky();
})();
