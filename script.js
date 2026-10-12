/* =========================================================
   NITHUB ACCELERATOR — INTERACTION + MOTION
   Smooth, lightweight, accessible animations for every section.
   ========================================================= */

const CONFIG = {
  BENEFITS_API: "https://nithub-backend-eg0tsg82o.vercel.app/api/program-benefits",
  TIMELINE_API: "https://nithub-backend.vercel.app/api/timeline"
};

const LOCAL_BENEFIT_IMAGES = [
  "Images/Depth 9, Frame 0.svg",
  "Images/Depth 9, Frame 0 (1).svg",
  "Images/Depth 8, Frame 0.svg",
  "Images/Depth 9, Frame 0 (2).svg",
  "Images/Depth 9, Frame 0 (3).svg",
  "Images/Depth 9, Frame 0 (4).svg"
];

const BACKEND_TIMELINE_IMAGES = [
  "https://nithub-backend.vercel.app/images/applicationOpen.svg",
  "https://nithub-backend.vercel.app/images/Application_close.png",
  "https://nithub-backend.vercel.app/images/selection%20interview.svg",
  "https://nithub-backend.vercel.app/images/program_start.png"
];

const FALLBACKS = {
  benefits: [
    { title: "Mentorship", description: "Get practical guidance from experienced founders and industry experts." },
    { title: "Technical Support", description: "Access technical advisory and tools that help you build and improve faster." },
    { title: "Workspace", description: "Work from a collaborative environment designed for focused startup growth." },
    { title: "Growth Resources", description: "Use resources, playbooks and support to turn traction into sustainable growth." },
    { title: "Ecosystem Access", description: "Connect with a network of founders, partners and ecosystem opportunities." },
    { title: "Investor Readiness", description: "Refine your business, story and metrics so you are better prepared for investment." }
  ],
  timeline: [
    { title: "Applications Open", date: "Applications begin" },
    { title: "Applications Close", date: "Application deadline" },
    { title: "Selection Interview", date: "Shortlisted founders interviewed" },
    { title: "Program Starts", date: "Accelerator begins" }
  ]
};

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Preloader ---------- */
window.addEventListener("load", () => {
  const preloader = document.getElementById("preloader");
  if (!preloader) return;

  const hide = () => {
    preloader.classList.add("preloader-hidden");
    window.setTimeout(() => preloader.remove(), prefersReducedMotion ? 0 : 700);
  };

  window.setTimeout(hide, prefersReducedMotion ? 150 : 900);
});

/* ---------- Cursor ---------- */
function initCursor() {
  if (prefersReducedMotion || !window.matchMedia("(pointer: fine)").matches) return;

  const dot = document.querySelector(".custom-cursor-dot");
  const circle = document.querySelector(".custom-cursor-circle");
  if (!dot || !circle) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let dotX = mouseX;
  let dotY = mouseY;
  let circleX = mouseX;
  let circleY = mouseY;

  window.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    dot.classList.add("cursor-active");
    circle.classList.add("cursor-active");
  }, { passive: true });

  document.querySelectorAll("a, button, input, select, textarea, .boxes").forEach((element) => {
    element.addEventListener("mouseenter", () => circle.classList.add("cursor-hover"));
    element.addEventListener("mouseleave", () => circle.classList.remove("cursor-hover"));
  });

  const render = () => {
    dotX += (mouseX - dotX) * 0.22;
    dotY += (mouseY - dotY) * 0.22;
    circleX += (mouseX - circleX) * 0.12;
    circleY += (mouseY - circleY) * 0.12;

    dot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
    circle.style.transform = `translate3d(${circleX}px, ${circleY}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(render);
  };

  render();
}

/* ---------- Scroll reveal ---------- */
function initScrollReveal() {
  const targets = document.querySelectorAll(
    ".textContent, .img1, .textContent1, .textContent2, #programBenefits, .liableApplicants, .TimelineContainer, .img2, footer"
  );

  if (prefersReducedMotion) {
    targets.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

  targets.forEach((element) => observer.observe(element));
}

/* ---------- Small parallax for the hero artwork ---------- */
function initHeroParallax() {
  if (prefersReducedMotion || window.matchMedia("(pointer: coarse)").matches) return;
  const heroImage = document.querySelector(".container .img1");
  if (!heroImage) return;

  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const rect = heroImage.getBoundingClientRect();
      const progress = Math.max(-1, Math.min(1, (window.innerHeight * 0.5 - rect.top) / window.innerHeight));
      heroImage.style.setProperty("--hero-shift", `${progress * -14}px`);
      ticking = false;
    });
  }, { passive: true });
}

/* ---------- Smooth navigation ---------- */
function initNavigation() {
  const navItems = document.querySelectorAll("nav li");
  const sections = [document.querySelector(".bdy2"), document.querySelector(".TimelineContainer")];

  navItems.forEach((item, index) => {
    item.setAttribute("role", "link");
    item.tabIndex = 0;
    item.addEventListener("click", () => sections[index]?.scrollIntoView({ behavior: "smooth", block: "start" }));
    item.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        sections[index]?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  document.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      if (!/apply/i.test(button.textContent)) return;
      const timeline = document.querySelector(".liableApplicants");
      timeline?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });
}

/* ---------- Program benefits ---------- */
async function initProgramBenefits() {
  const container = document.getElementById("programBenefits");
  if (!container) return;

  try {
    const response = await fetch(CONFIG.BENEFITS_API);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const benefits = Array.isArray(data) ? data : (data.benefits || data.data || FALLBACKS.benefits);
    renderBenefits(container, benefits);
  } catch (error) {
    console.warn("Benefits API failed; using fallback content.", error);
    renderBenefits(container, FALLBACKS.benefits);
  }
}

function renderBenefits(container, items) {
  container.innerHTML = "";

  items.forEach((item, index) => {
    const box = document.createElement("article");
    box.className = "boxes";
    const title = item.title || item.name || item.heading || "";
    const description = item.description || item.body || item.details || "";
    const icon = LOCAL_BENEFIT_IMAGES[index] || LOCAL_BENEFIT_IMAGES[0];

    box.innerHTML = `
      <img src="${icon}" alt="" loading="lazy">
      <h4 class="${index % 2 === 0 ? "myH4A" : "myH4B"}">${title}</h4>
      <p class="myP4">${description}</p>
    `;

    container.appendChild(box);
  });
}

/* ---------- Timeline ---------- */
async function initTimeline() {
  const container = document.getElementById("timelineContainer");
  if (!container) return;

  try {
    const response = await fetch(CONFIG.TIMELINE_API);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const timeline = Array.isArray(data) ? data : (data.timeline || data.data || FALLBACKS.timeline);
    renderTimeline(container, timeline);
  } catch (error) {
    console.warn("Timeline API failed; using fallback content.", error);
    renderTimeline(container, FALLBACKS.timeline);
  }
}

function renderTimeline(container, items) {
  container.innerHTML = "";

  items.forEach((item, index) => {
    const itemElement = document.createElement("div");
    itemElement.className = "Items";
    const title = item.title || item.name || item.event || "";
    const date = item.date || item.time || item.startDate || "";
    const icon = BACKEND_TIMELINE_IMAGES[index] || BACKEND_TIMELINE_IMAGES[0];

    itemElement.innerHTML = `
      <img src="${icon}" alt="" class="TimelineIcon" width="25" height="25" loading="lazy">
      <p class="timelineContent">${title}<br><span>${date}</span></p>
    `;
    container.appendChild(itemElement);
  });

  // Dynamic timeline items are inserted after the initial observer runs.
  requestAnimationFrame(() => {
    container.closest(".TimelineContainer")?.classList.add("timeline-ready");
  });
}

/* ---------- Init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  initCursor();
  initNavigation();
  initScrollReveal();
  initHeroParallax();
  initProgramBenefits();
  initTimeline();
});
