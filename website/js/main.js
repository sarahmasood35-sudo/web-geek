const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 70}ms`;
  io.observe(el);
});

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Hero headline: stagger each word in
const title = document.getElementById('hero-title');
title.querySelectorAll('.word > span').forEach((s, i) => { s.style.transitionDelay = `${150 + i * 70}ms`; });
setTimeout(() => title.classList.add('words-in'), 60);

// Scroll: progress bar, hide/show nav, subtle parallax
const header = document.getElementById('site-header');
const progress = document.getElementById('progress');
const layers = [...document.querySelectorAll('[data-speed]')];
let lastY = scrollY, ticking = false;
function onScroll() {
  const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  header.classList.toggle('nav-hidden', y > lastY && y > 160);
  lastY = y;
  if (!reduce) layers.forEach((el) => { el.style.transform = `translate3d(0, ${y * el.dataset.speed}px, 0)`; });
  ticking = false;
}
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
header.addEventListener('focusin', () => header.classList.remove('nav-hidden'));

// "Request a quote" buttons preselect the matching project type in the form
const projectType = document.getElementById('project-type');
document.querySelectorAll('.type-cta').forEach((a) => a.addEventListener('click', () => { projectType.value = a.dataset.type; }));

// Contact form: send to info@webgeek.uk via FormSubmit without leaving the page
const form = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');
function showStatus(ok, text) {
  formStatus.textContent = text;
  formStatus.classList.remove('hidden');
  formStatus.classList.toggle('text-iris-600', ok);
  formStatus.classList.toggle('text-snow', !ok);
}
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const button = form.querySelector('[type="submit"]');
  button.disabled = true;
  try {
    const res = await fetch('https://formsubmit.co/ajax/info@webgeek.uk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(Object.fromEntries(new FormData(form))),
    });
    const data = await res.json();
    if (!res.ok || String(data.success) !== 'true') throw new Error(data.message);
    form.reset();
    showStatus(true, "Thanks — we'll be in touch within one business day.");
  } catch {
    showStatus(false, 'Sorry, that didn’t send. Please email us at info@webgeek.uk.');
  } finally {
    button.disabled = false;
  }
});
