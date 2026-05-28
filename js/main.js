// Vena Digital — landing interactions

document.addEventListener('DOMContentLoaded', () => {

  // ─── Nav: blur + hairline on scroll ──────────────────────────────────
  const nav = document.querySelector('.nav');
  const onScroll = () => {
    if (window.scrollY > 12) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ─── Mobile menu (hamburger) ──────────────────────────────────────────
  const navToggle = document.querySelector('.nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  if (navToggle && mobileMenu) {
    const openMenu = () => {
      mobileMenu.hidden = false;
      // Force a frame so the .is-open transition triggers
      requestAnimationFrame(() => mobileMenu.classList.add('is-open'));
      mobileMenu.setAttribute('aria-hidden', 'false');
      navToggle.setAttribute('aria-expanded', 'true');
      navToggle.setAttribute('aria-label', 'Cerrar menú');
      document.body.classList.add('is-menu-open');
      // Focus the first link for keyboard users
      const firstLink = mobileMenu.querySelector('a');
      if (firstLink) setTimeout(() => firstLink.focus(), 240);
    };
    const closeMenu = () => {
      mobileMenu.classList.remove('is-open');
      mobileMenu.setAttribute('aria-hidden', 'true');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Abrir menú');
      document.body.classList.remove('is-menu-open');
      // Hide after transition completes
      setTimeout(() => { mobileMenu.hidden = true; }, 260);
    };
    navToggle.addEventListener('click', () => {
      if (mobileMenu.classList.contains('is-open')) closeMenu();
      else openMenu();
    });
    // Close on link click (smooth-scroll handler also fires)
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        if (mobileMenu.classList.contains('is-open')) closeMenu();
      });
    });
    // ESC to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
        closeMenu();
        navToggle.focus();
      }
    });
  }

  // ─── Scrollspy: highlight active nav link ─────────────────────────────
  const navLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
  const navTargets = navLinks
    .map(a => ({ link: a, target: document.querySelector(a.getAttribute('href')) }))
    .filter(x => x.target);
  if (navTargets.length && 'IntersectionObserver' in window) {
    const setActive = (id) => {
      navTargets.forEach(({ link }) => {
        link.classList.toggle('is-active', link.getAttribute('href') === '#' + id);
      });
    };
    const spy = new IntersectionObserver((entries) => {
      // Pick the entry with the largest intersection ratio
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible.length) setActive(visible[0].target.id);
    }, { rootMargin: '-40% 0px -50% 0px', threshold: [0, 0.25, 0.5, 1] });
    navTargets.forEach(({ target }) => spy.observe(target));
  }

  // ─── Scroll-reveal ─────────────────────────────────────────────────
  const revealTargets = document.querySelectorAll('.reveal');
  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!('IntersectionObserver' in window) || reducedMotion) {
    revealTargets.forEach(el => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    revealTargets.forEach(el => io.observe(el));

    requestAnimationFrame(() => {
      revealTargets.forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 1.1) el.classList.add('in');
      });
    });
    setTimeout(() => {
      revealTargets.forEach(el => {
        if (!el.classList.contains('in')) {
          const r = el.getBoundingClientRect();
          if (r.top < window.innerHeight) el.classList.add('in');
        }
      });
    }, 1200);
  }

  // ─── Servicios: in-view choreographed reveal ────────────────────────
  const servicios = document.querySelectorAll('.servicio');
  if (servicios.length) {
    if (reducedMotion) {
      servicios.forEach(s => s.classList.add('in-view'));
    } else {
      const sObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('in-view');
            sObs.unobserve(e.target);
          }
        });
      }, { threshold: 0.18, rootMargin: '0px 0px -10% 0px' });
      servicios.forEach(s => sObs.observe(s));
    }
  }

  // ─── Servicios: parallax tilt on illustration ────────────────────────
  if (window.matchMedia('(hover: hover)').matches && !reducedMotion) {
    servicios.forEach(servicio => {
      const illus = servicio.querySelector('.illus');
      const img = illus && illus.querySelector('img');
      if (!illus || !img) return;
      servicio.addEventListener('mousemove', (e) => {
        const r = servicio.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        img.style.transform = `translate(${x * 8}px, ${y * 8}px) scale(1.04)`;
      });
      servicio.addEventListener('mouseleave', () => {
        img.style.transform = '';
      });
    });
  }

  // ─── Lead form ───────────────────────────────────────────────────────
  const leadForm = document.querySelector('.lead-form');
  if (leadForm) {
    const fields = leadForm.querySelectorAll('.lead-field');
    const successEl = leadForm.querySelector('.lead-success');
    const errorEl = leadForm.querySelector('.lead-error');
    const submitBtn = leadForm.querySelector('button[type="submit"]');
    const nameEl = leadForm.querySelector('[data-success-name]');

    // Endpoint for the backend; override with <body data-lead-endpoint="...">
    const endpoint = document.body.dataset.leadEndpoint || '/api/lead';

    // Live error-clearing as user types + blur validation
    const validateField = (f) => {
      const input = f.querySelector('input, textarea');
      if (!input) return true;
      const value = input.value.trim();
      let ok = true;
      if (input.hasAttribute('required') && !value) ok = false;
      if (input.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) ok = false;
      f.classList.toggle('is-error', !ok);
      return ok;
    };
    fields.forEach(f => {
      const input = f.querySelector('input, textarea');
      if (!input) return;
      input.addEventListener('input', () => f.classList.remove('is-error'));
      input.addEventListener('blur', () => {
        // Only validate if user actually typed something or left a required empty
        if (input.value !== '' || input.hasAttribute('required')) validateField(f);
      });
    });

    // Char counter on textarea
    const msg = leadForm.querySelector('#lead-message');
    const counter = leadForm.querySelector('[data-char-count]');
    if (msg && counter) {
      const max = parseInt(msg.getAttribute('maxlength') || '500', 10);
      const update = () => {
        const n = msg.value.length;
        counter.textContent = String(n);
        const span = counter.parentElement;
        if (span) span.classList.toggle('is-near-limit', n >= max * 0.9);
      };
      msg.addEventListener('input', update);
      update();
    }

    leadForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (errorEl) errorEl.hidden = true;

      let valid = true;
      const data = {};
      fields.forEach(f => {
        const input = f.querySelector('input, textarea');
        if (!input) return;
        const value = input.value.trim();
        data[input.name] = value;
        if (input.hasAttribute('required') && !value) {
          f.classList.add('is-error');
          valid = false;
        }
        if (input.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          f.classList.add('is-error');
          valid = false;
        }
      });
      if (!valid) {
        const firstErr = leadForm.querySelector('.lead-field.is-error input, .lead-field.is-error textarea');
        if (firstErr) firstErr.focus();
        return;
      }

      // Loading state
      leadForm.classList.add('is-loading');
      if (submitBtn) submitBtn.disabled = true;

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Request failed: ' + res.status);

        // Personalize the success message using the user's name (first name only for warmth)
        const fullName = (data.name || '').trim();
        const firstName = fullName.split(/\s+/)[0] || fullName;
        if (nameEl) nameEl.textContent = firstName || 'amigo';

        leadForm.classList.remove('is-loading');
        leadForm.classList.add('is-sent');
        if (successEl) {
          successEl.hidden = false;
          const y = successEl.getBoundingClientRect().top + window.scrollY - 120;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      } catch (err) {
        console.error('[lead form]', err);
        leadForm.classList.remove('is-loading');
        if (submitBtn) submitBtn.disabled = false;
        if (errorEl) errorEl.hidden = false;
      }
    });
  }

  // ─── Testimonios slider ──────────────────────────────────────────────
  const slider = document.querySelector('[data-slider]');
  if (slider) {
    const track = slider.querySelector('.testi-track');
    const cards = Array.from(track.querySelectorAll('.testi-card'));
    const dotsWrap = slider.querySelector('.testi-dots');
    const counterCur = document.querySelector('.testi-counter .cur');
    const counterTotal = document.querySelector('.testi-counter .total');
    const prevBtn = document.querySelector('.testi-arrow[data-dir="prev"]');
    const nextBtn = document.querySelector('.testi-arrow[data-dir="next"]');

    if (counterTotal) counterTotal.textContent = String(cards.length).padStart(2, '0');

    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'testi-dot';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Ir al testimonio ${i + 1}`);
      dot.addEventListener('click', () => scrollToCard(i));
      dotsWrap.appendChild(dot);
    });
    const dots = Array.from(dotsWrap.children);

    function scrollToCard(i) {
      const card = cards[i];
      if (!card) return;
      const target = card.offsetLeft - track.offsetLeft;
      track.scrollTo({ left: target, behavior: 'smooth' });
    }
    function getCurrentIndex() {
      const sl = track.scrollLeft;
      let best = 0, bestDist = Infinity;
      cards.forEach((c, i) => {
        const offset = c.offsetLeft - track.offsetLeft;
        const dist = Math.abs(offset - sl);
        if (dist < bestDist) { bestDist = dist; best = i; }
      });
      return best;
    }
    function updateUI() {
      const i = getCurrentIndex();
      cards.forEach((c, idx) => c.classList.toggle('is-active', idx === i));
      dots.forEach((d, idx) => d.classList.toggle('is-active', idx === i));
      if (counterCur) counterCur.textContent = String(i + 1).padStart(2, '0');
      if (prevBtn) prevBtn.toggleAttribute('disabled', i === 0);
      if (nextBtn) nextBtn.toggleAttribute('disabled', i === cards.length - 1);
    }

    if (prevBtn) prevBtn.addEventListener('click', () => scrollToCard(Math.max(0, getCurrentIndex() - 1)));
    if (nextBtn) nextBtn.addEventListener('click', () => scrollToCard(Math.min(cards.length - 1, getCurrentIndex() + 1)));

    let rafScroll = null;
    track.addEventListener('scroll', () => {
      if (rafScroll) cancelAnimationFrame(rafScroll);
      rafScroll = requestAnimationFrame(updateUI);
    }, { passive: true });

    slider.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' && prevBtn)  { e.preventDefault(); prevBtn.click(); }
      if (e.key === 'ArrowRight' && nextBtn) { e.preventDefault(); nextBtn.click(); }
    });

    updateUI();
    requestAnimationFrame(updateUI);
  }

  // ─── FAQ accordion ────────────────────────────────────────────────────
  const faqs = document.querySelectorAll('.faq-item');
  faqs.forEach(item => {
    const btn = item.querySelector('.faq-q');
    const body = item.querySelector('.faq-a');
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      faqs.forEach(other => {
        other.classList.remove('open');
        other.querySelector('.faq-a').style.maxHeight = '0px';
      });
      if (!isOpen) {
        item.classList.add('open');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });

  // ─── Stat counters ────────────────────────────────────────────────────
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const el = e.target;
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const dur = 1400;
        const start = performance.now();
        const tick = (now) => {
          const t = Math.min(1, (now - start) / dur);
          const eased = 1 - Math.pow(1 - t, 3);
          const val = Math.round(target * eased);
          el.textContent = val + suffix;
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        statObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-count]').forEach(el => statObserver.observe(el));

  // ─── Smooth-scroll anchor links ───────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });

  // ─── Open first FAQ by default ────────────────────────────────────────
  if (faqs.length) {
    const first = faqs[0];
    first.classList.add('open');
    const body = first.querySelector('.faq-a');
    requestAnimationFrame(() => { body.style.maxHeight = body.scrollHeight + 'px'; });
  }

});
