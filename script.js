/* ============================================
   STRANGER THINGS WEBSITE - GSAP ANIMATIONS
   OPTIMIZED FOR PERFORMANCE & MOBILE
   ============================================ */

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// ============================================
// SCROLLTRIGGER CONFIGURATION - OPTIMIZED
// ============================================

// Configure ScrollTrigger for better performance
ScrollTrigger.config({
    limitCallbacks: true,
    ignoreMobileResize: true,
    autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load'
});

// Detect mobile/touch devices
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// Refresh ScrollTrigger on window load
window.addEventListener('load', () => {
    // Delay refresh to ensure all content is rendered
    requestAnimationFrame(() => {
        setTimeout(() => {
            ScrollTrigger.refresh(true);
        }, 100);
    });
});

// Additional refresh for mobile devices after orientation change
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        ScrollTrigger.refresh(true);
    }, 500);
});

// Refresh on resize (debounced)
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        ScrollTrigger.refresh();
    }, 200);
}, { passive: true });

// ============================================
// PERFORMANCE UTILITIES - OPTIMIZED
// ============================================

// Throttle function with RAF for smooth animations
const throttle = (func, limit) => {
    let inThrottle;
    let lastFunc;
    let lastRan;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            lastRan = Date.now();
            inThrottle = true;
            setTimeout(() => {
                inThrottle = false;
                if (lastFunc) {
                    lastFunc();
                    lastFunc = null;
                }
            }, limit);
        } else {
            lastFunc = () => func.apply(this, args);
        }
    };
};

// Debounce function
const debounce = (func, wait) => {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
};

// Request Idle Callback polyfill
const requestIdleCallback = window.requestIdleCallback || ((cb) => setTimeout(cb, 1));

// Check if element is in viewport
const isInViewport = (el) => {
    const rect = el.getBoundingClientRect();
    return (
        rect.top < window.innerHeight &&
        rect.bottom > 0 &&
        rect.left < window.innerWidth &&
        rect.right > 0
    );
};

// ============================================
// GLOBAL IMAGE PRELOADER - OPTIMIZED
// ============================================

const ImagePreloader = {
    imagesToLoad: [
        'Challenges Photos/Challenge 1 (1).jpeg',
        'Challenges Photos/Challenge 2.jpeg',
        'Challenges Photos/Challenge 3.jpg',
        'Challenges Photos/Challenge 4.jpeg',
        'Challenges Photos/Challenge 5.jpeg',
        'will1.webp',
        'v1.png',
        'gallery/IMG-20250919-WA0115.png',
        'gallery/IMG-20250919-WA0116.png',
        'gallery/IMG-20250919-WA0117.png',
        'gallery/IMG-20250919-WA0123.png',
        'gallery/WhatsApp Image 2026-01-12 at 13.21.16.jpeg',
        'gallery/WhatsApp Image 2026-01-12 at 13.21.18.jpeg',
        'Team/Sunidhi.jpeg',
        'Team/Prathmesh.jpeg',
        'Team/Mahek.jpg',
        'Team/Aswin.jpeg',
        'Team/Jash.jpeg'
    ],
    
    loadedImages: [],
    totalImages: 0,
    loadedCount: 0,
    
    init() {
        this.totalImages = this.imagesToLoad.length;
        return this.preloadAll();
    },
    
    preloadAll() {
        return new Promise((resolve) => {
            if (this.totalImages === 0) {
                resolve();
                return;
            }
            
            // Load critical images first (above the fold)
            const criticalImages = this.imagesToLoad.slice(0, 2);
            const deferredImages = this.imagesToLoad.slice(2);
            
            // Load critical images immediately
            criticalImages.forEach(src => this.loadImage(src, resolve));
            
            // Defer non-critical images
            requestIdleCallback(() => {
                deferredImages.forEach(src => this.loadImage(src, resolve));
            });
        });
    },
    
    loadImage(src, resolve) {
        const img = new Image();
        img.decoding = 'async';
        img.src = src;
        
        const onComplete = () => {
            this.loadedCount++;
            this.loadedImages.push(img);
            if (this.loadedCount >= this.totalImages) {
                resolve();
            }
        };
        
        img.onload = onComplete;
        img.onerror = onComplete;
    },
    
    getProgress() {
        return this.totalImages > 0 ? (this.loadedCount / this.totalImages) * 100 : 100;
    }
};

// ============================================
// IMAGE SEQUENCE SCROLL SYSTEM
// ============================================

const ImageSequenceScroll = {
    // Configuration
    frameCount: 68, // 000 to 067
    startFrame: 5, // Skip first few black frames, start from bicycle scene
    framePrefix: 'intro/WhatsApp Video 2026-01-12 at 11.20.37_',
    frameExtension: '.png',
    
    // DOM Elements
    canvas: null,
    ctx: null,
    loader: null,
    loaderBar: null,
    loaderPercent: null,
    csiText: null,
    scrollHint: null,
    heroSection: null,
    
    // State
    images: [],
    currentFrame: 0,
    isLoaded: false,
    
    // Initialize
    init() {
        this.cacheElements();
        if (!this.canvas) return;
        
        this.setupCanvas();
        this.preloadImages();
    },
    
    cacheElements() {
        this.canvas = document.getElementById('sequenceCanvas');
        this.loader = document.getElementById('sequenceLoader');
        this.loaderBar = document.getElementById('loaderBarFill');
        this.loaderPercent = document.getElementById('loaderPercent');
        this.csiText = document.getElementById('csiPresentsText');
        this.scrollHint = document.getElementById('sequenceScrollHint');
        this.heroSection = document.getElementById('hero');
        
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
        }
    },
    
    setupCanvas() {
        const resize = () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            if (this.isLoaded && this.images[this.currentFrame]) {
                this.renderFrame(this.currentFrame);
            }
        };
        
        resize();
        // Debounce resize for better performance
        window.addEventListener('resize', debounce(resize, 150));
    },
    
    getFramePath(index) {
        const paddedIndex = String(index).padStart(3, '0');
        return `${this.framePrefix}${paddedIndex}${this.frameExtension}`;
    },
    
    preloadImages() {
        let loadedCount = 0;
        const totalToLoad = this.frameCount + ImagePreloader.totalImages;
        
        // Start preloading other images in parallel
        ImagePreloader.init();
        
        for (let i = 0; i < this.frameCount; i++) {
            const img = new Image();
            img.src = this.getFramePath(i);
            
            img.onload = () => {
                loadedCount++;
                const combinedProgress = Math.round(((loadedCount + ImagePreloader.loadedCount) / totalToLoad) * 100);
                
                if (this.loaderBar) {
                    this.loaderBar.style.width = combinedProgress + '%';
                }
                if (this.loaderPercent) {
                    this.loaderPercent.textContent = combinedProgress + '%';
                }
                
                if (loadedCount === this.frameCount) {
                    this.onLoadComplete();
                }
            };
            
            img.onerror = () => {
                loadedCount++;
                console.warn(`Failed to load frame ${i}`);
                if (loadedCount === this.frameCount) {
                    this.onLoadComplete();
                }
            };
            
            this.images.push(img);
        }
    },
    
    onLoadComplete() {
        this.isLoaded = true;
        
        // Render first visible frame (skip black frames)
        this.renderFrame(this.startFrame);
        this.currentFrame = this.startFrame;
        
        // Hide loader
        setTimeout(() => {
            if (this.loader) {
                this.loader.classList.add('hidden');
            }
            
            // Show scroll hint
            if (this.scrollHint) {
                this.scrollHint.classList.add('visible');
            }
            
            // Setup scroll animation
            this.setupScrollAnimation();
        }, 500);
    },
    
    renderFrame(index) {
        if (!this.ctx || !this.images[index]) return;
        
        const img = this.images[index];
        const canvas = this.canvas;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Calculate cover dimensions
        const imgRatio = img.width / img.height;
        const canvasRatio = canvas.width / canvas.height;
        
        let drawWidth, drawHeight, drawX, drawY;
        
        if (canvasRatio > imgRatio) {
            drawWidth = canvas.width;
            drawHeight = canvas.width / imgRatio;
            drawX = 0;
            drawY = (canvas.height - drawHeight) / 2;
        } else {
            drawHeight = canvas.height;
            drawWidth = canvas.height * imgRatio;
            drawX = (canvas.width - drawWidth) / 2;
            drawY = 0;
        }
        
        this.ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    },
    
    setupScrollAnimation() {
        const self = this;
        const frameObj = { frame: this.startFrame };
        
        // Create scroll trigger for image sequence with smoother scrub
        gsap.to(frameObj, {
            frame: this.frameCount - 1,
            ease: 'none',
            scrollTrigger: {
                trigger: this.heroSection,
                start: 'top top',
                end: 'bottom bottom',
                scrub: 1.5, // Smoother scrub value
                onUpdate: (scrollTrigger) => {
                    const progress = scrollTrigger.progress;
                    // Map progress to frame range (startFrame to frameCount-1)
                    const frameRange = this.frameCount - 1 - this.startFrame;
                    const frameIndex = Math.round(this.startFrame + (progress * frameRange));
                    
                    if (frameIndex !== self.currentFrame) {
                        self.currentFrame = frameIndex;
                        self.renderFrame(frameIndex);
                    }
                    
                    // Update text overlays based on progress
                    self.updateOverlays(progress);
                },
                onLeave: () => {
                    // When leaving the section, ensure last frame is displayed and stays
                    self.renderFrame(self.frameCount - 1);
                    self.freezeLastFrame();
                },
                onEnterBack: () => {
                    // When scrolling back, unfreeze
                    self.unfreezeFrame();
                }
            }
        });
        
        // Pin the canvas and overlay during scroll
        ScrollTrigger.create({
            trigger: this.heroSection,
            start: 'top top',
            end: 'bottom bottom',
            pin: '.sequence-canvas',
            pinSpacing: false
        });
        
        ScrollTrigger.create({
            trigger: this.heroSection,
            start: 'top top',
            end: 'bottom bottom',
            pin: '.sequence-overlay',
            pinSpacing: false
        });
    },
    
    freezeLastFrame() {
        // Create a static image from the last frame and place it at the end of hero section
        const canvas = this.canvas;
        const heroSection = this.heroSection;
        
        // Check if frozen frame already exists
        let frozenFrame = document.getElementById('frozenFrame');
        if (!frozenFrame) {
            frozenFrame = document.createElement('div');
            frozenFrame.id = 'frozenFrame';
            frozenFrame.style.cssText = `
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 100vh;
                background-image: url(${canvas.toDataURL()});
                background-size: cover;
                background-position: center;
                z-index: 0;
            `;
            heroSection.appendChild(frozenFrame);
        } else {
            frozenFrame.style.backgroundImage = `url(${canvas.toDataURL()})`;
        }
        frozenFrame.style.display = 'block';
    },
    
    unfreezeFrame() {
        const frozenFrame = document.getElementById('frozenFrame');
        if (frozenFrame) {
            frozenFrame.style.display = 'none';
        }
    },
    
    updateOverlays(progress) {
        // CSI Presents shows on first page (0-30%) - fades when red frames appear
        // Red frames start around 30% of the sequence
        if (progress < 0.30) {
            this.csiText.classList.add('visible');
            // Start fading at 20%, fully gone by 30%
            if (progress < 0.20) {
                this.csiText.style.opacity = 1;
            } else {
                // Fade from 20% to 30%
                const fadeProgress = (progress - 0.20) / 0.10;
                this.csiText.style.opacity = 1 - fadeProgress;
            }
        } else {
            this.csiText.classList.remove('visible');
            this.csiText.style.opacity = 0;
        }
        
        // Hide scroll hint after scrolling starts
        if (progress > 0.05) {
            this.scrollHint.classList.remove('visible');
        } else if (this.isLoaded) {
            this.scrollHint.classList.add('visible');
        }
    }
};

// Initialize image sequence on DOM ready
// Consolidated into main init function below

// ============================================
// PREMIUM ANIMATION SYSTEM
// ============================================

// Scroll Progress Indicator
function initScrollProgress() {
    const progressBar = document.getElementById('scrollProgress');
    if (!progressBar) return;
    
    // Use throttled scroll handler for better performance
    const updateProgress = throttle(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        progressBar.style.width = scrollPercent + '%';
    }, 16); // ~60fps
    
    window.addEventListener('scroll', updateProgress, { passive: true });
}

// Magnetic Effect for Elements
function initMagneticEffect() {
    const magneticElements = document.querySelectorAll('.magnetic');
    
    magneticElements.forEach(elem => {
        const strength = parseFloat(elem.dataset.strength) || 0.3;
        
        elem.addEventListener('mousemove', (e) => {
            const rect = elem.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            gsap.to(elem, {
                x: x * strength,
                y: y * strength,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
        
        elem.addEventListener('mouseleave', () => {
            gsap.to(elem, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: 'elastic.out(1, 0.5)'
            });
        });
    });
}

// Split Text Animation
function initSplitText() {
    const splitElements = document.querySelectorAll('.split-text');
    
    splitElements.forEach(elem => {
        const text = elem.textContent;
        elem.innerHTML = '';
        
        // Split into characters
        text.split('').forEach((char, i) => {
            const span = document.createElement('span');
            span.className = 'char';
            span.textContent = char === ' ' ? '\u00A0' : char;
            span.style.transitionDelay = `${i * 0.03}s`;
            elem.appendChild(span);
        });
        
        // Create scroll trigger for animation
        ScrollTrigger.create({
            trigger: elem,
            start: 'top 80%',
            onEnter: () => elem.classList.add('animated'),
            once: true
        });
    });
}

// Reveal Animations on Scroll
function initRevealAnimations() {
    const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-scale');
    
    revealElements.forEach(elem => {
        const delay = parseFloat(elem.dataset.delay) || 0;
        
        ScrollTrigger.create({
            trigger: elem,
            start: 'top 85%',
            onEnter: () => {
                setTimeout(() => {
                    elem.classList.add('revealed');
                }, delay * 1000);
            },
            once: true
        });
    });
}

// Stagger Animation for Groups
function initStaggerAnimations() {
    const staggerGroups = document.querySelectorAll('.stagger-group');
    
    staggerGroups.forEach(group => {
        const items = group.querySelectorAll('.stagger-item');
        
        ScrollTrigger.create({
            trigger: group,
            start: 'top 80%',
            onEnter: () => {
                items.forEach((item, i) => {
                    setTimeout(() => {
                        item.classList.add('animated');
                    }, i * 100);
                });
            },
            once: true
        });
    });
}

// 3D Tilt Effect for Prize Cards Only (removed from challenge rows)
function initTiltEffect() {
    // Only apply tilt to prize cards, not challenge rows
    const tiltCards = document.querySelectorAll('.prize-card');
    
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 25;
            const rotateY = (centerX - x) / 25;
            
            gsap.to(card, {
                rotateX: rotateX,
                rotateY: rotateY,
                transformPerspective: 1000,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
        
        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                rotateX: 0,
                rotateY: 0,
                duration: 0.5,
                ease: 'power2.out'
            });
        });
    });
}

// Navbar Hide/Show on Scroll
function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    
    let lastScroll = 0;
    const scrollThreshold = 100;
    
    // Use throttled scroll handler for better performance
    const handleNavbarScroll = throttle(() => {
        const currentScroll = window.scrollY;
        
        // Add scrolled class for background
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Hide/show navbar
        if (currentScroll > lastScroll && currentScroll > scrollThreshold) {
            navbar.classList.add('hidden');
        } else {
            navbar.classList.remove('hidden');
        }
        
        lastScroll = currentScroll;
    }, 16); // ~60fps
    
    window.addEventListener('scroll', handleNavbarScroll, { passive: true });
}

// Parallax Effect for Hero
function initHeroParallax() {
    const layers = document.querySelectorAll('.hero-parallax-layer');
    const heroContent = document.querySelector('.hero-center-content');
    
    if (layers.length === 0) return;
    
    gsap.to(layers[0], {
        y: 100,
        ease: 'none',
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1
        }
    });
    
    gsap.to(layers[1], {
        y: 150,
        ease: 'none',
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1.5
        }
    });
    
    // Fade out hero content on scroll
    if (heroContent) {
        gsap.to(heroContent, {
            opacity: 0,
            y: -50,
            ease: 'none',
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: '50% top',
                scrub: 1
            }
        });
    }
}

// Premium Cursor Enhancement
function initPremiumCursor() {
    const cursor = document.getElementById('cursor');
    const cursorDot = document.getElementById('cursorDot');
    
    if (!cursor || !cursorDot) return;
    
    // Add hover class on interactive elements (removed challenge-row and prize-card)
    const interactiveElements = document.querySelectorAll('a, button, .magnetic');
    
    interactiveElements.forEach(elem => {
        elem.addEventListener('mouseenter', () => {
            cursor.classList.add('hover');
        });
        
        elem.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
        });
    });
    
    // Click effect
    document.addEventListener('mousedown', () => {
        cursor.classList.add('click');
    });
    
    document.addEventListener('mouseup', () => {
        cursor.classList.remove('click');
    });
}

// Section Reveal Animations
function initSectionAnimations() {
    // NOTE: Challenge rows (.challenge-row) no longer exist in HTML
    // The HTML now uses full-page .challenge-page sections
    // Challenge page animations are handled by initChallengePageAnimations()
    
    // NOTE: Prize cards animation is now handled by the pinned scroll timeline
    // in the PRIZE POOL ANIMATION section - do not duplicate here
    
    // Section titles animation
    const sectionTitles = document.querySelectorAll('.section-title');
    
    sectionTitles.forEach(title => {
        gsap.fromTo(title,
            { 
                y: 50, 
                opacity: 0,
                scale: 0.95
            },
            {
                y: 0,
                opacity: 1,
                scale: 1,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: title,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    });
    
    // Gallery items animation - staggered reveal
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach((item, index) => {
        gsap.fromTo(item,
            { 
                y: 80, 
                opacity: 0,
                scale: 0.9
            },
            {
                y: 0,
                opacity: 1,
                scale: 1,
                duration: 0.8,
                delay: index * 0.1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.gallery-grid',
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    });
    
    // Team members - NO GSAP animations per user request
    // Team section uses CSS-only animations defined in styles.css
    
    // About cards animation
    const aboutCards = document.querySelectorAll('.about-card');
    
    aboutCards.forEach((card, index) => {
        gsap.fromTo(card,
            { 
                y: 60, 
                opacity: 0,
                scale: 0.95
            },
            {
                y: 0,
                opacity: 1,
                scale: 1,
                duration: 0.8,
                delay: index * 0.2,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.about-grid',
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    });
    
    // Sponsor items animation
    const sponsorItems = document.querySelectorAll('.sponsor-item');
    
    sponsorItems.forEach((item, index) => {
        gsap.fromTo(item,
            { 
                x: -50, 
                opacity: 0
            },
            {
                x: 0,
                opacity: 1,
                duration: 0.6,
                delay: index * 0.1,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: '.sponsors-marquee-container',
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                }
            }
        );
    });
    
    // Footer - No GSAP animation, keeping it simple
}

// Smooth Scroll Links - Fixed for proper section targeting
function initSmoothScrollLinks() {
    const links = document.querySelectorAll('a[href^="#"]');
    const navbar = document.getElementById('navbar');
    const navbarHeight = navbar ? navbar.offsetHeight : 80;
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            const target = document.querySelector(href);
            
            if (target) {
                // Close mobile menu if open
                const navLinks = document.getElementById('navLinks');
                const mobileToggle = document.getElementById('mobileMenuToggle');
                if (navLinks && navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    mobileToggle.classList.remove('active');
                }
                
                // Update active state
                document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                // Calculate proper scroll position
                // Account for any pinned elements by getting the actual element position
                const targetRect = target.getBoundingClientRect();
                const absoluteTop = targetRect.top + window.pageYOffset;
                
                // Scroll to target with proper offset
                gsap.to(window, {
                    duration: 1,
                    scrollTo: {
                        y: absoluteTop - navbarHeight - 20,
                        autoKill: false
                    },
                    ease: 'power2.inOut'
                });
            }
        });
    });
    
    // Update active nav link on scroll - improved detection
    const updateActiveLink = throttle(() => {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY;
        const windowHeight = window.innerHeight;
        
        let currentSection = null;
        
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const sectionTop = rect.top;
            const sectionBottom = rect.bottom;
            
            // Check if section is in viewport (at least 30% visible from top)
            if (sectionTop <= windowHeight * 0.3 && sectionBottom > navbarHeight + 50) {
                currentSection = section.getAttribute('id');
            }
        });
        
        if (currentSection) {
            document.querySelectorAll('.nav-links a').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentSection}`) {
                    link.classList.add('active');
                }
            });
        }
    }, 50); // Update every 50ms for smoother highlighting
    
    window.addEventListener('scroll', updateActiveLink, { passive: true });
    
    // Initial call to set active state on page load
    setTimeout(updateActiveLink, 200);
}

// Initialize all premium animations
function initPremiumAnimations() {
    initScrollProgress();
    initMagneticEffect();
    initSplitText();
    initRevealAnimations();
    initStaggerAnimations();
    initTiltEffect();
    initNavbarScroll();
    initHeroParallax();
    initPremiumCursor();
    initSectionAnimations();
    initSmoothScrollLinks();
}

// Run after DOM is ready - consolidated into main init function

// ============================================
// HERO VIDEO SPEED CONTROL
// ============================================

const heroVideo = document.getElementById('heroVideo');
if (heroVideo) {
    heroVideo.playbackRate = 1.0; // Normal speed for smooth playback
}

// ============================================
// HELL BACKGROUND WEBGL FOR CHALLENGES (Stranger Things Style)
// ============================================

const vertexHellSource = `
  attribute vec4 a_position;
  void main() {
    gl_Position = a_position;
  }
`;

const fragmentHellSource = `
precision mediump float;

uniform vec2 iResolution;
uniform float iTime;
uniform vec2 iMouse;
uniform vec3 uColor;

void mainImage(out vec4 fragColor, in vec2 fragCoord){
    vec2 uv = fragCoord / iResolution;
    vec2 centeredUV = (2.0 * fragCoord - iResolution.xy) / min(iResolution.x, iResolution.y);

    float time = iTime * 0.5;

    // Normalize mouse input (0.0 - 1.0)
    vec2 mouse = iMouse / iResolution;
    vec2 rippleCenter = 2.0 * mouse - 1.0; // remap to -1.0 ~ 1.0

    vec2 distortion = centeredUV;
    for (float i = 1.0; i < 8.0; i++) {
        distortion.x += 0.5 / i * cos(i * 2.0 * distortion.y + time + rippleCenter.x * 3.1415);
        distortion.y += 0.5 / i * cos(i * 2.0 * distortion.x + time + rippleCenter.y * 3.1415);
    }

    float wave = abs(sin(distortion.x + distortion.y + time));
    float glow = smoothstep(0.9, 0.2, wave);

    fragColor = vec4(uColor * glow, 1.0);
}

void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
`;

function initHellBackground() {
    const canvas = document.getElementById('smokeyBgCanvas');
    const smokeyWrapper = document.getElementById('smokeyWrapper');
    if (!canvas || !smokeyWrapper) return;

    const gl = canvas.getContext('webgl');
    if (!gl) {
        console.error('WebGL not supported');
        return;
    }

    const compileShader = (type, source) => {
        const shader = gl.createShader(type);
        if (!shader) return null;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    };

    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexHellSource);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentHellSource);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program linking error:', gl.getProgramInfoLog(program));
        return;
    }

    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
        gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const iResolutionLocation = gl.getUniformLocation(program, 'iResolution');
    const iTimeLocation = gl.getUniformLocation(program, 'iTime');
    const iMouseLocation = gl.getUniformLocation(program, 'iMouse');
    const uColorLocation = gl.getUniformLocation(program, 'uColor');

    let startTime = Date.now();
    let isVisible = false;
    let mouseX = 0;
    let mouseY = 0;
    let isHovering = false;

    // Stranger Things red color (RGB normalized) - #e50914
    const stColor = { r: 0.898, g: 0.035, b: 0.078 };

    // Mouse tracking
    canvas.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = event.clientX - rect.left;
        mouseY = event.clientY - rect.top;
    });

    canvas.addEventListener('mouseenter', () => {
        isHovering = true;
    });

    canvas.addEventListener('mouseleave', () => {
        isHovering = false;
        mouseX = 0;
        mouseY = 0;
    });

    const render = () => {
        if (!isVisible) {
            requestAnimationFrame(render);
            return;
        }

        const width = window.innerWidth;
        const height = window.innerHeight;

        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
            gl.viewport(0, 0, width, height);
        }

        const currentTime = (Date.now() - startTime) / 1000;

        gl.uniform2f(iResolutionLocation, width, height);
        gl.uniform1f(iTimeLocation, currentTime);
        gl.uniform2f(iMouseLocation, isHovering ? mouseX : 0, isHovering ? height - mouseY : 0);
        gl.uniform3f(uColorLocation, stColor.r, stColor.g, stColor.b);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
        requestAnimationFrame(render);
    };

    // Use Intersection Observer to show/hide canvas
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            isVisible = entry.isIntersecting;
            canvas.style.opacity = entry.isIntersecting ? '1' : '0';
            const blurOverlay = document.querySelector('.smokey-blur-overlay');
            if (blurOverlay) {
                blurOverlay.style.opacity = entry.isIntersecting ? '1' : '0';
            }
        });
    }, { threshold: 0.01 });

    observer.observe(smokeyWrapper);

    render();
}

// Initialize hell background - consolidated into main init function

// ============================================
// SMOOTH SCROLLING WITH LENIS
// ============================================

let lenis = null;

try {
    if (typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            smoothTouch: false,
            touchMultiplier: 2,
        });

        // Connect Lenis to GSAP ScrollTrigger
        lenis.on('scroll', ScrollTrigger.update);

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });

        gsap.ticker.lagSmoothing(0);
    }
} catch (e) {
    console.warn('Lenis smooth scroll failed to initialize:', e);
}

// ============================================
// INTRO SCREEN ANIMATION - EPIC STRANGER THINGS STYLE
// ============================================

const introScreen = document.getElementById('introScreen');
const introGradient = document.querySelector('.intro-gradient');
const introLines = document.querySelector('.intro-lines');
const introLights = document.querySelector('.intro-lights');
const introPortal = document.querySelector('.intro-portal');
const introScanlines = document.querySelector('.intro-scanlines');
const introParticles = document.getElementById('introParticles');
const stepCSI = document.querySelector('.step-csi');
const stepPresents = document.querySelector('.step-presents');
const stepMain = document.querySelector('.step-main');
const introLoader = document.querySelector('.intro-loader');
const loaderBar = document.querySelector('.loader-bar');
const csiText = document.querySelector('.csi-text');
const csiUnderline = document.querySelector('.csi-underline');
const presentsLine = document.querySelector('.presents-line');
const strangerWord = document.querySelector('.stranger-word');
const techWord = document.querySelector('.tech-word');
const introSubtitle = document.querySelector('.intro-subtitle');

// Create floating particles
function createIntroParticles() {
    if (!introParticles) return;

    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'intro-particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.width = (Math.random() * 4 + 2) + 'px';
        particle.style.height = particle.style.width;
        introParticles.appendChild(particle);
    }
}

// Animate particles floating up
function animateIntroParticles() {
    const particles = document.querySelectorAll('.intro-particle');
    particles.forEach((particle, i) => {
        gsap.to(particle, {
            opacity: Math.random() * 0.8 + 0.2,
            y: -window.innerHeight - 100,
            x: (Math.random() - 0.5) * 200,
            duration: Math.random() * 4 + 3,
            delay: Math.random() * 2,
            ease: 'none',
            repeat: -1,
            onRepeat: () => {
                gsap.set(particle, {
                    y: window.innerHeight + 50,
                    x: 0,
                    left: Math.random() * 100 + '%'
                });
            }
        });
    });
}

function playIntroAnimation() {
    // Guard: Don't run if intro elements don't exist
    if (!introScreen) {
        animateHeroContent();
        return;
    }
    
    // Create particles
    createIntroParticles();

    // Create master timeline
    const introTl = gsap.timeline();

    // Activate background elements with stagger
    setTimeout(() => {
        if (introGradient) introGradient.classList.add('active');
    }, 100);

    setTimeout(() => {
        if (introLines) introLines.classList.add('active');
        if (introScanlines) introScanlines.classList.add('active');
    }, 300);

    setTimeout(() => {
        if (introLoader) introLoader.classList.add('active');
        animateIntroParticles();
    }, 500);

    // Animate loader bar
    if (loaderBar) {
        gsap.to(loaderBar, {
            width: '100%',
            duration: 5,
            ease: 'power1.inOut'
        });
    }

    // ===== STEP 1: CSI with glitch effect =====
    if (stepCSI) {
        introTl.to(stepCSI, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            delay: 0.5
        });
    }

    // Add glitch effect to CSI
    introTl.add(() => {
        if (csiText) csiText.classList.add('glitch');
    }, '-=0.3');

    // Animate CSI underline
    introTl.to(csiUnderline, {
        width: '150px',
        duration: 0.5,
        ease: 'power2.out'
    }, '-=0.2');

    // Flicker the lights
    introTl.add(() => {
        if (introLights) introLights.classList.add('active');
    }, '-=0.3');

    // CSI holds, then fades with glitch
    introTl.to(stepCSI, {
        opacity: 0,
        scale: 1.1,
        filter: 'blur(10px)',
        duration: 0.4,
        ease: 'power2.in',
        delay: 0.8,
        onStart: () => {
            // Quick glitch burst
            gsap.to(csiText, {
                x: '+=5',
                duration: 0.05,
                repeat: 5,
                yoyo: true
            });
        }
    });

    // Remove glitch class
    introTl.add(() => {
        if (csiText) csiText.classList.remove('glitch');
    });

    // ===== STEP 2: "presents" with typewriter effect =====
    introTl.set(stepPresents, { opacity: 1, y: 0 });

    // Typewriter effect for presents
    introTl.fromTo('.presents-text',
        {
            clipPath: 'inset(0 100% 0 0)',
            opacity: 1
        },
        {
            clipPath: 'inset(0 0% 0 0)',
            duration: 0.8,
            ease: 'steps(8)'
        }
    );

    // Animate presents line
    introTl.to(presentsLine, {
        width: '120px',
        duration: 0.4,
        ease: 'power2.out'
    }, '-=0.2');

    // "presents" fades
    introTl.to(stepPresents, {
        opacity: 0,
        y: -30,
        duration: 0.4,
        ease: 'power2.in',
        delay: 0.6
    });

    // ===== STEP 3: STRANGER TECH epic reveal =====

    // Activate portal cracks
    introTl.add(() => {
        if (introPortal) introPortal.classList.add('active');
    });

    // Animate portal cracks appearing
    introTl.to('.portal-crack', {
        opacity: 1,
        scaleX: 1,
        duration: 0.3,
        stagger: 0.1,
        ease: 'power4.out'
    });

    // Screen shake effect
    introTl.to(introScreen, {
        x: '+=3',
        duration: 0.05,
        repeat: 10,
        yoyo: true,
        ease: 'none'
    }, '-=0.3');

    // Show main title container
    introTl.set(stepMain, { opacity: 1, y: 0 });

    // STRANGER word reveal from below with mask
    introTl.fromTo(strangerWord,
        {
            y: 100,
            opacity: 0,
            scale: 0.8
        },
        {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.8,
            ease: 'power4.out'
        }
    );

    // Add glitch to STRANGER
    introTl.add(() => {
        if (strangerWord) strangerWord.classList.add('glitch');
    }, '-=0.4');

    // TECH word reveal
    introTl.fromTo(techWord,
        {
            y: 100,
            opacity: 0,
            scale: 0.8
        },
        {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.8,
            ease: 'power4.out'
        }, '-=0.5'
    );

    // Add glitch to TECH
    introTl.add(() => {
        if (techWord) techWord.classList.add('glitch');
    }, '-=0.4');

    // Epic glow pulse
    introTl.to('.stranger-word, .tech-word', {
        textShadow: '0 0 30px rgba(255, 50, 50, 1), 0 0 60px rgba(229, 9, 20, 1), 0 0 100px rgba(229, 9, 20, 0.8), 0 0 150px rgba(229, 9, 20, 0.6)',
        duration: 0.4,
        ease: 'power2.out'
    }, '-=0.2');

    // Settle glow
    introTl.to('.stranger-word, .tech-word', {
        textShadow: '0 0 10px rgba(255, 50, 50, 0.8), 0 0 30px rgba(229, 9, 20, 0.6), 0 0 60px rgba(229, 9, 20, 0.4), 0 0 100px rgba(229, 9, 20, 0.2)',
        duration: 0.6,
        ease: 'power2.inOut'
    });

    // Remove glitch classes
    introTl.add(() => {
        if (strangerWord) strangerWord.classList.remove('glitch');
        if (techWord) techWord.classList.remove('glitch');
    }, '-=0.3');

    // Fade in subtitle
    introTl.to(introSubtitle, {
        color: 'rgba(255, 255, 255, 0.6)',
        duration: 0.8,
        ease: 'power2.out'
    }, '-=0.4');

    // Fade out portal cracks
    introTl.to('.portal-crack', {
        opacity: 0,
        duration: 0.5
    }, '-=0.6');

    // Hold main title
    introTl.to({}, { duration: 1 });

    // ===== EXIT ANIMATION =====

    // Zoom into the title
    introTl.to('.main-title', {
        scale: 1.5,
        duration: 0.8,
        ease: 'power2.in'
    });

    // Fade out everything
    introTl.to(introScreen, {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.inOut',
        onComplete: () => {
            if (introScreen) introScreen.style.display = 'none';
            // Animate hero content after intro
            animateHeroContent();
        }
    }, '-=0.4');
}

// Animate hero content after intro finishes
function animateHeroContent() {
    const heroElements = document.querySelectorAll('.hero-animate');
    
    heroElements.forEach(elem => {
        const delay = parseFloat(elem.dataset.delay) || 0;
        
        setTimeout(() => {
            elem.classList.add('visible');
        }, delay * 1000);
    });
}

// Start intro animation when page loads - only if intro screen exists
window.addEventListener('load', () => {
    // Only run intro animation if the intro screen element exists
    if (introScreen) {
        playIntroAnimation();
    } else {
        // If no intro screen, just animate hero content directly
        animateHeroContent();
    }
});

// DOM Elements
const audioControl = document.getElementById('audioControl');
const bgMusic = document.getElementById('bgMusic');
const startBtn = document.getElementById('startBtn');
const glitchOverlay = document.querySelector('.glitch-overlay');
const particlesContainer = document.getElementById('particles');
const cursor = document.getElementById('cursor');
const cursorDot = document.getElementById('cursorDot');

// Custom Cursor - Works on both desktop and mobile
document.addEventListener('mousemove', (e) => {
    if (cursor) {
        gsap.to(cursor, {
            x: e.clientX - 10,
            y: e.clientY - 10,
            duration: 0.2,
            ease: 'power2.out'
        });
    }
    if (cursorDot) {
        gsap.to(cursorDot, {
            x: e.clientX - 2.5,
            y: e.clientY - 2.5,
            duration: 0.1
        });
    }
});

// Touch support for custom cursor on mobile
document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
        const touch = e.touches[0];
        if (cursor) {
            gsap.to(cursor, {
                x: touch.clientX - 10,
                y: touch.clientY - 10,
                duration: 0.1,
                ease: 'power2.out'
            });
        }
        if (cursorDot) {
            gsap.to(cursorDot, {
                x: touch.clientX - 2.5,
                y: touch.clientY - 2.5,
                duration: 0.05
            });
        }
    }
}, { passive: true });

// Show cursor on touch start
document.addEventListener('touchstart', (e) => {
    if (e.touches.length > 0) {
        const touch = e.touches[0];
        if (cursor) {
            cursor.style.opacity = '1';
            gsap.set(cursor, { x: touch.clientX - 10, y: touch.clientY - 10 });
        }
        if (cursorDot) {
            cursorDot.style.opacity = '1';
            gsap.set(cursorDot, { x: touch.clientX - 2.5, y: touch.clientY - 2.5 });
        }
    }
}, { passive: true });

// Hide cursor on touch end (optional - comment out to keep visible)
document.addEventListener('touchend', () => {
    // Keep cursor visible after touch
    // if (cursor) cursor.style.opacity = '0.5';
}, { passive: true });

// Cursor hover effect
document.querySelectorAll('a, button, .round-card, .sponsor-card').forEach(el => {
    el.addEventListener('mouseenter', () => cursor && cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor && cursor.classList.remove('hover'));
});

// Audio Control with Web Audio API for maximum volume boost
let isMuted = true;
let audioContext = null;
let gainNode = null;

if (bgMusic && audioControl) {
    bgMusic.volume = 1.0; // Max normal volume
    
    // Setup Web Audio API for volume boost
    function setupAudioBoost() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContext.createMediaElementSource(bgMusic);
            gainNode = audioContext.createGain();
            gainNode.gain.value = 3.0; // 3x volume boost (amplified!)
            source.connect(gainNode);
            gainNode.connect(audioContext.destination);
        }
    }
    
    audioControl.addEventListener('click', () => {
        isMuted = !isMuted;
        if (isMuted) {
            bgMusic.pause();
            audioControl.classList.remove('playing');
            audioControl.classList.add('muted');
        } else {
            // Setup audio boost on first play
            setupAudioBoost();
            
            // Resume audio context if suspended
            if (audioContext && audioContext.state === 'suspended') {
                audioContext.resume();
            }
            
            // Play audio with user interaction (required by browsers)
            bgMusic.play().then(() => {
                console.log('Audio playing at boosted volume');
                audioControl.classList.remove('muted');
                audioControl.classList.add('playing');
            }).catch(err => {
                console.error('Audio play failed:', err);
            });
        }
    });
}

if (startBtn) {
    startBtn.addEventListener('click', () => {
        gsap.to(window, {
            duration: 1,
            scrollTo: '#rounds',
            ease: 'power2.inOut'
        });
    });
}

// Glitch Effect
function triggerGlitch() {
    if (!glitchOverlay) return;
    glitchOverlay.classList.add('active');
    setTimeout(() => {
        glitchOverlay.classList.remove('active');
    }, 200);
}

// Random Glitch
setInterval(() => {
    if (Math.random() > 0.7) {
        triggerGlitch();
    }
}, 5000);

// Lightning Effect - Realistic forked lightning with GSAP
function triggerLightning() {
    const lightnings = document.querySelectorAll('.lightning-svg');
    const flash = document.querySelector('.lightning-flash');
    const flashIntense = document.querySelector('.lightning-flash-intense');
    const hero = document.querySelector('.hero');

    // Pick 1-3 random lightning bolts to flash
    const numBolts = Math.floor(Math.random() * 3) + 1;
    const indices = [];
    while (indices.length < numBolts && indices.length < lightnings.length) {
        const idx = Math.floor(Math.random() * lightnings.length);
        if (!indices.includes(idx)) indices.push(idx);
    }

    // Determine if this is a close strike (more intense)
    const isCloseStrike = Math.random() > 0.7;

    indices.forEach((idx, i) => {
        const bolt = lightnings[idx];
        const delay = i * (50 + Math.random() * 100);

        setTimeout(() => {
            // Create realistic multi-flash pattern
            const flashPattern = gsap.timeline();

            // Initial bright flash
            flashPattern.to(bolt, {
                opacity: 1,
                duration: 0.05,
                ease: 'power4.out'
            });

            // Quick dim
            flashPattern.to(bolt, {
                opacity: 0.15,
                duration: 0.03,
                ease: 'power2.in'
            });

            // Second flash (aftershock)
            flashPattern.to(bolt, {
                opacity: isCloseStrike ? 1 : 0.85,
                duration: 0.04,
                ease: 'power4.out'
            });

            // Another dim
            flashPattern.to(bolt, {
                opacity: 0.1,
                duration: 0.05,
                ease: 'power2.in'
            });

            // Third flash (sometimes)
            if (Math.random() > 0.4) {
                flashPattern.to(bolt, {
                    opacity: 0.7,
                    duration: 0.03,
                    ease: 'power4.out'
                });
                flashPattern.to(bolt, {
                    opacity: 0.05,
                    duration: 0.06,
                    ease: 'power2.in'
                });
            }

            // Final flicker and fade
            flashPattern.to(bolt, {
                opacity: Math.random() * 0.4 + 0.2,
                duration: 0.04,
                ease: 'power2.out'
            });

            flashPattern.to(bolt, {
                opacity: 0,
                duration: 0.15,
                ease: 'power2.in'
            });
        }, delay);
    });

    // Screen flash effect
    if (flash) {
        const flashTl = gsap.timeline();

        flashTl.to(flash, {
            opacity: isCloseStrike ? 0.7 : 0.4,
            duration: 0.05,
            ease: 'power4.out'
        });
        flashTl.to(flash, {
            opacity: 0.1,
            duration: 0.04,
            ease: 'power2.in'
        });
        flashTl.to(flash, {
            opacity: isCloseStrike ? 0.5 : 0.3,
            duration: 0.04,
            ease: 'power4.out'
        });
        flashTl.to(flash, {
            opacity: 0,
            duration: 0.2,
            ease: 'power2.in'
        });
    }

    // Intense flash for close strikes
    if (flashIntense && isCloseStrike) {
        gsap.to(flashIntense, {
            opacity: 0.25,
            duration: 0.03,
            ease: 'power4.out',
            onComplete: () => {
                gsap.to(flashIntense, {
                    opacity: 0,
                    duration: 0.15,
                    ease: 'power2.in'
                });
            }
        });
    }

    // Hero brightness flash
    if (hero) {
        const brightnessTl = gsap.timeline();

        brightnessTl.to(hero, {
            filter: isCloseStrike ? 'brightness(1.8)' : 'brightness(1.4)',
            duration: 0.05,
            ease: 'power4.out'
        });
        brightnessTl.to(hero, {
            filter: 'brightness(1.1)',
            duration: 0.04,
            ease: 'power2.in'
        });
        brightnessTl.to(hero, {
            filter: isCloseStrike ? 'brightness(1.5)' : 'brightness(1.25)',
            duration: 0.04,
            ease: 'power4.out'
        });
        brightnessTl.to(hero, {
            filter: 'brightness(1)',
            duration: 0.2,
            ease: 'power2.inOut'
        });
    }
}

// Random lightning strikes with varying intervals
function scheduleLightning() {
    // Random interval between 2-6 seconds
    const interval = 2000 + Math.random() * 4000;

    setTimeout(() => {
        if (Math.random() > 0.3) { // 70% chance of lightning
            triggerLightning();

            // Sometimes trigger a second strike shortly after
            if (Math.random() > 0.6) {
                setTimeout(triggerLightning, 300 + Math.random() * 500);
            }
        }
        scheduleLightning();
    }, interval);
}

// Start lightning
scheduleLightning();

// Initial lightning on page load
setTimeout(triggerLightning, 1500);

// Create Particles
function createParticles() {
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particlesContainer.appendChild(particle);

        gsap.to(particle, {
            y: -window.innerHeight,
            x: (Math.random() - 0.5) * 200,
            opacity: 0,
            duration: Math.random() * 10 + 5,
            repeat: -1,
            delay: Math.random() * 5,
            ease: 'none'
        });
    }
}

createParticles();

// ============================================
// GSAP ANIMATIONS
// ============================================

// Initial Page Load Animation - Only for elements that exist
const loadTimeline = gsap.timeline();

loadTimeline
    .from('.navbar', {
        y: -100,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
    });

// Section Headers Animation - Exclude sponsors and prize sections (handled separately)
gsap.utils.toArray('.section-header').forEach(header => {
    // Skip sponsors section header - it has its own animation
    if (header.closest('.sponsors-section')) return;
    // Skip prize section header - it should always be visible
    if (header.closest('.prize-section')) return;

    // Set initial state
    gsap.set(header, { opacity: 0, y: 50 });

    // Animate to visible state on scroll
    gsap.to(header, {
        scrollTrigger: {
            trigger: header,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
        },
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out'
    });
});

// ============================================
// ROUNDS SECTION 3D BACKGROUND ANIMATIONS
// ============================================

// 3D Depth Orbs - Floating animation with depth
gsap.utils.toArray('.depth-orb').forEach((orb, index) => {
    // Initial random position
    gsap.set(orb, {
        x: Math.random() * 30 - 15,
        y: Math.random() * 30 - 15
    });

    // Continuous 3D floating
    gsap.to(orb, {
        y: `-=${50 + Math.random() * 80}`,
        x: `+=${Math.random() * 60 - 30}`,
        z: `+=${Math.random() * 50 - 25}`,
        scale: 1 + Math.random() * 0.2,
        duration: 15 + Math.random() * 10,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: index * 2
    });

    // Pulsing glow effect
    gsap.to(orb, {
        opacity: 0.3 + Math.random() * 0.4,
        duration: 4 + Math.random() * 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: Math.random() * 2
    });
});

// Floating Rings - 3D rotation with parallax
gsap.utils.toArray('.floating-ring').forEach((ring, index) => {
    // Continuous rotation
    gsap.to(ring, {
        rotationZ: index % 2 === 0 ? 360 : -360,
        duration: 40 + index * 10,
        repeat: -1,
        ease: 'none'
    });

    // Subtle floating
    gsap.to(ring, {
        y: `-=${30 + Math.random() * 40}`,
        x: `+=${Math.random() * 30 - 15}`,
        duration: 12 + Math.random() * 8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: index * 1.5
    });
});

// Portal Glow - Breathing effect (only if element exists)
const portalGlow = document.querySelector('.portal-glow');
if (portalGlow) {
    gsap.to(portalGlow, {
        scale: 1.3,
        opacity: 0.9,
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
    });
}

// Energy Lines - Only if elements exist
const energyLines = document.querySelectorAll('.energy-line');
if (energyLines.length > 0) {
    energyLines.forEach((line, index) => {
        const isLeft = index % 2 === 0;
        gsap.set(line, {
            x: isLeft ? -400 : window.innerWidth + 100,
            opacity: 0
        });
        gsap.to(line, {
            x: isLeft ? window.innerWidth + 400 : -400,
            opacity: 0.8,
            duration: 3 + Math.random() * 2,
            repeat: -1,
            repeatDelay: 5 + Math.random() * 10,
            ease: 'power1.inOut',
            delay: index * 4
        });
    });
}

// ============================================
// FLOATING SPORES ANIMATIONS - Only if elements exist
// ============================================

const floatingSpores = document.querySelectorAll('.floating-spore');
if (floatingSpores.length > 0) {
    floatingSpores.forEach((spore, index) => {
        gsap.set(spore, {
            x: Math.random() * 50 - 25,
            y: Math.random() * 50 - 25
        });
        gsap.to(spore, {
            y: `-=${100 + Math.random() * 150}`,
            x: `+=${Math.random() * 100 - 50}`,
            duration: 10 + Math.random() * 10,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: index * 0.5
        });
        gsap.to(spore, {
            scale: 1.5,
            opacity: 0.9,
            duration: 2 + Math.random() * 2,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: Math.random() * 2
        });
    });

    // Red pulse breathing animation
    gsap.utils.toArray('.red-pulse').forEach((pulse, index) => {
        gsap.to(pulse, {
            scale: 1.4,
            opacity: 0.5,
            duration: 6 + index * 2,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: index * 3
        });
    });
}

// ============================================
// QUOTE SECTION ANIMATIONS - REMOVED
// ============================================
// NOTE: The old challenge-row animations have been removed as the HTML
// now uses full-page .challenge-page sections instead of .challenge-row elements.
// The new challenge pages have their own animations in initChallengePageAnimations().

// Title glitch effect - disabled to not interfere with TextScramble
/*
setInterval(() => {
    const titles = document.querySelectorAll('.challenge-title');
    const randomTitle = titles[Math.floor(Math.random() * titles.length)];

    if (randomTitle && Math.random() > 0.7) {
        gsap.to(randomTitle, {
            x: 5,
            skewX: 3,
            textShadow: '-3px 0 0 rgba(0, 255, 255, 0.5), 3px 0 0 rgba(255, 0, 100, 0.5)',
            duration: 0.05,
            onComplete: () => {
                gsap.to(randomTitle, {
                    x: -3,
                    skewX: -2,
                    duration: 0.05,
                    onComplete: () => {
                        gsap.to(randomTitle, {
                            x: 0,
                            skewX: 0,
                            textShadow: '0 0 30px rgba(229, 9, 20, 0.3)',
                            duration: 0.1
                        });
                    }
                });
            }
        });
    }
}, 2500);
*/

// ============================================
// QUOTE SECTION - REMOVED (elements don't exist in current HTML)
// ============================================
// NOTE: The quote section animations have been removed as the HTML
// no longer contains .quote-section, .quote-content, .quote-marks,
// .main-quote, .quote-author, .quote-divider, .event-description,
// or .quote-bg elements.

// ============================================
// SPONSORS SECTION - ANIMATION
// ============================================

const sponsorsSection = document.querySelector('.sponsors-section');

if (sponsorsSection) {
    // Section header animation - ensure visibility first
    const sponsorHeader = sponsorsSection.querySelector('.section-header');
    if (sponsorHeader) {
        // Ensure header is always visible
        sponsorHeader.style.opacity = '1';
        sponsorHeader.style.visibility = 'visible';

        const sectionTag = sponsorHeader.querySelector('.section-tag');
        const sectionTitle = sponsorHeader.querySelector('.section-title');
        const sectionSubtitle = sponsorHeader.querySelector('.section-subtitle');

        if (sectionTag) sectionTag.style.opacity = '1';
        if (sectionTitle) sectionTitle.style.opacity = '1';
        if (sectionSubtitle) sectionSubtitle.style.opacity = '1';

        // Simple entrance animation using 'to' instead of 'from'
        gsap.set(sponsorHeader, { y: 40 });
        gsap.to(sponsorHeader, {
            scrollTrigger: {
                trigger: sponsorsSection,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            y: 0,
            duration: 0.8,
            ease: 'power3.out'
        });
    }
}

// Sponsor Cards - Smooth Animation
gsap.utils.toArray('.sponsor-card').forEach((card, index) => {
    // Ensure cards are visible by default
    card.style.opacity = '1';
    card.style.visibility = 'visible';

    // Set initial position for animation
    gsap.set(card, { y: 50 });

    // Simple entrance animation
    gsap.to(card, {
        scrollTrigger: {
            trigger: card,
            start: 'top 90%',
            toggleActions: 'play none none reverse'
        },
        y: 0,
        duration: 0.7,
        delay: index * 0.08,
        ease: 'power3.out'
    });

    // Hover effects
    card.addEventListener('mouseenter', () => {
        gsap.to(card, {
            y: -10,
            scale: 1.03,
            duration: 0.4,
            ease: 'power2.out'
        });
    });

    card.addEventListener('mouseleave', () => {
        gsap.to(card, {
            y: 0,
            scale: 1,
            duration: 0.4,
            ease: 'power2.out'
        });
    });
});

// Footer - No GSAP animations, keeping it simple and always visible

// ============================================
// GLOBAL SCROLL-BASED PARALLAX EFFECTS
// ============================================

// NOTE: Removed animations for non-existent elements:
// - .hero-center-content (doesn't exist in current HTML)
// - .storm-clouds (doesn't exist)
// - .red-glow (doesn't exist)

// Navbar hide on scroll down, show on scroll up
let lastScrollY = 0;
if (typeof lenis !== 'undefined' && lenis) {
    lenis.on('scroll', ({ scroll }) => {
        const navbar = document.querySelector('.navbar');
        if (scroll > lastScrollY && scroll > 100) {
            gsap.to(navbar, { y: -100, duration: 0.3, ease: 'power2.out' });
        } else {
            gsap.to(navbar, { y: 0, duration: 0.3, ease: 'power2.out' });
        }
        lastScrollY = scroll;
    });
}

// ============================================
// SECTION REVEAL ANIMATIONS WITH SMOOTH SCRUB
// ============================================

// NOTE: Removed animations for non-existent elements:
// - .rounds-section (doesn't exist - challenges use .challenge-page)
// - .quote-section, .quote-marks, .main-quote, .quote-content (don't exist)
// - .login-section, .vecna-silhouette, .login-form-container, .login-container (don't exist)

// Footer - No animations, always visible

// ============================================
// INTERACTIVE EFFECTS
// ============================================

// NOTE: Removed mousemove parallax for non-existent .storm-clouds and .red-glow

// ============================================
// FLOATING IMAGE GSAP ANIMATION (Challenge Pages)
// ============================================

const floatingImages = document.querySelectorAll('.floating-img');

floatingImages.forEach((img, index) => {
    const container = img.closest('.floating-image-container');
    const shadow = container?.querySelector('.floating-shadow');
    const challengePage = img.closest('.challenge-page');

    // Kill any CSS animations to let GSAP take over
    gsap.set(img, { animation: 'none' });
    if (shadow) gsap.set(shadow, { animation: 'none' });

    // Initial state
    gsap.set(img, {
        y: 0,
        rotationX: 2,
        rotationY: -3,
        scale: 1,
        transformPerspective: 1000
    });

    // Main floating animation timeline
    const floatTl = gsap.timeline({ repeat: -1, yoyo: true });

    floatTl.to(img, {
        y: -25,
        rotationX: -2,
        rotationY: 3,
        duration: 2.5,
        ease: 'sine.inOut'
    })
        .to(img, {
            y: -15,
            rotationX: 1,
            rotationY: -2,
            duration: 2,
            ease: 'sine.inOut'
        })
        .to(img, {
            y: -30,
            rotationX: -1,
            rotationY: 2,
            duration: 2.5,
            ease: 'sine.inOut'
        });

    // Shadow animation synced with floating
    if (shadow) {
        const shadowTl = gsap.timeline({ repeat: -1, yoyo: true });

        shadowTl.to(shadow, {
            scale: 0.7,
            opacity: 0.3,
            duration: 2.5,
            ease: 'sine.inOut'
        })
            .to(shadow, {
                scale: 0.8,
                opacity: 0.4,
                duration: 2,
                ease: 'sine.inOut'
            })
            .to(shadow, {
                scale: 0.65,
                opacity: 0.25,
                duration: 2.5,
                ease: 'sine.inOut'
            });
    }

    // Glow pulse animation
    gsap.to(img, {
        filter: 'drop-shadow(0 30px 60px rgba(0, 0, 0, 0.8)) drop-shadow(0 0 50px rgba(229, 9, 20, 0.5))',
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
    });

    // Scroll-triggered parallax for floating image
    if (challengePage) {
        gsap.to(img, {
            scrollTrigger: {
                trigger: challengePage,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 2
            },
            y: -50,
            rotationY: 5,
            ease: 'none'
        });
    }

    // Enhanced hover effects
    if (container) {
        container.addEventListener('mouseenter', () => {
            gsap.to(img, {
                scale: 1.08,
                rotationY: 8,
                filter: 'drop-shadow(0 40px 80px rgba(0, 0, 0, 0.9)) drop-shadow(0 0 80px rgba(229, 9, 20, 0.7))',
                duration: 0.5,
                ease: 'power2.out'
            });

            if (shadow) {
                gsap.to(shadow, {
                    scale: 1.2,
                    opacity: 0.6,
                    duration: 0.5,
                    ease: 'power2.out'
                });
            }
        });

        container.addEventListener('mouseleave', () => {
            gsap.to(img, {
                scale: 1,
                rotationY: -3,
                filter: 'drop-shadow(0 25px 50px rgba(0, 0, 0, 0.7)) drop-shadow(0 0 40px rgba(229, 9, 20, 0.35))',
                duration: 0.5,
                ease: 'power2.out'
            });

            if (shadow) {
                gsap.to(shadow, {
                    scale: 0.75,
                    opacity: 0.35,
                    duration: 0.5,
                    ease: 'power2.out'
                });
            }
        });

        // Mouse move parallax effect
        container.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;

            gsap.to(img, {
                rotationY: x * 15,
                rotationX: -y * 10,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
    }
});

// ============================================
// PRIZE POOL ANIMATION - PINNED SCROLL
// Bus moves across while prize cards reveal simultaneously
// ============================================

const prizeSection = document.querySelector('.prize-section');
const schoolBusGroup = document.getElementById('cyclistsGroup');
const cyclingTrack = document.querySelector('.cycling-track');
const prizeCards = document.querySelectorAll('.prize-card');

if (prizeSection && schoolBusGroup && cyclingTrack) {
    // Calculate the distance bus needs to travel
    const trackWidth = cyclingTrack.offsetWidth || window.innerWidth;
    const travelDistance = trackWidth + 250;

    // Check if mobile - disable pinning on mobile
    const isMobileDevice = window.innerWidth <= 768;
    
    if (isMobileDevice) {
        // On mobile, show everything immediately without animation
        gsap.set(schoolBusGroup, { x: travelDistance }); // Bus at end position
        prizeCards.forEach(card => {
            gsap.set(card, { 
                y: 0, 
                opacity: 1,
                scale: 1,
                rotateX: 0
            });
        });
    } else {
        // Desktop: Set initial states
        gsap.set(schoolBusGroup, { x: -200 });
        
        // Prize cards start hidden
        prizeCards.forEach(card => {
            gsap.set(card, { 
                y: 60, 
                opacity: 0,
                scale: 0.9
            });
        });

        // Create pinned timeline for prize section
        // Start pinning when section is 10% from top to ensure content fits
        const prizeTl = gsap.timeline({
            scrollTrigger: {
                trigger: prizeSection,
                start: 'top 10%', // Start pin when section is 10% from top
                end: '+=120%', // Pin for 1.2x the section height
                pin: true,
                pinSpacing: true,
                scrub: 0.5,
                anticipatePin: 1,
                onUpdate: (self) => {
                    // Bus moving animation
                    if (self.progress > 0.02 && self.progress < 0.5) {
                        schoolBusGroup.classList.add('moving');
                    } else {
                        schoolBusGroup.classList.remove('moving');
                    }
                }
            }
        });

        // Bus moves across the screen (0% - 50% of timeline)
        prizeTl.to(schoolBusGroup, {
            x: travelDistance,
            ease: 'power1.inOut',
            duration: 0.5
        }, 0);

        // Prize cards reveal simultaneously with bus movement
        // 3rd prize starts at 15%
        prizeTl.to('.prize-card.prize-3', {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.2,
            ease: 'back.out(1.2)'
        }, 0.15);

        // 1st prize (center) starts at 25%
        prizeTl.to('.prize-card.prize-1', {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.2,
            ease: 'back.out(1.2)'
        }, 0.25);

        // 2nd prize starts at 35%
        prizeTl.to('.prize-card.prize-2', {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.2,
            ease: 'back.out(1.2)'
        }, 0.35);

        // Hold at end for a moment
        prizeTl.to({}, { duration: 0.1 });
    }
}

// Navbar Background on Scroll
ScrollTrigger.create({
    start: 'top -100',
    end: 99999,
    toggleClass: {
        className: 'scrolled',
        targets: '.navbar'
    }
});

// Add scrolled style
const style = document.createElement('style');
style.textContent = `
    .navbar.scrolled {
        background: rgba(10, 10, 10, 0.95);
        backdrop-filter: blur(10px);
        padding: 15px 50px;
    }
`;
document.head.appendChild(style);

// ============================================
// NAVIGATION ACTIVE STATE - CONSOLIDATED
// Note: Nav click handling is done in initSmoothScrollLinks()
// This section only handles ScrollTrigger-based active state updates
// ============================================

// Get all nav links and sections for ScrollTrigger updates
const navLinksForScroll = document.querySelectorAll('.nav-links a');
const sectionsForScroll = document.querySelectorAll('section[id]');

// Function to update active nav link
function updateActiveNav(activeId) {
    navLinksForScroll.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${activeId}`) {
            link.classList.add('active');
        }
    });
}

// ScrollTrigger for each section to update nav on scroll
// This complements the scroll-based detection in initSmoothScrollLinks()
sectionsForScroll.forEach(section => {
    ScrollTrigger.create({
        trigger: section,
        start: 'top 40%',
        end: 'bottom 40%',
        onEnter: () => updateActiveNav(section.id),
        onEnterBack: () => updateActiveNav(section.id)
    });
});

// Text Scramble Effect for Challenge Titles
class TextScramble {
    constructor(el) {
        this.el = el;
        this.chars = '!<>-_\\/[]{}—=+*^?#@$%&ΩΨΣΔ________';
        this.update = this.update.bind(this);
        // Store original text immediately
        this.originalText = el.innerText;
    }

    setText(newText) {
        // Always ensure we have text to show
        if (!newText) newText = this.originalText;
        const oldText = this.el.innerText || this.originalText;
        const length = Math.max(oldText.length, newText.length);
        const promise = new Promise((resolve) => this.resolve = resolve);
        this.queue = [];

        for (let i = 0; i < length; i++) {
            const from = oldText[i] || newText[i] || '';
            const to = newText[i] || '';
            const start = Math.floor(Math.random() * 20); // Faster start
            const end = start + Math.floor(Math.random() * 20); // Faster completion
            this.queue.push({ from, to, start, end });
        }

        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.update();
        return promise;
    }

    update() {
        let output = '';
        let complete = 0;

        for (let i = 0, n = this.queue.length; i < n; i++) {
            let { from, to, start, end, char } = this.queue[i];

            if (this.frame >= end) {
                complete++;
                output += to;
            } else if (this.frame >= start) {
                if (!char || Math.random() < 0.28) {
                    char = this.randomChar();
                    this.queue[i].char = char;
                }
                output += `<span class="scramble">${char}</span>`;
            } else {
                // Show the target character instead of empty/from
                output += to || from;
            }
        }

        this.el.innerHTML = output;

        if (complete === this.queue.length) {
            this.resolve();
        } else {
            this.frameRequest = requestAnimationFrame(this.update);
            this.frame++;
        }
    }

    randomChar() {
        return this.chars[Math.floor(Math.random() * this.chars.length)];
    }
}

// Initialize text scramble effects for challenges
function initChallengeTextScramble() {
    // Apply scramble effect on hover for challenge titles
    document.querySelectorAll('.challenge-page').forEach((page) => {
        const title = page.querySelector('.challenge-title');
        const tags = page.querySelectorAll('.challenge-tags span');
        
        if (!title) return;
        
        // Store original text before any manipulation
        const originalTitleText = title.innerText;
        
        // Ensure title is visible with original text
        title.style.opacity = '1';
        title.style.visibility = 'visible';
        
        const titleFx = new TextScramble(title);
        
        // Store original tag texts
        const tagData = Array.from(tags).map(tag => {
            // Ensure tags are visible
            tag.style.opacity = '1';
            tag.style.visibility = 'visible';
            return {
                el: tag,
                fx: new TextScramble(tag),
                originalText: tag.innerText
            };
        });
        
        // Scroll trigger - scramble reveal when entering viewport
        let hasTriggered = false;
        
        ScrollTrigger.create({
            trigger: page,
            start: 'top 85%',
            onEnter: () => {
                if (!hasTriggered) {
                    hasTriggered = true;
                    // Scramble the title - text stays visible during animation
                    titleFx.setText(originalTitleText);
                    
                    // Scramble tags with stagger
                    tagData.forEach((data, i) => {
                        setTimeout(() => {
                            data.fx.setText(data.originalText);
                        }, 300 + (i * 150));
                    });
                }
            }
        });
        
        // Hover effect - re-scramble on each hover
        page.addEventListener('mouseenter', () => {
            titleFx.setText(originalTitleText);
            
            tagData.forEach((data, i) => {
                setTimeout(() => {
                    data.fx.setText(data.originalText);
                }, i * 100);
            });
        });
    });
}

// Initialize on DOM ready - consolidated into main init function
// Text scramble is now initialized via initializeWebsite()

// Add scramble style
const scrambleStyle = document.createElement('style');
scrambleStyle.textContent = `
    .scramble {
        color: #e50914;
        text-shadow: 0 0 10px #e50914, 0 0 20px #e50914;
        animation: scrambleFlicker 0.1s infinite;
        display: inline;
    }
    
    @keyframes scrambleFlicker {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.8; }
    }
    
    /* Ensure challenge titles are always visible */
    .challenge-title {
        transition: text-shadow 0.3s ease;
        opacity: 1 !important;
        visibility: visible !important;
        min-height: 1.2em;
    }
    
    .challenge-page:hover .challenge-title {
        text-shadow: 0 0 20px rgba(229, 9, 20, 0.5);
    }
    
    /* Ensure tags are always visible */
    .challenge-tags span {
        transition: all 0.3s ease;
        opacity: 1 !important;
        visibility: visible !important;
        min-height: 1em;
    }
`;
document.head.appendChild(scrambleStyle);

// ============================================
// SOUND EFFECTS (Optional - requires audio files)
// ============================================

// Hover sound effect placeholder
const playHoverSound = () => {
    // Add hover sound if audio file is available
    // const hoverSound = new Audio('hover.mp3');
    // hoverSound.volume = 0.1;
    // hoverSound.play();
};

document.querySelectorAll('button, a').forEach(el => {
    el.addEventListener('mouseenter', playHoverSound);
});

// ============================================
// CONSOLE EASTER EGG
// ============================================

console.log('%c🔴 THE UPSIDE DOWN 🔴', 'color: #e50914; font-size: 24px; font-weight: bold;');
console.log('%cFriends don\'t lie. But codes do.', 'color: #888; font-size: 14px;');
console.log('%c011', 'color: #e50914; font-size: 48px; font-weight: bold;');

// ============================================
// ENHANCED GSAP SCROLL ANIMATIONS
// ============================================

function initEnhancedGSAPAnimations() {
    // About Section Animations - Note: uses .about-hero class, not .about-section
    const aboutSection = document.querySelector('.about-hero');
    if (aboutSection) {
        // The about-hero section has its own mouse reveal animation
        // No additional GSAP animations needed here
    }

    // Gallery Section Animations
    const gallerySection = document.querySelector('.gallery-section');
    if (gallerySection) {
        const galleryTitle = gallerySection.querySelector('.gsap-title');
        const galleryFade = gallerySection.querySelector('.gsap-fade');
        
        // Title animation
        if (galleryTitle) {
            gsap.to(galleryTitle, {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.gallery-section',
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                }
            });
        }

        // Subtitle animation
        if (galleryFade) {
            gsap.to(galleryFade, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                delay: 0.2,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.gallery-section',
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                }
            });
        }
        
        // Gallery uses CSS animation for auto-scrolling, no GSAP needed for items
    }

    // Team Section - No GSAP animations, using CSS only
    // Removed GSAP animations as per user request

    // Sponsors Section Animation
    const sponsorsSection = document.querySelector('.sponsors-section');
    if (sponsorsSection) {
        const sponsorTitle = sponsorsSection.querySelector('.section-title');
        if (sponsorTitle) {
            gsap.to(sponsorTitle, {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: sponsorsSection,
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                }
            });
        }
    }

    // Footer - No GSAP animations, always visible

    // Smooth scroll snap effect for sections - REMOVED
    // Nav active state is handled by the consolidated NAVIGATION ACTIVE STATE section
    // This was creating duplicate ScrollTriggers on every section

    // Horizontal text scroll effect for section headers - REMOVED
    // This was causing duplicate animations on section titles
    // Section titles are already animated by initSectionAnimations()
}

// Initialize enhanced animations - consolidated into main init function

// ============================================
// SCROLL-TRIGGERED PARALLAX EFFECTS
// ============================================

function initParallaxEffects() {
    // Background parallax for about section
    const aboutBg = document.querySelector('.about-bg-image');
    if (aboutBg) {
        gsap.to(aboutBg, {
            y: 100,
            ease: 'none',
            scrollTrigger: {
                trigger: '.about-section',
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1
            }
        });
    }

    // Floating particles parallax
    document.querySelectorAll('.g-particle').forEach((particle, index) => {
        gsap.to(particle, {
            y: -100 * (index + 1),
            x: 50 * (index % 2 === 0 ? 1 : -1),
            ease: 'none',
            scrollTrigger: {
                trigger: '.gallery-section',
                start: 'top bottom',
                end: 'bottom top',
                scrub: 2
            }
        });
    });

    // Team vines parallax
    document.querySelectorAll('.t-vine').forEach((vine, index) => {
        gsap.to(vine, {
            height: `+=${50 + index * 30}px`,
            ease: 'none',
            scrollTrigger: {
                trigger: '.team-section',
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.5
            }
        });
    });
}

// Parallax effects - consolidated into main init function

// ============================================
// SMOOTH SCROLL ENHANCEMENT
// ============================================

function initSmoothScrollEnhancement() {
    // Add smooth reveal for all sections
    gsap.utils.toArray('section').forEach((section, index) => {
        const bg = section.querySelector('.section-header');
        if (bg) {
            gsap.fromTo(bg,
                { opacity: 0.5 },
                {
                    opacity: 1,
                    duration: 1,
                    scrollTrigger: {
                        trigger: section,
                        start: 'top 80%',
                        end: 'top 20%',
                        scrub: 1
                    }
                }
            );
        }
    });
}

// Smooth scroll enhancement - consolidated into main init function


// ============================================
// FAQ ACCORDION
// ============================================

function initFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            // Close other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current item
            item.classList.toggle('active');
        });
    });
}

// ============================================
// CONTACT FORM
// ============================================

function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData);
            
            // Show success message (you can replace this with actual form submission)
            const submitBtn = contactForm.querySelector('.contact-submit');
            const originalText = submitBtn.querySelector('.btn-text').textContent;
            
            submitBtn.querySelector('.btn-text').textContent = 'SENDING...';
            submitBtn.disabled = true;
            
            // Simulate sending
            setTimeout(() => {
                submitBtn.querySelector('.btn-text').textContent = 'MESSAGE SENT! ✓';
                submitBtn.style.background = 'linear-gradient(135deg, #33aa33 0%, #228822 100%)';
                
                // Reset form
                contactForm.reset();
                
                // Reset button after delay
                setTimeout(() => {
                    submitBtn.querySelector('.btn-text').textContent = originalText;
                    submitBtn.style.background = '';
                    submitBtn.disabled = false;
                }, 3000);
            }, 1500);
        });
    }
}

// ============================================
// FAQ & CONTACT GSAP ANIMATIONS
// ============================================

function initFAQContactAnimations() {
    // FAQ Section Animations
    const faqSection = document.querySelector('.faq-section');
    if (faqSection) {
        const faqTitle = faqSection.querySelector('.gsap-title');
        const faqFade = faqSection.querySelector('.gsap-fade');
        const faqItems = document.querySelectorAll('.gsap-faq');
        const faqContainer = document.querySelector('.faq-container');
        
        if (faqTitle) {
            gsap.to(faqTitle, {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: faqSection,
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                }
            });
        }

        if (faqFade) {
            gsap.to(faqFade, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                delay: 0.2,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: faqSection,
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                }
            });
        }

        // FAQ items stagger animation
        if (faqItems.length > 0 && faqContainer) {
            gsap.to(faqItems, {
                opacity: 1,
                x: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: faqContainer,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                }
            });
        }
    }

    // Contact Section Animations
    const contactSection = document.querySelector('.contact-section');
    if (contactSection) {
        const contactTitle = contactSection.querySelector('.gsap-title');
        const contactFade = contactSection.querySelector('.gsap-fade');
        const contactItems = document.querySelectorAll('.gsap-contact');
        const contactContainer = document.querySelector('.contact-container');
        
        if (contactTitle) {
            gsap.to(contactTitle, {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: contactSection,
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                }
            });
        }

        if (contactFade) {
            gsap.to(contactFade, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                delay: 0.2,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: contactSection,
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                }
            });
        }

        // Contact cards and form animation
        if (contactItems.length > 0 && contactContainer) {
            gsap.to(contactItems, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.2,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: contactContainer,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                }
            });
        }
    }
}

// Initialize FAQ and Contact - consolidated into main init function


// ============================================
// FULL PAGE CHALLENGE ANIMATIONS
// ============================================

function initChallengePageAnimations() {
    const challengePages = document.querySelectorAll('.challenge-page');
    
    if (challengePages.length === 0) return;
    
    // Parallax effect on challenge backgrounds
    challengePages.forEach(page => {
        const bg = page.querySelector('.challenge-bg-img');
        if (bg) {
            gsap.to(bg, {
                y: 50,
                ease: 'none',
                scrollTrigger: {
                    trigger: page,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1
                }
            });
        }
        
        // Add hover effect for title
        const title = page.querySelector('.challenge-title');
        if (title) {
            page.addEventListener('mouseenter', () => {
                gsap.to(title, {
                    textShadow: '0 0 50px rgba(229, 9, 20, 0.8)',
                    duration: 0.3
                });
            });
            page.addEventListener('mouseleave', () => {
                gsap.to(title, {
                    textShadow: '0 0 30px rgba(229, 9, 20, 0.5)',
                    duration: 0.3
                });
            });
        }
    });
}

// Initialize on DOM ready - consolidated into main init function

// ============================================
// ABOUT SECTION - MOUSE REVEAL ANIMATION
// ============================================

function initAboutMouseReveal() {
    const aboutHero = document.getElementById('about');
    const fireReveal = document.getElementById('fireReveal');
    
    if (!aboutHero || !fireReveal) {
        console.log('About section elements not found');
        return;
    }
    
    console.log('About mouse reveal: Elements found, initializing...');
    
    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;
    let isHovering = false;
    
    // Animation loop for smooth movement
    function animate() {
        if (isHovering) {
            // Smooth interpolation
            currentX += (mouseX - currentX) * 0.1;
            currentY += (mouseY - currentY) * 0.1;
            
            // Create the mask with multiple radial gradients for organic blob effect
            const mask = `
                radial-gradient(circle 300px at ${currentX}px ${currentY}px, black 0%, black 30%, transparent 70%),
                radial-gradient(circle 250px at ${currentX + 60}px ${currentY - 50}px, black 0%, black 20%, transparent 60%),
                radial-gradient(circle 180px at ${currentX - 40}px ${currentY + 40}px, black 0%, black 20%, transparent 60%)
            `;
            
            fireReveal.style.webkitMaskImage = mask;
            fireReveal.style.maskImage = mask;
        }
        
        requestAnimationFrame(animate);
    }
    
    animate();
    
    // Mouse enter
    aboutHero.addEventListener('mouseenter', (e) => {
        console.log('Mouse entered about section');
        isHovering = true;
        const rect = aboutHero.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
        currentX = mouseX;
        currentY = mouseY;
        fireReveal.classList.add('active');
    });
    
    // Mouse move
    aboutHero.addEventListener('mousemove', (e) => {
        const rect = aboutHero.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    });
    
    // Mouse leave
    aboutHero.addEventListener('mouseleave', () => {
        console.log('Mouse left about section');
        isHovering = false;
        fireReveal.classList.remove('active');
    });
    
    console.log('About mouse reveal initialized successfully');
}

// Initialize about section mouse reveal - only once
let aboutMouseRevealInitialized = false;

function tryInitAboutMouseReveal() {
    if (aboutMouseRevealInitialized) return;
    aboutMouseRevealInitialized = true;
    initAboutMouseReveal();
}

// Initialize on DOM ready - consolidated into main init function


// ============================================
// MOBILE MENU TOGGLE
// ============================================

const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const mobileNavLinks = document.getElementById('navLinks');

if (mobileMenuToggle && mobileNavLinks) {
    mobileMenuToggle.addEventListener('click', () => {
        mobileMenuToggle.classList.toggle('active');
        mobileNavLinks.classList.toggle('active');
        document.body.style.overflow = mobileNavLinks.classList.contains('active') ? 'hidden' : '';
    });
    
    // Close menu when clicking a link
    mobileNavLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuToggle.classList.remove('active');
            mobileNavLinks.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileNavLinks.classList.contains('active')) {
            mobileMenuToggle.classList.remove('active');
            mobileNavLinks.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}


// ============================================
// SKELETON LOADING & IMAGE OPTIMIZATION
// ============================================

// Add skeleton loading to gallery items
function initSkeletonLoading() {
    // Gallery images
    const galleryItems = document.querySelectorAll('.gallery-scroll-item');
    galleryItems.forEach(item => {
        item.classList.add('skeleton-loading');
        const img = item.querySelector('img');
        if (img) {
            if (img.complete) {
                item.classList.remove('skeleton-loading');
            } else {
                img.addEventListener('load', () => {
                    item.classList.remove('skeleton-loading');
                });
            }
        }
    });
    
    // Challenge background images
    const challengeImages = document.querySelectorAll('.challenge-bg-img');
    challengeImages.forEach(img => {
        img.classList.add('loading');
        if (img.complete) {
            img.classList.remove('loading');
        } else {
            img.addEventListener('load', () => {
                img.classList.remove('loading');
            });
        }
    });
}

// Lazy load images that are not in viewport
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '100px 0px',
            threshold: 0.1
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// Optimize scroll performance
function optimizeScrollPerformance() {
    let ticking = false;
    
    // Throttle scroll events using requestAnimationFrame
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
    
    // Disable pointer events during scroll for better performance
    let scrollTimeout;
    const handleScrollPointer = throttle(() => {
        document.body.style.pointerEvents = 'none';
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            document.body.style.pointerEvents = '';
        }, 100);
    }, 50);
    
    window.addEventListener('scroll', handleScrollPointer, { passive: true });
}

// Pause animations when tab is not visible
function initVisibilityOptimization() {
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // Pause GSAP animations when tab is hidden
            gsap.globalTimeline.pause();
        } else {
            // Resume when tab is visible
            gsap.globalTimeline.resume();
        }
    });
}

// Initialize optimizations - consolidated into main init function

// Preconnects are now handled in HTML head for better performance

// ============================================
// HERO SECTION BUTTONS VISIBILITY
// ============================================

function initHeroButtonsVisibility() {
    const goBackBtn = document.getElementById('goBackBtn');
    const registerBtn = document.getElementById('registerBtn');
    const heroSection = document.getElementById('hero');
    
    if (!heroSection) return;
    
    // Function to check if we're in hero section
    function updateButtonsVisibility() {
        const heroRect = heroSection.getBoundingClientRect();
        const heroBottom = heroRect.bottom;
        const windowHeight = window.innerHeight;
        
        // Show buttons only when hero section is visible (bottom of hero is below viewport top)
        const isInHero = heroBottom > windowHeight * 0.3;
        
        if (goBackBtn) {
            if (isInHero) {
                goBackBtn.classList.remove('hidden');
            } else {
                goBackBtn.classList.add('hidden');
            }
        }
        
        if (registerBtn) {
            if (isInHero) {
                registerBtn.classList.remove('hidden');
            } else {
                registerBtn.classList.add('hidden');
            }
        }
    }
    
    // Initial check
    updateButtonsVisibility();
    
    // Update on scroll (throttled)
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) return;
        scrollTimeout = setTimeout(() => {
            updateButtonsVisibility();
            scrollTimeout = null;
        }, 50);
    }, { passive: true });
}

// Initialize on DOM ready - consolidated into main init function


// ============================================
// CONSOLIDATED INITIALIZATION
// Single entry point for all initializations
// ============================================

function initializeWebsite() {
    // Phase 1: Critical - Immediate (0ms)
    ImageSequenceScroll.init();
    initHellBackground();
    initHeroButtonsVisibility();
    
    // Phase 2: Core animations (100ms)
    setTimeout(() => {
        initPremiumAnimations();
        initSkeletonLoading();
        initLazyLoading();
    }, 100);
    
    // Phase 3: Enhanced features (200ms)
    setTimeout(() => {
        initEnhancedGSAPAnimations();
        initParallaxEffects();
    }, 200);
    
    // Phase 4: Secondary features (400ms)
    setTimeout(() => {
        initSmoothScrollEnhancement();
        initFAQAccordion();
        initContactForm();
        initFAQContactAnimations();
    }, 400);
    
    // Phase 5: Final polish (700ms)
    setTimeout(() => {
        initChallengePageAnimations();
        initChallengeTextScramble();
        tryInitAboutMouseReveal();
        optimizeScrollPerformance();
        initVisibilityOptimization();
    }, 700);
}

// Single DOMContentLoaded handler
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWebsite);
} else {
    // DOM already loaded
    initializeWebsite();
}
