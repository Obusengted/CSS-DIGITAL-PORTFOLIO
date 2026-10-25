document.documentElement.classList.add('js');

// Scroll progress
const bar = document.getElementById('progress');
addEventListener('scroll', () => {
  const h = document.documentElement;
  bar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + '%';
}, { passive: true });

// Mobile menu
const menu = document.getElementById('menu'), btn = document.getElementById('menuBtn');
btn.addEventListener('click', () => btn.setAttribute('aria-expanded', menu.classList.toggle('open')));
menu.addEventListener('click', e => { if (e.target.tagName === 'A') { menu.classList.remove('open'); btn.setAttribute('aria-expanded', false); } });

// Active nav link
const links = [...menu.querySelectorAll('a')];
const spy = new IntersectionObserver(es => es.forEach(en => {
  if (en.isIntersecting) links.forEach(l => l.classList.toggle('on', l.getAttribute('href') === '#' + en.target.id));
}), { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('main section[id]').forEach(s => spy.observe(s));

// Scroll reveal
const rev = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); rev.unobserve(en.target); } }), { threshold: .08 });
document.querySelectorAll('.reveal').forEach(el => rev.observe(el));

// Tabs (scoped per section)
document.querySelectorAll('.tabs button').forEach(b => b.addEventListener('click', () => {
  const sec = b.closest('section');
  sec.querySelectorAll('.tabs button').forEach(x => { x.classList.remove('active'); x.setAttribute('aria-selected', false); });
  sec.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  b.classList.add('active'); b.setAttribute('aria-selected', true);
  document.getElementById(b.dataset.tab).classList.add('active');
}));

// Count-up stats
document.querySelectorAll('[data-count]').forEach(el => {
  const end = +el.dataset.count; let n = 0;
  const t = setInterval(() => { el.textContent = ++n; if (n >= end) clearInterval(t); }, 350);
});

// Save helper: uses the host's download capability when present (preview), otherwise a normal download
async function saveFile(name, blob) {
  try {
    const dl = window.claude && await claude.use('downloads');
    if (dl) { await dl.save({ filename: name, data: blob }); return; }
  } catch (e) { return; }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

// Download letter / email as a Word document
document.querySelectorAll('[data-download]').forEach(b => b.addEventListener('click', () => {
  const body = b.closest('.doc').querySelector('.letter').innerHTML;
  const html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>' + b.dataset.file +
    '</title><style>body{font-family:Calibri,Arial,sans-serif;font-size:11pt;line-height:1.4}p{margin:0 0 10pt}</style></head><body>' + body + '</body></html>';
  saveFile(b.dataset.file + '.doc', new Blob(['\ufeff', html], { type: 'application/msword' }));
}));

// Download CV: on the live site the link downloads assets/Sekao_Obuseng_CV.pdf directly
const cv = document.querySelector('[data-cv]');
if (cv) cv.addEventListener('click', e => {
  if (!window.__CV_B64 || !window.claude) return;   // preview-only path
  e.preventDefault();
  const bytes = Uint8Array.from(atob(window.__CV_B64), c => c.charCodeAt(0));
  saveFile('Sekao_Obuseng_CV.pdf', new Blob([bytes], { type: 'application/pdf' }));
});

// Photo lightbox
const lb = document.createElement('div'); lb.className = 'lightbox'; lb.innerHTML = '<img alt="">'; document.body.appendChild(lb);
const open = f => { lb.firstChild.src = f.querySelector('img').src; lb.firstChild.alt = f.querySelector('img').alt; lb.classList.add('open'); };
document.querySelectorAll('.gallery figure').forEach(f => { f.addEventListener('click', () => open(f)); f.addEventListener('keydown', e => { if (e.key === 'Enter') open(f); }); });
lb.addEventListener('click', () => lb.classList.remove('open'));
addEventListener('keydown', e => { if (e.key === 'Escape') lb.classList.remove('open'); });
