/**
 * Main Application Script
 * Initializes all components and handles global functionality
 */

class DanNicCosApp {
    constructor() {
        this.videoController = null;
        this.isInitialized = false;
        
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.onDOMReady());
        } else {
            this.onDOMReady();
        }
    }

    onDOMReady() {
        console.log('🚀 DanNicCos site initializing...');
        
        try {
            this.initializeComponents();
            this.setupEventListeners();
            this.initializeAccessibility();
            this.isInitialized = true;
            
            console.log('✅ Site initialization complete');
        } catch (error) {
            console.error('❌ Error during site initialization:', error);
        }
    }

    initializeComponents() {
        // Initialize video controller
        this.initVideoController();
        
        // Initialize any quote rotation if utils.ts is available
        this.initQuoteRotation();
        
        // Initialize smooth scrolling
        this.initSmoothScrolling();
    }

    initVideoController() {
        try {
            this.videoController = new VideoController(
                'showcaseVideo',
                'videoContainer', 
                'videoStatus'
            );
            
            // Listen for video status changes
            const container = document.getElementById('videoContainer');
            if (container) {
                container.addEventListener('videoStatusChange', (event) => {
                    this.onVideoStatusChange(event.detail);
                });
            }
            
            console.log('✅ Video controller initialized');
        } catch (error) {
            console.warn('⚠️ Video controller initialization failed:', error.message);
        }
    }

    initQuoteRotation() {
        // Check if quote rotation is available from utils.ts
        if (typeof startQuoteRotation === 'function') {
            const quoteElement = document.querySelector('.quote');
            if (quoteElement) {
                startQuoteRotation(4000); // 4 second intervals
                console.log('✅ Quote rotation initialized');
            }
        }
    }

    initSmoothScrolling() {
        // Enhanced smooth scrolling for internal links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    setupEventListeners() {
        // Home icon click handler
        const homeIcon = document.querySelector('.home-icon');
        if (homeIcon) {
            homeIcon.addEventListener('click', this.handleHomeClick.bind(this));
        }

        // Brand name click handler with glitch effect
        const brandName = document.querySelector('.brand-name');
        if (brandName) {
            brandName.addEventListener('click', this.handleBrandClick.bind(this));
        }

        // Handle window resize for responsive adjustments
        window.addEventListener('resize', this.debounce(this.handleResize.bind(this), 250));

        // Handle visibility change (tab switching)
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

        // Handle keyboard navigation
        document.addEventListener('keydown', this.handleGlobalKeydown.bind(this));

        console.log('✅ Event listeners setup complete');
    }

    initializeAccessibility() {
        // Add skip to main content link for screen readers
        this.addSkipLink();
        
        // Enhance focus management
        this.setupFocusManagement();
        
        // Add ARIA labels where needed
        this.enhanceARIA();
        
        console.log('✅ Accessibility enhancements applied');
    }

    addSkipLink() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'skip-link';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: var(--color-bg-primary);
            color: var(--color-primary);
            padding: 8px;
            text-decoration: none;
            border-radius: 4px;
            z-index: 10000;
            transition: top 0.3s;
        `;
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
        
        // Add id to main content
        const mainContent = document.querySelector('.main-content');
        if (mainContent && !mainContent.id) {
            mainContent.id = 'main-content';
        }
    }

    setupFocusManagement() {
        // Improve focus visibility
        const style = document.createElement('style');
        style.textContent = `
            .focus-visible {
                outline: 2px solid var(--color-primary);
                outline-offset: 2px;
            }
        `;
        document.head.appendChild(style);
    }

    enhanceARIA() {
        // Add ARIA labels to interactive elements that need them
        const socialLinks = document.querySelectorAll('.social-link');
        socialLinks.forEach((link, index) => {
            if (!link.getAttribute('aria-label')) {
                const href = link.getAttribute('href');
                if (href.includes('github')) {
                    link.setAttribute('aria-label', 'Visit GitHub profile');
                } else if (href.includes('x.com') || href.includes('twitter')) {
                    link.setAttribute('aria-label', 'Visit X (Twitter) profile');
                } else if (href.includes('substack')) {
                    link.setAttribute('aria-label', 'Visit Substack newsletter');
                }
            }
        });

        // Add role and aria-label to video container
        const videoContainer = document.getElementById('videoContainer');
        if (videoContainer) {
            videoContainer.setAttribute('role', 'button');
            videoContainer.setAttribute('aria-label', 'Play/pause showcase video');
        }
    }

    // Event Handlers
    handleHomeClick(event) {
        event.preventDefault();
        
        // Scroll to top smoothly
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        console.log('🏠 Home clicked - scrolled to top');
    }

    handleBrandClick(event) {
        // Add extra glitch effect on click
        const brandName = event.target;
        brandName.style.animation = 'none';
        brandName.offsetHeight; // Trigger reflow
        brandName.style.animation = 'glitch 0.3s ease-in-out, gradient-shift 8s ease infinite';
        
        console.log('✨ Brand name clicked - glitch effect triggered');
    }

    handleResize() {
        // Handle any resize-specific logic
        if (this.videoController) {
            // Potentially pause video on mobile rotation
            if (window.innerWidth <= 768 && this.videoController.isPlaying()) {
                this.videoController.pause();
            }
        }
    }

    handleVisibilityChange() {
        if (document.hidden && this.videoController) {
            // Pause video when tab is not visible
            this.videoController.pause();
        }
    }

    handleGlobalKeydown(event) {
        // Global keyboard shortcuts
        if (event.ctrlKey || event.metaKey) {
            switch (event.key) {
                case 'k':
                    // Ctrl+K to focus on video (example shortcut)
                    event.preventDefault();
                    const videoContainer = document.getElementById('videoContainer');
                    if (videoContainer) {
                        videoContainer.focus();
                    }
                    break;
            }
        }
    }

    onVideoStatusChange(detail) {
        console.log(`📹 Video status changed to: ${detail.status}`);
        
        // Could add analytics tracking here
        // Could add additional UI feedback here
    }

    // Utility Methods
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Public API
    getVideoController() {
        return this.videoController;
    }

    isReady() {
        return this.isInitialized;
    }
}

// Initialize the application
const app = new DanNicCosApp();

// Make app available globally for debugging
if (typeof window !== 'undefined') {
    window.DanNicCosApp = app;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DanNicCosApp;
}