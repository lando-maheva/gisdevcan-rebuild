(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  const start = () => {
    requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add('is-loaded')));
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }

  if (reducedMotion) return;

  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.appendChild(progress);

  const revealConfig = [
    ['.trust-grid > div', 'reveal-scale', 90],
    ['.intro .two-col > div', 'reveal', 120],
    ['.services .section-head > div, .products .section-head > div', 'reveal-left', 0],
    ['.services .section-head > p, .products .section-head > p', 'reveal-right', 0],
    ['.service-card', 'reveal-scale', 90],
    ['.product-card', 'reveal-scale', 80],
    ['.fine-print', 'reveal', 0],
    ['.process > .container > .eyebrow', 'reveal-left', 0],
    ['.process .section-head > h2', 'reveal-left', 0],
    ['.process .section-head > p', 'reveal-right', 0],
    ['.step', 'reveal', 100],
    ['.process-disclaimer', 'reveal', 0],
    ['.why .why-layout > div:first-child', 'reveal-left', 0],
    ['.values > div', 'reveal-right', 100],
    ['.cta-inner', 'reveal', 0],
    ['.contact-layout > div', 'reveal-left', 0],
    ['.contact-form', 'reveal-right', 0],
    ['.footer-main > *', 'reveal', 90],
    ['.footer-bottom', 'reveal', 0]
  ];

  const revealElements = [];
  revealConfig.forEach(([selector, variant, stagger]) => {
    document.querySelectorAll(selector).forEach((el) => {
      if (el.classList.contains('reveal')) return;
      el.classList.add('reveal', variant);
      if (stagger) {
        const siblings = Array.from(el.parentElement.children);
        const index = Math.max(0, siblings.indexOf(el));
        el.style.setProperty('--reveal-delay', `${index * stagger}ms`);
      }
      revealElements.push(el);
    });
  });

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add('is-visible'));
  }

  const navLinks = Array.from(document.querySelectorAll('.nav a[href^="#"]'));
  const sections = Array.from(document.querySelectorAll('main section[id]'));

  if ('IntersectionObserver' in window && sections.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => link.classList.remove('active'));
        const active = navLinks.find((link) => link.getAttribute('href') === `#${entry.target.id}`);
        if (active) active.classList.add('active');
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach((section) => sectionObserver.observe(section));
  }

  const hero = document.querySelector('.hero');
  const header = document.querySelector('.header');
  let ticking = false;

  const updateScroll = () => {
    const y = window.scrollY || window.pageYOffset;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;

    progress.style.transform = `scaleX(${ratio})`;
    if (header) header.classList.toggle('is-scrolled', y > 8);
    if (hero) hero.style.setProperty('--hero-parallax', `${Math.min(y * 0.16, 90)}px`);

    ticking = false;
  };

  const requestScrollUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateScroll);
  };

  window.addEventListener('scroll', requestScrollUpdate, { passive: true });
  window.addEventListener('resize', requestScrollUpdate);
  updateScroll();

  if (finePointer.matches) {
    if (hero) {
      hero.addEventListener('pointermove', (event) => {
        const rect = hero.getBoundingClientRect();
        hero.style.setProperty('--glow-x', `${((event.clientX - rect.left) / rect.width) * 100}%`);
        hero.style.setProperty('--glow-y', `${((event.clientY - rect.top) / rect.height) * 100}%`);
      }, { passive: true });
    }

    document.querySelectorAll('.product-card, .service-card').forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.setProperty('--tilt-x', `${(-y * 6).toFixed(2)}deg`);
        card.style.setProperty('--tilt-y', `${(x * 6).toFixed(2)}deg`);
      }, { passive: true });

      const resetTilt = () => {
        card.style.setProperty('--tilt-x', '0deg');
        card.style.setProperty('--tilt-y', '0deg');
      };
      card.addEventListener('pointerleave', resetTilt);
      card.addEventListener('blur', resetTilt);
    });

    document.querySelectorAll('.btn').forEach((btn) => {
      btn.addEventListener('pointermove', (event) => {
        const rect = btn.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        btn.style.setProperty('--mag-x', `${(x * 8).toFixed(1)}px`);
        btn.style.setProperty('--mag-y', `${(y * 8).toFixed(1)}px`);
      }, { passive: true });

      const resetMagnet = () => {
        btn.style.setProperty('--mag-x', '0px');
        btn.style.setProperty('--mag-y', '0px');
      };
      btn.addEventListener('pointerleave', resetMagnet);
    });
  }

  document.querySelectorAll('.btn, .nav-cta').forEach((el) => {
    el.addEventListener('click', (event) => {
      const rect = el.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const fromKeyboard = event.detail === 0;
      const x = fromKeyboard ? rect.width / 2 : event.clientX - rect.left;
      const y = fromKeyboard ? rect.height / 2 : event.clientY - rect.top;
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.setAttribute('aria-hidden', 'true');
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${x - size / 2}px`;
      ripple.style.top = `${y - size / 2}px`;
      el.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
    });
  });
})();
