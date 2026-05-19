// ================================================
// ANIMATED EFFECTS MODULE - Code Rain, Particles, Interactions
// ================================================

class CodeRainGenerator {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.chars = ['0', '1', '0', '1', '0', '1', '.', ':', ';', '{', '}', '[', ']', '<', '>', '/', '\\', '|', '-', '+', '*', '&', '^', '%', '$', '#', '@', '!'];
    this.fontSize = 14;
    this.columns = 0;
    this.drops = [];
    this.matrix = [];
    this.isInitialized = false;
    
    this.setupCanvas();
    this.animate();
  }

  setupCanvas() {
    this.canvas.id = 'codeRain';
    this.canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      z-index: -10;
      display: block;
      opacity: 0.1;
      mix-blend-mode: screen;
    `;
    document.body.appendChild(this.canvas);
    
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    this.isInitialized = true;
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    
    const oldColumns = this.columns;
    this.columns = Math.ceil(this.canvas.width / this.fontSize);
    
    if (this.columns !== oldColumns) {
      this.drops = Array(this.columns).fill(0).map(() => Math.random() * this.canvas.height);
      this.matrix = Array(this.columns).fill(0).map(() => this.getRandomChar());
    }
  }

  getRandomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }

  animate() {
    if (!this.isInitialized) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
    this.ctx.font = `${this.fontSize}px monospace`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'top';

    for (let i = 0; i < this.columns; i++) {
      this.ctx.fillText(this.matrix[i], i * this.fontSize, this.drops[i]);
      
      // Random chance for new character
      if (Math.random() > 0.98) {
        this.matrix[i] = this.getRandomChar();
      }

      this.drops[i] += this.fontSize;
      if (this.drops[i] > this.canvas.height) {
        this.drops[i] = 0;
      }
    }

    requestAnimationFrame(() => this.animate());
  }
}

// ================================================
// PARTICLE SYSTEM
// ================================================
class ParticleSystem {
  constructor(container = 'body') {
    this.container = document.querySelector(container);
    this.particles = [];
    this.particleCount = 30;
    this.createParticles();
  }

  createParticles() {
    for (let i = 0; i < this.particleCount; i++) {
      const particle = document.createElement('div');
      particle.style.cssText = `
        position: fixed;
        width: 4px;
        height: 4px;
        background: radial-gradient(circle, #00f0ff, #0080ff);
        border-radius: 50%;
        pointer-events: none;
        z-index: -5;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        box-shadow: 0 0 10px rgba(0, 240, 255, 0.6);
        animation: float ${5 + Math.random() * 10}s ${Math.random() * 2}s infinite ease-in-out;
      `;
      document.body.appendChild(particle);
      this.particles.push(particle);
    }

    this.addStyles();
  }

  addStyles() {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes float {
        0%, 100% {
          transform: translateY(0px) translateX(0px);
          opacity: 0.5;
        }
        25% {
          transform: translateY(-20px) translateX(10px);
          opacity: 0.8;
        }
        50% {
          transform: translateY(-40px) translateX(-10px);
          opacity: 1;
        }
        75% {
          transform: translateY(-20px) translateX(15px);
          opacity: 0.8;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

// ================================================
// MOUSE TRAIL EFFECT
// ================================================
class MouseTrail {
  constructor() {
    this.particles = [];
    this.isActive = true;
    this.document.addEventListener('mousemove', (e) => this.createTrail(e));
  }

  get document() {
    return document;
  }

  createTrail(e) {
    if (!this.isActive || Math.random() > 0.7) return;

    const particle = document.createElement('div');
    const size = Math.random() * 6 + 2;
    particle.style.cssText = `
      position: fixed;
      width: ${size}px;
      height: ${size}px;
      background: radial-gradient(circle, #00f0ff, #b000ff);
      border-radius: 50%;
      pointer-events: none;
      z-index: -4;
      left: ${e.clientX}px;
      top: ${e.clientY}px;
      box-shadow: 0 0 15px rgba(0, 240, 255, 0.8);
      transform: translate(-50%, -50%);
    `;
    document.body.appendChild(particle);

    const lifetime = Math.random() * 1000 + 500;
    let opacity = 1;
    const decay = 1 / (lifetime / 50);

    const animate = () => {
      opacity -= decay;
      particle.style.opacity = opacity;

      if (opacity > 0) {
        particle.style.transform = `translate(-50%, -50%) translateY(${(1 - opacity) * 20}px)`;
        setTimeout(animate, 50);
      } else {
        particle.remove();
      }
    };

    animate();
  }
}

// ================================================
// SCROLL REVEAL ANIMATIONS
// ================================================
class ScrollReveal {
  constructor() {
    this.elements = document.querySelectorAll(
      '.card, .tf-item, .subject-card, .grid-item, .resource-item'
    );
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          this.observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    this.elements.forEach((el) => this.observer.observe(el));
    this.addStyles();
  }

  addStyles() {
    const style = document.createElement('style');
    style.innerHTML = `
      .card, .tf-item, .subject-card, .grid-item, .resource-item {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      .card.revealed, .tf-item.revealed, .subject-card.revealed, 
      .grid-item.revealed, .resource-item.revealed {
        opacity: 1;
        transform: translateY(0);
      }
    `;
    document.head.appendChild(style);
  }
}

// ================================================
// FLOATING ACTION BUTTON
// ================================================
class FloatingActionButton {
  constructor() {
    this.fab = document.getElementById('fab') || this.createFab();
    this.setupEvents();
  }

  createFab() {
    const fab = document.createElement('button');
    fab.id = 'fab';
    fab.innerHTML = '⬆️';
    fab.style.cssText = `
      position: fixed;
      bottom: 30px;
      right: 30px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #00f0ff 0%, #0080ff 50%, #b000ff 100%);
      color: #000;
      border: none;
      cursor: pointer;
      z-index: 999;
      font-size: 1.5rem;
      box-shadow: 0 0 30px rgba(0, 240, 255, 0.5);
      transition: all 0.3s ease;
      opacity: 0;
      visibility: hidden;
      transform: scale(0);
    `;
    document.body.appendChild(fab);
    return fab;
  }

  setupEvents() {
    this.fab.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        this.fab.style.opacity = '1';
        this.fab.style.visibility = 'visible';
        this.fab.style.transform = 'scale(1)';
      } else {
        this.fab.style.opacity = '0';
        this.fab.style.visibility = 'hidden';
        this.fab.style.transform = 'scale(0)';
      }
    });

    this.fab.addEventListener('mouseenter', () => {
      this.fab.style.transform = 'scale(1.1)';
      this.fab.style.boxShadow = '0 0 50px rgba(0, 240, 255, 0.8)';
    });

    this.fab.addEventListener('mouseleave', () => {
      this.fab.style.transform = 'scale(1)';
      this.fab.style.boxShadow = '0 0 30px rgba(0, 240, 255, 0.5)';
    });
  }
}



// ================================================
// TOAST NOTIFICATIONS
// ================================================
class Toast {
  static show(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    const colors = {
      success: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
      error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      info: 'linear-gradient(135deg, #00f0ff 0%, #0080ff 100%)',
    };

    toast.style.cssText = `
      position: fixed;
      bottom: 30px;
      right: 30px;
      background: ${colors[type] || colors.info};
      color: ${type === 'warning' ? '#000' : '#fff'};
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 0 30px rgba(0, 240, 255, 0.4);
      z-index: 10000;
      animation: slideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      max-width: 400px;
      font-weight: 600;
      backdrop-filter: blur(20px);
    `;

    document.body.appendChild(toast);
    toast.textContent = message;

    const removeToast = () => {
      toast.style.animation = 'slideOut 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
      setTimeout(() => toast.remove(), 400);
    };

    setTimeout(removeToast, duration);
  }
}

// ================================================
// PERFORMANCE OPTIMIZATION - LAZY LOADING
// ================================================
class LazyLoader {
  constructor() {
    this.images = document.querySelectorAll('img[data-src]');
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.lazyLoad(entry.target);
          this.observer.unobserve(entry.target);
        }
      });
    });

    this.images.forEach((img) => this.observer.observe(img));
  }

  lazyLoad(img) {
    img.src = img.dataset.src;
    img.removeAttribute('data-src');
    img.style.animation = 'fadeInUp 0.5s ease-out';
  }
}

// ================================================
// INIT FUNCTION - Call on page load
// ================================================
function initModernEffects() {
  // Initialize with slight delay for DOM readiness
  setTimeout(() => {
    try {
      new CodeRainGenerator();
      new ParticleSystem();
      new MouseTrail();
      new ScrollReveal();
      // new FloatingActionButton(); // Disabled
      new LazyLoader();
    } catch (e) {
      console.warn('Modern effects initialization:', e.message);
    }
  }, 100);
}

// Auto initialize if script is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initModernEffects);
} else {
  initModernEffects();
}

// Export for manual initialization
window.ModernEffects = {
  CodeRainGenerator,
  ParticleSystem,
  MouseTrail,
  ScrollReveal,
  FloatingActionButton,
  Toast,
  LazyLoader,
  init: initModernEffects,
};
