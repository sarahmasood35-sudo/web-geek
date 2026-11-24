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
// Spam and abuse checks, run before anything is sent
const formLoadedAt = Date.now();
const MIN_FILL_MS = 3000;          // bots submit instantly; people take a few seconds
const COOLDOWN_MS = 60 * 1000;     // one enquiry per minute from this browser
const MAX_LINKS = 3;               // spam messages are usually stuffed with links
const COOLDOWN_KEY = 'wg-last-enquiry';

function lastSent() {
  try { return Number(localStorage.getItem(COOLDOWN_KEY)) || 0; } catch { return 0; }
}
function markSent() {
  try { localStorage.setItem(COOLDOWN_KEY, String(Date.now())); } catch { /* storage blocked: skip */ }
}
// Trim values, strip control characters and angle brackets so nothing can be read as HTML
function clean(value) {
  return String(value).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').replace(/[<>]/g, '').trim();
}
function checkForm(data) {
  if (data._honey) return 'bot';
  if (Date.now() - formLoadedAt < MIN_FILL_MS) return 'Please take a moment to fill in the form, then try again.';
  if (Date.now() - lastSent() < COOLDOWN_MS) return 'Thanks, we already have your message. Please wait a minute before sending another.';
  if (!data.name || data.name.length < 2) return 'Please enter your name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) return 'Please enter a valid email address.';
  if (!data.details || data.details.length < 10) return 'Please tell us a little more about your project.';
  if ((data.details.match(/https?:\/\/|www\./gi) || []).length > MAX_LINKS) return 'Please include fewer links in your message.';
  return null;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const button = form.querySelector('[type="submit"]');
  if (!form.reportValidity()) return;

  const data = {};
  for (const [key, value] of new FormData(form)) data[key] = clean(value);

  const problem = checkForm(data);
  if (problem === 'bot') { form.reset(); showStatus(true, "Thanks — we'll be in touch within one business day."); return; }
  if (problem) { showStatus(false, problem); return; }
  delete data._honey;

  button.disabled = true;
  try {
    const res = await fetch('https://formsubmit.co/ajax/info@webgeek.uk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data),
    });
    const reply = await res.json();
    if (!res.ok || String(reply.success) !== 'true') throw new Error(reply.message);
    form.reset();
    markSent();
    showStatus(true, "Thanks — we'll be in touch within one business day.");
  } catch {
    showStatus(false, 'Sorry, that didn’t send. Please email us at info@webgeek.uk.');
  } finally {
    button.disabled = false;
  }
});
