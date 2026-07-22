/* =================================================================
   JACK FROST — script
   1. Loader (le givre se dessine)
   2. Révélation des illustrations & textes au scroll
   3. Repère de progression (stalactite + points de chapitre)
   4. Neige ambiante
   ================================================================= */

document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -----------------------------------------------------------
     1. LOADER
     ----------------------------------------------------------- */
  const loader = document.getElementById('loader');
  document.body.classList.add('is-loading');

  const hideLoader = () => {
    loader.classList.add('hidden');
    document.body.classList.remove('is-loading');
    setTimeout(() => loader.remove(), 1100);
  };

  // durée mini pour laisser l'animation d'encre se jouer,
  // même si la page charge instantanément
  const minLoadTime = prefersReducedMotion ? 300 : 2400;
  const start = performance.now();

  window.addEventListener('load', () => {
    const elapsed = performance.now() - start;
    const remaining = Math.max(0, minLoadTime - elapsed);
    setTimeout(hideLoader, remaining);
  });
  // filet de sécurité si "load" tarde
  setTimeout(hideLoader, 4500);


  /* -----------------------------------------------------------
     2. RÉVÉLATION AU SCROLL (texte + dessins à l'encre)
     ----------------------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });

    revealEls.forEach(el => revealObserver.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in-view'));
  }


  /* -----------------------------------------------------------
     3. REPÈRE DE PROGRESSION
     ----------------------------------------------------------- */
  const railFill = document.getElementById('railFill');
  const dots = document.querySelectorAll('.rail-dots .dot');
  const chapterFlag = document.getElementById('chapterFlag');
  const sections = document.querySelectorAll('main .section');

  const sectionTitles = {
    hero: 'Prologue',
    ch1: 'I. L\u2019enfant sans ombre',
    ch2: 'II. La fen\u00eatre de Suzon',
    ch3: 'III. La nuit o\u00f9 il resta',
    cta: 'Le livre'
  };

  function updateRailFill() {
    const doc = document.documentElement;
    const scrollTop = window.scrollY || doc.scrollTop;
    const scrollHeight = doc.scrollHeight - doc.clientHeight;
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    railFill.style.height = `${Math.min(100, Math.max(0, progress))}%`;
  }

  function setActiveDot(id) {
    dots.forEach(dot => {
      dot.classList.toggle('active', dot.dataset.target === id);
    });
    if (sectionTitles[id]) {
      chapterFlag.textContent = sectionTitles[id];
      chapterFlag.classList.add('visible');
    }
  }

  let flagTimeout;
  function flashFlag() {
    clearTimeout(flagTimeout);
    chapterFlag.classList.add('visible');
    flagTimeout = setTimeout(() => {
      // reste visible tant qu'on est proche du haut de la section, sinon s'estompe légèrement
    }, 1600);
  }

  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.4) {
          setActiveDot(entry.target.id);
          flashFlag();
        }
      });
    }, { threshold: [0.4, 0.6] });

    sections.forEach(sec => sectionObserver.observe(sec));
  }

  // clic sur un point : défilement doux vers la section
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const target = document.getElementById(dot.dataset.target);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // bouton "faites glisser la nuit" dans le hero
  const scrollCue = document.getElementById('scrollCue');
  if (scrollCue) {
    scrollCue.addEventListener('click', () => {
      const ch1 = document.getElementById('ch1');
      if (ch1) ch1.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateRailFill();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  updateRailFill();


  /* -----------------------------------------------------------
     4. NEIGE AMBIANTE
     ----------------------------------------------------------- */
  if (!prefersReducedMotion) {
    const snowfall = document.getElementById('snowfall');
    const flakeCount = window.innerWidth < 600 ? 14 : 26;

    for (let i = 0; i < flakeCount; i++) {
      const flake = document.createElement('div');
      flake.className = 'flake';
      const size = 2 + Math.random() * 3;
      flake.style.width = `${size}px`;
      flake.style.height = `${size}px`;
      flake.style.left = `${Math.random() * 100}%`;
      flake.style.animationDuration = `${14 + Math.random() * 16}s`;
      flake.style.animationDelay = `-${Math.random() * 20}s`;
      flake.style.opacity = (0.15 + Math.random() * 0.3).toFixed(2);
      snowfall.appendChild(flake);
    }
  }

});
