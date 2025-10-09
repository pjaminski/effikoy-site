document.getElementById('y').textContent = new Date().getFullYear();

const headerEl = document.querySelector('.header');
const progressEl = document.getElementById('progress');
const sections = Array.from(document.querySelectorAll('section.slide'));
const navLinks = Array.from(document.querySelectorAll('.nav a'));
const navMap = new Map(navLinks.map(a => [a.getAttribute('href').slice(1), a]));

let currentIndex = 0;
let isScrolling = false;

function setHeaderH(){
  const h = headerEl ? headerEl.offsetHeight : 96;
  document.documentElement.style.setProperty('--header-h', h + 'px');
}

function setFooterH(){
  const f = document.querySelector('.footer-in-slide');
  const h = f ? f.offsetHeight : 0;
  document.documentElement.style.setProperty('--footer-h', h + 'px');
}

function setActiveNav(id){
  navLinks.forEach(a => a.removeAttribute('aria-current'));
  const link = navMap.get(id); if(link) link.setAttribute('aria-current','true');
}

function setProgress(){
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const docH = document.documentElement.scrollHeight - window.innerHeight;
  const p = docH>0 ? (scrollTop/docH)*100 : 0;
  progressEl.style.width = p + '%';
}

function sectionTop(i){
  return sections[i].offsetTop - (headerEl ? headerEl.offsetHeight : 0) - 5; // mała przerwa pod progress barem
}

function setActiveFromScroll(){
  const vh = window.innerHeight;
  const y = window.scrollY + (headerEl ? headerEl.offsetHeight : 0);
  let idx = 0;
  sections.forEach((s,i)=>{ const top = s.offsetTop; if(y >= top - vh*0.5) idx = i; });
  currentIndex = idx;
  setActiveNav(sections[currentIndex].id);
}

function visibleHeight(){
  const head = headerEl ? headerEl.offsetHeight : 0;
  const foot = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--footer-h')) || 0;
  return window.innerHeight - head - foot;
}

function sectionScrollable(i){
  const s = sections[i];
  return s && s.scrollHeight > visibleHeight() + 2;
}

function atTop(){
  const y = window.scrollY || document.documentElement.scrollTop;
  const top = sectionTop(currentIndex);
  return y <= top + 2;
}

function atBottom(){
  const y = window.scrollY || document.documentElement.scrollTop;
  const bottom = sectionTop(currentIndex) + (sections[currentIndex]?.scrollHeight || 0) - visibleHeight();
  return y >= bottom - 2;
}

function goTo(idx){
  const clamped = Math.max(0, Math.min(idx, sections.length - 1));
  if (clamped === currentIndex) return;
  isScrolling = true;
  window.scrollTo({ top: sectionTop(clamped), behavior: 'smooth' });
  currentIndex = clamped;
  setActiveNav(sections[currentIndex].id);
  setTimeout(() => { isScrolling = false; setProgress(); }, 600);
}

window.addEventListener('wheel', (e) => {
  if (isScrolling) { e.preventDefault(); return; }

  const intent = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
  const scrollable = sectionScrollable(currentIndex);

  if (scrollable) {
    if (intent > 0 && atBottom()) { e.preventDefault(); goTo(currentIndex + 1); }
    else if (intent < 0 && atTop()) { e.preventDefault(); goTo(currentIndex - 1); }
    else {
      // środek sekcji - pozwól przewijać natywnie
      return;
    }
  } else {
    e.preventDefault();
    if (intent > 0) goTo(currentIndex + 1);
    else if (intent < 0) goTo(currentIndex - 1);
  }
}, { passive: false });

window.addEventListener('keydown', (e)=>{
  const keysDown = (e.key === 'ArrowDown' || e.key === 'PageDown');
  const keysUp   = (e.key === 'ArrowUp'   || e.key === 'PageUp');

  if (keysDown || keysUp) {
    const scrollable = sectionScrollable(currentIndex);

    if (scrollable) {
      if (keysDown && atBottom()) { e.preventDefault(); goTo(currentIndex + 1); }
      else if (keysUp && atTop()) { e.preventDefault(); goTo(currentIndex - 1); }
      else {
        return; // w środku sekcji - pozwól natywnie przewinąć
      }
    } else {
      e.preventDefault();
      if (keysDown) goTo(currentIndex + 1);
      if (keysUp)   goTo(currentIndex - 1);
    }
  }

  if (e.key === 'Home') { e.preventDefault(); goTo(0); }
  if (e.key === 'End')  { e.preventDefault(); goTo(sections.length - 1); }
});

document.addEventListener('click', (e)=>{
  const a = e.target.closest('a[href^="#"]');
  if(!a) return; const id = a.getAttribute('href').slice(1);
  const idx = sections.findIndex(s=>s.id===id); if(idx>=0){ e.preventDefault(); goTo(idx); }
});

window.addEventListener('scroll', ()=>{ setProgress(); setActiveFromScroll(); }, {passive:true});
function handleResize(){ setHeaderH(); setProgress(); setFooterH(); setTimeout(()=>{ window.scrollTo({ top: sectionTop(currentIndex), behavior:'auto' }); }, 50); }
window.addEventListener('resize', handleResize);
window.addEventListener('orientationchange', handleResize);

setHeaderH();
setProgress();
setActiveFromScroll();
setFooterH();
