// ============ Mobile menu — full-screen editorial overlay (Version 25) ============
const menuBtn = document.getElementById("menuBtn");
const nav = document.getElementById("nav");

function setMenu(open) {
  if (!nav || !menuBtn) return;
  nav.classList.toggle("open", open);
  document.body.classList.toggle("menu-open", open);
  menuBtn.setAttribute("aria-expanded", String(open));
  menuBtn.textContent = open ? "Close" : "Menu";
}

if (menuBtn) {
  menuBtn.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
}
if (nav) {
  nav.querySelectorAll("a").forEach(link =>
    link.addEventListener("click", () => setMenu(false))
  );
}
document.addEventListener("keydown", e => { if (e.key === "Escape") setMenu(false); });
window.addEventListener("resize", () => { if (window.innerWidth > 820) setMenu(false); });

// ============ Dark mode + browser chrome colour ============
const rootEl = document.documentElement;
const themeToggle = document.getElementById("themeToggle");
const metaTheme = document.querySelector('meta[name="theme-color"]');

if (localStorage.getItem("virasat-theme") === "dark") {
  rootEl.setAttribute("data-theme", "dark");
}

function syncToggle() {
  const dark = rootEl.getAttribute("data-theme") === "dark";
  if (themeToggle) {
    themeToggle.setAttribute("aria-pressed", String(dark));
    themeToggle.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
  }
  if (metaTheme) {
    metaTheme.setAttribute("content", dark ? "#201812" : "#F7F2EA");
  }
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const dark = rootEl.getAttribute("data-theme") === "dark";
    if (dark) {
      rootEl.removeAttribute("data-theme");
      localStorage.setItem("virasat-theme", "light");
    } else {
      rootEl.setAttribute("data-theme", "dark");
      localStorage.setItem("virasat-theme", "dark");
    }
    syncToggle();
  });
}
syncToggle();

// ============ Missing-photo safety net ============
document.querySelectorAll("img").forEach(img => {
  const hideMissing = () => img.classList.add("is-missing");
  if (img.complete && img.naturalWidth === 0) hideMissing();
  img.addEventListener("error", hideMissing);
});

// ============ Slow, subtle reveal on scroll (Guideline 08) ============
const items = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  items.forEach(el => observer.observe(el));
} else {
  items.forEach(el => el.classList.add("is-visible"));
}

// ============ Footer year ============
document.getElementById("year").textContent = new Date().getFullYear();