// Year
document.getElementById('y').textContent = new Date().getFullYear();

const headerEl   = document.querySelector('.header');
const sections   = Array.from(document.querySelectorAll('section.slide'));
const navLinks   = Array.from(document.querySelectorAll('.nav a'));
const navMap     = new Map(navLinks.map(a => [a.getAttribute('href').slice(1), a]));

let currentId = null;

function setHeaderH(){
  const h = headerEl ? headerEl.offsetHeight : 96;
  document.documentElement.style.setProperty('--header-h', h + 'px');
}

function setFooterH(){
  const f = document.querySelector('.footer');
  const h = f ? f.offsetHeight : 0;
  document.documentElement.style.setProperty('--footer-h', h + 'px');
}

function setActiveNav(id){
  navLinks.forEach(a => a.removeAttribute('aria-current'));
  const link = navMap.get(id);
  if (link) link.setAttribute('aria-current','true');
}

function showSection(id, {updateHash = true, focus = true} = {}){
  if (!id) id = sections[0]?.id;
  if (!id) return;

  if (!sections.some(s => s.id === id)) {
    id = sections[0].id;
  }

  if (currentId === id) {
    setActiveNav(id);
    return;
  }

  sections.forEach(s => {
    if (s.id === id) s.classList.add('is-active');
    else s.classList.remove('is-active');
  });

  setActiveNav(id);

  if (updateHash) {
    const newUrl = '#' + id;
    if (location.hash !== newUrl) {
      history.pushState({ id }, '', newUrl);
    }
  }

  if (focus) {
    const heading = sections.find(s => s.id === id)?.querySelector('h1, h2, h3');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
      setTimeout(() => heading.removeAttribute('tabindex'), 100);
    }
  }

  currentId = id;
}

function initRoute(){
  const initialId = location.hash ? location.hash.slice(1) : sections[0]?.id;
  showSection(initialId, { updateHash: false, focus: false });
}

function handleResize(){
  setHeaderH();
  setFooterH();
}

document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href').slice(1);
  if (!id) return;

  if (sections.some(s => s.id === id)) {
    e.preventDefault();
    showSection(id, { updateHash: true, focus: true });
  }
});

window.addEventListener('popstate', (e) => {
  const id = e.state?.id || (location.hash ? location.hash.slice(1) : null);
  showSection(id, { updateHash: false, focus: false });
});

window.addEventListener('resize', handleResize);
window.addEventListener('orientationchange', handleResize)

setHeaderH();
setFooterH();
initRoute();

// Hamburger toggle
const header = document.querySelector('.header');
const btn    = document.querySelector('.nav-toggle');
if (btn){
  btn.addEventListener('click', ()=>{
    const open = header.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  document.addEventListener('click', (e)=>{
    if (header.classList.contains('is-open') && e.target.closest('.nav a')) {
      header.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
}

lucide.createIcons();

