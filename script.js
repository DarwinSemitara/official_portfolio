// Utility: set current year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Topbar blur on scroll
const topbar = document.querySelector('.topbar');
function setTopbarBlur(){
  if (!topbar) return;
  const scrolled = (window.scrollY || document.documentElement.scrollTop) > 0;
  topbar.classList.toggle('scrolled', scrolled);
}
window.addEventListener('scroll', setTopbarBlur, { passive: true });
setTopbarBlur();

// Horizontal scroll behavior and nav
const links = document.querySelectorAll('.nav-link');

links.forEach((a) => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const id = a.getAttribute('data-target');
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    }
  });
});

// Randomize floating animation timings for variety
(function seedFloatAnimations(){
  const floats = document.querySelectorAll('.float');
  floats.forEach((el, i) => {
    const d = (Math.random() * 4 + 6).toFixed(2) + 's'; // 6s - 10s
    const delay = (Math.random() * 3).toFixed(2) + 's';  // 0s - 3s
    el.style.setProperty('--float-duration', d);
    el.style.setProperty('--float-delay', delay);
  });
})();

// Cursor ripple effect
(function initCursorRipples(){
  const rippleContainer = document.getElementById('cursor-ripples');
  if (!rippleContainer) return;

  let lastMoveTime = 0;
  let activeRipple = null;
  const ripples = [];
  
  // Check if device supports touch
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Color cycling system
  const colors = ['color-white', 'color-blue', 'color-green', 'color-yellow'];
  let currentColorIndex = 0;
  
  // Set initial color
  rippleContainer.className = 'bg-decor ' + colors[currentColorIndex];
  
  function cycleColor() {
    currentColorIndex = (currentColorIndex + 1) % colors.length;
    rippleContainer.className = 'bg-decor ' + colors[currentColorIndex];
  }

  function createRipple(x, y) {
    const ripple = document.createElement('div');
    ripple.className = 'cursor-ripple';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    rippleContainer.appendChild(ripple);
    
    // Add to tracking array
    ripples.push(ripple);
    
    // Clean up old ripples (keep max 5)
    if (ripples.length > 5) {
      const oldRipple = ripples.shift();
      if (oldRipple && oldRipple.parentNode) {
        oldRipple.parentNode.removeChild(oldRipple);
      }
    }
    
    return ripple;
  }

  function createPulseRipple(x, y) {
    const ripple = createRipple(x, y);
    ripple.classList.add('pulse');
    
    // Remove after animation (increased time for longer radio wave effect)
    setTimeout(() => {
      if (ripple && ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
        const index = ripples.indexOf(ripple);
        if (index > -1) ripples.splice(index, 1);
      }
    }, 800);
  }

  // Mouse events for desktop
  if (!isTouchDevice) {
    document.addEventListener('mousemove', (e) => {
      const now = Date.now();
      const x = e.clientX;
      const y = e.clientY;

      // Update active ripple position
      if (activeRipple) {
        activeRipple.style.left = x + 'px';
        activeRipple.style.top = y + 'px';
      } else {
        activeRipple = createRipple(x, y);
        activeRipple.classList.add('active');
      }

      // Create pulse ripples on movement (slightly more frequent for radio wave effect)
      if (now - lastMoveTime > 80) { // Max 12.5 pulses per second
        createPulseRipple(x, y);
        lastMoveTime = now;
      }
    });

    // Hide active ripple when mouse leaves window
    document.addEventListener('mouseleave', () => {
      if (activeRipple) {
        activeRipple.classList.remove('active');
        setTimeout(() => {
          if (activeRipple && activeRipple.parentNode) {
            activeRipple.parentNode.removeChild(activeRipple);
            const index = ripples.indexOf(activeRipple);
            if (index > -1) ripples.splice(index, 1);
          }
          activeRipple = null;
        }, 300);
      }
    });

    // Show active ripple when mouse enters window
    document.addEventListener('mouseenter', (e) => {
      if (!activeRipple) {
        activeRipple = createRipple(e.clientX, e.clientY);
        activeRipple.classList.add('active');
      }
    });
  }

  // Touch events for mobile
  if (isTouchDevice) {
    document.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      createPulseRipple(touch.clientX, touch.clientY);
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      const now = Date.now();
      if (now - lastMoveTime > 150) { // Slower for touch
        const touch = e.touches[0];
        createPulseRipple(touch.clientX, touch.clientY);
        lastMoveTime = now;
      }
    }, { passive: true });
  }

  // Left-click to cycle colors (works on both desktop and mobile tap)
  document.addEventListener('click', (e) => {
    // Only cycle colors if NOT clicking on interactive elements
    const isInteractive = e.target.closest('button, a, input, textarea, .deck-card, .project-card, .chip, .nav-link, .btn, .carousel-btn, .gbtn, .modal-close, .fullscreen-close');
    
    if (!isInteractive) {
      cycleColor();
      
      // Create a special pulse at click location to show color change
      const x = e.clientX;
      const y = e.clientY;
      createPulseRipple(x, y);
    }
  });
})();

// Glowing name with realistic broken signage effect
(function initGlowingName(){
  const nameEl = document.getElementById('glowing-name');
  if (!nameEl) return;
  
  const text = nameEl.textContent;
  const protectedLetters = ['D', 'J', 'S']; // Never flicker these letters
  let letters = [];
  let brokenLetters = new Set(); // Track letters that are currently "broken"
  
  // Wrap each character in a span
  nameEl.innerHTML = text.split('').map((char, index) => {
    if (char === ' ') return ' ';
    const span = `<span class="letter" data-char="${char}" data-index="${index}">${char}</span>`;
    return span;
  }).join('');
  
  letters = Array.from(nameEl.querySelectorAll('.letter'));
  
  function quickFlicker(letter) {
    if (letter.classList.contains('broken')) return;
    
    letter.classList.add('flicker');
    setTimeout(() => {
      letter.classList.remove('flicker');
    }, 100);
  }
  
  function breakLetter(letter) {
    const char = letter.getAttribute('data-char');
    if (protectedLetters.includes(char)) return;
    
    letter.classList.add('broken');
    brokenLetters.add(letter);
    
    // Schedule repair after 1-5 seconds
    const repairTime = Math.random() * 4000 + 1000;
    setTimeout(() => {
      letter.classList.remove('broken');
      brokenLetters.delete(letter);
    }, repairTime);
  }
  
  function startRandomEffect() {
    const availableLetters = letters.filter(letter => {
      const char = letter.getAttribute('data-char');
      return !protectedLetters.includes(char) && !letter.classList.contains('flicker');
    });
    
    if (availableLetters.length === 0) return;
    
    // 70% chance for quick flicker, 30% chance for extended break
    const shouldBreak = Math.random() < 0.3;
    
    if (shouldBreak && brokenLetters.size < 2) {
      // Extended break - only if we don't have too many broken letters
      const randomIndex = Math.floor(Math.random() * availableLetters.length);
      const selectedLetter = availableLetters[randomIndex];
      breakLetter(selectedLetter);
    } else {
      // Quick flicker - can happen to same letter multiple times
      const numToFlicker = Math.random() < 0.8 ? 1 : 2; // Usually 1, sometimes 2
      
      for (let i = 0; i < numToFlicker && availableLetters.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * availableLetters.length);
        const selectedLetter = availableLetters[randomIndex];
        quickFlicker(selectedLetter);
        // Don't remove from available letters - same letter can flicker multiple times
      }
    }
  }
  
  // Start effects at random intervals
  function scheduleNextEffect() {
    const delay = Math.random() * 2000 + 500; // 0.5-2.5 seconds
    setTimeout(() => {
      startRandomEffect();
      scheduleNextEffect();
    }, delay);
  }
  
  scheduleNextEffect();
})();

// About deck: click to cycle through prepared cards
(function initAboutDeck(){
  const deck = document.getElementById('about-deck');
  if (!deck) return;
  const cards = Array.from(deck.querySelectorAll('.deck-card'));
  if (!cards.length) return;

  // Prepare at least 5 cards (including existing topics)
  const pool = [
    { title: 'About', list: [
      '21 yrs old, born on June 16, 2004',
      'Currently living in Brgy. Tuntungin Putho Los Baños Laguna',
      'Passionate about art'
    ]},
    { title: 'Goals', list: [
      'Be fluent in more than 3 types of coding language',
      'Be able to develop and maintain a system of my own',
      'Be able to make a meaningful yet fun game'
    ]},
    { title: 'Education', list: [
      'Graduated from K-12 at LBSHS',
      'Graduated highschool at TPINHS',
      'Currently studying at LSPU - Sta Cruz Campus'
    ]},
    { title: 'Interests', list: [
      'Game development and game designing',
      'Arts and crafts',
      'Making and playing music'
    ]},
    { title: 'Currently', list: [
      'Honing my skills in programming',
      'Is trying to build and develop projects',
      'Explore different programming languages'
    ]}
  ];

  function render(el, item){
    const ul = item.list?.map(li => `<li>${li}</li>`).join('') || '';
    el.innerHTML = `
      <h2>${item.title}</h2>
      ${ul ? `<ul class="list">${ul}</ul>` : `<p class="desc">${item.desc || ''}</p>`}
    `;
  }

  function currentTitles(){
    return new Set(cards.map(c => (c.querySelector('h2')?.textContent || '').trim()));
  }

  let nextIdx = 0;
  // Start pointer after currently shown items to reduce immediate repeats
  const shown = currentTitles();
  for (let i = 0; i < pool.length; i++) {
    if (!shown.has(pool[i].title)) { nextIdx = i; break; }
  }

  function getNextItem(excludeTitles){
    // find next item not currently displayed
    for (let k = 0; k < pool.length; k++) {
      const i = (nextIdx + k) % pool.length;
      if (!excludeTitles.has(pool[i].title)) {
        nextIdx = (i + 1) % pool.length;
        return pool[i];
      }
    }
    // fallback
    const item = pool[nextIdx];
    nextIdx = (nextIdx + 1) % pool.length;
    return item;
  }

  // Busy guard per card to prevent stuck interactions
  const busyMap = new WeakMap();

  function cycleCard(card){
    if (busyMap.get(card)) return;
    busyMap.set(card, true);

    const exclude = currentTitles();
    const incoming = getNextItem(exclude);

    // Hide any tip while animating
    hideTip(card);

    card.classList.add('shrink-out');
    const finish = () => {
      busyMap.set(card, false);
      // Restart tip timer after card change
      scheduleIdleTip(card);
    };

    const onShrinkEnd = () => {
      card.removeEventListener('animationend', onShrinkEnd);
      render(card, incoming);
      card.classList.remove('shrink-out');
      card.classList.add('pop-in');
      card.addEventListener('animationend', () => { 
        card.classList.remove('pop-in'); 
        finish(); 
      }, { once: true });
    };
    card.addEventListener('animationend', onShrinkEnd);

    // Fallback timer in case animationend doesn't fire
    setTimeout(() => {
      if (busyMap.get(card)) { 
        card.classList.remove('shrink-out'); 
        card.classList.remove('pop-in'); 
        finish(); 
      }
    }, 600);
  }

  // Tip bubble helpers per card
  const tipMap = new WeakMap();
  const idleTimerMap = new WeakMap();

  function getTip(card){
    let tip = tipMap.get(card);
    if (!tip) {
      tip = document.createElement('span');
      tip.className = 'tip-bubble';
      tip.textContent = 'Click me';
      card.appendChild(tip);
      tipMap.set(card, tip);
    }
    return tip;
  }
  function showTip(card){ const tip = getTip(card); tip.classList.add('show'); }
  function hideTip(card){ const tip = tipMap.get(card); if (tip) tip.classList.remove('show'); }
  function scheduleIdleTip(card){
    clearTimeout(idleTimerMap.get(card));
    const t = setTimeout(() => { showTip(card); }, 8000); // Show after 8 seconds of idle
    idleTimerMap.set(card, t);
  }

  // IO to show tip when card enters view initially
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const card = entry.target;
        scheduleIdleTip(card); // Start idle timer when card comes into view
        io.unobserve(card); // only first time
      }
    });
  }, { threshold: 0.5 });

  cards.forEach(card => {
    io.observe(card);
    
    // Hide tip on any interaction and restart idle timer
    ['mousemove','focusin','pointerdown','keydown','click'].forEach(evt => {
      card.addEventListener(evt, () => {
        hideTip(card);
        scheduleIdleTip(card);
      });
    });
    
    card.addEventListener('click', () => cycleCard(card));
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cycleCard(card); } });
  });
})();

// Projects carousel
(function initProjectsCarousel(){
  const carousels = document.querySelectorAll('.projects-carousel');
  if (!carousels.length) return;

  carousels.forEach((root) => {
    const windowEl = root.querySelector('.projects-window');
    const track = root.querySelector('.projects-track');
    const prevBtn = root.querySelector('.carousel-btn.prev');
    const nextBtn = root.querySelector('.carousel-btn.next');
    if (!windowEl || !track || !prevBtn || !nextBtn) return;

    const cards = Array.from(track.children).filter(el => el.classList.contains('project-card'));
    let index = 0;
    let cardWidth = 0;
    let gapPx = 0;

    function measure() {
      // Use the visible window width to prevent overflow regardless of card dimensions
      const cs = window.getComputedStyle(track);
      gapPx = parseFloat(cs.columnGap || cs.gap || '0') || 0;
      cardWidth = windowEl.clientWidth;
    }

    function update() {
      const offset = index * cardWidth; // exactly one full window per page
      track.style.transform = `translateX(-${offset}px)`;
      prevBtn.disabled = index <= 0;
      nextBtn.disabled = index >= (cards.length - 1);
    }

    function go(delta) {
      index = Math.max(0, Math.min(cards.length - 1, index + delta));
      update();
    }

    prevBtn.addEventListener('click', () => go(-1));
    nextBtn.addEventListener('click', () => go(1));

    // Keyboard support when focusing on the carousel
    root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    });

    // Initialize & watch resize
    function onResize() { measure(); update(); }
    window.addEventListener('resize', onResize);
    onResize();
  });
})();

// Scroll reveal: float in on scroll down, float out when scrolling up
(function initScrollReveal(){
  const candidates = Array.from(document.querySelectorAll(
    '.card, .project-card, .chip, .avatar, .projects-carousel, .chips, .socials'
  ));
  const variants = ['rv-fade','rv-up','rv-down','rv-left','rv-right','rv-zoom'];
  candidates.forEach((el) => {
    el.classList.add('reveal');
    // assign a random reveal variant once
    const v = variants[Math.floor(Math.random() * variants.length)];
    el.classList.add(v);
  });

  let lastY = window.scrollY;
  let dir = 'down';
  function onScroll(){
    const y = window.scrollY;
    dir = y < lastY ? 'up' : 'down';
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry => {
      const el = entry.target;
      if (entry.isIntersecting) {
        el.classList.add('visible');
        el.classList.remove('hide-up');
      } else {
        el.classList.remove('visible');
        if (dir === 'up') el.classList.add('hide-up');
        else el.classList.remove('hide-up');
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' });

  candidates.forEach(el => io.observe(el));
})();

// Set project thumbnails with specific images
(function seedProjectThumbs(){
  const projectThumbnails = {
    'RAD': 'images/projects/rad/rad2.png',
    'TPINHS': 'images/projects/tpinhs/tpinhs1.jpg',
    'Verdant': 'images/projects/verdant/verdant2.jpg'
  };

  document.querySelectorAll('.project-card').forEach((card) => {
    const thumb = card.querySelector('.project-thumb');
    if (!thumb) return;
    
    const title = card.getAttribute('data-title');
    const thumbnailImage = projectThumbnails[title];
    
    if (thumbnailImage) {
      thumb.style.backgroundImage = `url(${thumbnailImage})`;
    }
  });
})();

// Modal for projects
(function initProjectModal(){
  const modal = document.getElementById('project-modal');
  if (!modal) return;
  const titleEl = modal.querySelector('#modal-title');
  const descEl = modal.querySelector('#modal-desc');
  const imgEl = modal.querySelector('#modal-image');
  const prev = modal.querySelector('.gbtn.prev');
  const next = modal.querySelector('.gbtn.next');
  const closeEls = modal.querySelectorAll('[data-close]');

  let images = [];
  let i = 0;

  function placeholderSrc(text) {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1280' height='800'>\n      <defs>\n        <linearGradient id='g' x1='0' x2='1' y1='0' y2='1'>\n          <stop offset='0%' stop-color='#333'/>\n          <stop offset='100%' stop-color='#111'/>\n        </linearGradient>\n      </defs>\n      <rect width='100%' height='100%' fill='url(#g)'/>\n      <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='white' font-family='Inter, Arial' font-size='42'>${text}</text>\n    </svg>`;
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
  }

  function update() {
    if (!images.length) {
      imgEl.src = placeholderSrc('No Image');
    } else {
      imgEl.src = images[i];
    }
    imgEl.alt = (titleEl.textContent || 'Project') + ' image ' + (i + 1);
  }

  function openModal(opts) {
    titleEl.textContent = opts.title || 'Project';
    descEl.textContent = opts.desc || '';
    images = (opts.images || []).filter(Boolean);
    if (!images.length) {
      images = [placeholderSrc(opts.title || 'Project'), placeholderSrc('Preview'), placeholderSrc('Gallery')];
    }
    i = 0;
    update();
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn && closeBtn.focus();
  }

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Add click handler for fullscreen image
  imgEl.addEventListener('click', () => {
    openFullscreen(imgEl.src, imgEl.alt);
  });

  next.addEventListener('click', () => { i = (i + 1) % images.length; update(); });
  prev.addEventListener('click', () => { i = (i - 1 + images.length) % images.length; update(); });
  closeEls.forEach(el => el.addEventListener('click', closeModal));
  window.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('open')) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowRight') { e.preventDefault(); i = (i + 1) % images.length; update(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); i = (i - 1 + images.length) % images.length; update(); }
  });

  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.project-card');
      if (!card) return;
      const title = card.getAttribute('data-title') || 'Project';
      const desc = card.getAttribute('data-desc') || '';
      const imgs = (card.getAttribute('data-images') || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      openModal({ title, desc, images: imgs });
    });
  });
})();

// Fullscreen image functionality
(function initFullscreenImage(){
  const overlay = document.getElementById('fullscreen-overlay');
  const fullscreenImg = document.getElementById('fullscreen-image');
  const closeBtn = document.getElementById('fullscreen-close');
  
  if (!overlay || !fullscreenImg || !closeBtn) return;

  window.openFullscreen = function(src, alt) {
    fullscreenImg.src = src;
    fullscreenImg.alt = alt || 'Fullscreen image';
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  };

  function closeFullscreen() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closeFullscreen);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeFullscreen();
  });
  
  window.addEventListener('keydown', (e) => {
    if (overlay.classList.contains('open') && e.key === 'Escape') {
      closeFullscreen();
    }
  });
})();

// Simple contact form validation + simulated submit
const form = document.getElementById('contact-form');
const statusEl = document.getElementById('form-status');

function validateEmail(email) {
  return /[^\s@]+@[^\s@]+\.[^\s@]+/.test(email);
}

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusEl.textContent = '';
    const formData = new FormData(form);
    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const message = String(formData.get('message') || '').trim();

    if (!name || !email || !message) {
      statusEl.textContent = 'Please fill out all fields.';
      return;
    }
    if (!validateEmail(email)) {
      statusEl.textContent = 'Please provide a valid email address.';
      return;
    }

    // Simulate async submit
    statusEl.textContent = 'Sending…';
    await new Promise(r => setTimeout(r, 800));
    statusEl.textContent = 'The message has been sent (demo, feature to be added later :3 )';
    form.reset();
  });
}
