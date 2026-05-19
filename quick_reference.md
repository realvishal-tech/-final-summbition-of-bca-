/* ================================================
   QUICK REFERENCE - MODERN THEME FEATURES
   ================================================ */

/*
   🎨 COLORS REFERENCE
   
   Primary Neon Colors:
   - Cyan:     #00f0ff (Bright cyan glow)
   - Purple:   #b000ff (Deep violet)
   - Pink:     #f0359f (Hot pink)
   - Blue:     #0080ff (Bright blue)
   
   Status Colors:
   - Success:  #22c55e (Green)
   - Error:    #ef4444 (Red)
   - Warning:  #f59e0b (Orange)
   - Info:     #00f0ff (Cyan)
   
   Backgrounds:
   - Dark:     #020817 (Deep space black)
   - Card:     #0c1a2e (Dark blue)
   - Glass:    rgba(12, 26, 46, 0.7)
*/

/* ================================================
   ANIMATION KEYFRAMES INCLUDED
   ================================================ */

@keyframes fadeInUp { }           /* Fade in + slide up */
@keyframes fadeInDown { }         /* Fade in + slide down */
@keyframes fadeInLeft { }         /* Fade in from left */
@keyframes fadeInRight { }        /* Fade in from right */
@keyframes slideDown { }          /* Dropdown animation */
@keyframes glowPulse { }          /* Pulsing glow effect */
@keyframes floatUp { }            /* Floating up animation */
@keyframes rotateSlow { }         /* Slow 360 rotation */
@keyframes shimmer { }            /* Shimmer effect */
@keyframes neonGlow { }           /* Text glow pulse */
@keyframes borderGlow { }         /* Border glow pulse */
@keyframes rippleExpand { }       /* Ripple effect */
@keyframes slideInLeft { }        /* Slide from left */
@keyframes slideInUp { }          /* Slide from bottom */

/* ================================================
   GLASSMORPHISM EFFECT
   ================================================ */

background: rgba(12, 26, 46, 0.7);
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);
border: 1px solid rgba(0, 240, 255, 0.2);
box-shadow: 0 8px 32px rgba(0, 240, 255, 0.1);

/* ================================================
   GLOW EFFECTS
   ================================================ */

/* Text Glow */
text-shadow: 0 0 10px rgba(0, 240, 255, 0.5),
             0 0 20px rgba(0, 240, 255, 0.3);

/* Box Glow */
box-shadow: 0 0 20px rgba(0, 240, 255, 0.5),
            inset 0 0 20px rgba(0, 240, 255, 0.1);

/* Border Glow */
border: 2px solid rgba(0, 240, 255, 0.5);
box-shadow: 0 0 20px rgba(0, 240, 255, 0.3);

/* ================================================
   SMOOTH TRANSITIONS
   ================================================ */

transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);

/* Common transition times:
   0.3s - Quick hover effects
   0.4s - Button transitions
   0.5s - Card animations
   0.6s - Page transitions
*/

/* ================================================
   HOVER EFFECTS
   ================================================ */

/* Card Hover */
transform: translateY(-12px) scale(1.02);
box-shadow: 0 0 40px rgba(0, 240, 255, 0.4);

/* Button Hover */
transform: translateY(-3px) scale(1.05);
box-shadow: 0 0 40px rgba(0, 240, 255, 0.8);

/* Link Hover */
border-bottom: 2px solid linear-gradient(90deg, #00f0ff 0%, #b000ff 100%);

/* ================================================
   RESPONSIVE BREAKPOINTS
   ================================================ */

/* Mobile: 320px - 640px */
@media (max-width: 640px) { }

/* Tablet: 641px - 1024px */
@media (max-width: 1024px) { }

/* Desktop: 1025px+ */
@media (min-width: 1025px) { }

/* ================================================
   CLASS NAMING CONVENTION
   ================================================ */

.card              /* Main content card */
.btn               /* Button element */
.btn-primary       /* Primary button */
.btn-secondary     /* Secondary button */
.section           /* Main section */
.grid-item         /* Grid child element */
.modal             /* Modal dialog */
.alert             /* Alert notification */
.loading           /* Loading state */

/* ================================================
   Z-INDEX HIERARCHY
   ================================================ */

z-index: 1       /* Cards, default elements */
z-index: 100     /* Dropdowns, menus */
z-index: 500     /* Overlays, backdrops */
z-index: 1000    /* Modals, popovers */
z-index: 2000    /* Tooltips, notifications */
z-index: 9998    /* Cursor effects */
z-index: 9999    /* Floating action button */
z-index: 10000   /* Toast notifications */

/* ================================================
   JAVASCRIPT API
   ================================================ */

// Modern Effects
ModernEffects.CodeRainGenerator    // Start code rain
ModernEffects.ParticleSystem       // Floating particles
ModernEffects.MouseTrail           // Mouse trail effect
ModernEffects.ScrollReveal         // Scroll animations
ModernEffects.FloatingActionButton // Back to top button
ModernEffects.CursorGlow          // Cursor glow
ModernEffects.Toast.show()        // Show notification

// Enhancements
Enhancements.Toast.success()       // Success toast
Enhancements.Toast.error()         // Error toast
Enhancements.Toast.warning()       // Warning toast
Enhancements.Toast.info()          // Info toast

// Performance
window.ModernEffects.init()        // Reinitialize effects
window.Enhancements.init()         // Reinitialize enhancements

/* ================================================
   COMMON USAGE PATTERNS
   ================================================ */

/* Make card glow on hover */
.card:hover {
  border-color: rgba(0, 240, 255, 0.5);
  box-shadow: 0 0 40px rgba(0, 240, 255, 0.4);
}

/* Smooth page transition */
body {
  animation: fadeInUp 0.6s ease-out;
}

/* Animated button */
button {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
button:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 0 40px rgba(0, 240, 255, 0.8);
}

/* Form input focus */
input:focus {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(0, 240, 255, 0.6);
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.3);
}

/* ================================================
   PERFORMANCE TIPS
   ================================================ */

/* ✓ Use GPU-accelerated properties */
transform: translateX(0);    /* Good - GPU accelerated */
left: 0;                     /* Bad - CPU intensive */

/* ✓ Use will-change sparingly */
.animation-element {
  will-change: transform, opacity;
}

/* ✓ Optimize animations */
animation: fadeInUp 0.6s ease-out forwards;  /* Good */
animation: fadeInUp 3s ease-out forwards;    /* Bad - too long */

/* ✓ Defer non-critical animations */
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
  }
}

/* ================================================
   ACCESSIBILITY FEATURES
   ================================================ */

/* Focus visible for keyboard navigation */
:focus-visible {
  outline: 2px solid rgba(0, 240, 255, 0.8);
  outline-offset: 2px;
}

/* Respect user motion preferences */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}

/* Color contrast for readability */
color: #f1f5f9;              /* Light text on dark */
background: #020817;         /* Dark background */

/* ================================================
   DEVELOPER NOTES
   ================================================ */

/*
   All animations use cubic-bezier(0.34, 1.56, 0.64, 1)
   This creates a smooth, bouncy feeling rather than linear.
   
   For different feels:
   - ease-out: 0.26, 0.46, 0.52, 1
   - ease-in: 0.13, 0.52, 0.48, 1
   - speed: increase element duration
   - smoothness: adjust bezier curve
   
   Code Rain: Low opacity (0.1) for readability
   Particles: 30 per system for performance
   Cursor Glow: Desktop only (no mobile)
   
   All effects automatically initialize on page load.
   No manual configuration needed!
*/

/* ================================================
   END OF QUICK REFERENCE
   ================================================ */
