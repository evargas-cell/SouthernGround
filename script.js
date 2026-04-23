/* ============================================================
   SOUTHERN GROUND CAPITAL — script.js
   ============================================================ */

(function () {
  'use strict';

  // === STICKY HEADER ===
  const header = document.getElementById('site-header');
  if (header) {
    window.addEventListener('scroll', function () {
      header.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  }

  // === MOBILE HAMBURGER ===
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
      const isOpen = mobileMenu.classList.contains('open');
      mobileMenu.classList.toggle('open', !isOpen);
      hamburger.classList.toggle('open', !isOpen);
      hamburger.setAttribute('aria-expanded', String(!isOpen));
      mobileMenu.setAttribute('aria-hidden', String(isOpen));
    });

    // Close on nav link click
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
      });
    });
  }

  // === SCROLL FADE-IN (IntersectionObserver) ===
  const fadeEls = document.querySelectorAll('.fade-in');
  if ('IntersectionObserver' in window) {
    const fadeObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    fadeEls.forEach(function (el) { fadeObserver.observe(el); });
  } else {
    fadeEls.forEach(function (el) { el.classList.add('visible'); });
  }

  // === COUNT-UP ANIMATION (stats panel) ===
  function animateCount(el) {
    var prefix = el.dataset.prefix || '';
    var target  = parseInt(el.dataset.count, 10);
    var suffix  = el.dataset.suffix || '';
    var duration = 1600;
    var start = null;

    function step(timestamp) {
      if (!start) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      var current = Math.floor(eased * target);
      el.textContent = prefix + current + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var countEls = document.querySelectorAll('.stat-num[data-count]');
  if ('IntersectionObserver' in window && countEls.length) {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    countEls.forEach(function (el) { countObserver.observe(el); });
  }

  // === FORM VALIDATION — shared helper ===
  function validateField(input) {
    var errorEl = input.parentElement.querySelector('.form-error');
    var valid = true;

    input.classList.remove('error');
    if (errorEl) errorEl.textContent = '';

    if (input.required && !input.value.trim()) {
      if (errorEl) errorEl.textContent = 'This field is required.';
      input.classList.add('error');
      valid = false;
    } else if (input.type === 'email' && input.value.trim()) {
      var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(input.value.trim())) {
        if (errorEl) errorEl.textContent = 'Please enter a valid email address.';
        input.classList.add('error');
        valid = false;
      }
    } else if (input.type === 'tel' && input.value.trim()) {
      var telRe = /[\d\s\(\)\-\+]{7,}/;
      if (!telRe.test(input.value.trim())) {
        if (errorEl) errorEl.textContent = 'Please enter a valid phone number.';
        input.classList.add('error');
        valid = false;
      }
    } else if (input.tagName === 'SELECT' && input.required && !input.value) {
      if (errorEl) errorEl.textContent = 'Please select an option.';
      input.classList.add('error');
      valid = false;
    }
    return valid;
  }

  function setupForm(formId, successId) {
    var form = document.getElementById(formId);
    if (!form) return;

    var successEl = document.getElementById(successId);
    var inputs = form.querySelectorAll('input, select, textarea');

    // Inline validation on blur
    inputs.forEach(function (input) {
      input.addEventListener('blur', function () { validateField(input); });
      input.addEventListener('input', function () {
        if (input.classList.contains('error')) validateField(input);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var allValid = true;
      inputs.forEach(function (input) {
        if (!validateField(input)) allValid = false;
      });
      if (!allValid) return;

      // Simulate submission (replace with real endpoint)
      var submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting…';
      }
      setTimeout(function () {
        form.reset();
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = submitBtn.dataset.originalText || 'Submit';
        }
        if (successEl) {
          successEl.hidden = false;
          successEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 900);
    });

    // Store original button text
    var btn = form.querySelector('button[type="submit"]');
    if (btn) btn.dataset.originalText = btn.textContent;
  }

  setupForm('contact-form', 'form-success');
  setupForm('lead-magnet-form', 'lm-success');

  // === FOOTER YEAR ===
  var yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
