// ההגה בידיים שלי — VSL landing page interactions

(function () {
  // VSL video: HLS stream via hls.js (native playback on Safari/iOS).
  const video = document.getElementById('vsl-video');
  const VSL_SRC = 'https://vz-631013e3-af8.b-cdn.net/d139d084-2029-4539-b00a-728479c91766/playlist.m3u8';

  if (video) {
    if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls();
      hls.loadSource(VSL_SRC);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = VSL_SRC;
    }
  }

  // Scroll-reveal: fade/slide elements in as they enter the viewport.
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  }

  // Life timeline: per-item reveal (drives dot color via CSS) + scroll-linked line fill.
  const timelineItems = document.querySelectorAll('.timeline-item');
  if (timelineItems.length) {
    const timelineObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            timelineObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3, rootMargin: '0px 0px -10% 0px' }
    );
    timelineItems.forEach((item) => timelineObserver.observe(item));
  }

  const timelineEl = document.querySelector('.timeline');
  const timelineFill = document.getElementById('timeline-fill');
  if (timelineEl && timelineFill) {
    let ticking = false;
    const updateFill = () => {
      const rect = timelineEl.getBoundingClientRect();
      const ref = window.innerHeight * 0.55;
      let progress = (ref - rect.top) / rect.height;
      progress = Math.max(0, Math.min(1, progress));
      timelineFill.style.height = progress * 100 + '%';
      ticking = false;
    };
    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          requestAnimationFrame(updateFill);
          ticking = true;
        }
      },
      { passive: true }
    );
    updateFill();
  }

  // Payoff sheep: rise-in animation when the section scrolls into view.
  const payoffSheep = document.querySelector('.payoff-sheep');
  if (payoffSheep) {
    const sheepObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            sheepObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    sheepObserver.observe(payoffSheep);
  }

  // Infinite-loop diagram: draw connector arrows precisely between the 4 icon circles.
  const loopWheel = document.querySelector('.loop-wheel');
  const loopRingSvg = document.querySelector('.loop-ring');
  if (loopWheel && loopRingSvg) {
    const iconIds = { top: 'loop-icon-top', right: 'loop-icon-right', bottom: 'loop-icon-bottom', left: 'loop-icon-left' };
    const pairs = [
      ['top', 'right', 'loop-arrow-top-right'],
      ['right', 'bottom', 'loop-arrow-right-bottom'],
      ['bottom', 'left', 'loop-arrow-bottom-left'],
      ['left', 'top', 'loop-arrow-left-top'],
    ];

    const updateLoopArrows = () => {
      if (getComputedStyle(loopRingSvg).display === 'none') return;
      const wheelRect = loopWheel.getBoundingClientRect();
      if (!wheelRect.width) return;

      const toSvg = (rect) => {
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        return {
          x: ((cx - wheelRect.left) / wheelRect.width) * 600,
          y: ((cy - wheelRect.top) / wheelRect.height) * 600,
          r: (rect.width / 2 / wheelRect.width) * 600,
        };
      };

      const points = {};
      Object.keys(iconIds).forEach((key) => {
        const el = document.getElementById(iconIds[key]);
        if (el) points[key] = toSvg(el.getBoundingClientRect());
      });

      const center = { x: 300, y: 300 };
      pairs.forEach(([fromKey, toKey, pathId]) => {
        const pathEl = document.getElementById(pathId);
        const p1 = points[fromKey];
        const p2 = points[toKey];
        if (!pathEl || !p1 || !p2) return;
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const ux = dx / dist;
        const uy = dy / dist;
        const startX = p1.x + ux * (p1.r + 6);
        const startY = p1.y + uy * (p1.r + 6);
        const endX = p2.x - ux * (p2.r + 14);
        const endY = p2.y - uy * (p2.r + 14);
        // Bow the connector outward, away from the wheel's center, so it reads
        // as a circular arc following the loop's own curve.
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;
        const ctrlX = center.x + (midX - center.x) * 1.25;
        const ctrlY = center.y + (midY - center.y) * 1.25;
        pathEl.setAttribute(
          'd',
          `M${startX.toFixed(1)},${startY.toFixed(1)} Q${ctrlX.toFixed(1)},${ctrlY.toFixed(1)} ${endX.toFixed(1)},${endY.toFixed(1)}`
        );
      });
    };

    updateLoopArrows();
    window.addEventListener('resize', updateLoopArrows);
    window.addEventListener('load', updateLoopArrows);
    setTimeout(updateLoopArrows, 400);
  }

  // Life-road: the mascot drives along the route as this section scrolls through view.
  const roadSection = document.querySelector('.life-road');
  if (roadSection) {
    const roadWrap = roadSection.querySelector('.road-wrap');
    const roadCar = roadSection.querySelector('.road-car');
    const stations = [...roadSection.querySelectorAll('.road-station')];
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const updateRoad = () => {
      // Progress spans the whole section (quote through the closing card) — it
      // reaches 1 as soon as the section's bottom edge reaches the bottom of the
      // viewport, i.e. once the card has fully scrolled into view, rather than
      // requiring an extra viewport of scrolling past the section afterwards.
      const rect = roadSection.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height > 0 ? rect.height : 1;
      let progress = (vh - rect.top) / total;
      progress = Math.max(0, Math.min(1, progress));
      roadWrap.style.setProperty('--progress', progress.toFixed(4));

      const pct = progress * 100;
      stations.forEach((st) => {
        const pos = parseFloat(st.dataset.pos);
        st.classList.toggle('is-passed', pct >= pos - 1);
        st.classList.toggle('is-active', Math.abs(pct - pos) < 8);
      });
    };

    let roadTicking = false;
    window.addEventListener(
      'scroll',
      () => {
        if (!roadTicking) {
          requestAnimationFrame(() => {
            updateRoad();
            roadTicking = false;
          });
          roadTicking = true;
        }
      },
      { passive: true }
    );
    window.addEventListener('resize', updateRoad);
    updateRoad();

    if (reduceMotion) {
      if (roadCar) roadCar.style.transition = 'none';
      stations.forEach((st) => {
        const dot = st.querySelector('.road-station-dot');
        if (dot) dot.style.transition = 'none';
      });
    }
  }

  // Lead form: sends each submission to a Make.com webhook, which appends
  // the row to the team's Google Sheet.
  const LEAD_WEBHOOK_URL = 'https://hook.eu1.make.com/e73ic13hesf3o9q35reh349nsulu07yb';
  const form = document.getElementById('lead-form');
  const status = document.getElementById('form-status');
  const submitBtn = form ? form.querySelector('button[type="submit"]') : null;

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const payload = {
        fullName: form.elements['full-name'].value.trim(),
        phone: form.elements['phone'].value.trim(),
        email: form.elements['email'].value.trim(),
        marketingConsent: form.elements['marketing-consent'].checked,
      };

      if (submitBtn) submitBtn.disabled = true;

      fetch(LEAD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .catch((err) => console.error('Lead webhook failed:', err))
        .finally(() => {
          if (submitBtn) submitBtn.disabled = false;
          form.reset();
          if (status) status.classList.add('show');
        });
    });
  }
})();
