// ============ Mobile menu ============
const menuBtn = document.getElementById("menuBtn");
const nav = document.getElementById("nav");

menuBtn.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", open);
});

nav.querySelectorAll("a").forEach(link =>
  link.addEventListener("click", () => nav.classList.remove("open"))
);

// ============ Missing-photo safety net (Version 15) ============
// If a project photo file is not in /images yet, hide the broken image
// so the frame keeps showing its cream "Photograph coming soon" panel.
// Drop the correctly-named file later + hard refresh, and it appears.
document.querySelectorAll("img").forEach(img => {
  const hideMissing = () => img.classList.add("is-missing");
  if (img.complete && img.naturalWidth === 0) hideMissing();
  img.addEventListener("error", hideMissing);
});

// ============ Slide 1 — project collage slider ============
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const collageSection = document.getElementById("work");
const slides  = Array.from(document.querySelectorAll(".collage-slide"));
const dots    = Array.from(document.querySelectorAll(".cdot"));
const countEl = document.getElementById("collageCount");
const prevBtn = document.getElementById("collagePrev");
const nextBtn = document.getElementById("collageNext");

let currentSlide = 0;
let autoTimer = null;
const AUTO_MS = 5000;   // slide changes every 5 seconds

function pad(n) { return String(n).padStart(2, "0"); }

function showSlide(i) {
  if (!slides.length) return;   // safe on project pages (no collage there)
  currentSlide = (i + slides.length) % slides.length;
  slides.forEach((s, idx) => s.classList.toggle("is-active", idx === currentSlide));
  dots.forEach((d, idx) => d.classList.toggle("is-on", idx === currentSlide));
  if (countEl) countEl.textContent = pad(currentSlide + 1) + " / " + pad(slides.length);
}

function nextSlide() { showSlide(currentSlide + 1); }
function prevSlide() { showSlide(currentSlide - 1); }

function stopAuto() { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } }
function startAuto() { if (reducedMotion) return; stopAuto(); autoTimer = setInterval(nextSlide, AUTO_MS); }

if (nextBtn) nextBtn.addEventListener("click", () => { nextSlide(); startAuto(); });
if (prevBtn) prevBtn.addEventListener("click", () => { prevSlide(); startAuto(); });

dots.forEach(d => d.addEventListener("click", () => {
  showSlide(Number(d.dataset.index));
  startAuto();
}));

// Pause the 5-second drift only while the cursor rests on the collage,
// so a client can study it; move the cursor away and the rhythm resumes.
if (collageSection) {
  collageSection.addEventListener("mouseenter", stopAuto);
  collageSection.addEventListener("mouseleave", startAuto);

  // swipe on touch screens
  let touchX = null;
  collageSection.addEventListener("touchstart", e => {
    touchX = e.touches[0].clientX;
    stopAuto();
  }, { passive: true });
  collageSection.addEventListener("touchend", e => {
    if (touchX !== null) {
      const delta = e.changedTouches[0].clientX - touchX;
      if (Math.abs(delta) > 40) { delta < 0 ? nextSlide() : prevSlide(); }
    }
    touchX = null;
    startAuto();
  }, { passive: true });
}

if (slides.length) {   // only run the slider where a collage exists
  showSlide(0);
  startAuto();
}

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