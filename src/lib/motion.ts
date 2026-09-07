import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** Groups larger than this are batched instead of staggered as one block. */
const BATCH_THRESHOLD = 8;

let lenis: Lenis | null = null;

/**
 * Failsafe: if anything throws before the reveal tweens run, content that
 * starts at visibility:hidden would stay invisible forever. Force it visible.
 */
function revealAll() {
  document
    .querySelectorAll<HTMLElement>('[data-reveal], [data-reveal-group] > *')
    .forEach((el) => {
      el.style.visibility = 'visible';
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
}

/** Smooth scrolling, driven by GSAP's ticker so ScrollTrigger stays in sync. */
export function initSmoothScroll() {
  if (lenis) return lenis;

  lenis = new Lenis({
    duration: 1.05,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.6,
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis?.scrollTo(target as HTMLElement, { offset: -80 });
    });
  });

  return lenis;
}

export function getLenis() {
  return lenis;
}

/** Shrink/solidify the header once the page has scrolled. */
export function initHeader(selector = '[data-header]') {
  const header = document.querySelector<HTMLElement>(selector);
  if (!header) return;

  ScrollTrigger.create({
    start: 'top -80',
    end: 99999,
    onUpdate: (self) => {
      header.classList.toggle('is-stuck', self.scroll() > 80);
    },
  });
}

/**
 * All scroll-driven decoration lives inside matchMedia so that a user on
 * `prefers-reduced-motion: reduce` gets the final state immediately and every
 * ScrollTrigger is torn down cleanly.
 */
export function initScrollAnimations() {
  const mm = gsap.matchMedia();

  // ---------------------------------------------------------------- reduced
  mm.add('(prefers-reduced-motion: reduce)', () => {
    revealAll();
  });

  // ------------------------------------------------------------ full motion
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    // --- Single element reveals -------------------------------------------
    gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
      const kind = el.dataset.reveal || 'up';
      const delay = parseFloat(el.dataset.revealDelay || '0');

      const from: gsap.TweenVars = {
        autoAlpha: 0,
        duration: 0.75,
        ease: 'power2.out',
        delay,
      };

      // Small offsets: it should read as a fade, not a slide.
      if (kind === 'up') from.y = 24;
      if (kind === 'left') from.x = -28;
      if (kind === 'right') from.x = 28;
      if (kind === 'scale') {
        from.scale = 0.96;
        from.y = 16;
      }

      gsap.from(el, {
        ...from,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    });

    // --- Grouped children --------------------------------------------------
    gsap.utils.toArray<HTMLElement>('[data-reveal-group]').forEach((group) => {
      const children = Array.from(group.children) as HTMLElement[];
      const stagger = parseFloat(group.dataset.revealStagger || '0.08');

      if (children.length > BATCH_THRESHOLD) {
        // Long grids (the 67-photo gallery): reveal per row as it enters the
        // viewport instead of staggering every item off one trigger, which
        // would leave the last items lagging seconds behind.
        gsap.set(children, { autoAlpha: 0, y: 20 });

        ScrollTrigger.batch(children, {
          start: 'top 92%',
          once: true,
          batchMax: 6,
          onEnter: (batch) =>
            gsap.to(batch, {
              autoAlpha: 1,
              y: 0,
              duration: 0.55,
              ease: 'power2.out',
              stagger: 0.05,
              overwrite: true,
            }),
        });
      } else {
        gsap.from(children, {
          autoAlpha: 0,
          y: 24,
          duration: 0.6,
          ease: 'power2.out',
          stagger: Math.min(stagger, 0.08),
          scrollTrigger: { trigger: group, start: 'top 85%', once: true },
        });
      }
    });

    // --- Headline word reveal ---------------------------------------------
    gsap.utils.toArray<HTMLElement>('[data-split-text]').forEach((el) => {
      const spans = splitWords(el);
      if (!spans.length) return;

      gsap.from(spans, {
        yPercent: 108,
        duration: 0.8,
        ease: 'expo.out',
        stagger: 0.035,
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      });
    });

    // --- Parallax ----------------------------------------------------------
    gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
      const distance = parseFloat(el.dataset.parallax || '60');
      // Keep the delta small (5-15%) so foreground and background never desync.
      const shift = gsap.utils.clamp(4, 14, distance / 8);
      const container = el.parentElement || el;

      gsap.fromTo(
        el,
        { yPercent: -shift },
        {
          yPercent: shift,
          ease: 'none',
          scrollTrigger: {
            trigger: container,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
            // Free GPU memory once the section has passed.
            onEnter: () => gsap.set(el, { willChange: 'transform' }),
            onLeave: () => gsap.set(el, { willChange: 'auto' }),
            onLeaveBack: () => gsap.set(el, { willChange: 'auto' }),
          },
        },
      );
    });

    // --- Section headers get a hairline that draws in ----------------------
    gsap.utils.toArray<HTMLElement>('[data-rule]').forEach((el) => {
      gsap.from(el, {
        scaleX: 0,
        transformOrigin: 'left center',
        duration: 0.9,
        ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 92%', once: true },
      });
    });

    return () => revealAll();
  });

  return mm;
}

/** Split an element into per-word spans once. Returns the inner spans. */
function splitWords(el: HTMLElement): HTMLElement[] {
  if (el.dataset.splitDone) {
    return Array.from(el.querySelectorAll<HTMLElement>('.split-word__inner'));
  }

  const words = (el.textContent || '').trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [];

  el.textContent = '';
  el.dataset.splitDone = 'true';

  return words.map((word, i) => {
    const outer = document.createElement('span');
    outer.className = 'split-word';

    const inner = document.createElement('span');
    inner.className = 'split-word__inner';
    inner.textContent = word;

    outer.appendChild(inner);
    el.appendChild(outer);
    if (i < words.length - 1) el.appendChild(document.createTextNode(' '));

    return inner;
  });
}

/** Count [data-count] numbers up when they enter the viewport. */
export function initCounters(root: ParentNode = document) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  root.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    const target = parseFloat(el.dataset.count || '0');
    const suffix = el.dataset.countSuffix || '';

    if (reduced) {
      el.textContent = target.toLocaleString('en-IN') + suffix;
      return;
    }

    const state = { n: 0 };
    gsap.to(state, {
      n: target,
      duration: 1.8,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      onUpdate: () => {
        el.textContent = Math.round(state.n).toLocaleString('en-IN') + suffix;
      },
    });
  });
}

/** One call to wire up every standard behaviour on a page. */
export function initPage() {
  try {
    initSmoothScroll();
    initHeader();
    initScrollAnimations();
    initCounters();
    ScrollTrigger.refresh();
  } catch (err) {
    // Never leave the page stuck behind hidden reveal targets.
    console.error('[motion] init failed, revealing content', err);
    revealAll();
  }

  // Recalculate once fonts and images have settled.
  if (document.fonts?.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}

export { gsap, ScrollTrigger, revealAll };
