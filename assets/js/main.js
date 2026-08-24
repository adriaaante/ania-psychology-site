/* ============================================================
   main.js — поведение сайта:
   - подстановка контактов из AM_CONFIG (data-cfg / data-href)
   - header scroll-state, мобильное меню, FAB
   - reveal-on-scroll (IntersectionObserver)
   - счётчики, карусель отзывов, FAQ-аккордеон
   - подпись «вдох/выдох» у дыхательного круга
   - год в футере, активный пункт меню
   ============================================================ */
(function () {
  'use strict';

  const cfg = window.AM_CONFIG || {};
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* -------- Подстановка контактов -------- */
  function getNested(obj, path) {
    return path.split('.').reduce((a, k) => (a == null ? a : a[k]), obj);
  }
  function applyConfig() {
    $$('[data-cfg]').forEach(el => {
      const key = el.getAttribute('data-cfg');
      const value = getNested(cfg, key);
      if (value == null) return;
      el.textContent = value;
    });
    $$('[data-href]').forEach(el => {
      const key = el.getAttribute('data-href');
      if (key === 'phone')         el.href = 'tel:' + (cfg.phoneClean || '');
      else if (key === 'telegram') el.href = cfg.telegram || '#';
      else if (key === 'whatsapp') el.href = cfg.whatsapp || '#';
    });
    const map = $('#map-frame');
    if (map && cfg.mapEmbed) map.src = cfg.mapEmbed;
  }

  /* -------- Header scroll-state -------- */
  function setupHeader() {
    const h = $('.header');
    if (!h) return;
    const onScroll = () => h.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* -------- Mobile menu -------- */
  function setupMobileMenu() {
    const burger = $('.burger');
    const menu = $('.mobile-menu');
    if (!burger || !menu) return;
    const toggle = (open) => {
      const isOpen = open ?? !menu.classList.contains('is-open');
      menu.classList.toggle('is-open', isOpen);
      document.body.classList.toggle('no-scroll', isOpen);
      burger.setAttribute('aria-expanded', String(isOpen));
    };
    burger.addEventListener('click', () => toggle());
    $$('.mobile-menu a, .mobile-menu__close', menu).forEach(el =>
      el.addEventListener('click', () => toggle(false)));
  }

  /* -------- FAB -------- */
  function setupFab() {
    const fab = $('.fab');
    if (!fab) return;
    const toggle = fab.querySelector('.fab__toggle');
    const syncAria = () => toggle?.setAttribute('aria-expanded', String(fab.classList.contains('is-open')));
    toggle?.addEventListener('click', () => { fab.classList.toggle('is-open'); syncAria(); });
    document.addEventListener('click', (e) => {
      if (!fab.contains(e.target)) { fab.classList.remove('is-open'); syncAria(); }
    });
  }

  /* -------- Reveal-on-scroll -------- */
  function setupReveals() {
    const els = $$('.reveal');
    if (!els.length) return;
    if (!('IntersectionObserver' in window) ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.forEach(el => el.classList.add('is-in'));
      return;
    }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        obs.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    els.forEach(el => obs.observe(el));
  }

  /* -------- Счётчики -------- */
  function setupCounters() {
    const counters = $$('[data-counter]');
    if (!counters.length) return;
    const fmt = (n) => Math.round(n).toLocaleString('ru-RU');
    const animate = (el) => {
      const target = parseFloat(el.getAttribute('data-counter')) || 0;
      const duration = 1400;
      const startTs = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - startTs) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = fmt(target * eased);
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if (!('IntersectionObserver' in window)) {
      counters.forEach(c => { c.textContent = fmt(parseFloat(c.getAttribute('data-counter')) || 0); });
      return;
    }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        animate(e.target);
        obs.unobserve(e.target);
      });
    }, { threshold: 0.45 });
    counters.forEach(c => obs.observe(c));
  }

  /* -------- Карусель отзывов (стрелки) -------- */
  function setupReviews() {
    const wrap = $('.reviews-wrap');
    if (!wrap) return;
    const track = wrap.querySelector('.reviews');
    const prev  = wrap.querySelector('.reviews-arrow--prev');
    const next  = wrap.querySelector('.reviews-arrow--next');
    if (!track || !prev || !next) return;

    let index = 0;
    const stepPx = () => {
      const first = track.firstElementChild;
      if (!first) return 0;
      const gap = parseFloat(getComputedStyle(track).gap || '20');
      return first.getBoundingClientRect().width + gap;
    };
    const maxIndex = () => {
      const visible = Math.max(1, Math.round(wrap.clientWidth / stepPx()));
      return Math.max(0, track.children.length - visible);
    };
    const update = () => {
      const max = maxIndex();
      if (index > max) index = max;
      if (index < 0) index = 0;
      track.style.transform = `translateX(-${index * stepPx()}px)`;
      prev.toggleAttribute('disabled', index <= 0);
      next.toggleAttribute('disabled', index >= max);
    };
    prev.addEventListener('click', () => { index--; update(); });
    next.addEventListener('click', () => { index++; update(); });
    window.addEventListener('resize', update);
    update();
  }

  /* -------- FAQ-аккордеон -------- */
  function setupFaq() {
    $$('.faq-item').forEach(item => {
      const head = item.querySelector('.faq-item__head');
      const body = item.querySelector('.faq-item__body');
      if (!head || !body) return;
      head.addEventListener('click', () => {
        const open = !item.classList.contains('is-open');
        item.classList.toggle('is-open', open);
        head.setAttribute('aria-expanded', String(open));
        body.style.maxHeight = open ? body.scrollHeight + 'px' : '0px';
      });
    });
  }

  /* -------- Дыхательный круг: подпись «вдох / выдох» --------
     Цикл 8с синхронизирован с CSS-анимацией breathCore. */
  function setupBreath() {
    const label = $('.breath__label');
    if (!label) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      label.textContent = 'вдох · выдох';
      return;
    }
    const phases = [['вдох', 3600], ['задержка', 800], ['выдох', 3600]];
    let i = 0;
    (function tick() {
      label.textContent = phases[i][0];
      const wait = phases[i][1];
      i = (i + 1) % phases.length;
      setTimeout(tick, wait);
    })();
  }

  /* -------- Год в футере -------- */
  function setupYear() {
    $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
  }

  /* -------- Активный пункт меню -------- */
  function setupActiveNav() {
    const path = location.pathname.split('/').pop() || 'index.html';
    $$('.nav__link, .mobile-menu__link').forEach(a => {
      const href = (a.getAttribute('href') || '').split('/').pop().split('#')[0];
      if (href === path) a.classList.add('is-active');
    });
  }

  /* -------- INIT -------- */
  document.addEventListener('DOMContentLoaded', () => {
    applyConfig();
    setupHeader();
    setupMobileMenu();
    setupFab();
    setupReveals();
    setupCounters();
    setupReviews();
    setupFaq();
    setupBreath();
    setupYear();
    setupActiveNav();
  });

  /* Утилита для скриншот-тестов: window.__revealAll() показывает всё мгновенно. */
  window.__revealAll = () => {
    $$('.reveal').forEach(el => { el.style.transition = 'none'; el.classList.add('is-in'); });
    $$('[data-counter]').forEach(c => {
      const n = parseFloat(c.getAttribute('data-counter')) || 0;
      c.textContent = Math.round(n).toLocaleString('ru-RU');
    });
  };
})();
