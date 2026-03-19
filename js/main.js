/* ============================================
   Sarnetsky Consulting — Main JS
   v4: Scroll reveal, hue shift, count-up
   ============================================ */

(function () {
  'use strict';

  // ============================================
  // Scroll-driven colour shift
  // ============================================
  var hueStops = [
    { at: 0.00, hue: 150, sat: 40 },
    { at: 0.20, hue: 148, sat: 42 },
    { at: 0.40, hue: 155, sat: 38 },
    { at: 0.60, hue: 165, sat: 35 },
    { at: 0.80, hue: 150, sat: 40 },
    { at: 1.00, hue: 42,  sat: 65 }
  ];

  function lerpHue(scrollPct) {
    var i = 0;
    while (i < hueStops.length - 1 && hueStops[i + 1].at <= scrollPct) i++;
    if (i >= hueStops.length - 1) return hueStops[hueStops.length - 1];

    var a = hueStops[i];
    var b = hueStops[i + 1];
    var range = b.at - a.at;
    var t = range > 0 ? (scrollPct - a.at) / range : 0;
    t = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    var dh = b.hue - a.hue;
    if (Math.abs(dh) > 180) dh = dh > 0 ? dh - 360 : dh + 360;

    return {
      hue: Math.round(a.hue + dh * t),
      sat: Math.round(a.sat + (b.sat - a.sat) * t)
    };
  }

  var root = document.documentElement;
  var ticking = false;

  function updateScrollHue() {
    var scrollHeight = document.body.scrollHeight - window.innerHeight;
    var scrollPct = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
    var result = lerpHue(scrollPct);
    root.style.setProperty('--hue', result.hue);
    root.style.setProperty('--sat', result.sat + '%');
    root.style.setProperty('--scroll-progress', scrollPct);
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) { requestAnimationFrame(updateScrollHue); ticking = true; }
  }, { passive: true });
  updateScrollHue();

  // ============================================
  // Nav
  // ============================================
  var nav = document.getElementById('nav');
  function handleNavScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }
  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  var toggle = document.getElementById('nav-toggle');
  var links = document.getElementById('nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () { links.classList.toggle('open'); });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { links.classList.remove('open'); });
    });
  }

  // ============================================
  // Scroll Reveal — staggered IntersectionObserver
  // Works on all browsers, mobile included
  // ============================================
  var revealEls = document.querySelectorAll('[data-reveal]');

  // Assign stagger delays to siblings in grids
  document.querySelectorAll('.services-grid, .results-grid, .about-cards, .process-steps').forEach(function (container) {
    var children = container.querySelectorAll('[data-reveal], .scroll-reveal');
    children.forEach(function (child, i) {
      child.style.setProperty('--reveal-delay', i);
    });
  });

  // Also stagger .scroll-reveal cards (service/result cards)
  document.querySelectorAll('.scroll-reveal').forEach(function (el) {
    if (!el.hasAttribute('data-reveal')) {
      el.setAttribute('data-reveal', '');
    }
  });

  // Re-query after adding attributes
  revealEls = document.querySelectorAll('[data-reveal]');

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px'
  });

  revealEls.forEach(function (el) {
    observer.observe(el);
  });

  // ============================================
  // Count-up animation
  // ============================================
  var countEls = document.querySelectorAll('[data-count]');
  var counted = new Set();

  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var duration = target > 100 ? 1400 : 900;
    var start = performance.now();

    function tick(now) {
      var elapsed = now - start;
      var progress = Math.min(elapsed / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.round(eased * target);
      el.textContent = current.toLocaleString();
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  var countObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && !counted.has(entry.target)) {
        counted.add(entry.target);
        animateCount(entry.target);
      }
    });
  }, { threshold: 0.5 });

  countEls.forEach(function (el) { countObserver.observe(el); });

  // ============================================
  // Terminal typing animation
  // ============================================
  var prompts = [
    {
      text: 'Pull last 30 days of Shopify orders and calculate contribution margin by product',
      output: [
        '<span class="t-success">&#10003;</span> Pulled 1,847 orders from Shopify API',
        '<span class="t-success">&#10003;</span> Matched COGS data for 186 products',
        '<span class="t-success">&#10003;</span> Contribution margin report saved to analytics/cm_by_product.csv',
        '<span class="t-dim">  Top performer: Weekly Planner HC, 68.2% CM</span>'
      ]
    },
    {
      text: 'Audit SEO for all active products and fix missing alt text',
      output: [
        '<span class="t-success">&#10003;</span> Scanned 290 active products (2,984 images)',
        '<span class="t-dim">  Found 847 images missing alt text</span>',
        '<span class="t-dim">  Found 134 weak meta descriptions</span>',
        '<span class="t-success">&#10003;</span> Generated alt text for 285 images. Applied via Shopify API'
      ]
    },
    {
      text: 'Build a daily briefing from GA4, Meta Ads, and Shopify data',
      output: [
        '<span class="t-success">&#10003;</span> GA4: 4,218 sessions (+12% vs. last week)',
        '<span class="t-success">&#10003;</span> Meta: $3,142 spend, 4.26x ROAS',
        '<span class="t-success">&#10003;</span> Shopify: $13,847 revenue, 94 orders',
        '<span class="t-dim">  Briefing saved. Dashboard updated at localhost:5173</span>'
      ]
    }
  ];

  var typedEl = document.getElementById('typed-text');
  var outputEl = document.getElementById('terminal-output');
  var cursor = document.querySelector('.t-cursor');
  var promptIdx = 0;

  function typePrompt(text, cb) {
    var i = 0;
    typedEl.textContent = '';
    outputEl.innerHTML = '';
    if (cursor) cursor.style.display = '';

    function tick() {
      if (i <= text.length) {
        typedEl.textContent = text.slice(0, i);
        i++;
        setTimeout(tick, 28 + Math.random() * 25);
      } else {
        if (cursor) cursor.style.display = 'none';
        setTimeout(cb, 400);
      }
    }
    tick();
  }

  function showOutput(lines, cb) {
    var html = '';
    var i = 0;
    function nextLine() {
      if (i < lines.length) {
        html += '<div>' + lines[i] + '</div>';
        outputEl.innerHTML = html;
        i++;
        setTimeout(nextLine, 350);
      } else {
        setTimeout(cb, 2800);
      }
    }
    nextLine();
  }

  function runCycle() {
    var p = prompts[promptIdx % prompts.length];
    promptIdx++;
    typePrompt(p.text, function () {
      showOutput(p.output, runCycle);
    });
  }

  setTimeout(runCycle, 1200);

})();
