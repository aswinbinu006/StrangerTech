/* ============================================
   STRANGER THINGS WEBSITE - GSAP ANIMATIONS
   PREMIUM MULTI-MILLION DOLLAR ANIMATIONS
   ============================================ */

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// ============================================
// PERFORMANCE UTILITIES
// ============================================

// Throttle function for scroll events
const throttle = (func, limit) => {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// Debounce function for resize events
const debounce = (func, wait) => {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
};

// Request Idle Callback polyfill
const requestIdleCallback = window.requestIdleCallback || ((cb) => setTimeout(cb, 1));

// ============================================
// GLOBAL IMAGE PRELOADER - Load all images during loading screen
// ============================================

const ImagePreloader = {
    // All images to preload
    imagesToLoad: [
        // Challenge images from Challenges Photos folder
        'Challenges Photos/Challenge 1 (1).jpeg',
        'Challenges Photos/Challenge 2.jpeg',
        'Challenges Photos/Challenge 3.jpg',
        'Challenges Photos/Challenge 4.jpeg',
        'Challenges Photos/Challenge 5.jpeg',
        // About section
        'will1.webp',
        'v1.png',
        // Gallery images
        'gallery/IMG-20250919-WA0115.png',
        'gallery/IMG-20250919-WA0116.png',
        'gallery/IMG-20250919-WA0117.png',
        'gallery/IMG-20250919-WA0123.png',
        'gallery/WhatsApp Image 2026-01-12 at 13.21.16.jpeg',
        'gallery/WhatsApp Image 2026-01-12 at 13.21.18.jpeg',
        // Team photos
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
            
            // Use intersection observer for lazy loading non-critical images
            const criticalImages = this.imagesToLoad.slice(0, 3); // First 3 are critical
            const deferredImages = this.imagesToLoad.slice(3);
            
            // Load critical images first
            criticalImages.forEach(src => this.loadImage(src, resolve));
            
            // Defer non-critical images
            requestIdleCallback(() => {
                deferredImages.forEach(src => this.loadImage(src, resolve));
            });
        });
    },
    
    loadImage(src, resolve) {
        const img = new Image();
        img.src = src;
        
        img.onload = () => {
            this.loadedCount++;
            this.loadedImages.push(img);
            if (this.loadedCount >= this.totalImages) {
                resolve();
            }
        };
        
        img.onerror = () => {
            this.loadedCount++;
            console.warn(`Failed to preload: ${src}`);
            if (this.loadedCount >= this.totalImages) {
                resolve();
            }
        };
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
document.addEventListener('DOMContentLoaded', () => {
    ImageSequenceScroll.init();
});

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
    // Challenge rows animation
    const challengeRows = document.querySelectorAll('.challenge-row');
    
    challengeRows.forEach((row, index) => {
        const isLeft = row.classList.contains('left');
        const image = row.querySelector('.challenge-image');
        const details = row.querySelector('.challenge-details');
        
        gsap.fromTo(image, 
            { 
                x: isLeft ? -100 : 100, 
                opacity: 0 
            },
            {
                x: 0,
                opacity: 1,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: row,
                    start: 'top 75%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
        
        gsap.fromTo(details,
            { 
                x: isLeft ? 100 : -100, 
                opacity: 0 
            },
            {
                x: 0,
                opacity: 1,
                duration: 1,
                delay: 0.2,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: row,
                    start: 'top 75%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    });
    
    // Prize cards pop-up animation - more dramatic
    const prizeCards = document.querySelectorAll('.prize-card');
    
    prizeCards.forEach((card, index) => {
        // Set initial state
        gsap.set(card, { 
            y: 120, 
            opacity: 0,
            scale: 0.5,
            rotateX: 45
        });
        
        gsap.to(card, {
            y: 0,
            opacity: 1,
            scale: 1,
            rotateX: 0,
            duration: 1,
            delay: index * 0.2,
            ease: 'back.out(1.4)',
            scrollTrigger: {
                trigger: '.prizes-row',
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            }
        });
    });
    
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
    
    // Team members animation - staggered from bottom
    const teamMembers = document.querySelectorAll('.team-member');
    
    teamMembers.forEach((member, index) => {
        gsap.fromTo(member,
            { 
                y: 100, 
                opacity: 0,
                rotateY: -15
            },
            {
                y: 0,
                opacity: 1,
                rotateY: 0,
                duration: 1,
                delay: index * 0.15,
                ease: 'back.out(1.2)',
                scrollTrigger: {
                    trigger: '.team-grid',
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    });
    
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
    
    // Footer animation
    const footerMain = document.querySelector('.footer-main');
    if (footerMain) {
        gsap.fromTo(footerMain,
            { 
                y: 50, 
                opacity: 0
            },
            {
                y: 0,
                opacity: 1,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.footer',
                    start: 'top 90%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    }
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

// Run after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure everything is loaded
    setTimeout(initPremiumAnimations, 100);
});

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

// Initialize hell background when DOM is ready
document.addEventListener('DOMContentLoaded', initHellBackground);

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
    gsap.to(loaderBar, {
        width: '100%',
        duration: 5,
        ease: 'power1.inOut'
    });

    // ===== STEP 1: CSI with glitch effect =====
    introTl.to(stepCSI, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.5
    });

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

// Start intro animation when page loads
window.addEventListener('load', () => {
    playIntroAnimation();
});

// DOM Elements
const audioControl = document.getElementById('audioControl');
const bgMusic = document.getElementById('bgMusic');
const startBtn = document.getElementById('startBtn');
const glitchOverlay = document.querySelector('.glitch-overlay');
const particlesContainer = document.getElementById('particles');
const cursor = document.getElementById('cursor');
const cursorDot = document.getElementById('cursorDot');

// Custom Cursor
document.addEventListener('mousemove', (e) => {
    gsap.to(cursor, {
        x: e.clientX - 10,
        y: e.clientY - 10,
        duration: 0.2,
        ease: 'power2.out'
    });
    gsap.to(cursorDot, {
        x: e.clientX - 2.5,
        y: e.clientY - 2.5,
        duration: 0.1
    });
});

// Cursor hover effect
document.querySelectorAll('a, button, .round-card, .sponsor-card').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
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

// Initial Page Load Animation
const loadTimeline = gsap.timeline();

loadTimeline
    .from('.navbar', {
        y: -100,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
    })
    .from('.storm-clouds', {
        opacity: 0,
        scale: 1.2,
        duration: 2,
        ease: 'power2.out'
    }, '-=0.8')
    .from('.series-badge', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
    }, '-=1')
    .from('.title-main', {
        y: 100,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
    }, '-=0.5')
    .from('.title-sub', {
        y: 100,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
    }, '-=0.7')
    .from('.hero-tagline', {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: 'power2.out'
    }, '-=0.5')
    .from('.hero-buttons button', {
        y: 30,
        opacity: 0,
        scale: 0.9,
        duration: 0.6,
        stagger: 0.15,
        ease: 'back.out(1.7)'
    }, '-=0.3')
    .from('.scroll-indicator', {
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: 'power2.out'
    }, '-=0.3');

// Hero Title Glitch Animation
gsap.to('.title-main', {
    textShadow: '0 0 20px rgba(229, 9, 20, 1), 0 0 40px rgba(229, 9, 20, 0.8), 0 0 80px rgba(229, 9, 20, 0.5)',
    duration: 2,
    repeat: -1,
    yoyo: true,
    ease: 'power1.inOut'
});

gsap.to('.title-sub', {
    textShadow: '0 0 20px rgba(229, 9, 20, 1), 0 0 40px rgba(229, 9, 20, 0.8), 0 0 80px rgba(229, 9, 20, 0.5)',
    duration: 2,
    repeat: -1,
    yoyo: true,
    ease: 'power1.inOut',
    delay: 0.5
});

// Storm clouds subtle movement
gsap.to('.storm-clouds', {
    backgroundPosition: '10% 0%',
    duration: 20,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut'
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

// Portal Glow - Breathing effect
gsap.to('.portal-glow', {
    scale: 1.3,
    opacity: 0.9,
    duration: 6,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut'
});

// Energy Lines - Streaking across screen
gsap.utils.toArray('.energy-line').forEach((line, index) => {
    const isLeft = index % 2 === 0;

    gsap.set(line, {
        x: isLeft ? -400 : window.innerWidth + 100,
        opacity: 0
    });

    // Streak animation
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

// 3D Parallax on scroll for background layers
gsap.to('.bg-layer-deep', {
    scrollTrigger: {
        trigger: '.rounds-section',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 2
    },
    y: -200,
    ease: 'none'
});

gsap.to('.bg-layer-mid', {
    scrollTrigger: {
        trigger: '.rounds-section',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.5
    },
    y: -120,
    ease: 'none'
});

gsap.to('.bg-layer-front', {
    scrollTrigger: {
        trigger: '.rounds-section',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1
    },
    y: -60,
    ease: 'none'
});

// Mouse parallax for 3D background
document.querySelector('.rounds-section')?.addEventListener('mousemove', (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    gsap.to('.bg-layer-deep', {
        x: x * 40,
        y: y * 30,
        duration: 1,
        ease: 'power2.out'
    });

    gsap.to('.bg-layer-mid', {
        x: x * 25,
        y: y * 20,
        duration: 0.8,
        ease: 'power2.out'
    });

    gsap.to('.bg-layer-front', {
        x: x * 15,
        y: y * 10,
        duration: 0.6,
        ease: 'power2.out'
    });

    gsap.to('.portal-glow', {
        x: x * 50,
        y: y * 40,
        duration: 1.2,
        ease: 'power2.out'
    });
});

// ============================================
// FLOATING SPORES ANIMATIONS
// ============================================

// Animate floating spores with GSAP for smoother movement
gsap.utils.toArray('.floating-spore').forEach((spore, index) => {
    // Random starting position offset
    gsap.set(spore, {
        x: Math.random() * 50 - 25,
        y: Math.random() * 50 - 25
    });

    // Continuous floating animation
    gsap.to(spore, {
        y: `-=${100 + Math.random() * 150}`,
        x: `+=${Math.random() * 100 - 50}`,
        duration: 10 + Math.random() * 10,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: index * 0.5
    });

    // Pulsing glow
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

// Parallax effect on rounds section background
gsap.to('.rounds-bg-effects', {
    scrollTrigger: {
        trigger: '.rounds-section',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1
    },
    y: -100,
    ease: 'none'
});

// ============================================
// CHALLENGE ROWS - ENHANCED CINEMATIC ANIMATION
// ============================================

// Set initial hidden state for all challenge rows with 3D transforms
// Note: Using .challenge-row prefix to avoid affecting .challenge-page elements
gsap.set('.challenge-row', {
    opacity: 0,
    y: 120,
    rotationX: 15,
    transformPerspective: 1000,
    transformOrigin: 'center bottom'
});
gsap.set('.challenge-row .challenge-image', {
    opacity: 0,
    scale: 0.7,
    rotationY: 0,
    filter: 'blur(10px)'
});
gsap.set('.challenge-row .challenge-number', {
    opacity: 0,
    scale: 0.5,
    y: 50
});
gsap.set('.challenge-row .challenge-tags span', {
    opacity: 0,
    y: 20,
    scale: 0.8
});
gsap.set('.challenge-row .challenge-description', {
    opacity: 0,
    y: 30,
    filter: 'blur(5px)'
});
gsap.set('.challenge-row .meta-item', {
    opacity: 0,
    x: -30
});

gsap.utils.toArray('.challenge-row').forEach((row, rowIndex) => {
    const isLeft = row.classList.contains('left');
    const image = row.querySelector('.challenge-image');
    const imageGlow = row.querySelector('.image-glow');
    const imagePlaceholder = row.querySelector('.image-placeholder');
    const number = row.querySelector('.challenge-number');
    const title = row.querySelector('.challenge-title');
    const tags = row.querySelectorAll('.challenge-tags span');
    const description = row.querySelector('.challenge-description');
    const meta = row.querySelectorAll('.meta-item');
    const details = row.querySelector('.challenge-details');

    // Set initial x position for image based on side with rotation
    gsap.set(image, {
        x: isLeft ? 100 : -100,
        rotationY: isLeft ? -15 : 15
    });

    // Create a master timeline for cinematic scroll-triggered animation
    const rowTl = gsap.timeline({
        scrollTrigger: {
            trigger: row,
            start: 'top 90%',
            end: 'top 30%',
            toggleActions: 'play none none reverse',
            scrub: false
        }
    });

    // Row dramatic entrance with 3D rotation
    rowTl.to(row, {
        opacity: 1,
        y: 0,
        rotationX: 0,
        duration: 1,
        ease: 'power4.out'
    });

    // Challenge number - dramatic scale up with glow
    rowTl.to(number, {
        opacity: 0.2,
        scale: 1,
        y: 0,
        duration: 0.6,
        ease: 'back.out(1.7)'
    }, '-=0.8');

    // Image cinematic slide with 3D rotation and blur clear
    rowTl.to(image, {
        opacity: 1,
        scale: 1,
        x: 0,
        rotationY: 0,
        filter: 'blur(0px)',
        duration: 1.2,
        ease: 'power3.out'
    }, '-=0.7');

    // Image glow pulse on reveal
    rowTl.fromTo(imageGlow,
        { opacity: 0, scale: 0.8 },
        { opacity: 0.5, scale: 1.2, duration: 0.4, ease: 'power2.out' },
        '-=0.5'
    );
    rowTl.to(imageGlow, {
        opacity: 0.3,
        scale: 1,
        duration: 0.3
    });

    // Tags stagger in with bounce (TextScramble handles title animation)
    rowTl.to(tags, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        stagger: 0.08,
        ease: 'back.out(1.5)'
    }, '-=0.6');

    // Description fade up with blur clear
    rowTl.to(description, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.6,
        ease: 'power2.out'
    }, '-=0.4');

    // Meta items slide in from left with stagger
    rowTl.to(meta, {
        opacity: 1,
        x: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power3.out'
    }, '-=0.4');

    // Continuous floating animation for details (starts after reveal)
    rowTl.add(() => {
        gsap.to(details, {
            y: -10,
            duration: 3 + rowIndex * 0.3,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });

        // Subtle image float
        gsap.to(image, {
            y: -5,
            duration: 4 + rowIndex * 0.2,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });
    });

    // Parallax effect for each row on scroll
    gsap.to(image, {
        scrollTrigger: {
            trigger: row,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5
        },
        y: -30,
        ease: 'none'
    });

    gsap.to(details, {
        scrollTrigger: {
            trigger: row,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1
        },
        y: -20,
        ease: 'none'
    });

    // ============================================
    // ENHANCED HOVER EFFECTS
    // ============================================

    row.addEventListener('mouseenter', () => {
        // Image dramatic scale with 3D tilt - no box-shadow for floating images
        gsap.to(image, {
            scale: 1.08,
            rotationY: isLeft ? 5 : -5,
            duration: 0.6,
            ease: 'power2.out'
        });

        // Image glow intensify
        gsap.to(imageGlow, {
            opacity: 1,
            scale: 1.3,
            duration: 0.5,
            ease: 'power2.out'
        });

        // Image placeholder shimmer
        if (imagePlaceholder) {
            gsap.to(imagePlaceholder, {
                backgroundPosition: '200% 0',
                duration: 1,
                ease: 'power1.inOut'
            });
        }

        // Title color shift with glow
        gsap.to(title, {
            color: '#ff4444',
            textShadow: '0 0 40px rgba(229, 9, 20, 0.8), 0 0 80px rgba(229, 9, 20, 0.4)',
            scale: 1.02,
            duration: 0.4,
            ease: 'power2.out'
        });

        // Number pulse
        gsap.to(number, {
            scale: 1.15,
            opacity: 0.35,
            textShadow: '0 0 50px rgba(229, 9, 20, 0.6)',
            duration: 0.5,
            ease: 'power2.out'
        });

        // Tags lift with glow
        gsap.to(tags, {
            y: -5,
            boxShadow: '0 5px 20px rgba(229, 9, 20, 0.3)',
            stagger: 0.03,
            duration: 0.3,
            ease: 'power2.out'
        });

        // Details shift
        gsap.to(details, {
            x: isLeft ? 15 : -15,
            duration: 0.5,
            ease: 'power2.out'
        });

        // Description subtle highlight
        gsap.to(description, {
            color: '#ffffff',
            duration: 0.3
        });
    });

    row.addEventListener('mouseleave', () => {
        gsap.to(image, {
            scale: 1,
            rotationY: 0,
            duration: 0.6,
            ease: 'power2.out'
        });

        gsap.to(imageGlow, {
            opacity: 0,
            scale: 1,
            duration: 0.5,
            ease: 'power2.out'
        });

        gsap.to(title, {
            color: '#ffffff',
            textShadow: '0 0 20px rgba(229, 9, 20, 0.3)',
            scale: 1,
            duration: 0.4,
            ease: 'power2.out'
        });

        gsap.to(number, {
            scale: 1,
            opacity: 0.15,
            textShadow: '0 0 30px rgba(229, 9, 20, 0.3)',
            duration: 0.5,
            ease: 'power2.out'
        });

        gsap.to(tags, {
            y: 0,
            boxShadow: '0 0 0 rgba(229, 9, 20, 0)',
            stagger: 0.03,
            duration: 0.3,
            ease: 'power2.out'
        });

        gsap.to(details, {
            x: 0,
            duration: 0.5,
            ease: 'power2.out'
        });

        gsap.to(description, {
            color: '#cccccc',
            duration: 0.3
        });
    });
});

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
// QUOTE SECTION - CINEMATIC 3D ANIMATION
// ============================================

const quoteSection = document.querySelector('.quote-section');
const quoteContent = document.querySelector('.quote-content');

if (quoteSection) {
    // Set up 3D perspective
    gsap.set(quoteSection, {
        perspective: 1500
    });

    gsap.set(quoteContent, {
        transformStyle: 'preserve-3d'
    });

    // Create master timeline for quote section
    const quoteTl = gsap.timeline({
        scrollTrigger: {
            trigger: '.quote-section',
            start: 'top 75%',
            end: 'center center',
            toggleActions: 'play none none reverse'
        }
    });

    // Quote marks - dramatic 3D spin entrance
    quoteTl.from('.quote-marks', {
        scale: 0,
        rotationY: 360,
        rotationX: -90,
        z: -500,
        opacity: 0,
        filter: 'blur(20px)',
        duration: 1.2,
        ease: 'back.out(1.5)'
    });

    // Quote marks glow pulse
    quoteTl.to('.quote-marks', {
        textShadow: '0 0 80px rgba(229, 9, 20, 0.8), 0 0 150px rgba(229, 9, 20, 0.5)',
        duration: 0.3,
        ease: 'power2.out'
    }, '-=0.3');

    quoteTl.to('.quote-marks', {
        textShadow: '0 0 30px rgba(229, 9, 20, 0.3)',
        duration: 0.5,
        ease: 'power2.inOut'
    });

    // Main quote - typewriter 3D reveal with glitch
    quoteTl.from('.main-quote', {
        y: 80,
        z: -300,
        rotationX: -45,
        opacity: 0,
        filter: 'blur(15px)',
        skewX: -10,
        duration: 1,
        ease: 'power3.out'
    }, '-=0.8');

    // Quote glitch flash
    quoteTl.to('.main-quote', {
        textShadow: '-5px 0 0 rgba(0, 255, 255, 0.5), 5px 0 0 rgba(255, 0, 100, 0.5)',
        skewX: 3,
        duration: 0.08,
        ease: 'none'
    }, '-=0.3');

    quoteTl.to('.main-quote', {
        textShadow: '0 0 0 transparent',
        skewX: 0,
        duration: 0.15,
        ease: 'power2.out'
    });

    // Quote author - slide in with 3D rotation
    quoteTl.from('.quote-author', {
        x: -100,
        rotationY: -30,
        opacity: 0,
        filter: 'blur(5px)',
        duration: 0.8,
        ease: 'power3.out'
    }, '-=0.5');

    // Author glow
    quoteTl.to('.quote-author', {
        textShadow: '0 0 30px rgba(229, 9, 20, 0.8)',
        duration: 0.2
    }, '-=0.2');

    quoteTl.to('.quote-author', {
        textShadow: '0 0 10px rgba(229, 9, 20, 0.3)',
        duration: 0.4
    });

    // Quote divider - expand from center with glow
    quoteTl.from('.quote-divider', {
        scaleX: 0,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
    }, '-=0.4');

    quoteTl.to('.quote-divider', {
        boxShadow: '0 0 30px rgba(229, 9, 20, 0.8), 0 0 60px rgba(229, 9, 20, 0.4)',
        duration: 0.3
    }, '-=0.3');

    quoteTl.to('.quote-divider', {
        boxShadow: '0 0 10px rgba(229, 9, 20, 0.3)',
        duration: 0.5
    });

    // Event description - fade up with 3D
    quoteTl.from('.event-description', {
        y: 60,
        z: -150,
        rotationX: -20,
        opacity: 0,
        filter: 'blur(8px)',
        duration: 0.8,
        ease: 'power2.out'
    }, '-=0.4');

    // Quote background glow animation
    quoteTl.from('.quote-bg', {
        scale: 0.5,
        opacity: 0,
        duration: 1.5,
        ease: 'power2.out'
    }, 0);
}

// Quote section parallax on scroll
gsap.to('.quote-content', {
    scrollTrigger: {
        trigger: '.quote-section',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 2
    },
    y: -50,
    rotationX: 5,
    ease: 'none'
});

// Quote marks floating animation
gsap.to('.quote-marks', {
    y: -20,
    duration: 3,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut'
});

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

// Footer Animation
const footerTl = gsap.timeline({
    scrollTrigger: {
        trigger: '.footer',
        start: 'top 90%',
        toggleActions: 'play reverse play reverse'
    }
});

footerTl.from('.footer-logo', {
    y: 40,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out'
});

footerTl.from('.logo-text', {
    x: -30,
    opacity: 0,
    duration: 0.5,
    ease: 'power2.out'
}, '-=0.5');

footerTl.from('.logo-accent', {
    x: 30,
    opacity: 0,
    duration: 0.5,
    ease: 'power2.out'
}, '-=0.3');

// Footer links staggered animation
gsap.from('.footer-links a', {
    scrollTrigger: {
        trigger: '.footer',
        start: 'top 90%',
        toggleActions: 'play reverse play reverse'
    },
    y: 25,
    opacity: 0,
    stagger: 0.1,
    duration: 0.5,
    delay: 0.4,
    ease: 'power2.out'
});

// Footer social icons animation
gsap.from('.footer-social .social-icon', {
    scrollTrigger: {
        trigger: '.footer',
        start: 'top 90%',
        toggleActions: 'play reverse play reverse'
    },
    scale: 0,
    rotation: 180,
    opacity: 0,
    stagger: 0.1,
    duration: 0.6,
    delay: 0.6,
    ease: 'back.out(2)'
});

// Easter egg pulse animation
gsap.to('.easter-egg', {
    textShadow: '0 0 40px rgba(229, 9, 20, 0.9)',
    duration: 1.5,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut'
});

// ============================================
// GLOBAL SCROLL-BASED PARALLAX EFFECTS
// ============================================

// Hero section parallax on scroll (fades out as you scroll down)
gsap.to('.hero-center-content', {
    scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5
    },
    y: -200,
    opacity: 0,
    scale: 0.85,
    ease: 'none'
});

// Storm clouds parallax - slower, more dramatic
gsap.to('.storm-clouds', {
    scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.8
    },
    y: 150,
    scale: 1.15,
    ease: 'none'
});

// Red glow parallax
gsap.to('.red-glow', {
    scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.6
    },
    y: 80,
    opacity: 0.3,
    ease: 'none'
});

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

// Rounds section title parallax
gsap.to('.rounds-section .section-title', {
    scrollTrigger: {
        trigger: '.rounds-section',
        start: 'top bottom',
        end: 'top 20%',
        scrub: 0.5
    },
    y: -50,
    ease: 'none'
});

// Quote section parallax elements
gsap.to('.quote-marks', {
    scrollTrigger: {
        trigger: '.quote-section',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.8
    },
    y: -100,
    rotation: 15,
    ease: 'none'
});

gsap.to('.main-quote', {
    scrollTrigger: {
        trigger: '.quote-section',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.6
    },
    y: -60,
    ease: 'none'
});

gsap.from('.quote-content', {
    scrollTrigger: {
        trigger: '.quote-section',
        start: 'top 80%',
        end: 'top 40%',
        scrub: 0.5
    },
    y: 100,
    opacity: 0,
    scale: 0.95,
    ease: 'none'
});

// Login section parallax
gsap.to('.vecna-silhouette', {
    scrollTrigger: {
        trigger: '.login-section',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.7
    },
    y: -80,
    rotation: 8,
    ease: 'none'
});

gsap.to('.login-form-container', {
    scrollTrigger: {
        trigger: '.login-section',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.6
    },
    y: -40,
    ease: 'none'
});

gsap.from('.login-container', {
    scrollTrigger: {
        trigger: '.login-section',
        start: 'top 85%',
        end: 'top 45%',
        scrub: 0.5
    },
    y: 80,
    opacity: 0,
    ease: 'none'
});

// Footer reveal
gsap.from('.footer-content', {
    scrollTrigger: {
        trigger: '.footer',
        start: 'top 90%',
        end: 'top 60%',
        scrub: 0.5
    },
    y: 50,
    opacity: 0,
    ease: 'none'
});

// ============================================
// INTERACTIVE EFFECTS
// ============================================

// Parallax Effect on Hero - Subtle storm movement
document.addEventListener('mousemove', (e) => {
    const moveX = (e.clientX - window.innerWidth / 2) * 0.005;
    const moveY = (e.clientY - window.innerHeight / 2) * 0.005;

    gsap.to('.storm-clouds', {
        x: moveX * 10,
        y: moveY * 5,
        duration: 1,
        ease: 'power2.out'
    });

    gsap.to('.red-glow', {
        x: moveX * 5,
        y: moveY * 3,
        duration: 1,
        ease: 'power2.out'
    });
});

// ============================================
// FLOATING IMAGE GSAP ANIMATION (Challenge 1)
// ============================================

const floatingImages = document.querySelectorAll('.floating-img');

floatingImages.forEach((img, index) => {
    const container = img.closest('.floating-image-container');
    const shadow = container?.querySelector('.floating-shadow');
    const challengeRow = img.closest('.challenge-row');

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
    if (challengeRow) {
        gsap.to(img, {
            scrollTrigger: {
                trigger: challengeRow,
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
// PRIZE POOL SCROLL-DRIVEN BUS ANIMATION
// ============================================

const prizeSection = document.querySelector('.prize-section');
const schoolBusGroup = document.getElementById('cyclistsGroup');
const prize1 = document.querySelector('.prize-1');
const prize2 = document.querySelector('.prize-2');
const prize3 = document.querySelector('.prize-3');
const prizeStickyWrapper = document.querySelector('.prize-sticky-wrapper');
const cyclingTrack = document.querySelector('.cycling-track');

if (prizeSection && schoolBusGroup && prizeStickyWrapper) {

    // Ensure prize section header is always visible
    const prizeHeader = prizeSection.querySelector('.section-header');
    if (prizeHeader) {
        gsap.set(prizeHeader, {
            opacity: 1,
            visibility: 'visible',
            y: 0
        });
    }

    // Set initial states for prize cards - completely invisible, no blur
    gsap.set([prize1, prize2, prize3], {
        opacity: 0,
        y: 80,
        scale: 0.8,
        rotationX: 20,
        rotationY: -10,
        transformPerspective: 1000,
        visibility: 'hidden'
    });

    gsap.set(schoolBusGroup, {
        x: -200
    });

    // Create the pinned scroll animation timeline
    const prizeTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: prizeSection,
            start: 'top top',
            end: '+=2500', // Pin for 2500px of scrolling for smoother animation
            pin: true,
            pinSpacing: true,
            scrub: 1.5,
            anticipatePin: 1,
            onUpdate: (self) => {
                const progress = self.progress;

                // Add moving class for wheel animation when bus is moving
                if (progress > 0.02 && progress < 0.95) {
                    schoolBusGroup.classList.add('moving');
                } else {
                    schoolBusGroup.classList.remove('moving');
                }

                // Hide scroll hint after starting
                const scrollHint = document.querySelector('.prize-scroll-hint');
                if (scrollHint) {
                    scrollHint.style.opacity = progress > 0.1 ? '0' : '1';
                }
            }
        }
    });

    // Calculate the distance bus needs to travel
    const trackWidth = cyclingTrack ? cyclingTrack.offsetWidth : window.innerWidth;
    const travelDistance = trackWidth + 250;

    // Animate bus across the screen (throughout the entire timeline)
    prizeTimeline.to(schoolBusGroup, {
        x: travelDistance,
        ease: 'none',
        duration: 1
    }, 0);

    // Reveal Prize 3 (Bronze) - at 15% progress with dramatic entrance
    prizeTimeline.to(prize3, {
        visibility: 'visible',
        opacity: 1,
        y: 0,
        scale: 1,
        rotationX: 0,
        rotationY: 0,
        duration: 0.15,
        ease: 'back.out(2)'
    }, 0.15);

    // Add glow effect to prize 3
    prizeTimeline.to(prize3, {
        boxShadow: '0 0 30px rgba(205, 127, 50, 0.6), 0 20px 40px rgba(0,0,0,0.4)',
        duration: 0.1,
        ease: 'power2.out'
    }, 0.25);

    // Reveal Prize 2 (Silver) - at 45% progress
    prizeTimeline.to(prize2, {
        visibility: 'visible',
        opacity: 1,
        y: 0,
        scale: 1,
        rotationX: 0,
        rotationY: 0,
        duration: 0.15,
        ease: 'back.out(2)'
    }, 0.45);

    // Add glow effect to prize 2
    prizeTimeline.to(prize2, {
        boxShadow: '0 0 30px rgba(192, 192, 192, 0.6), 0 20px 40px rgba(0,0,0,0.4)',
        duration: 0.1,
        ease: 'power2.out'
    }, 0.55);

    // Reveal Prize 1 (Champion) - at 70% progress with extra dramatic entrance
    prizeTimeline.to(prize1, {
        visibility: 'visible',
        opacity: 1,
        y: 0,
        scale: 1.05,
        rotationX: 0,
        rotationY: 0,
        duration: 0.18,
        ease: 'elastic.out(1, 0.5)'
    }, 0.70);

    // Champion card special glow and pulse
    prizeTimeline.to(prize1, {
        scale: 1,
        boxShadow: '0 0 50px rgba(229, 9, 20, 0.8), 0 0 100px rgba(229, 9, 20, 0.4), 0 25px 50px rgba(0,0,0,0.5)',
        duration: 0.12,
        ease: 'power2.out'
    }, 0.85);

    // Final celebration pulse for all cards
    prizeTimeline.to([prize3, prize2], {
        scale: 1.02,
        duration: 0.05,
        ease: 'power1.out'
    }, 0.92);

    prizeTimeline.to([prize3, prize2], {
        scale: 1,
        duration: 0.05,
        ease: 'power1.in'
    }, 0.97);
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
// NAVIGATION ACTIVE STATE
// ============================================

// Get all nav links and sections
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('section[id]');

// Function to update active nav link
function updateActiveNav(activeId) {
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${activeId}`) {
            link.classList.add('active');
        }
    });
}

// Click handler for nav links
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);

        if (targetSection) {
            // Update active state immediately on click
            updateActiveNav(targetId);

            // Smooth scroll to section
            gsap.to(window, {
                duration: 1,
                scrollTo: { y: targetSection, offsetY: 80 },
                ease: 'power2.inOut'
            });
        }
    });
});

// ScrollTrigger for each section to update nav on scroll
sections.forEach(section => {
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
    }

    setText(newText) {
        const oldText = this.el.innerText;
        const length = Math.max(oldText.length, newText.length);
        const promise = new Promise((resolve) => this.resolve = resolve);
        this.queue = [];

        for (let i = 0; i < length; i++) {
            const from = oldText[i] || '';
            const to = newText[i] || '';
            const start = Math.floor(Math.random() * 40);
            const end = start + Math.floor(Math.random() * 40);
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
                output += from;
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
    document.querySelectorAll('.challenge-row').forEach((row) => {
        const title = row.querySelector('.challenge-title');
        const tags = row.querySelectorAll('.challenge-tags span');
        
        if (!title) return;
        
        const originalTitleText = title.innerText;
        const titleFx = new TextScramble(title);
        
        // Store original tag texts
        const tagData = Array.from(tags).map(tag => ({
            el: tag,
            fx: new TextScramble(tag),
            originalText: tag.innerText
        }));
        
        // Scroll trigger - scramble reveal when entering viewport
        let hasTriggered = false;
        
        ScrollTrigger.create({
            trigger: row,
            start: 'top 85%',
            onEnter: () => {
                if (!hasTriggered) {
                    hasTriggered = true;
                    // Scramble the title
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
        row.addEventListener('mouseenter', () => {
            titleFx.setText(originalTitleText);
            
            tagData.forEach((data, i) => {
                setTimeout(() => {
                    data.fx.setText(data.originalText);
                }, i * 100);
            });
        });
    });
}

// Initialize on DOM ready - with longer delay to ensure everything is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initChallengeTextScramble, 800);
    });
} else {
    setTimeout(initChallengeTextScramble, 800);
}

// Add scramble style
const scrambleStyle = document.createElement('style');
scrambleStyle.textContent = `
    .scramble {
        color: #e50914;
        text-shadow: 0 0 10px #e50914, 0 0 20px #e50914;
        animation: scrambleFlicker 0.1s infinite;
    }
    
    @keyframes scrambleFlicker {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.8; }
    }
    
    .challenge-title {
        transition: text-shadow 0.3s ease;
    }
    
    .challenge-row:hover .challenge-title {
        text-shadow: 0 0 20px rgba(229, 9, 20, 0.5);
    }
    
    .challenge-tags span {
        transition: all 0.3s ease;
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
    // About Section Animations
    const aboutSection = document.querySelector('.about-section');
    if (aboutSection) {
        // Title animation
        gsap.to('.about-section .gsap-title', {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.about-section',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            }
        });

        // Subtitle animation
        gsap.to('.about-section .gsap-fade', {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: 0.2,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.about-section',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            }
        });

        // Cards stagger animation
        gsap.to('.about-card.gsap-card', {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: 'back.out(1.2)',
            scrollTrigger: {
                trigger: '.about-grid',
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            }
        });

        // Quote animation
        gsap.to('.about-quote.gsap-fade', {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.about-quote',
                start: 'top 90%',
                toggleActions: 'play none none reverse'
            }
        });
    }

    // Gallery Section Animations
    const gallerySection = document.querySelector('.gallery-section');
    if (gallerySection) {
        // Title animation
        gsap.to('.gallery-section .gsap-title', {
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

        // Subtitle animation
        gsap.to('.gallery-section .gsap-fade', {
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

        // Gallery items stagger animation with scale
        gsap.to('.gsap-gallery', {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            stagger: {
                each: 0.1,
                from: 'random'
            },
            ease: 'back.out(1.4)',
            scrollTrigger: {
                trigger: '.gallery-grid',
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            }
        });

        // Parallax effect on gallery items
        document.querySelectorAll('.gallery-item').forEach((item, index) => {
            gsap.to(item, {
                y: (index % 2 === 0) ? -30 : 30,
                ease: 'none',
                scrollTrigger: {
                    trigger: '.gallery-section',
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1.5
                }
            });
        });
    }

    // Team Section Animations - Enhanced
    const teamSection = document.querySelector('.team-section');
    if (teamSection) {
        // Set initial states for team members
        gsap.set('.gsap-team', {
            opacity: 0,
            y: 80,
            scale: 0.8,
            rotateY: -15,
            transformPerspective: 1000
        });

        // Title animation with glow effect
        gsap.to('.team-section .gsap-title', {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.team-section',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            }
        });

        // Subtitle animation
        gsap.to('.team-section .gsap-fade', {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: 0.3,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.team-section',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            }
        });

        // Team members cinematic entrance with stagger
        gsap.to('.gsap-team', {
            opacity: 1,
            y: 0,
            scale: 1,
            rotateY: 0,
            duration: 1,
            stagger: {
                each: 0.12,
                from: 'center'
            },
            ease: 'back.out(1.5)',
            scrollTrigger: {
                trigger: '.team-grid',
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            }
        });

        // Add hover sound effect simulation with scale
        document.querySelectorAll('.member-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                gsap.to(card.querySelector('.member-photo'), {
                    scale: 1.1,
                    duration: 0.4,
                    ease: 'back.out(2)'
                });
                gsap.to(card.querySelector('.member-glow'), {
                    opacity: 1,
                    scale: 1.2,
                    duration: 0.3
                });
            });
            card.addEventListener('mouseleave', () => {
                gsap.to(card.querySelector('.member-photo'), {
                    scale: 1,
                    duration: 0.3,
                    ease: 'power2.out'
                });
                gsap.to(card.querySelector('.member-glow'), {
                    opacity: 0,
                    scale: 1,
                    duration: 0.3
                });
            });
        });
    }

    // Enhanced Prize Section Animation
    const prizeSection = document.querySelector('.prize-section');
    if (prizeSection) {
        // Prize cards dramatic entrance
        gsap.fromTo('.prize-card', 
            {
                opacity: 0,
                y: 150,
                scale: 0.5,
                rotateY: 45
            },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                rotateY: 0,
                duration: 1,
                stagger: 0.2,
                ease: 'back.out(1.4)',
                scrollTrigger: {
                    trigger: '.prizes-row',
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    }

    // Sponsors Section Animation
    const sponsorsSection = document.querySelector('.sponsors-section');
    if (sponsorsSection) {
        gsap.to('.sponsors-section .section-title', {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.sponsors-section',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            }
        });
    }

    // Footer Animation
    const footer = document.querySelector('.footer');
    if (footer) {
        gsap.fromTo('.footer-brand, .footer-nav, .footer-info, .footer-connect',
            {
                opacity: 0,
                y: 50
            },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.footer',
                    start: 'top 90%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    }

    // Smooth scroll snap effect for sections
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        ScrollTrigger.create({
            trigger: section,
            start: 'top top',
            end: 'bottom top',
            onEnter: () => {
                // Update active nav link
                const id = section.getAttribute('id');
                document.querySelectorAll('.nav-links a').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            },
            onEnterBack: () => {
                const id = section.getAttribute('id');
                document.querySelectorAll('.nav-links a').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });

    // Horizontal text scroll effect for section headers
    document.querySelectorAll('.section-title').forEach(title => {
        gsap.fromTo(title,
            { 
                backgroundPosition: '0% 50%' 
            },
            {
                backgroundPosition: '100% 50%',
                ease: 'none',
                scrollTrigger: {
                    trigger: title,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 2
                }
            }
        );
    });
}

// Initialize enhanced animations after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initEnhancedGSAPAnimations, 200);
});

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

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initParallaxEffects, 300);
});

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

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initSmoothScrollEnhancement, 400);
});


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
        gsap.to('.faq-section .gsap-title', {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.faq-section',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            }
        });

        gsap.to('.faq-section .gsap-fade', {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: 0.2,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.faq-section',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            }
        });

        // FAQ items stagger animation
        gsap.to('.gsap-faq', {
            opacity: 1,
            x: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.faq-container',
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            }
        });
    }

    // Contact Section Animations
    const contactSection = document.querySelector('.contact-section');
    if (contactSection) {
        gsap.to('.contact-section .gsap-title', {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.contact-section',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            }
        });

        gsap.to('.contact-section .gsap-fade', {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: 0.2,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.contact-section',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            }
        });

        // Contact cards and form animation
        gsap.to('.gsap-contact', {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.2,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.contact-container',
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            }
        });
    }
}

// Initialize FAQ and Contact
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        initFAQAccordion();
        initContactForm();
        initFAQContactAnimations();
    }, 600);
});


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

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initChallengePageAnimations, 700);
});

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

// Initialize about section mouse reveal on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for page to fully load
    setTimeout(initAboutMouseReveal, 800);
});

// Also try on window load as backup
window.addEventListener('load', () => {
    setTimeout(initAboutMouseReveal, 100);
});


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

// Initialize optimizations after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for main content to load
    setTimeout(() => {
        initSkeletonLoading();
        initLazyLoading();
        optimizeScrollPerformance();
        initVisibilityOptimization();
    }, 100);
});

// Preconnects are now handled in HTML head for better performance
