(() => {
  const LINE_URL = "https://lin.ee/VYgsvSm";
  const send = (name, params = {}) => {
    const analytics = Reflect.get(window, "gtag");
    if (typeof analytics === "function") analytics("event", name, params);
  };

  document.querySelectorAll('[data-cta="line"]').forEach((link) => {
    link.setAttribute("href", LINE_URL);
    link.setAttribute("rel", "noopener");
    link.addEventListener("click", () => send(link.getAttribute("data-event") || "line_click_unknown", {
      link_url: LINE_URL,
      section_id: link.closest("section")?.id || "sticky"
    }), { once: true });
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

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

  document.querySelectorAll(".faq details").forEach((item) => {
    item.addEventListener("toggle", () => {
      if (item.hasAttribute("open")) send("faq_open", { question: item.querySelector("summary")?.textContent.trim() });
    });
  });

  const sticky = document.getElementById("sticky");
  const hero = document.getElementById("hero");
  const faq = document.getElementById("faq");
  const finalCta = document.getElementById("final-cta");
  const updateSticky = () => {
    const pastHero = window.scrollY > hero.offsetHeight * 0.7;
    const blocked = [faq, finalCta].some((el) => {
      const box = el.getBoundingClientRect();
      return box.top < window.innerHeight && box.bottom > 0;
    });
    sticky.classList.toggle("show", pastHero && !blocked);
  };
  window.addEventListener("scroll", updateSticky, { passive: true });
  window.addEventListener("resize", updateSticky);
  updateSticky();
})();
