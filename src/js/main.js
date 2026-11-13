/**
 * THE COMPUTER WORLD - Main JavaScript Module
 * Professional interactions: header scroll, mobile drawer, smooth scroll,
 * scroll reveal animations, dynamic year, active nav highlighting
 */

// ==========================================
// STATE
// ==========================================
const state = {
  isDrawerOpen: false,
  scrollY: 0,
  headerEl: null,
  drawerEl: null,
  backdropEl: null,
  navLinks: null,
  drawerLinks: null,
  revealEls: null,
  staggerContainers: null,
  yearEl: null,
};

const config = {
  headerScrollThreshold: 24,
  revealThreshold: 0.12,
  revealRootMargin: '0px 0px -48px 0px',
};


// ==========================================
// CACHE DOM
// ==========================================
function cacheElements() {
  state.headerEl = document.querySelector('[data-header]');
  state.drawerEl = document.querySelector('[data-drawer]');
  state.backdropEl = document.querySelector('[data-drawer-backdrop]');
  state.navLinks = document.querySelectorAll('[data-nav-link]');
  state.drawerLinks = document.querySelectorAll('[data-drawer-link]');
  state.revealEls = document.querySelectorAll('.reveal');
  state.staggerContainers = document.querySelectorAll('.reveal-stagger');
  state.yearEl = document.querySelector('[data-year]');
}

// ==========================================
// EVENT BINDING
// ==========================================
function bindEvents() {
  // Drawer toggle buttons
  document.querySelectorAll('[data-drawer-toggle]').forEach(btn => {
    btn.addEventListener('click', toggleDrawer);
  });

  // Backdrop click
  if (state.backdropEl) {
    state.backdropEl.addEventListener('click', closeDrawer);
  }

  // Drawer links
  state.drawerLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  // Smooth scroll for all anchor links
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', handleSmoothScroll);
  });

  // Scroll handler (throttled via rAF)
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        state.scrollY = window.scrollY;
        handleHeaderScroll();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // Resize handler
  window.addEventListener('resize', debounce(() => {
    if (window.innerWidth >= 768 && state.isDrawerOpen) {
      closeDrawer();
    }
  }, 200));

  // Keyboard
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && state.isDrawerOpen) closeDrawer();
  });
}

// ==========================================
// DRAWER
// ==========================================
function toggleDrawer() {
  state.isDrawerOpen = !state.isDrawerOpen;
  updateDrawerState();
  document.body.style.overflow = state.isDrawerOpen ? 'hidden' : '';
}

function closeDrawer() {
  if (state.isDrawerOpen) {
    state.isDrawerOpen = false;
    updateDrawerState();
    document.body.style.overflow = '';
  }
}

function updateDrawerState() {
  if (state.drawerEl) {
    state.drawerEl.classList.toggle('open', state.isDrawerOpen);
    state.drawerEl.setAttribute('aria-hidden', !state.isDrawerOpen);
  }
  if (state.backdropEl) {
    state.backdropEl.classList.toggle('open', state.isDrawerOpen);
  }
  document.querySelectorAll('[data-drawer-toggle]').forEach(btn => {
    btn.setAttribute('aria-expanded', state.isDrawerOpen);
    btn.setAttribute('aria-label', state.isDrawerOpen ? 'Close menu' : 'Open menu');
  });
}

// ==========================================
// HEADER SCROLL STATE
// ==========================================
function handleHeaderScroll() {
  if (!state.headerEl) return;
  if (state.scrollY > config.headerScrollThreshold) {
    state.headerEl.classList.add('scrolled');
  } else {
    state.headerEl.classList.remove('scrolled');
  }
}

// ==========================================
// SMOOTH SCROLL
// ==========================================
function handleSmoothScroll(e) {
  const href = this.getAttribute('href');
  if (!href || href === '#' || href === '#!') return;

  const target = document.querySelector(href);
  if (!target) return;

  e.preventDefault();

  const headerHeight = state.headerEl?.offsetHeight ?? 80;
  const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight;

  window.scrollTo({ top: targetTop, behavior: 'smooth' });

  // Update active state immediately for better UX
  updateActiveNav(href);
}

// ==========================================
// SCROLL SPY (Active nav highlighting)
// ==========================================
function setupScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  if (!sections.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        updateActiveNav(`#${id}`);
      }
    });
  }, {
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0.08,
  });

  sections.forEach(section => observer.observe(section));
}

function updateActiveNav(href) {
  const links = [...state.navLinks, ...state.drawerLinks];
  links.forEach(link => {
    const linkHref = link.getAttribute('href');
    if (linkHref === href) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// ==========================================
// SCROLL REVEAL
// ==========================================
function initScrollReveal() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) {
    [...state.revealEls, ...state.staggerContainers].forEach(el => {
      el.classList.add('visible');
    });
    return;
  }

  // Individual reveal elements
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: config.revealThreshold,
    rootMargin: config.revealRootMargin,
  });

  state.revealEls.forEach(el => revealObserver.observe(el));

  // Stagger containers
  const staggerObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        staggerObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: config.revealThreshold,
    rootMargin: config.revealRootMargin,
  });

  state.staggerContainers.forEach(el => staggerObserver.observe(el));
}

// ==========================================
// DYNAMIC YEAR
// ==========================================
function updateYear() {
  if (state.yearEl) {
    state.yearEl.textContent = new Date().getFullYear();
  }
}

// ==========================================
// UTILITIES
// ==========================================
function debounce(fn, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
}

// ==========================================
// BOOTSTRAP
// ==========================================
async function init() {
  cacheElements();
  bindEvents();
  initScrollReveal();
  updateYear();
  setupScrollSpy();
  handleHeaderScroll();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Expose minimal API
window.TCW = { closeDrawer, initScrollReveal, updateYear };