const themeToggle = document.getElementById('themeToggle');
// Default to dark mode unless user explicitly selected light
if (localStorage.theme === 'light') {
  document.documentElement.classList.remove('dark');
} else {
  document.documentElement.classList.add('dark');
}

themeToggle.addEventListener('click', () => {
  document.documentElement.classList.toggle('dark');
  if (document.documentElement.classList.contains('dark')) {
    localStorage.theme = 'dark';
  } else {
    localStorage.theme = 'light';
  }
});


window.addEventListener('load', () => {
  setTimeout(() => createConfetti(80), 500);
});

// Smooth Scroll to Quotes
document.getElementById('scrollDownBtn')?.addEventListener('click', () => {
  document.getElementById('quotes').scrollIntoView({ behavior: 'smooth' });
});

// Intersection Observer for Scroll Animations
const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.15
};

const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
      observer.unobserve(entry.target); // Only animate once
    }
  });
}, observerOptions);

document.querySelectorAll('.reveal-up').forEach(el => {
  observer.observe(el);
});

// Modal Logic
const cards = document.querySelectorAll('.teacher-card');
const modal = document.getElementById('modal');
const modalInner = modal.querySelector('div');
const modalImg = document.getElementById('modalImg');
const modalImgBg = document.getElementById('modalImgBg');
const modalName = document.getElementById('modalName');
const modalTitle = document.getElementById('modalTitle');
const modalMsg = document.getElementById('modalMsg');
const modalQuote = document.getElementById('modalQuote');
const noteInput = document.getElementById('noteInput');
const saveNoteBtn = document.getElementById('saveNote');
const downloadBtn = document.getElementById('downloadCard');
const modalClose = document.getElementById('modalClose');

function openModal(name, title, msg, img, quote) {
  modalImg.src = img;
  if (modalImgBg) modalImgBg.src = img;
  modalName.textContent = name;
  if (modalTitle) modalTitle.textContent = title || 'Senior Engineer';
  modalMsg.textContent = msg;
  modalQuote.textContent = quote || '';
  
  const saved = localStorage.getItem('note_' + name);
  noteInput.value = saved || '';
  
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  // Trigger reflow for transition
  void modal.offsetWidth;
  modal.classList.add('show');
  document.body.style.overflow = 'hidden'; // Prevent scrolling
}

function closeModal() {
  modal.classList.remove('show');
  setTimeout(() => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
  }, 300); // match transition duration
}

cards.forEach(card => {
  card.addEventListener('click', () => {
    openModal(card.dataset.name, card.dataset.title, card.dataset.msg, card.dataset.img, card.dataset.quote);
  });
  card.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openModal(card.dataset.name, card.dataset.title, card.dataset.msg, card.dataset.img, card.dataset.quote);
    }
  });
});

if(modalClose) modalClose.addEventListener('click', closeModal);
if(modal) {
  modal.addEventListener('click', (e) => { 
    if (e.target === modal) closeModal(); 
  });
}
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal && modal.classList.contains('show')) {
    closeModal();
  }
});

saveNoteBtn && saveNoteBtn.addEventListener('click', () => {
  const name = modalName.textContent;
  const note = noteInput.value.trim();
  if (name) {
    localStorage.setItem('note_' + name, note);
    showToast('Note saved successfully!');
    createConfetti(50); // Little celebration
  }
});

// Toast Notification
function showToast(msg) {
  const existing = document.querySelector('.toast');
  if(existing) existing.remove();
  
  const t = document.createElement('div'); 
  t.className = 'toast'; 
  t.textContent = msg; 
  document.body.appendChild(t);
  
  // Trigger reflow
  void t.offsetWidth;
  t.classList.add('visible');
  
  setTimeout(() => {
    t.classList.remove('visible');
    setTimeout(() => t.remove(), 300);
  }, 3000);
}

// Hero Slider
const slides = Array.from(document.querySelectorAll('#heroSlider .slide'));
const dotsWrap = document.getElementById('sliderDots');
let current = 0; 
let autoplayId = null;
let isAnimating = false;

function makeDots() {
  slides.forEach((s, i) => { 
    const b = document.createElement('button'); 
    b.setAttribute('aria-label', `Go to slide ${i + 1}`);
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      if(current !== i && !isAnimating) {
        showSlide(i);
        resetAutoplay();
      }
    }); 
    if(dotsWrap) dotsWrap.appendChild(b); 
  });
}

function showSlide(i) {
  isAnimating = true;
  slides.forEach((s, idx) => {
    if(idx === i) {
      s.classList.add('visible');
      s.style.zIndex = '10';
    } else {
      s.classList.remove('visible');
      s.style.zIndex = '0';
    }
  });
  if (dotsWrap) {
    Array.from(dotsWrap.children).forEach((d, idx) => d.classList.toggle('active', idx === i));
  }
  current = i;
  setTimeout(() => { isAnimating = false; }, 700); // match transition duration
}

function nextSlide() { 
  if(!isAnimating) showSlide((current + 1) % slides.length); 
}
function prevSlide() { 
  if(!isAnimating) showSlide((current - 1 + slides.length) % slides.length); 
}

const nextBtn = document.getElementById('nextSlide');
const prevBtn = document.getElementById('prevSlide');

if(nextBtn && prevBtn) {
  nextBtn.addEventListener('click', (e) => { e.stopPropagation(); nextSlide(); resetAutoplay(); });
  prevBtn.addEventListener('click', (e) => { e.stopPropagation(); prevSlide(); resetAutoplay(); });
}

makeDots(); 
if(slides.length > 0) showSlide(0);

function startAutoplay() { 
  autoplayId = setInterval(nextSlide, 5000); 
}
function resetAutoplay() { 
  clearInterval(autoplayId); 
  startAutoplay(); 
}
startAutoplay();

// Allow clicking slide to open modal
slides.forEach(s => {
  s.addEventListener('click', () => {
    const img = s.dataset.img || (s.querySelector('img') && s.querySelector('img').src) || ''; 
    openModal(s.dataset.name, s.dataset.title, s.dataset.msg, img, s.dataset.quote); 
  });
});

// Pause slider on hover
const sliderEl = document.getElementById('heroSlider');
if(sliderEl) {
  sliderEl.addEventListener('mouseenter', () => clearInterval(autoplayId));
  sliderEl.addEventListener('mouseleave', startAutoplay);
  
  // Touch support
  let startX = 0; 
  let deltaX = 0;
  sliderEl.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    clearInterval(autoplayId);
  }, {passive: true});
  
  sliderEl.addEventListener('touchmove', e => {
    deltaX = e.touches[0].clientX - startX;
  }, {passive: true});
  
  sliderEl.addEventListener('touchend', () => { 
    if (deltaX > 50) { prevSlide(); } 
    else if (deltaX < -50) { nextSlide(); } 
    startX = 0; 
    deltaX = 0; 
    startAutoplay();
  });
}

// Hero Note Button opens modal for current slide
const heroNoteBtn = document.getElementById('heroNote');
if (heroNoteBtn) { 
  heroNoteBtn.addEventListener('click', (e) => { 
    e.stopPropagation();
    const s = slides[current]; 
    const img = s.dataset.img || (s.querySelector('img') && s.querySelector('img').src) || ''; 
    openModal(s.dataset.name, s.dataset.title, s.dataset.msg, img, s.dataset.quote); 
  }); 
}

// Elegant Confetti (Golden & Silver tones for a respectful feel)
const confettiCanvas = document.getElementById('confettiCanvas');
const ctx = confettiCanvas.getContext('2d');
let confettiPieces = [];

function resizeCanvas() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const elegantColors = ['#d4af37', '#ffd700', '#c0c0c0', '#e5e4e2', '#f9f6f0']; // Golds and silvers

function createConfetti(amount = 100) {
  for (let i = 0; i < amount; i++) {
    confettiPieces.push({
      x: Math.random() * confettiCanvas.width,
      y: Math.random() * -confettiCanvas.height - 50,
      w: 5 + Math.random() * 5,
      h: 10 + Math.random() * 10,
      r: Math.random() * 360,
      color: elegantColors[Math.floor(Math.random() * elegantColors.length)],
      speed: 1 + Math.random() * 2,
      rotSpeed: (Math.random() - 0.5) * 5,
      opacity: 0.8 + Math.random() * 0.2
    });
  }
  if(confettiPieces.length === amount) {
    requestAnimationFrame(drawConfetti);
  }
}

function drawConfetti() {
  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  confettiPieces.forEach(p => {
    p.x += Math.sin(p.r * 0.01) * 1;
    p.y += p.speed;
    p.r += p.rotSpeed;
    ctx.save();
    ctx.globalAlpha = p.opacity;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.r * Math.PI / 180);
    ctx.fillStyle = p.color;
    // draw little diamonds/rectangles
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    ctx.restore();
  });
  
  confettiPieces = confettiPieces.filter(p => p.y < confettiCanvas.height + 50);
  if (confettiPieces.length > 0) {
    requestAnimationFrame(drawConfetti);
  } else {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }
}

// Download Card functionality
if(downloadBtn) {
  downloadBtn.addEventListener('click', () => {
    const name = modalName.textContent;
    const quote = modalQuote.textContent;
    const imgSrc = modalImg.src;
    
    showToast('Preparing your card...');
    
    const canvas = document.createElement('canvas');
    const w = 1200, h = 630;
    canvas.width = w; canvas.height = h;
    const ctx2 = canvas.getContext('2d');
    
    // Premium Background Gradient
    const grad = ctx2.createLinearGradient(0, 0, w, h);
    const isDark = document.documentElement.classList.contains('dark');
    if(isDark) {
      grad.addColorStop(0, '#1e293b'); // slate-800
      grad.addColorStop(1, '#0f172a'); // slate-900
    } else {
      grad.addColorStop(0, '#fdf8f6'); // brand-50
      grad.addColorStop(1, '#eaddd7'); // brand-200
    }
    ctx2.fillStyle = grad; 
    ctx2.fillRect(0, 0, w, h);
    
    // Add decorative elements
    ctx2.fillStyle = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(163, 124, 107, 0.05)';
    ctx2.beginPath();
    ctx2.arc(w, 0, 400, 0, Math.PI * 2);
    ctx2.fill();
    ctx2.beginPath();
    ctx2.arc(0, h, 300, 0, Math.PI * 2);
    ctx2.fill();
    
    const avatar = new Image();
    avatar.crossOrigin = 'anonymous';
    avatar.onload = () => {
      const size = 340;
      const xPos = 140;
      const yPos = (h - size) / 2;
      
      // Shadow for image
      ctx2.shadowColor = 'rgba(0,0,0,0.3)';
      ctx2.shadowBlur = 30;
      ctx2.shadowOffsetY = 10;
      ctx2.beginPath(); 
      ctx2.arc(xPos + size / 2, yPos + size / 2, size / 2, 0, Math.PI * 2); 
      ctx2.fillStyle = 'white';
      ctx2.fill();
      ctx2.shadowColor = 'transparent';
      
      // Draw Image Circle
      ctx2.save();
      ctx2.beginPath(); 
      ctx2.arc(xPos + size / 2, yPos + size / 2, size / 2, 0, Math.PI * 2); 
      ctx2.closePath(); 
      ctx2.clip();
      ctx2.drawImage(avatar, xPos, yPos, size, size);
      ctx2.restore();
      
      // Add a border ring
      ctx2.beginPath();
      ctx2.arc(xPos + size / 2, yPos + size / 2, size / 2, 0, Math.PI * 2);
      ctx2.lineWidth = 8;
      ctx2.strokeStyle = isDark ? '#334155' : '#ffffff';
      ctx2.stroke();
      
      // Text Setup
      const textStartX = 540;
      const textColor = isDark ? '#f8fafc' : '#1e293b';
      const quoteColor = isDark ? '#94a3b8' : '#475569';
      const noteColor = isDark ? '#cbd5e1' : '#334155';
      
      // Draw "Happy Teachers' Day" label
      ctx2.fillStyle = isDark ? '#a37c6b' : '#8c6b5d'; // brand color
      ctx2.font = 'bold 24px Inter';
      ctx2.fillText("HAPPY TEACHERS' DAY", textStartX, h / 2 - 80);
      
      // Draw Name
      ctx2.fillStyle = textColor; 
      ctx2.font = 'bold 64px "Playfair Display", serif'; 
      ctx2.fillText(name, textStartX, h / 2);
      
      // Check for user's personal note
      const personalNote = noteInput && noteInput.value.trim();
      
      if (personalNote) {
        // Draw user's personal note
        ctx2.fillStyle = noteColor; 
        ctx2.font = '400 28px Inter'; 
        wrapText(ctx2, personalNote, textStartX, h / 2 + 60, 600, 42);
      } else {
        // Draw Quote
        ctx2.fillStyle = quoteColor; 
        ctx2.font = 'italic 32px "Playfair Display", serif'; 
        wrapText(ctx2, `"${quote.replace(/"/g, '')}"`, textStartX, h / 2 + 60, 600, 42);
      }
      
      // Trigger download
      try {
        const a = document.createElement('a'); 
        a.download = `${name}-Teachers-Day.png`; 
        a.href = canvas.toDataURL('image/png'); 
        a.click();
        showToast('Card downloaded!');
        createConfetti(100);
      } catch(e) {
        showToast('Could not download due to CORS restrictions on image.');
      }
    };
    
    avatar.onerror = () => {
      showToast('Error loading image for download.');
    };
    
    avatar.src = imgSrc;
  });
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  for(let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if(metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, x, y); 
      line = words[n] + ' '; 
      y += lineHeight;
    } else { 
      line = testLine; 
    }
  }
  ctx.fillText(line, x, y);
}

// Fallback for missing images
const placeholder = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500"><rect width="100%" height="100%" fill="%23e2e8f0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2364748b" font-family="sans-serif" font-size="28">Image not available</text></svg>';
document.querySelectorAll('img').forEach(img => {
  img.addEventListener('error', () => { 
    if(img.src !== placeholder) {
      img.src = placeholder; 
      img.classList.add('error'); 
    }
  });
});

// End of file
// ==========================================
// 1. 3D Tilt Effect for Grid Cards
// ==========================================
const tiltCards = document.querySelectorAll('.teacher-card');
tiltCards.forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    
    card.style.transform = "perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)";
    card.style.transition = 'transform 0.1s ease-out';
  });
  
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'transform 0.5s ease-out';
  });
});

// ==========================================
// 2. Magical Sparkle Cursor
// ==========================================
document.addEventListener('mousemove', function(e) {
  if (Math.random() > 0.88) {
    createSparkle(e.pageX, e.pageY);
  }
});

function createSparkle(x, y) {
  const sparkle = document.createElement('div');
  sparkle.className = 'absolute rounded-full pointer-events-none z-50 mix-blend-screen';
  const size = Math.random() * 4 + 2;
  sparkle.style.width = ".${size}px";
  sparkle.style.height = ".${size}px";
  sparkle.style.left = ".${x}px";
  sparkle.style.top = ".${y}px";
  sparkle.style.backgroundColor = "hsl(.${Math.random() * 60 + 30}, 100%, 75%)";
  sparkle.style.boxShadow = "0 0 .${size*2}px currentColor";
  
  document.body.appendChild(sparkle);
  
  const destY = y - (Math.random() * 40 + 20);
  const destX = x + (Math.random() * 40 - 20);
  
  const animation = sparkle.animate([
    { transform: 'translate(0, 0) scale(1)', opacity: 0.8 },
    { transform: "translate(.${destX - x}px, .${destY - y}px) scale(0)", opacity: 0 }
  ], {
    duration: Math.random() * 600 + 400,
    easing: 'cubic-bezier(0, .9, .57, 1)'
  });
  
  animation.onfinish = () => sparkle.remove();
}

// ==========================================
// 3. Developer Terminal Easter Egg
// ==========================================
const devModeBtn = document.getElementById('devModeBtn');
const terminalOverlay = document.getElementById('terminalOverlay');
const terminalWindow = document.getElementById('terminalWindow');
const closeTerminal = document.getElementById('closeTerminal');
const terminalBody = document.getElementById('terminalBody');

if (devModeBtn) {
  devModeBtn.addEventListener('click', () => {
    terminalOverlay.classList.remove('hidden');
    terminalOverlay.classList.add('flex');
    setTimeout(() => {
      terminalOverlay.classList.remove('opacity-0');
      terminalWindow.classList.remove('scale-95');
    }, 10);
    document.body.style.overflow = 'hidden';
    runTerminalSequence();
  });
}

if (closeTerminal) {
  closeTerminal.addEventListener('click', () => {
    terminalOverlay.classList.add('opacity-0');
    terminalWindow.classList.add('scale-95');
    setTimeout(() => {
      terminalOverlay.classList.add('hidden');
      terminalOverlay.classList.remove('flex');
      document.body.style.overflow = '';
      terminalBody.innerHTML = '';
    }, 300);
  });
}

function runTerminalSequence() {
  terminalBody.innerHTML = '';
  const lines = [
    '[INFO] Initializing gratitude_engine v1.0.0...',
    '[INFO] Connecting to database: memories_and_milestones.db... SUCCESS',
    '[WARN] Overwhelming support detected! Buffer overflow of appreciation.',
    'Resolving dependencies...',
    ' -> fetched: Patience from Ankit_Sir',
    ' -> fetched: Creativity from Ayantika_Maam',
    ' -> fetched: Technical_Wizardry from Debargha_Sir',
    ' -> fetched: Positivity from Jyoti_Maam',
    ' -> fetched: Visionary_Leadership from Anupam_Sir',
    'Building project...',
    '[===================================>] 100%',
    'Build SUCCESS.',
    ' ',
    '> Executing final_message.js:',
    ' ',
    'Dear Core Team,',
    'Thank you for compiling my scattered skills into a working professional.',
    'I could not have asked for a better environment to debug my early career.',
    'Without you, my code wouldnt compile, and my career wouldnt scale.',
    'Happy Teachers Day!',
    ' ',
    'Process finished with exit code 0.'
  ];
  
  let i = 0;
  function printLine() {
    if (i < lines.length) {
      const line = document.createElement('div');
      line.textContent = lines[i];
      if (lines[i].includes('SUCCESS') || lines[i].includes('100%')) line.className = 'text-emerald-400';
      if (lines[i].includes('WARN')) line.className = 'text-yellow-400';
      if (lines[i].includes('Dear') || lines[i].includes('Thank') || lines[i].includes('Happy') || lines[i].includes('Without')) line.className = 'text-cyan-300 font-bold';
      if (lines[i].startsWith('>')) line.className = 'text-white font-bold mt-2';
      
      terminalBody.appendChild(line);
      terminalBody.scrollTop = terminalBody.scrollHeight;
      i++;
      setTimeout(printLine, Math.random() * 200 + 50);
    }
  }
  
  setTimeout(printLine, 300);
}
