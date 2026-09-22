// ============ Mobile menu — full-screen editorial overlay ============
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

// ============ Projects film strip (Version 31) ============
const stripStage = document.getElementById("stripStage");
const stripTrack = document.getElementById("stripTrack");
const stripCount = document.getElementById("stripCount");
const stripPrev  = document.getElementById("stripPrev");
const stripNext  = document.getElementById("stripNext");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let stripIndex = 0;
let stripTimer = null;
const STRIP_MS = 5500;   // one framed print glides forward every 5.5 s

function visibleCards() {
  if (!stripTrack) return [];
  return Array.from(stripTrack.querySelectorAll(".strip-card"))
    .filter(card => !card.classList.contains("is-empty"));
}

function pad2(n) { return String(n).padStart(2, "0"); }

function goCard(i) {
  const cards = visibleCards();
  if (!cards.length || !stripTrack || !stripStage) return;
  stripIndex = (i + cards.length) % cards.length;
  const first = cards[0];
  const target = cards[stripIndex];
  const maxShift = Math.max(stripTrack.scrollWidth - stripStage.clientWidth, 0);
  const shift = Math.min(target.offsetLeft - first.offsetLeft, maxShift);
  stripTrack.style.transform = "translateX(" + (-shift) + "px)";
  if (stripCount) {
    stripCount.textContent = pad2(Number(target.dataset.project)) + " / 06";
  }
}

function nextCard() { goCard(stripIndex + 1); }
function prevCard() { goCard(stripIndex - 1); }

function stopStrip() { if (stripTimer) { clearInterval(stripTimer); stripTimer = null; } }
function startStrip() {
  if (reducedMotion) return;
  stopStrip();
  stripTimer = setInterval(nextCard, STRIP_MS);
}

if (stripNext) stripNext.addEventListener("click", () => { nextCard(); startStrip(); });
if (stripPrev) stripPrev.addEventListener("click", () => { prevCard(); startStrip(); });

if (stripStage) {
  // pause while the visitor studies the prints
  stripStage.addEventListener("mouseenter", stopStrip);
  stripStage.addEventListener("mouseleave", startStrip);

  // play only while the strip is on screen
  if ("IntersectionObserver" in window) {
    const viewObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { startStrip(); }
        else { stopStrip(); }
      });
    }, { threshold: 0.2 });
    viewObserver.observe(stripStage);
  } else {
    startStrip();
  }

  // swipe on touch screens
  let touchX = null;
  stripStage.addEventListener("touchstart", e => {
    touchX = e.touches[0].clientX;
    stopStrip();
  }, { passive: true });
  stripStage.addEventListener("touchend", e => {
    if (touchX !== null) {
      const delta = e.changedTouches[0].clientX - touchX;
      if (Math.abs(delta) > 40) { delta < 0 ? nextCard() : prevCard(); }
    }
    touchX = null;
    startStrip();
  }, { passive: true });
}

window.addEventListener("resize", () => goCard(stripIndex));
goCard(0);

// ============ Missing-photo safety net ============
document.querySelectorAll("img").forEach(img => {
  const hideMissing = () => {
    img.classList.add("is-missing");
    const card = img.closest(".strip-card");
    if (card) card.classList.add("is-empty");
    goCard(Math.min(stripIndex, Math.max(visibleCards().length - 1, 0)));
  };
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